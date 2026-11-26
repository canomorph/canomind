import { invoke } from "@tauri-apps/api/core";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, PDFFont, PDFPage, StandardFonts, degrees, rgb } from "pdf-lib";
import { Doc, Item, Kind, LLine, TStyle, baseStyle, bounds, hasShadow, foldSize, bulletPrefix, layoutText, placeLines, inkPath, connEnds, connPath, listLines, lum, readable, shapePath, wrap } from "./model";
import { Prim, chartPrims, tablePrims } from "./prims";

type Box = { x: number; y: number; w: number; h: number };
type Cache = Map<string, PDFFont>;
const URL_RE = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
const rgbOf = (c: string) => { let h = c.replace("#", ""); if (h.length === 3) h = h.split("").map((x) => x + x).join(""); const n = parseInt(h, 16) || 0; return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255); };
const safe = (f: PDFFont, s: string) => { try { f.encodeText(s); return s; } catch { return Array.from(s).map((ch) => { try { f.encodeText(ch); return ch; } catch { return "?"; } }).join(""); } };

async function getFont(pdf: PDFDocument, ff: string, bold: boolean, italic: boolean, cache: Cache) {
  const key = `${ff}|${bold}|${italic}`, hit = cache.get(key); if (hit) return hit; let f: PDFFont;
  try { const b64 = await invoke<string>("font_bytes", { family: ff, bold, italic }); f = await pdf.embedFont(Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)), { subset: true }); }
  catch { f = await pdf.embedFont(bold ? (italic ? StandardFonts.HelveticaBoldOblique : StandardFonts.HelveticaBold) : italic ? StandardFonts.HelveticaOblique : StandardFonts.Helvetica); }
  cache.set(key, f); return f;
}
async function viaCanvas(pdf: PDFDocument, src: string) {
  return new Promise<any>((res) => { const im = new Image(); im.onload = async () => { const c = document.createElement("canvas"); c.width = im.width; c.height = im.height; c.getContext("2d")!.drawImage(im, 0, 0);
    try { res(await pdf.embedPng(Uint8Array.from(atob(c.toDataURL("image/png").split(",")[1]), (x) => x.charCodeAt(0)))); } catch { res(null); } }; im.onerror = () => res(null); im.src = src; });
}
async function embedImg(pdf: PDFDocument, src: string) {
  try { const m = /^data:image\/([a-z+.-]+);base64,(.*)$/i.exec(src); if (!m) return null; const bytes = Uint8Array.from(atob(m[2]), (c) => c.charCodeAt(0));
    if (/png/i.test(m[1])) return await pdf.embedPng(bytes); if (/jpe?g/i.test(m[1])) return await pdf.embedJpg(bytes); return await viaCanvas(pdf, src); } catch { return null; }
}
function drawLine(page: PDFPage, font: PDFFont, line: string, x: number, y: number, size: number, color: string, deco: { ul?: boolean; st?: boolean }) {
  let cx = x;
  line.split(URL_RE).forEach((part, i) => {
    if (!part) return; const s = safe(font, part), w = font.widthOfTextAtSize(s, size), c = i % 2 === 1 ? "#4da3ff" : color;
    page.drawText(s, { x: cx, y, size, font, color: rgbOf(c) });
    if (i % 2 === 1 || deco.ul) page.drawLine({ start: { x: cx, y: y - 1.5 }, end: { x: cx + w, y: y - 1.5 }, thickness: 0.7, color: rgbOf(c) });
    if (deco.st) page.drawLine({ start: { x: cx, y: y + size * 0.3 }, end: { x: cx + w, y: y + size * 0.3 }, thickness: 0.7, color: rgbOf(c) });
    cx += w;
  });
}
async function drawPrims(pdf: PDFDocument, page: PDFPage, prims: Prim[], ox: number, oy: number, cache: Cache) {
  for (const p of prims) {
    if (p.t === "rect") page.drawRectangle({ x: ox + p.x, y: oy - p.y - p.h, width: p.w, height: p.h, color: p.fill ? rgbOf(p.fill) : undefined, opacity: p.fo, borderColor: p.stroke ? rgbOf(p.stroke) : undefined, borderWidth: p.stroke ? p.sw ?? 1 : 0 });
    else if (p.t === "line") page.drawLine({ start: { x: ox + p.x1, y: oy - p.y1 }, end: { x: ox + p.x2, y: oy - p.y2 }, thickness: p.sw ?? 1, color: rgbOf(p.stroke) });
    else if (p.t === "path") page.drawSvgPath(p.d, { x: ox, y: oy, color: p.fill ? rgbOf(p.fill) : undefined, opacity: p.fo, borderColor: p.stroke ? rgbOf(p.stroke) : undefined, borderWidth: p.stroke ? p.sw ?? 1 : 0 });
    else { const f = await getFont(pdf, p.ff ?? "Calibri", !!p.bold, false, cache), s = safe(f, p.s), w = f.widthOfTextAtSize(s, p.size);
      page.drawText(s, { x: ox + p.x - (p.anchor === "middle" ? w / 2 : p.anchor === "end" ? w : 0), y: oy - p.y - p.size * 0.33, size: p.size, font: f, color: rgbOf(p.color) }); }
  }
}
async function drawItem(pdf: PDFDocument, page: PDFPage, it: Item, ox: number, oy: number, dark: boolean, cache: Cache) {
  if (it.kind === "image") { const img = await embedImg(pdf, it.src ?? ""); if (img) page.drawImage(img, { x: ox, y: oy - it.h, width: it.w, height: it.h }); return; }
  const kp = (["table", "chart", "notepad"].includes(it.kind) ? "rect" : it.kind === "todo" ? "round" : it.kind) as Kind, hasFill = it.fill !== "none", hasLine = !!it.sw;
  if (hasFill || hasLine) page.drawSvgPath(shapePath(kp, it.w, it.h), { x: ox, y: oy, color: hasFill ? rgbOf(it.fill) : undefined, opacity: it.fo ?? 1, borderColor: hasLine ? rgbOf(it.stroke) : undefined, borderWidth: it.sw || 0, borderOpacity: it.so ?? 1, borderDashArray: it.dash ? [6, 4] : undefined });
  if (it.kind === "note") { const f = foldSize(it.w, it.h); page.drawSvgPath(`M${it.w - f},${it.h}L${it.w},${it.h - f}L${it.w - f},${it.h - f}Z`, { x: ox, y: oy, color: rgb(0, 0, 0), opacity: 0.2 }); }
  if (it.kind === "table" || it.kind === "chart") { await drawPrims(pdf, page, it.kind === "table" ? tablePrims(it) : chartPrims(it), ox, oy, cache); return; }
  const col = it.fill === "none" ? readable(it.color, dark) : it.color, font = await getFont(pdf, it.ff ?? "Calibri", !!it.bold, !!it.italic, cache), deco = { ul: it.ul, st: it.st };
  const done = it.kind === "todo" && !!it.done, bs = baseStyle(it, "text"), ns = baseStyle(it, "note"), ih = it.ih ?? 0, nh = it.nh ?? 0, rot = it.kind === "notepad" ? 0 : (it.rot ?? 0) % 360;
  const mapPt = (vx: number, vy: number): [number, number] => (rot === 90 ? [it.w - vy, vx] : rot === 270 ? [vy, it.h - vx] : rot === 180 ? [it.w - vx, it.h - vy] : [vx, vy]);
  const drawRich = async (ln: LLine, text: string, sx: number, top: number, base: TStyle, baseCol: string, strike: boolean, r: number) => {
    let cx = sx; const vyb = top + ln.h / 2 + (ln.h / 1.25) * 0.33, pt = (vx: number, vy: number): [number, number] => { const q = r === 0 ? [vx, vy] : mapPt(vx, vy); return [ox + q[0], oy - q[1]]; };
    const put = async (str: string, st: TStyle, color: string, link: boolean) => { if (!str) return; const f = await getFont(pdf, st.f, st.b, st.i, cache), s2 = safe(f, str), w = f.widthOfTextAtSize(s2, st.z), [px, py] = pt(cx, vyb), rr = r ? { rotate: degrees(-r) } : {};
      const eff = it.te, es = it.tes ?? 2, ec = rgbOf(it.tec ?? "#000000"), d1 = r ? [0, 0] : [0, 0];
      if (eff === "shadow") page.drawText(s2, { x: px + es, y: py - es, size: st.z, font: f, color: ec, opacity: 0.5, ...rr });
      if (eff === "outline") for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-0.7, -0.7], [0.7, -0.7], [-0.7, 0.7], [0.7, 0.7]]) page.drawText(s2, { x: px + dx * es, y: py + dy * es, size: st.z, font: f, color: ec, ...rr });
      page.drawText(s2, { x: px, y: py, size: st.z, font: f, color: rgbOf(color), ...rr }); void d1;
      const seg = (dy: number) => { const [x1, y1] = pt(cx, vyb + dy), [x2, y2] = pt(cx + w, vyb + dy); page.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, thickness: 0.7, color: rgbOf(color) }); };
      if (link || st.u) seg(1.5); if (st.k || strike) seg(-st.z * 0.3); cx += w; };
    if (ln.prefix) await put(ln.prefix, base, baseCol, false);
    for (const g of ln.segs) for (const [k, part] of text.slice(g.s, g.e).split(URL_RE).entries()) { const url = k % 2 === 1 ? part : g.st.h; await put(part, g.st, url ? "#4da3ff" : g.st.c === base.c ? baseCol : g.st.c, !!url); }
  };
  if (it.kind === "todo") { page.drawRectangle({ x: ox + 9, y: oy - it.h / 2 - 9, width: 18, height: 18, color: rgb(1, 1, 1), borderColor: rgbOf(it.stroke), borderWidth: 2 }); if (done) { page.drawLine({ start: { x: ox + 13, y: oy - it.h / 2 }, end: { x: ox + 17, y: oy - it.h / 2 - 4 }, thickness: 2.5, color: rgbOf("#07a352") }); page.drawLine({ start: { x: ox + 17, y: oy - it.h / 2 - 4 }, end: { x: ox + 24, y: oy - it.h / 2 + 4 }, thickness: 2.5, color: rgbOf("#07a352") }); } }
  if (it.img && ih > 0) { const img = await embedImg(pdf, it.img); if (img) { const aw = it.w - 16, ah = ih - 12, k = Math.min(aw / img.width, ah / img.height), sw = img.width * k, sh = img.height * k;
    page.drawImage(img, { x: ox + 8 + (aw - sw) / 2, y: oy - (6 + (ah - sh) / 2) - sh, width: sw, height: sh }); } }
  if (it.kind === "notepad") { const lh = Math.max(20, it.fs * 1.6); for (let y = 8 + lh; y < it.h - 4; y += lh) page.drawLine({ start: { x: ox, y: oy - y }, end: { x: ox + it.w, y: oy - y }, thickness: 0.6, color: rgbOf("#a8c7e8") }); page.drawLine({ start: { x: ox + 30, y: oy }, end: { x: ox + 30, y: oy - it.h }, thickness: 0.6, color: rgbOf("#e57373") }); }
  for (const p of placeLines(it, "text")) await drawRich(p.ln, it.text, p.sx, p.y, bs, col, done, rot);
  if (nh > 0) { page.drawLine({ start: { x: ox + 8, y: oy - (it.h - nh) }, end: { x: ox + it.w - 8, y: oy - (it.h - nh) }, thickness: 0.6, color: rgbOf(col), opacity: 0.35 });
    const ncol = ns.c === it.color ? col : ns.c; for (const p of placeLines(it, "note")) await drawRich(p.ln, it.note ?? "", p.sx, p.y, ns, ncol, false, 0); }
}
async function listPdf(pdf: PDFDocument, d: Doc, cache: Cache) {
  const font = await getFont(pdf, "Calibri", false, false, cache), bold = await getFont(pdf, "Calibri", true, false, cache), PW = 595, PH = 842, M = 50, LH = 20, size = 12;
  let page = pdf.addPage([PW, PH]), y = PH - M;
  for (const l of listLines(d)) {
    const f = l.depth ? font : bold, indent = l.depth * 18, words = ((l.depth ? "• " : "") + l.text).split(" "), out: string[] = []; let cur = "";
    for (const w of words) { const t = cur ? cur + " " + w : w; if (f.widthOfTextAtSize(safe(f, t), size) > PW - 2 * M - indent && cur) { out.push(cur); cur = w; } else cur = t; } out.push(cur);
    for (const ln of out) { if (y < M) { page = pdf.addPage([PW, PH]); y = PH - M; } page.drawText(safe(f, ln), { x: M + indent, y, size, font: f, color: rgb(0.1, 0.1, 0.1) }); y -= LH; }
  }
  return pdf.save();
}
export async function buildPdf(d: Doc, o: { view: "map" | "list"; box?: Box; grid: boolean; gridType?: string }): Promise<Uint8Array> {
  const pdf = await PDFDocument.create(); pdf.registerFontkit(fontkit); const cache: Cache = new Map();
  if (o.view === "list") return listPdf(pdf, d, cache);
  const b = o.box ?? bounds(d), W = Math.max(50, Math.min(14400, b.w)), H = Math.max(50, Math.min(14400, b.h)), page = pdf.addPage([W, H]);
  const X = (x: number) => x - b.x, Y = (y: number) => H - (y - b.y), bg = d.bg?.color ?? "#ffffff", dark = lum(bg) < 0.4;
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: rgbOf(bg) });
  for (const im of d.bg?.imgs ?? []) { const img = await embedImg(pdf, im.src); if (img) page.drawImage(img, { x: X(im.x), y: Y(im.y + im.h), width: im.w, height: im.h }); }
  if (o.grid) {
    const gc = rgbOf(dark ? "#555555" : "#cfd4d9"), gt = o.gridType ?? "dots", x0 = Math.ceil(b.x / 20) * 20, y0 = Math.ceil(b.y / 20) * 20;
    if (gt === "dots") { if ((W / 20) * (H / 20) < 8000) for (let gx = x0; gx < b.x + W; gx += 20) for (let gy = y0; gy < b.y + H; gy += 20) page.drawCircle({ x: X(gx), y: Y(gy), size: 1, color: gc }); }
    else if (gt === "isodots") { const sw = 34.641; if ((W / sw) * (H / 10) < 12000) for (let ry = Math.ceil(b.y / 10); ry * 10 < b.y + H; ry++) { const off = ry % 2 ? 17.3205 : 0; for (let gx = Math.ceil((b.x - off) / sw) * sw + off; gx < b.x + W; gx += sw) page.drawCircle({ x: X(gx), y: Y(ry * 10), size: 1, color: gc }); } }
    else { const L = (x1: number, y1: number, x2: number, y2: number) => page.drawLine({ start: { x: X(x1), y: Y(y1) }, end: { x: X(x2), y: Y(y2) }, thickness: 0.5, color: gc });
      if (gt === "lines" || gt === "square") for (let gy = y0; gy < b.y + H; gy += 20) L(b.x, gy, b.x + W, gy);
      if (gt === "square") for (let gx = x0; gx < b.x + W; gx += 20) L(gx, b.y, gx, b.y + H);
      if (gt === "iso") { const sw = 34.641; for (let gx = Math.ceil(b.x / sw) * sw; gx < b.x + W; gx += sw) L(gx, b.y, gx, b.y + H); for (let k = -Math.ceil(W / 20) - 2; k < Math.ceil((H + W * 0.58) / 20) + 2; k++) { const y1 = b.y + k * 20; L(b.x, y1, b.x + W, y1 + W * 0.57735); L(b.x, y1 + 20, b.x + W, y1 + 20 - W * 0.57735); } } }
  }
  for (const c of Object.values(d.conns)) {
    const a = d.items[c.from], bb = d.items[c.to]; if (!a || !bb) continue;
    page.drawSvgPath(connPath(a, bb, c.style), { x: X(0), y: Y(0), borderColor: rgbOf(c.color), borderWidth: 2, borderDashArray: c.dash ? [6, 4] : undefined });
    if (c.arrow) { const { e, dir } = connEnds(a, bb, c.style), px = -dir.y, py = dir.x, bx = e.x - dir.x * 10, by = e.y - dir.y * 10;
      page.drawSvgPath(`M${e.x},${e.y}L${bx + px * 5},${by + py * 5}L${bx - px * 5},${by - py * 5}Z`, { x: X(0), y: Y(0), color: rgbOf(c.color) }); }
  }
  for (const id of d.order) { const it = d.items[id]; if (it) await drawItem(pdf, page, it, X(it.x), Y(it.y), dark, cache); }
  for (const s of d.ink ?? []) page.drawSvgPath(inkPath(s.pts), { x: X(0), y: Y(0), borderColor: rgbOf(s.c), borderWidth: s.w, borderOpacity: s.o, borderLineCap: 1 as any });
  return pdf.save();
}
