import JSZip from "jszip";
import { Doc, Item, buildTree, connEnds, emptyDoc, itemLabel, mkItem, pageOf, uid } from "./model";
import type { Tab } from "./store";
import { Tree, autoPage, treeToDoc } from "./templates";

const pagesOf = (tb: Tab) => tb.pages.map((p, i) => ({ name: p.name, doc: i === tb.page ? tb.doc : p.doc }));
function treeOf(d: Doc, name: string): Tree {
  const { kids, parent } = buildTree(d), pos = (x: string) => d.items[x].y * 1e4 + d.items[x].x, seen = new Set<string>();
  const node = (id: string): Tree => { seen.add(id); return { t: itemLabel(d.items[id]) || "…", c: (kids[id] || []).filter((k) => !seen.has(k) && d.items[k].kind !== "image").sort((a, b) => pos(a) - pos(b)).map(node) }; };
  const roots = d.order.filter((x) => d.items[x] && !parent[x] && d.items[x].kind !== "image").sort((a, b) => pos(a) - pos(b)).map(node);
  return roots.length === 1 ? roots[0] : { t: name, c: roots };
}
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// ---- XMind (.xmind, JSON in a zip; documented open format) ----
export async function exportXMind(tb: Tab) {
  const topic = (n: Tree): any => ({ id: uid(), class: "topic", title: n.t, ...(n.c.length ? { children: { attached: n.c.map(topic) } } : {}) });
  const sheets = pagesOf(tb).map((p) => ({ id: uid(), class: "sheet", title: p.name, rootTopic: topic(treeOf(p.doc, p.name)) }));
  const z = new JSZip(); z.file("content.json", JSON.stringify(sheets)); z.file("metadata.json", JSON.stringify({ creator: { name: "CanoMind", version: "0.4.0" } })); z.file("manifest.json", JSON.stringify({ "file-entries": { "content.json": {}, "metadata.json": {} } }));
  return z.generateAsync({ type: "uint8array" });
}
export async function importXMind(z: JSZip): Promise<{ name: string; doc: Doc }[]> {
  const j = z.file("content.json"); if (!j) throw new Error("content.json not found (old XMind format is not supported)");
  const conv = (n: any): Tree => ({ t: n.title || "", c: (n.children?.attached || []).map(conv) });
  return JSON.parse(await j.async("string")).map((s: any, i: number) => ({ name: s.title || `Page-${i + 1}`, doc: autoPage(treeToDoc(conv(s.rootTopic))) }));
}
// ---- FreeMind (.mm, open XML format) ----
export function exportMM(tb: Tab) {
  const node = (n: Tree): string => `<node TEXT="${esc(n.t).replace(/\n/g, "&#xa;")}">${n.c.map(node).join("")}</node>`;
  return `<map version="1.0.1">${node(treeOf(tb.doc, tb.name))}</map>`;
}
export function importMM(text: string): { name: string; doc: Doc }[] {
  const x = new DOMParser().parseFromString(text, "text/xml"), conv = (e: Element): Tree => ({ t: e.getAttribute("TEXT") || "", c: Array.from(e.children).filter((k) => k.tagName === "node").map(conv) }), r = x.querySelector("map > node");
  return r ? [{ name: "Page-1", doc: autoPage(treeToDoc(conv(r))) }] : [];
}
// ---- Visio (.vsdx, Open Packaging Convention / [MS-VSDX] open specification; basic shapes, text and connectors) ----
const NS = 'xmlns="http://schemas.microsoft.com/office/visio/2012/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"';
const REL = "http://schemas.openxmlformats.org/package/2006/relationships";
export async function exportVsdx(tb: Tab) {
  const pgs = pagesOf(tb), z = new JSZip(), inch = (v: number) => (v / 96).toFixed(4), hex = (c: string) => (/^#[0-9a-f]{6}$/i.test(c) ? c : "#ffffff");
  z.file("[Content_Types].xml", `<?xml version="1.0" encoding="utf-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/visio/document.xml" ContentType="application/vnd.ms-visio.drawing.main+xml"/><Override PartName="/visio/pages/pages.xml" ContentType="application/vnd.ms-visio.pages+xml"/>${pgs.map((_, i) => `<Override PartName="/visio/pages/page${i + 1}.xml" ContentType="application/vnd.ms-visio.page+xml"/>`).join("")}</Types>`);
  z.file("_rels/.rels", `<?xml version="1.0" encoding="utf-8"?><Relationships xmlns="${REL}"><Relationship Id="rId1" Type="http://schemas.microsoft.com/visio/2010/relationships/document" Target="visio/document.xml"/></Relationships>`);
  z.file("visio/document.xml", `<?xml version="1.0" encoding="utf-8"?><VisioDocument ${NS} xml:space="preserve"><DocumentSettings TopPage="0" DefaultTextStyle="0" DefaultLineStyle="0" DefaultFillStyle="0" DefaultGuideStyle="0"><GlueSettings>9</GlueSettings><SnapSettings>65847</SnapSettings><SnapExtensions>34</SnapExtensions><SnapAngles/><DynamicGridEnabled>0</DynamicGridEnabled></DocumentSettings><Colors/><FaceNames/><StyleSheets><StyleSheet ID="0" NameU="No Style" Name="No Style"><Cell N="EnableLineProps" V="1"/><Cell N="EnableFillProps" V="1"/><Cell N="EnableTextProps" V="1"/><Cell N="LineWeight" V="0.01041666666666667"/><Cell N="LineColor" V="0"/><Cell N="LinePattern" V="1"/><Cell N="FillForegnd" V="1"/><Cell N="FillPattern" V="1"/></StyleSheet></StyleSheets></VisioDocument>`);
  z.file("visio/_rels/document.xml.rels", `<?xml version="1.0" encoding="utf-8"?><Relationships xmlns="${REL}"><Relationship Id="rId1" Type="http://schemas.microsoft.com/visio/2010/relationships/pages" Target="pages/pages.xml"/></Relationships>`);
  z.file("visio/pages/pages.xml", `<?xml version="1.0" encoding="utf-8"?><Pages ${NS} xml:space="preserve">${pgs.map((p, i) => { const g = pageOf(p.doc); return `<Page ID="${i}" NameU="${esc(p.name)}" Name="${esc(p.name)}"><PageSheet><Cell N="PageWidth" V="${inch(g.w)}"/><Cell N="PageHeight" V="${inch(g.h)}"/></PageSheet><Rel r:id="rId${i + 1}"/></Page>`; }).join("")}</Pages>`);
  z.file("visio/pages/_rels/pages.xml.rels", `<?xml version="1.0" encoding="utf-8"?><Relationships xmlns="${REL}">${pgs.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.microsoft.com/visio/2010/relationships/page" Target="page${i + 1}.xml"/>`).join("")}</Relationships>`);
  pgs.forEach((p, pi) => {
    const d = p.doc, H = pageOf(d).h, ids: Record<string, number> = {}; let n = 0, xml = "";
    const rect = (w: number, h: number) => `<Section N="Geometry" IX="0"><Cell N="NoFill" V="0"/><Cell N="NoLine" V="0"/><Row T="MoveTo" IX="1"><Cell N="X" V="0"/><Cell N="Y" V="0"/></Row><Row T="LineTo" IX="2"><Cell N="X" V="${w}"/><Cell N="Y" V="0"/></Row><Row T="LineTo" IX="3"><Cell N="X" V="${w}"/><Cell N="Y" V="${h}"/></Row><Row T="LineTo" IX="4"><Cell N="X" V="0"/><Cell N="Y" V="${h}"/></Row><Row T="LineTo" IX="5"><Cell N="X" V="0"/><Cell N="Y" V="0"/></Row></Section>`;
    d.order.forEach((id) => { const it = d.items[id]; if (!it || it.kind === "image") return; ids[id] = ++n; const w = it.w / 96, h = it.h / 96;
      xml += `<Shape ID="${n}" Type="Shape"><Cell N="PinX" V="${inch(it.x + it.w / 2)}"/><Cell N="PinY" V="${inch(H - it.y - it.h / 2)}"/><Cell N="Width" V="${w.toFixed(4)}"/><Cell N="Height" V="${h.toFixed(4)}"/><Cell N="LocPinX" V="${(w / 2).toFixed(4)}" F="Width*0.5"/><Cell N="LocPinY" V="${(h / 2).toFixed(4)}" F="Height*0.5"/><Cell N="FillForegnd" V="${hex(it.fill)}"/><Cell N="FillPattern" V="${it.fill === "none" ? 0 : 1}"/><Cell N="LineColor" V="${hex(it.stroke)}"/><Cell N="LineWeight" V="${((it.sw || 1) / 96).toFixed(4)}"/>${rect(+w.toFixed(4), +h.toFixed(4))}<Text>${esc(itemLabel(it))}</Text></Shape>`; });
    Object.values(d.conns).forEach((c) => { const a = d.items[c.from], b = d.items[c.to]; if (!a || !b || !ids[c.from] || !ids[c.to]) return; const { s, e } = connEnds(a, b, c.style); ids["c" + c.id] = ++n;
      const minx = Math.min(s.x, e.x), maxy = Math.max(s.y, e.y), w = Math.max(0.01, Math.abs(e.x - s.x) / 96), h = Math.max(0.01, Math.abs(e.y - s.y) / 96), lx = (s.x - minx) / 96, ly = (maxy - s.y) / 96, ex = (e.x - minx) / 96, ey = (maxy - e.y) / 96;
      xml += `<Shape ID="${n}" Type="Shape"><Cell N="PinX" V="${inch((s.x + e.x) / 2)}"/><Cell N="PinY" V="${inch(H - (s.y + e.y) / 2)}"/><Cell N="Width" V="${w.toFixed(4)}"/><Cell N="Height" V="${h.toFixed(4)}"/><Cell N="LocPinX" V="${(w / 2).toFixed(4)}" F="Width*0.5"/><Cell N="LocPinY" V="${(h / 2).toFixed(4)}" F="Height*0.5"/><Cell N="BeginArrow" V="0"/><Cell N="EndArrow" V="${c.arrow ? 13 : 0}"/><Section N="Geometry" IX="0"><Cell N="NoFill" V="1"/><Cell N="NoLine" V="0"/><Row T="MoveTo" IX="1"><Cell N="X" V="${lx.toFixed(4)}"/><Cell N="Y" V="${ly.toFixed(4)}"/></Row><Row T="LineTo" IX="2"><Cell N="X" V="${ex.toFixed(4)}"/><Cell N="Y" V="${ey.toFixed(4)}"/></Row></Section></Shape>`; });
    z.file(`visio/pages/page${pi + 1}.xml`, `<?xml version="1.0" encoding="utf-8"?><PageContents ${NS} xml:space="preserve"><Shapes>${xml}</Shapes></PageContents>`);
  });
  return z.generateAsync({ type: "uint8array" });
}
export async function importVsdx(z: JSZip): Promise<{ name: string; doc: Doc }[]> {
  const px = (v: number) => v * 96, pagesXml = z.file("visio/pages/pages.xml"); if (!pagesXml) throw new Error("not a Visio drawing");
  const parse = (s: string) => new DOMParser().parseFromString(s, "text/xml"), cells = (el: Element) => { const m: Record<string, string> = {}; Array.from(el.children).forEach((c) => { if (c.tagName === "Cell") m[c.getAttribute("N") || ""] = c.getAttribute("V") || ""; }); return m; };
  const pd = parse(await pagesXml.async("string")), relsF = z.file("visio/pages/_rels/pages.xml.rels"), rels: Record<string, string> = {};
  if (relsF) Array.from(parse(await relsF.async("string")).getElementsByTagName("Relationship")).forEach((r) => { rels[r.getAttribute("Id") || ""] = r.getAttribute("Target") || ""; });
  const out: { name: string; doc: Doc }[] = [];
  for (const pg of Array.from(pd.getElementsByTagName("Page"))) {
    const rid = pg.getElementsByTagName("Rel")[0]?.getAttribute("r:id") || "", f = z.file("visio/pages/" + (rels[rid] || "")); if (!f) continue;
    const sheet = pg.getElementsByTagName("PageSheet")[0], pc = sheet ? cells(sheet) : {}, H = px(parseFloat(pc.PageHeight) || 8.27), xd = parse(await f.async("string")), d = emptyDoc(), map: Record<string, string> = {}, lines: { id: string; b?: string; e?: string }[] = [];
    Array.from(xd.getElementsByTagName("Shape")).forEach((sh) => {
      const c = cells(sh), id = sh.getAttribute("ID") || ""; if (c.BeginX !== undefined && c.EndX !== undefined) { lines.push({ id }); return; }
      if (c.PinX === undefined || c.Width === undefined || c.Height === undefined) return;
      const w = px(parseFloat(c.Width)), h = px(parseFloat(c.Height)); if (!(w > 0 && h > 0)) return;
      const text = (Array.from(sh.children).find((e) => e.tagName === "Text")?.textContent || "").trim(), fill = /^#[0-9a-f]{6}$/i.test(c.FillForegnd || "") ? c.FillForegnd : "#ffffff";
      const it = mkItem("rect", px(parseFloat(c.PinX)) - w / 2, H - px(parseFloat(c.PinY)) - h / 2, w, h, text, { fill, stroke: /^#[0-9a-f]{6}$/i.test(c.LineColor || "") ? c.LineColor : "#079a4a" }); d.items[it.id] = it; d.order.push(it.id); map[id] = it.id;
    });
    Array.from(xd.getElementsByTagName("Connect")).forEach((cn) => { const l = lines.find((x) => x.id === cn.getAttribute("FromSheet")); if (!l) return; const cell = cn.getAttribute("FromCell") || "", to = map[cn.getAttribute("ToSheet") || ""]; if (cell.startsWith("Begin")) l.b = to; else if (cell.startsWith("End")) l.e = to; });
    lines.forEach((l) => { if (l.b && l.e && l.b !== l.e) { const id = uid(); d.conns[id] = { id, from: l.b, to: l.e, style: "straight", arrow: true, dash: false, color: "#6b7280" }; } });
    if (Object.keys(d.items).length) out.push({ name: pg.getAttribute("NameU") || pg.getAttribute("Name") || `Page-${out.length + 1}`, doc: autoPage(d) });
  }
  return out;
}
export type { Item };
