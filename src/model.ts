import { textW } from "./measure";
import { t as tr } from "./i18n";
export type Kind = "rect"|"square"|"round"|"ellipse"|"circle"|"diamond"|"triangle"|"rtriangle"|"rotri"|"parallelogram"|"trapezoid"|"hexagon"|"heptagon"|"octagon"|"decagon"|"pentagon"|"star"|"star4"|"cylinder"|"cloud"|"arrow"|"larrow"|"uarrow"|"darrow"|"dblarrow"|"chevron"|"cross"|"cube"|"drop"|"semicircle"|"semiellipse"|"cone"|"invcone"|"pyramid"|"pointedoval"|"funnel"|"gear"|"document"|"terminator"|"callout"|"note"|"text"|"image"|"table"|"chart"|"notepad"|"todo";
export const GALLERY: Kind[] = ["rect","round","ellipse","diamond","triangle","parallelogram","hexagon","pentagon","star","cylinder","cloud","arrow","cross","document","terminator","callout"];
export interface Item { id:string; kind:Kind; x:number; y:number; w:number; h:number; text:string; fill:string; stroke:string; sw:number; color:string; fs:number; bold:boolean; italic:boolean; dash:boolean; src?:string; ff?:string; ul?:boolean; st?:boolean; ha?:"left"|"center"|"right"; va?:"top"|"middle"|"bottom"; bul?:boolean; ind?:number; shadow?:boolean; lock?:boolean; g?:string; tbl?:{r:number;c:number;cells:string[][]}; chart?:{type:string;cats:string[];series:{name:string;vals:number[]}[]}; img?:string; ih?:number; note?:string; nh?:number; fo?:number; so?:number; done?:boolean; bt?:string; gt?:{k:string;c?:number;r?:number;s?:number} }
export interface Conn { id:string; from:string; to:string; style:"curve"|"straight"|"elbow"; arrow:boolean; dash:boolean; color:string }
export interface BgImg { id: string; src: string; x: number; y: number; w: number; h: number }
export interface Doc { items:Record<string,Item>; conns:Record<string,Conn>; order:string[]; bg?: { color?: string; imgs: BgImg[] }; page?: { w: number; h: number } }
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
export function growToFit(it: Item): Partial<Item> {
  if (["image", "table", "chart", "notepad"].includes(it.kind)) return {};
  let w = it.w, hm = it.h - (it.nh ?? 0), nh = it.nh ?? 0; const nh0 = nh, ih = it.ih ?? 0, left = it.kind === "todo" ? 34 : 0, ind = (it.ind ?? 0) * 14, lh = it.fs * 1.25, nfs = Math.max(10, it.fs * .8), ff = it.ff ?? "Calibri";
  const raw = bulletize(it);
  for (let k = 0; k < 8; k++) {
    const lines = wrap(raw, w - ind - left, it.fs, ff, it.bold, it.italic), nl = it.note !== undefined ? wrap(it.note, w - 16, nfs, ff) : [];
    const maxLine = Math.max(0, ...lines.map((l) => textW(l, it.fs, ff, it.bold, it.italic))), maxNote = Math.max(0, ...nl.map((l) => textW(l, nfs, ff)));
    nh = it.note !== undefined ? Math.max(34, Math.round(nl.length * nfs * 1.25 + 16)) : 0;
    const f = Math.max(1, Math.max(maxLine + ind + left + 20, maxNote + 32) / w, (ih + lines.length * lh + 16) / hm);
    if (f <= 1.0001) break; w = Math.ceil(w * f); hm = Math.ceil(hm * f);
  }
  const h = hm + nh; if (w === it.w && h === it.h && nh === nh0) return {};
  return it.note !== undefined ? { w, h, nh } : { w, h };
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
export function autoLayout(d: Doc): Doc {
  const kids: Record<string,string[]> = {}, hasP = new Set<string>();
  Object.values(d.conns).forEach((c) => { if (d.items[c.from] && d.items[c.to]) { (kids[c.from] ||= []).push(c.to); hasP.add(c.to); } });
  const roots = d.order.filter((id) => kids[id] && !hasP.has(id));
  if (!roots.length) return d;
  const items = { ...d.items }, seen = new Set<string>(); let y = items[roots[0]].y;
  const place = (id: string, x: number): number => {
    seen.add(id); const it = items[id], ch = (kids[id] || []).filter((c) => !seen.has(c));
    if (!ch.length) { const cy = y + it.h/2; y += it.h + 24; items[id] = { ...it, x, y: cy - it.h/2 }; return cy; }
    const cs = ch.map((c) => place(c, x + it.w + 80)), cy = (cs[0] + cs[cs.length-1]) / 2;
    items[id] = { ...it, x, y: cy - it.h/2 }; return cy;
  };
  roots.forEach((r) => { place(r, items[r].x); y += 30; });
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
export function bulletize(it: Item): string {
  const k = it.bt ?? (it.bul ? "dot" : "none"); if (k === "none") return it.text;
  return it.text.split("\n").map((l, i) => { const n = i + 1; return (k === "dot" ? "• " : k === "circle" ? "○ " : k === "square" ? "▪ " : k === "dash" ? "– " : k === "num" ? `${n}. ` : k === "alpha" ? `${String.fromCharCode(97 + ((n - 1) % 26))}. ` : k === "ALPHA" ? `${String.fromCharCode(65 + ((n - 1) % 26))}. ` : `${roman(n)}. `) + l; }).join("\n");
}
