import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { open as openDlg, save as saveDlg } from "@tauri-apps/plugin-dialog";
import JSZip from "jszip";
import { renderToStaticMarkup } from "react-dom/server";
import { t } from "./i18n";
import { Doc, bounds, gridPatternSvg, listLines, lum, pageOf } from "./model";
import { exportMM, exportVsdx, exportXMind, importMD, importMM, importVsdx, importXMind } from "./formats";
import { buildPdf } from "./pdf";
import { DocBody } from "./render";
import { Tab, curTab, needsSave, useDocs } from "./store";
import { autoPage } from "./templates";

export interface Box { x: number; y: number; w: number; h: number }
export interface SaveOpts { view: "map" | "list"; area: "all" | "visible"; grid: boolean }
export const FORMATS = [{ id: "canomind", name: "CanoMind (.canomind)" }, { id: "png", name: "PNG (.png)" }, { id: "jpg", name: "JPEG (.jpg)" }, { id: "pdf", name: "PDF (.pdf)" }, { id: "svg", name: "SVG (.svg)" }, { id: "md", name: "Markdown (.md)" }, { id: "json", name: "JSON (.json)" }, { id: "xmind", name: "XMind (.xmind)" }, { id: "mm", name: "FreeMind (.mm)" }, { id: "vsdx", name: "Visio (.vsdx)" }];

export const EXPORT_ORDER: [string, string][] = [["canomind", "CanoMind"], ["mm", "FreeMind"], ["xmind", "XMind"], ["vsdx", "Visio"], ["pdf", "PDF"], ["png", "PNG"], ["jpg", "JPG"], ["svg", "SVG"], ["md", "Markdown"], ["json", "JSON"]];
const isTauri = () => typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
const baseName = (p: string) => (p.split(/[\\/]/).pop() || p).replace(/\.\w+$/, "");
const base = (tb: Tab) => tb.name.replace(/[^\w\- ]+/g, "") || "canomind";
const dl = (name: string, blob: Blob) => { const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1500); };
const toB64 = (u: Uint8Array) => { let s = ""; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode(...u.subarray(i, i + 0x8000)); return btoa(s); };
const fromB64 = (b: string) => Uint8Array.from(atob(b), (c) => c.charCodeAt(0));
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

export function svgString(d: Doc, bg?: string, o: { box?: Box; grid?: boolean; gridType?: string } = {}) {
  const b = o.box ?? bounds(d), color = d.bg?.color ?? bg, dark = color ? lum(color) < 0.4 : false;
  const grid = o.grid ? `<defs>${gridPatternSvg(o.gridType ?? "dots", dark ? "#555" : "#cfd4d9")}</defs><rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" fill="url(#gp)"/>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${b.w}" height="${b.h}" viewBox="${b.x} ${b.y} ${b.w} ${b.h}">${color ? `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" fill="${color}"/>` : ""}${grid}${renderToStaticMarkup(<DocBody doc={d} dark={dark} />)}</svg>`;
}
export function listSvg(d: Doc, bg: string) {
  const lines = listLines(d), W = 820, lh = 28, H = Math.max(80, lines.length * lh + 50), fg = lum(bg) < 0.4 ? "#ececec" : "#1a1a1a";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="${bg}"/>${lines.map((l, i) => `<text x="${30 + l.depth * 28}" y="${40 + i * lh}" font-size="16" font-weight="${l.depth ? 400 : 700}" font-family="Calibri, Segoe UI, sans-serif" fill="${fg}">${l.depth ? "• " : ""}${esc(l.text)}</text>`).join("")}</svg>`;
}
export const toMD = (d: Doc) => listLines(d).map((l) => (l.depth ? `${"  ".repeat(l.depth - 1)}- ${l.text}` : `\n# ${l.text}`)).join("\n").trim() + "\n";
export const fileData = (tb: Tab) => ({ v: 4, grid: tb.grid, gridType: tb.gridType, pages: tb.pages.map((p, i) => ({ name: p.name, doc: i === tb.page ? tb.doc : p.doc })) });

function rasterize(svg: string, type: "png" | "jpg"): Promise<Uint8Array> {
  return new Promise((res, rej) => {
    const m = svg.match(/width="([\d.]+)" height="([\d.]+)"/)!, k = Math.min(2, 8000 / Math.max(+m[1], +m[2], 1)), img = new Image();
    img.onload = () => { const c = document.createElement("canvas"); c.width = Math.max(1, Math.round(+m[1] * k)); c.height = Math.max(1, Math.round(+m[2] * k)); const x = c.getContext("2d")!; x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0, c.width, c.height);
      res(fromB64(c.toDataURL(type === "jpg" ? "image/jpeg" : "image/png", 0.92).split(",")[1])); };
    img.onerror = () => rej(new Error("render failed")); img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  });
}
async function writeOut(name: string, ext: string, label: string, data: string | Uint8Array): Promise<string | null> {
  if (!isTauri()) { dl(`${name}.${ext}`, new Blob([data as any])); return "browser"; }
  const p = await saveDlg({ defaultPath: `${name}.${ext}`, filters: [{ name: label, extensions: [ext] }] }); if (!p) return null;
  const path = new RegExp(`\\.${ext}$`, "i").test(p) ? p : `${p}.${ext}`;
  if (typeof data === "string") await invoke("write_text_file", { path, contents: data }); else await invoke("write_binary_file", { path, b64: toB64(data) });
  return path;
}

let afterSave: (() => void) | null = null;
const runAfter = () => { const f = afterSave; afterSave = null; f?.(); };
export const openSaveAs = (fmt: string) => useDocs.setState({ saveDlg: { fmt } });
export const cancelSave = () => { afterSave = null; useDocs.setState({ saveDlg: null }); };
export async function saveTab(asNew = false) {
  const tb = curTab(useDocs.getState());
  if (!isTauri()) { dl(`${base(tb)}.canomind`, new Blob([JSON.stringify(fileData(tb))])); runAfter(); return; }
  if (!asNew && tb.path) {
    try { await invoke("write_text_file", { path: tb.path, contents: JSON.stringify(fileData(tb)) }); useDocs.getState().setFile(tb.path, baseName(tb.path)); } catch (e) { alert(String(e)); afterSave = null; return; }
    runAfter(); return;
  }
  openSaveAs("canomind");
}
export async function confirmSaveAs(fmt: string, o: SaveOpts) {
  useDocs.setState({ saveDlg: null });
  const S = useDocs.getState(), tb0 = curTab(S);
  try {
    if (fmt === "canomind") {
      S.setGrid(o.grid); const tb = curTab(useDocs.getState()), path = await writeOut(base(tb), "canomind", "CanoMind", JSON.stringify(fileData(tb)));
      if (!path) { afterSave = null; return; } if (path !== "browser") useDocs.getState().setFile(path, baseName(path)); runAfter(); return;
    }
    afterSave = null;
    const d = tb0.doc, v = tb0.view, sz = S.size, bg = d.bg?.color ?? "#ffffff", box = o.view === "map" && o.area === "visible" ? { x: -v.x / v.k, y: -v.y / v.k, w: sz.w / v.k, h: sz.h / v.k } : undefined;
    const svg = () => (o.view === "list" ? listSvg(d, bg) : svgString(d, "#ffffff", { box, grid: o.grid, gridType: tb0.gridType }));
    let data: string | Uint8Array;
    if (fmt === "json") data = JSON.stringify(fileData(tb0)); else if (fmt === "md") data = toMD(d); else if (fmt === "svg") data = svg();
    else if (fmt === "xmind") data = await exportXMind(tb0); else if (fmt === "mm") data = exportMM(tb0); else if (fmt === "vsdx") data = await exportVsdx(tb0);
    else if (fmt === "pdf") data = await buildPdf(d, { view: o.view, box, grid: o.grid, gridType: tb0.gridType }); else data = await rasterize(svg(), fmt as "png" | "jpg");
    await writeOut(base(tb0), fmt, fmt.toUpperCase(), data);
  } catch (e) { alert(String(e)); }
}
export function printSheet(tb: Tab) { // prints the whole page (A4 etc.), with no browser header/footer
  const pg = pageOf(tb.doc), s = document.createElement("div"), st = document.createElement("style"); s.className = "print-sheet"; s.innerHTML = svgString(tb.doc, "#ffffff");
  st.textContent = `@page{size:${pg.w}px ${pg.h}px;margin:0}@media print{html,body{margin:0!important;background:#fff!important}.print-sheet{display:block!important;position:fixed;left:0;top:0;width:100vw;height:100vh}.print-sheet svg{width:100%;height:100%}}`;
  document.head.appendChild(st); document.body.appendChild(s);
  const done = () => { s.remove(); st.remove(); removeEventListener("afterprint", done); }; addEventListener("afterprint", done); print();
}

// ----- closing with unsaved changes -----
export async function tryQuit() {
  const st = useDocs.getState(), u = st.fresh ? [] : st.tabs.filter(needsSave);
  if (!u.length) { try { await getCurrentWindow().destroy(); } catch {} return; }
  useDocs.setState({ active: u[0].id, start: false, closeAsk: { tabId: u[0].id, mode: "quit" } });
}
export async function closeChoice(c: "save" | "saveas" | "discard" | "cancel") {
  const S = useDocs.getState(), ask = S.closeAsk; if (!ask) return; useDocs.setState({ closeAsk: null });
  if (c === "cancel") return;
  if (c === "discard") { S.closeTab(ask.tabId); if (ask.mode === "quit") tryQuit(); return; }
  S.setActive(ask.tabId); afterSave = ask.mode === "tab" ? () => useDocs.getState().closeTab(ask.tabId) : () => { tryQuit(); };
  await saveTab(c === "saveas");
}

// ----- open / import -----
export function openText(text: string, name: string, path?: string) {
  const d = JSON.parse(text), S = useDocs.getState();
  if (d.pages) S.openPages(name, d.pages.map((p: any) => ({ ...p, doc: autoPage({ ...p.doc, conns: p.doc.conns ?? {} }) })), path, d.grid);
  else if (d.items && d.order) S.newTab(name, autoPage({ ...d, conns: d.conns ?? {} }), path, d.grid); else throw new Error("bad file");
  if (d.gridType) useDocs.getState().setGridType(d.gridType);
}
async function importContent(name: string, ext: string, text: () => Promise<string>, zip: () => Promise<JSZip>, path?: string) {
  let docs: { name: string; doc: Doc }[] = [];
  try {
    if (ext === "canomind" || ext === "json") { openText(await text(), name, path); return; }
    if (ext === "mm") docs = importMM(await text()); else if (ext === "xmind") docs = await importXMind(await zip()); else if (ext === "vsdx") docs = await importVsdx(await zip()); else if (ext === "md" || ext === "markdown") docs = [{ name: "Page-1", doc: importMD(await text(), name) }]; else throw new Error("unsupported file type");
  } catch (e: any) { alert(t("Import failed: ") + (e?.message || e)); return; }
  if (!docs.length) { alert(t("Nothing to import.")); return; }
  if (docs.length === 1) useDocs.getState().newTab(name, docs[0].doc); else useDocs.getState().openPages(name, docs);
}
const extOf = (n: string) => (n.split(".").pop() || "").toLowerCase();
export const importFile = (f: File) => importContent(f.name.replace(/\.\w+$/, ""), extOf(f.name), () => f.text(), () => JSZip.loadAsync(f));
export const openFile = importFile;
async function importPath(p: string) {
  const ext = extOf(p);
  await importContent(baseName(p), ext, () => invoke<string>("read_text_file", { path: p }), async () => JSZip.loadAsync(await invoke<string>("read_binary_file", { path: p }), { base64: true }), ext === "canomind" || ext === "json" ? p : undefined);
}
export async function importDialog(fallback: () => void) {
  if (!isTauri()) return fallback();
  try { const p = await openDlg({ multiple: false, filters: [{ name: t("All supported files"), extensions: ["canomind", "json", "xmind", "mm", "vsdx", "md", "markdown"] }, { name: "CanoMind", extensions: ["canomind", "json"] }, { name: "XMind", extensions: ["xmind"] }, { name: "FreeMind", extensions: ["mm"] }, { name: "Visio", extensions: ["vsdx"] }, { name: "Markdown", extensions: ["md", "markdown"] }] }); if (typeof p === "string") await importPath(p); }
  catch (e) { alert(String(e)); }
}
export const openAny = () => importDialog(() => document.getElementById("canomind-open")?.click());
export async function handleFiles(fl: FileList) {
  for (const f of Array.from(fl)) { if (/\.(canomind|json|xmind|mm|vsdx|md|markdown)$/i.test(f.name)) await importFile(f); else if (f.type.startsWith("image/") && !useDocs.getState().start) await addImage(f); }
}
export async function bootOpen() {
  if (isTauri()) {
    invoke<string[]>("list_fonts").then((f) => useDocs.getState().setFonts(f.filter((x) => x && !x.startsWith("@")))).catch(() => {});
    try { const p = await invoke<string | null>("get_open_path"); if (p) await importPath(p); } catch (e) { alert(String(e)); }
  }
  useDocs.setState({ booting: false });
}
export async function openLink(url: string) { try { if (isTauri()) await invoke("open_url", { url }); else window.open(url, "_blank"); } catch (e) { alert(String(e)); } }

// ----- images -----
export function readImage(f: File): Promise<{ src: string; w: number; h: number }> {
  return new Promise((res) => { const r = new FileReader(); r.onload = () => { const src = String(r.result), im = new Image(); im.onload = () => res({ src, w: im.width, h: im.height }); im.src = src; }; r.readAsDataURL(f); });
}
export async function addImage(f: File) {
  const { src, w, h } = await readImage(f), k = Math.min(1, 300 / w), S = useDocs.getState(), v = curTab(S).view;
  const id = S.addItem("image", (120 - v.x) / v.k, (120 - v.y) / v.k, w * k, h * k, "", { src }); S.setSel([id]);
}
export async function attachImageFile(f: File, id: string) { const { src, w, h } = await readImage(f); useDocs.getState().attachImage(id, src, h / w); }
export async function bgImageFile(f: File) { const { src, w, h } = await readImage(f); useDocs.getState().bgAdd(src, w, h); }
