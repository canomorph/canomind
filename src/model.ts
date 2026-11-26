import { textW } from "./measure";
import { t as tr } from "./i18n";
export type Kind = "rect"|"square"|"round"|"ellipse"|"circle"|"diamond"|"triangle"|"rtriangle"|"rotri"|"parallelogram"|"trapezoid"|"hexagon"|"heptagon"|"octagon"|"decagon"|"pentagon"|"star"|"star4"|"cylinder"|"cloud"|"arrow"|"larrow"|"uarrow"|"darrow"|"dblarrow"|"chevron"|"cross"|"cube"|"drop"|"semicircle"|"semiellipse"|"cone"|"invcone"|"pyramid"|"pointedoval"|"funnel"|"gear"|"document"|"terminator"|"callout"|"note"|"text"|"image"|"table"|"chart"|"notepad"|"todo";
export const GALLERY: Kind[] = ["rect","round","ellipse","diamond","triangle","parallelogram","hexagon","pentagon","star","cylinder","cloud","arrow","cross","document","terminator","callout"];
export interface Item { id:string; kind:Kind; x:number; y:number; w:number; h:number; text:string; fill:string; stroke:string; sw:number; color:string; fs:number; bold:boolean; italic:boolean; dash:boolean; src?:string; ff?:string; ul?:boolean; st?:boolean; ha?:"left"|"center"|"right"; va?:"top"|"middle"|"bottom"; bul?:boolean; ind?:number; shadow?:boolean; lock?:boolean; g?:string; tbl?:{r:number;c:number;cells:string[][]}; chart?:{type:string;cats:string[];series:{name:string;vals:number[]}[]}; img?:string; ih?:number; note?:string; nh?:number; fo?:number; so?:number; done?:boolean; bt?:string; runs?:Run[]; nruns?:Run[]; ns?:Fmt; rot?:number; te?:string; tes?:number; tec?:string; gt?:{k:string;c?:number;r?:number;s?:number} }
export interface Conn { id:string; from:string; to:string; style:"curve"|"straight"|"elbow"; arrow:boolean; dash:boolean; color:string }
export interface BgImg { id: string; src: string; x: number; y: number; w: number; h: number }
export interface Doc { items:Record<string,Item>; conns:Record<string,Conn>; order:string[]; bg?: { color?: string; imgs: BgImg[] }; page?: { w: number; h: number }; ink?: Stroke[] }
export interface Stroke { id: string; pts: [number, number][]; c: string; w: number; o: number; hl?: boolean }
export const emptyDoc = (): Doc => ({ items:{}, conns:{}, order:[] });
export const uid = () => Math.random().toString(36).slice(2, 9);

export function mkItem(kind: Kind, x:number, y:number, w:number, h:number, text="", extra: Partial<Item> = {}): Item {
  const b: Item = { id: uid(), kind, x, y, w, h, text, fill:"#0DF279", stroke:"#079a4a", sw:2, color:"#1a1a1a", fs:16, bold:false, italic:false, dash:false, ff:"Calibri" };
  if (kind === "text" || kind === "image") Object.assign(b, { fill:"none", sw:0 });
  if (kind === "note") Object.assign(b, { fill:"#fff3a3", stroke:"#d4b106", sw:1 });
  if (kind === "notepad") Object.assign(b, { fill:"#fffdf2", stroke:"#bdbdbd", sw:1 });
  if (kind === "todo") Object.assign(b, { fill:"#ffffff" });
  return { ...b, ...extra };
}


export function defSize(k: Kind): [number, number] {
  if (["square","circle","cross","star","star4","pentagon","heptagon","octagon","decagon","gear","cube","drop","pyramid","cone","invcone","funnel","triangle","rtriangle","rotri"].includes(k)) return [100, 100];
  if (k === "hexagon") return [120, 100]; if (k === "semicircle") return [100, 50]; if (k === "semiellipse") return [140, 60]; if (k === "text") return [120, 36]; if (k === "notepad") return [220, 200]; if (k === "todo") return [240, 44]; if (k === "chart") return [380, 260]; return [140, 80];
}
const poly = (n: number, w: number, h: number) => { let d = ""; for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + (i * 2 * Math.PI) / n; d += `${i ? "L" : "M"}${w / 2 + (w / 2) * Math.cos(a)},${h / 2 + (h / 2) * Math.sin(a)}`; } return d + "Z"; };
const starP = (w: number, h: number, n: number, inner: number) => { let d = ""; for (let i = 0; i < n * 2; i++) { const a = -Math.PI / 2 + (i * Math.PI) / n, q = i % 2 ? inner : 1; d += `${i ? "L" : "M"}${w / 2 + (w / 2) * q * Math.cos(a)},${h / 2 + (h / 2) * q * Math.sin(a)}`; } return d + "Z"; };
const gearP = (w: number, h: number) => { const cx = w / 2, cy = h / 2; let d = ""; for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4; const ps: [number, number][] = [[a - .3, .78], [a - .17, 1], [a + .17, 1], [a + .3, .78]]; ps.forEach(([t, r], j) => { d += `${i + j ? "L" : "M"}${cx + cx * r * Math.cos(t)},${cy + cy * r * Math.sin(t)}`; }); }
  const r = .3; return d + `ZM${cx + cx * r},${cy}A${cx * r},${cy * r} 0 1 0 ${cx - cx * r},${cy}A${cx * r},${cy * r} 0 1 0 ${cx + cx * r},${cy}Z`; };

export function shapePath(k: Kind, w: number, h: number): string {
  const r = Math.min(12, h / 3);
  switch (k) {
    case "note": { const f = foldSize(w, h); return `M0,0H${w}V${h - f}L${w - f},${h}H0Z`; }
    case "circle": return shapePath("ellipse", w, h);
    case "semicircle": case "semiellipse": return `M0,${h}A${w/2},${h} 0 0 1 ${w},${h}Z`;
    case "square": return `M0,0H${w}V${h}H0Z`;
    case "rtriangle": return `M0,0L0,${h}L${w},${h}Z`;
    case "rotri": return `M${w},0L${w},${h}L0,${h}Z`;
    case "heptagon": return poly(7, w, h); case "octagon": return poly(8, w, h); case "decagon": return poly(10, w, h);
    case "trapezoid": { const o = w * .2; return `M${o},0H${w-o}L${w},${h}H0Z`; }
    case "chevron": { const o = w * .3; return `M0,0H${w-o}L${w},${h/2}L${w-o},${h}H0L${o},${h/2}Z`; }
    case "cube": { const o = Math.min(w, h) * .25; return `M0,${o}H${w-o}V${h}H0ZM0,${o}L${o},0H${w}L${w-o},${o}ZM${w},0V${h-o}L${w-o},${h}V${o}Z`; }
    case "drop": return `M${w/2},0C${w*.85},${h*.35} ${w},${h*.55} ${w},${h*.68}A${w/2},${h*.32} 0 0 1 0,${h*.68}C0,${h*.55} ${w*.15},${h*.35} ${w/2},0Z`;
    case "cone": return `M${w/2},0L${w},${h*.85}A${w/2},${h*.15} 0 0 1 0,${h*.85}Z`;
    case "invcone": return `M0,${h*.15}A${w/2},${h*.15} 0 0 1 ${w},${h*.15}L${w/2},${h}Z`;
    case "pyramid": return `M0,${h}L${w/2},0L${w},${h}ZM${w/2},0L${w*.7},${h}`;
    case "pointedoval": return `M${w/2},0C${w},${h*.3} ${w},${h*.7} ${w/2},${h}C0,${h*.7} 0,${h*.3} ${w/2},0Z`;
    case "funnel": return `M0,0H${w}L${w*.58},${h*.5}V${h}H${w*.42}V${h*.5}Z`;
    case "gear": return gearP(w, h);
    case "star4": return starP(w, h, 4, .38);
    case "larrow": return `M${w},${h*.3}H${w*.4}V0L0,${h/2}L${w*.4},${h}V${h*.7}H${w}Z`;
    case "uarrow": return `M${w*.3},${h}V${h*.4}H0L${w/2},0L${w},${h*.4}H${w*.7}V${h}Z`;
    case "darrow": return `M${w*.3},0V${h*.6}H0L${w/2},${h}L${w},${h*.6}H${w*.7}V0Z`;
    case "dblarrow": return `M0,${h/2}L${w*.2},0V${h*.3}H${w*.8}V0L${w},${h/2}L${w*.8},${h}V${h*.7}H${w*.2}V${h}Z`;
    case "round": return `M${r},0H${w-r}Q${w},0 ${w},${r}V${h-r}Q${w},${h} ${w-r},${h}H${r}Q0,${h} 0,${h-r}V${r}Q0,0 ${r},0Z`;
    case "terminator": { const q = h / 2; return `M${q},0H${w-q}A${q},${q} 0 0 1 ${w-q},${h}H${q}A${q},${q} 0 0 1 ${q},0Z`; }
    case "ellipse": return `M0,${h/2}A${w/2},${h/2} 0 1 0 ${w},${h/2}A${w/2},${h/2} 0 1 0 0,${h/2}Z`;
    case "diamond": return `M${w/2},0L${w},${h/2}L${w/2},${h}L0,${h/2}Z`;
    case "triangle": return `M${w/2},0L${w},${h}L0,${h}Z`;
    case "parallelogram": { const o = w * .2; return `M${o},0H${w}L${w-o},${h}H0Z`; }
    case "hexagon": { const o = w * .25; return `M${o},0H${w-o}L${w},${h/2}L${w-o},${h}H${o}L0,${h/2}Z`; }
    case "pentagon": return `M${w/2},0L${w},${h*.4}L${w*.81},${h}H${w*.19}L0,${h*.4}Z`;
    case "star": return starP(w, h, 5, .4);
    case "cylinder": { const e = h * .15; return `M0,${e}A${w/2},${e} 0 0 1 ${w},${e}V${h-e}A${w/2},${e} 0 0 1 0,${h-e}ZM0,${e}A${w/2},${e} 0 0 0 ${w},${e}`; }
    case "cloud": return `M${w*.25},${h*.8}C${-w*.05},${h*.8} ${-w*.05},${h*.45} ${w*.2},${h*.45}C${w*.2},${h*.1} ${w*.55},${h*.05} ${w*.6},${h*.3}C${w*.8},${h*.15} ${w},${h*.4} ${w*.85},${h*.55}C${w*1.05},${h*.6} ${w},${h*.85} ${w*.78},${h*.8}Z`;
    case "arrow": return `M0,${h*.3}H${w*.6}V0L${w},${h/2}L${w*.6},${h}V${h*.7}H0Z`;
    case "cross": { const a = w/3, b = h/3; return `M${a},0H${2*a}V${b}H${w}V${2*b}H${2*a}V${h}H${a}V${2*b}H0V${b}H${a}Z`; }
    case "document": return `M0,0H${w}V${h*.85}Q${w*.75},${h*.7} ${w*.5},${h*.85}T0,${h*.85}Z`;
    case "callout": return `M0,0H${w}V${h*.75}H${w*.4}L${w*.2},${h}L${w*.25},${h*.75}H0Z`;
    default: return `M0,0H${w}V${h}H0Z`;
  }
}

export function wrap(text: string, w: number, fs: number, ff?: string, bold = false, italic = false): string[] {
  const out: string[] = [];
  if (ff === undefined) { const max = Math.max(3, Math.floor((w - 16) / (fs * .55))); for (const p of text.split("\n")) { let line = ""; for (const word of p.split(" ")) { if (line && (line + " " + word).length > max) { out.push(line); line = word; } else line = line ? line + " " + word : word; } out.push(line); } return out; }
  const maxW = Math.max(10, w - 16);
  for (const p of text.split("\n")) { let line = ""; for (const word of p.split(" ")) { const t = line ? line + " " + word : word; if (line && textW(t, fs, ff, bold, italic) > maxW) { out.push(line); line = word; } else line = t; } out.push(line); }
  return out;
}
export const A4L = { w: 1123, h: 794 };
export const pageOf = (d: Doc) => d.page ?? A4L;
// Grows a box (width and height by the same factor) until its text and note fit inside.
// Keeps text inside its box. mode "edit": grow downward. "resizeW" (box was narrowed): grow height top and bottom. "resizeH" (box was shortened): widen left and right.
export function growToFit(it: Item, mode: "edit" | "resizeW" | "resizeH" = "edit"): Partial<Item> {
  if (["image", "table", "chart"].includes(it.kind)) return {};
  const notepad = it.kind === "notepad", bs = baseStyle(it, "text"), ns = baseStyle(it, "note"), left = it.kind === "todo" ? 34 : 0, ind = (it.ind ?? 0) * 14, ih = it.ih ?? 0, lhp = Math.max(20, it.fs * 1.6);
  if ((it.rot ?? 0) % 180 !== 0) { const ls = layoutText(it.text, it.runs, bs, it.h - 16), th = ls.reduce((a, l) => a + l.h, 0), ml = Math.max(0, ...ls.map((l) => l.w)), w2 = Math.max(it.w, Math.ceil(th + 16)), h2 = Math.max(it.h, Math.ceil(ml + left + ind + 20)); return w2 === it.w && h2 === it.h ? {} : { w: w2, h: h2 }; }
  const measure = (ww: number) => {
    if (notepad) { const ls = layoutText(it.text, it.runs, bs, ww - 60); return { needW: Math.max(0, ...ls.map((l) => l.w)) + 60, needHm: 16 + ls.length * lhp, nh: 0 }; }
    const ls = layoutText(it.text, it.runs, bs, ww - ind - left - 16, (pi) => bulletPrefix(it, pi)), nl = it.note !== undefined ? layoutText(it.note, it.nruns, ns, ww - 32) : [];
    const ml = Math.max(0, ...ls.map((l) => l.w)), mn = Math.max(0, ...nl.map((l) => l.w)), th = ls.reduce((a, l) => a + l.h, 0), nth = nl.reduce((a, l) => a + l.h, 0);
    return { needW: Math.max(ml + ind + left + 20, mn + 32), needHm: ih + th + 16, nh: it.note !== undefined ? Math.max(34, Math.round(nth + 16)) : 0 };
  };
  let w = it.w, x = it.x, y = it.y, m = measure(w); const hmOld = it.h - (it.nh ?? 0); let hm = hmOld;
  if (m.needW > w + 0.5) { const nw = Math.ceil(m.needW); if (mode !== "edit") x -= (nw - w) / 2; w = nw; m = measure(w); }
  if (m.needHm > hm + 0.5) {
    if (mode === "resizeH") {
      let hi = w, mm = m; for (let k = 0; k < 6 && mm.needHm > hmOld; k++) { hi *= 1.6; mm = measure(hi); }
      if (mm.needHm <= hmOld) { let lo = w; for (let k = 0; k < 18; k++) { const mid = (lo + hi) / 2; if (measure(mid).needHm <= hmOld) hi = mid; else lo = mid; } const nw = Math.ceil(hi); x -= (nw - w) / 2; w = nw; m = measure(w); } else hm = Math.ceil(m.needHm);
    } else { const nhm = Math.ceil(m.needHm); if (mode === "resizeW") y -= (nhm - hm) / 2; hm = nhm; }
  }
  const h = hm + m.nh, out: Partial<Item> = {}; if (w !== it.w) out.w = w; if (h !== it.h) out.h = h; if (x !== it.x) out.x = x; if (y !== it.y) out.y = y; if (it.note !== undefined && m.nh !== (it.nh ?? 0)) out.nh = m.nh;
  return out;
}

export function connPath(a: Item, b: Item, style: Conn["style"]) {
  const ac = { x: a.x + a.w/2, y: a.y + a.h/2 }, bc = { x: b.x + b.w/2, y: b.y + b.h/2 };
  const dx = bc.x - ac.x, dy = bc.y - ac.y, horiz = Math.abs(dx) >= Math.abs(dy);
  const s = horiz ? { x: dx > 0 ? a.x + a.w : a.x, y: ac.y } : { x: ac.x, y: dy > 0 ? a.y + a.h : a.y };
  const e = horiz ? { x: dx > 0 ? b.x : b.x + b.w, y: bc.y } : { x: bc.x, y: dy > 0 ? b.y : b.y + b.h };
  const cx = (s.x + e.x) / 2, cy = (s.y + e.y) / 2;
  if (style === "straight") return `M${s.x},${s.y}L${e.x},${e.y}`;
  if (style === "elbow") return horiz ? `M${s.x},${s.y}H${cx}V${e.y}H${e.x}` : `M${s.x},${s.y}V${cy}H${e.x}V${e.y}`;
  return horiz ? `M${s.x},${s.y}C${cx},${s.y} ${cx},${e.y} ${e.x},${e.y}` : `M${s.x},${s.y}C${s.x},${cy} ${e.x},${cy} ${e.x},${e.y}`;
}

// Tree layout to the right for every connected tree.
// Tree auto layout that keeps every tree where it is (top-left corner is preserved). "h": root left, children right. "v": root on top, children below.
export function autoLayout(d: Doc, mode: "h" | "v" = "h"): Doc {
  const kids: Record<string, string[]> = {}, hasP = new Set<string>();
  Object.values(d.conns).forEach((c) => { if (d.items[c.from] && d.items[c.to]) { (kids[c.from] ||= []).push(c.to); hasP.add(c.to); } });
  const roots = d.order.filter((id) => kids[id] && !hasP.has(id)); if (!roots.length) return d;
  const items = { ...d.items }, seen = new Set<string>();
  for (const r of roots) {
    if (seen.has(r)) continue;
    const tk: Record<string, string[]> = {}, ids: string[] = [], build = (id: string) => { seen.add(id); ids.push(id); tk[id] = []; for (const c of kids[id] || []) if (!seen.has(c)) { tk[id].push(c); build(c); } };
    build(r);
    const ox = Math.min(...ids.map((i) => d.items[i].x)), oy = Math.min(...ids.map((i) => d.items[i].y)), local: Record<string, { x: number; y: number }> = {};
    if (mode === "h") {
      let y = 0; const place = (id: string, x: number): number => { const it = d.items[id], ch = tk[id];
        if (!ch.length) { const cy = y + it.h / 2; y += it.h + 24; local[id] = { x, y: cy - it.h / 2 }; return cy; }
        const cs = ch.map((c) => place(c, x + it.w + 80)), cy = (cs[0] + cs[cs.length - 1]) / 2; local[id] = { x, y: cy - it.h / 2 }; return cy; };
      place(r, 0);
    } else {
      const W: Record<string, number> = {}, sw = (id: string): number => { const ch = tk[id], tot = ch.reduce((a, c) => a + sw(c), 0) + 30 * Math.max(0, ch.length - 1); return (W[id] = Math.max(d.items[id].w, tot)); };
      sw(r);
      const place = (id: string, left: number, y: number) => { const it = d.items[id], ch = tk[id], tot = ch.reduce((a, c) => a + W[c], 0) + 30 * Math.max(0, ch.length - 1); local[id] = { x: left + W[id] / 2 - it.w / 2, y };
        let cl = left + (W[id] - tot) / 2; ch.forEach((c) => { place(c, cl, y + it.h + 60); cl += W[c] + 30; }); };
      place(r, 0, 0);
    }
    const nx = Math.min(...ids.map((i) => local[i].x)), ny = Math.min(...ids.map((i) => local[i].y));
    ids.forEach((i) => { items[i] = { ...items[i], x: local[i].x - nx + ox, y: local[i].y - ny + oy }; });
  }
  return { ...d, items };
}

export function lum(c: string) {
  let h = c.replace("#", ""); if (h.length === 3) h = h.split("").map((x) => x + x).join(""); if (!/^[0-9a-f]{6}$/i.test(h)) return 0.5;
  const n = parseInt(h, 16); return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
}
export const readable = (c: string, dark: boolean) => (dark ? (lum(c) < 0.4 ? "#f0f0f0" : c) : lum(c) > 0.75 ? "#1a1a1a" : c);

// Parent/children of every item: real connectors + text boxes placed right below a shape (treated as its caption).
export function buildTree(d: Doc) {
  const kids: Record<string, string[]> = {}, parent: Record<string, string> = {};
  Object.values(d.conns).forEach((c) => { if (d.items[c.from] && d.items[c.to] && !parent[c.to]) { (kids[c.from] ||= []).push(c.to); parent[c.to] = c.from; } });
  const its = d.order.map((i) => d.items[i]).filter(Boolean);
  its.filter((x) => x.kind === "text" && !parent[x.id]).forEach((x) => {
    const cx = x.x + x.w / 2; let best: Item | undefined, bd = 1e9;
    its.forEach((s) => { if (s.id === x.id || s.kind === "text" || s.kind === "image") return; const gap = x.y - (s.y + s.h); if (gap >= -10 && gap <= 90 && cx >= s.x - 20 && cx <= s.x + s.w + 20 && gap < bd) { best = s; bd = gap; } });
    if (best) { (kids[best.id] ||= []).push(x.id); parent[x.id] = best.id; }
  });
  return { kids, parent };
}

export function connEnds(a: Item, b: Item, style: Conn["style"]) {
  const ac = { x: a.x + a.w / 2, y: a.y + a.h / 2 }, bc = { x: b.x + b.w / 2, y: b.y + b.h / 2 }, dx = bc.x - ac.x, dy = bc.y - ac.y, horiz = Math.abs(dx) >= Math.abs(dy);
  const s = horiz ? { x: dx > 0 ? a.x + a.w : a.x, y: ac.y } : { x: ac.x, y: dy > 0 ? a.y + a.h : a.y };
  const e = horiz ? { x: dx > 0 ? b.x : b.x + b.w, y: bc.y } : { x: bc.x, y: dy > 0 ? b.y : b.y + b.h };
  let dir = horiz ? { x: dx > 0 ? 1 : -1, y: 0 } : { x: 0, y: dy > 0 ? 1 : -1 };
  if (style === "straight") { const l = Math.hypot(e.x - s.x, e.y - s.y) || 1; dir = { x: (e.x - s.x) / l, y: (e.y - s.y) / l }; }
  return { s, e, dir };
}
export function bounds(d: Doc, _pad = 30) { const p = pageOf(d); return { x: 0, y: 0, w: p.w, h: p.h }; }
export const itemLabel = (i: Item) => i.text.replace(/\n/g, " ").trim() || (i.kind === "table" ? tr("Table") : i.kind === "chart" ? tr("Chart") : "");
export function listLines(d: Doc): { depth: number; text: string }[] {
  const { kids, parent } = buildTree(d), pos = (x: string) => d.items[x].y * 1e4 + d.items[x].x, seen = new Set<string>(), out: { depth: number; text: string }[] = [];
  const walk = (id: string, depth: number) => { if (seen.has(id) || !d.items[id]) return; seen.add(id); const it = d.items[id];
    if (it.kind !== "image" && (itemLabel(it) || kids[id])) out.push({ depth, text: itemLabel(it) || "…" });
    (kids[id] || []).slice().sort((a, b) => pos(a) - pos(b)).forEach((k) => walk(k, depth + 1)); };
  d.order.filter((x) => d.items[x] && !parent[x]).sort((a, b) => pos(a) - pos(b)).forEach((r) => walk(r, 0)); d.order.forEach((x) => walk(x, 0));
  return out;
}

export function gridPatternSvg(type: string, c: string) {
  const iso = type === "iso" || type === "isodots", w = iso ? 34.641 : 20, st = `fill="none" stroke="${c}" stroke-width="0.6"`;
  const body = type === "square" ? `<path d="M20 0H0V20" ${st}/>` : type === "lines" ? `<path d="M0 20H20" ${st}/>` : type === "iso" ? `<path d="M0 0L34.641 20M0 20L34.641 0M0 0V20" ${st}/>`
    : type === "isodots" ? `<circle cx="1" cy="1" r="1" fill="${c}"/><circle cx="18.32" cy="11" r="1" fill="${c}"/>` : `<circle cx="1" cy="1" r="1" fill="${c}"/>`;
  return `<pattern id="gp" width="${w}" height="20" patternUnits="userSpaceOnUse">${body}</pattern>`;
}

const roman = (n: number) => { let r = ""; for (const [v, s] of [[1000, "m"], [900, "cm"], [500, "d"], [400, "cd"], [100, "c"], [90, "xc"], [50, "l"], [40, "xl"], [10, "x"], [9, "ix"], [5, "v"], [4, "iv"], [1, "i"]] as [number, string][]) while (n >= v) { r += s; n -= v; } return r; };
export const BULLETS: [string, string][] = [["none", "None"], ["dot", "•  Bullet"], ["circle", "○  Circle"], ["square", "▪  Square"], ["dash", "–  Dash"], ["num", "1. 2. 3."], ["alpha", "a. b. c."], ["ALPHA", "A. B. C."], ["roman", "i. ii. iii."]];
export function bulletPrefix(it: Item, i: number): string {
  const k = it.bt ?? (it.bul ? "dot" : "none"); if (k === "none") return ""; const n = i + 1;
  return k === "dot" ? "• " : k === "circle" ? "○ " : k === "square" ? "▪ " : k === "dash" ? "– " : k === "num" ? `${n}. ` : k === "alpha" ? `${String.fromCharCode(97 + ((n - 1) % 26))}. ` : k === "ALPHA" ? `${String.fromCharCode(65 + ((n - 1) % 26))}. ` : `${roman(n)}. `;
}
export const bulletize = (it: Item) => it.text.split("\n").map((l, i) => bulletPrefix(it, i) + l).join("\n");

// ---------- rich text: formatting runs over a text, laid out line by line ----------
export interface Fmt { h?: string; b?: boolean; i?: boolean; u?: boolean; k?: boolean; c?: string; z?: number; f?: string }
export interface Run extends Fmt { s: number; e: number }
export interface TStyle { h?: string; b: boolean; i: boolean; u: boolean; k: boolean; c: string; z: number; f: string }
export const baseStyle = (it: Item, field: "text" | "note"): TStyle => field === "text"
  ? { b: !!it.bold, i: !!it.italic, u: !!it.ul, k: !!it.st || (it.kind === "todo" && !!it.done), c: it.color, z: it.fs, f: it.ff ?? "Calibri" }
  : { b: it.ns?.b ?? false, i: it.ns?.i ?? false, u: it.ns?.u ?? false, k: it.ns?.k ?? false, c: it.ns?.c ?? it.color, z: it.ns?.z ?? Math.max(8, it.fs - 2), f: it.ns?.f ?? it.ff ?? "Calibri" };
export const styleAt = (base: TStyle, runs: Run[] | undefined, idx: number): TStyle => { const r = runs?.find((x) => idx >= x.s && idx < x.e); return r ? { h: r.h ?? base.h, b: r.b ?? base.b, i: r.i ?? base.i, u: r.u ?? base.u, k: r.k ?? base.k, c: r.c ?? base.c, z: r.z ?? base.z, f: r.f ?? base.f } : base; };
export interface Seg { s: number; e: number; st: TStyle }
export interface LLine { segs: Seg[]; prefix: string; w: number; h: number; start: number; end: number }
export function splitSegs(s: number, e: number, base: TStyle, runs?: Run[]): Seg[] {
  const cuts = new Set<number>([s, e]); runs?.forEach((r) => { if (r.s > s && r.s < e) cuts.add(r.s); if (r.e > s && r.e < e) cuts.add(r.e); });
  const pts = Array.from(cuts).sort((a, b) => a - b), out: Seg[] = []; for (let k = 0; k + 1 < pts.length; k++) out.push({ s: pts[k], e: pts[k + 1], st: styleAt(base, runs, pts[k]) }); return out;
}
export const rangeW = (text: string, s: number, e: number, base: TStyle, runs?: Run[]) => splitSegs(s, e, base, runs).reduce((w, g) => w + textW(text.slice(g.s, g.e), g.st.z, g.st.f, g.st.b, g.st.i), 0);
export function layoutText(text: string, runs: Run[] | undefined, base: TStyle, maxW: number, prefixOf?: (pi: number) => string): LLine[] {
  const lines: LLine[] = []; let off = 0; const SPW = textW(" ", base.z, base.f, base.b, base.i);
  text.split("\n").forEach((para, pi) => {
    const prefix = prefixOf ? prefixOf(pi) : "", pw = prefix ? textW(prefix, base.z, base.f, base.b, base.i) : 0, words = para.split(" ");
    let ls = off, cw = pw, first = true, started = false, le = off, pos = off;
    const push = (end: number, w: number) => { const segs = splitSegs(ls, end, base, runs); lines.push({ segs, prefix: first ? prefix : "", w, h: Math.max(base.z, ...segs.map((g) => g.st.z)) * 1.25, start: ls, end }); first = false; };
    for (let wi = 0; wi < words.length; wi++) {
      const word = words[wi], ws = pos, we = pos + word.length, sp = wi > 0 ? SPW : 0, ww = word ? rangeW(text, ws, we, base, runs) : 0;
      if (started && cw + sp + ww > maxW) { push(le, cw); ls = ws; cw = ww; le = we; } else { cw += sp + ww; started = true; le = we; }
      pos = we + 1;
    }
    push(le, cw); off += para.length + 1;
  });
  return lines;
}
const sameFmt = (a: Fmt, b: Fmt) => (["b", "i", "u", "k", "c", "z", "f", "h"] as (keyof Fmt)[]).every((k) => a[k] === b[k]);
export function applyRuns(runs: Run[] | undefined, s: number, e: number, p: Fmt, len: number, base: TStyle): Run[] {
  const cur = runs ?? [], cuts = new Set<number>([0, len, Math.min(s, len), Math.min(e, len)]); cur.forEach((r) => { cuts.add(Math.max(0, Math.min(len, r.s))); cuts.add(Math.max(0, Math.min(len, r.e))); });
  const pts = Array.from(cuts).sort((a, b) => a - b), out: Run[] = [];
  for (let k = 0; k + 1 < pts.length; k++) {
    const a = pts[k], b = pts[k + 1]; if (b <= a) continue; const old = cur.find((r) => a >= r.s && a < r.e); let f: Fmt = old ? { h: old.h, b: old.b, i: old.i, u: old.u, k: old.k, c: old.c, z: old.z, f: old.f } : {};
    if (a >= s && b <= e) f = { ...f, ...p }; const clean: Fmt = {};
    (Object.keys(f) as (keyof Fmt)[]).forEach((key) => { if (f[key] !== undefined && f[key] !== (base as any)[key]) (clean as any)[key] = f[key]; });
    if (Object.keys(clean).length) { const prev = out[out.length - 1]; if (prev && prev.e === a && sameFmt(prev, clean)) prev.e = b; else out.push({ s: a, e: b, ...clean }); }
  }
  return out;
}
export function stripRuns(runs: Run[] | undefined, p: Fmt): Run[] | undefined {
  if (!runs) return runs; const keys = Object.keys(p) as (keyof Fmt)[];
  return runs.map((r) => { const c: any = { ...r }; keys.forEach((k) => delete c[k]); return c as Run; }).filter((r) => (["b", "i", "u", "k", "c", "z", "f", "h"] as (keyof Fmt)[]).some((k) => r[k] !== undefined));
}
// keeps formatting runs attached to the right characters when the text is edited
export function shiftRuns(runs: Run[] | undefined, oldT: string, newT: string): Run[] | undefined {
  if (!runs || !runs.length) return runs; let p = 0; const ol = oldT.length, nl = newT.length; while (p < ol && p < nl && oldT[p] === newT[p]) p++;
  let q = 0; while (q < ol - p && q < nl - p && oldT[ol - 1 - q] === newT[nl - 1 - q]) q++;
  const removed = ol - p - q, ins = nl - p - q, delta = nl - ol, out: Run[] = [];
  runs.forEach((r) => { let s = r.s, e = r.e;
    if (e <= p) { /* before the edit */ } else if (s >= p + removed && !(removed === 0 && s === p && false)) { s += delta; e += delta; }
    else { s = s < p ? s : p; e = e > p + removed ? e + delta : p + ins; }
    if (e > s) out.push({ ...r, s, e }); });
  return out;
}

export const foldSize = (w: number, h: number) => Math.min(24, Math.min(w, h) * 0.2);
export const hasShadow = (it: Item) => it.shadow ?? it.kind === "note";
// text rotation (0/90/180/270): virtual text box -> item coordinates
export const rotXform = (it: Item) => { const r = it.kind === "notepad" ? 0 : (it.rot ?? 0) % 360; return r === 90 ? `translate(${it.w},0) rotate(90)` : r === 270 ? `translate(0,${it.h}) rotate(270)` : r === 180 ? `translate(${it.w},${it.h}) rotate(180)` : ""; };
export const toVirtual = (it: Item, lx: number, ly: number): [number, number] => { const r = it.kind === "notepad" ? 0 : (it.rot ?? 0) % 360; return r === 90 ? [ly, it.w - lx] : r === 270 ? [it.h - ly, lx] : r === 180 ? [it.w - lx, it.h - ly] : [lx, ly]; };
export interface PLine { ln: LLine; sx: number; y: number; h: number }
// where every line of the text (or note) is drawn, in virtual (unrotated) box coordinates
export function placeLines(it: Item, field: "text" | "note"): PLine[] {
  const ind = (it.ind ?? 0) * 14, left = it.kind === "todo" ? 34 : 0, ha = it.ha ?? "center", va = it.va ?? "middle", nh = it.nh ?? 0;
  if (field === "note") { const ns = baseStyle(it, "note"), ls = layoutText(it.note ?? "", it.nruns, ns, it.w - 32); let y = it.h - nh + 8; return ls.map((ln) => { const p = { ln, sx: it.w / 2 - ln.w / 2, y, h: ln.h }; y += ln.h; return p; }); }
  const bs = baseStyle(it, "text"), rot = it.kind !== "notepad" && (it.rot ?? 0) % 180 !== 0, W = rot ? it.h : it.w, H = rot ? it.w : it.h, ih = rot ? 0 : it.ih ?? 0, nhh = rot ? 0 : nh;
  if (it.kind === "notepad") { const lh = Math.max(20, it.fs * 1.6), ls = layoutText(it.text, it.runs, bs, it.w - 60); return ls.map((ln, i) => ({ ln, sx: 38, y: 8 + i * lh + 2, h: lh })); }
  const ls = layoutText(it.text, it.runs, bs, W - ind - left - 16, (pi) => bulletPrefix(it, pi)), th = ls.reduce((a, l) => a + l.h, 0), top = ih, bottom = H - nhh;
  let y = va === "top" ? top + 8 : va === "bottom" ? bottom - 8 - th : (top + bottom) / 2 - th / 2; const tx = ha === "left" ? 8 + left + ind : ha === "right" ? W - 8 : left + (W - left) / 2 + ind / 2;
  return ls.map((ln) => { const sx = ha === "left" ? tx : ha === "right" ? tx - ln.w : tx - ln.w / 2, p = { ln, sx, y, h: ln.h }; y += ln.h; return p; });
}
export const inkPath = (pts: [number, number][]) => { if (!pts.length) return ""; if (pts.length < 3) return `M${pts[0][0]},${pts[0][1]}` + pts.slice(1).map((p) => `L${p[0]},${p[1]}`).join("") + (pts.length === 1 ? `l0.1,0` : "");
  let d = `M${pts[0][0]},${pts[0][1]}`; for (let i = 1; i < pts.length - 1; i++) d += `Q${pts[i][0]},${pts[i][1]} ${(pts[i][0] + pts[i + 1][0]) / 2},${(pts[i][1] + pts[i + 1][1]) / 2}`; const l = pts[pts.length - 1]; return d + `L${l[0]},${l[1]}`; };
