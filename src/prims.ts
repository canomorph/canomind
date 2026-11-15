import { Item, wrap } from "./model";
export type Prim =
  | { t: "rect"; x: number; y: number; w: number; h: number; fill?: string; stroke?: string; sw?: number; fo?: number }
  | { t: "path"; d: string; fill?: string; stroke?: string; sw?: number; fo?: number }
  | { t: "line"; x1: number; y1: number; x2: number; y2: number; stroke: string; sw?: number }
  | { t: "text"; x: number; y: number; s: string; size: number; anchor: "start" | "middle" | "end"; color: string; bold?: boolean; ff?: string };
export const CHART_COLORS = ["#4472c4", "#ed7d31", "#a5a5a5", "#ffc000", "#5b9bd5", "#70ad47"];

export function tablePrims(it: Item): Prim[] {
  const tb = it.tbl; if (!tb) return []; const cw = it.w / tb.c, rh = it.h / tb.r, out: Prim[] = [], size = it.fs * 0.85, lh = size * 1.25, sw = Math.max(1, it.sw / 2);
  for (let i = 1; i < tb.r; i++) out.push({ t: "line", x1: 0, y1: i * rh, x2: it.w, y2: i * rh, stroke: it.stroke, sw });
  for (let j = 1; j < tb.c; j++) out.push({ t: "line", x1: j * cw, y1: 0, x2: j * cw, y2: it.h, stroke: it.stroke, sw });
  for (let r = 0; r < tb.r; r++) for (let c = 0; c < tb.c; c++) {
    const lines = wrap(tb.cells[r]?.[c] ?? "", cw, size, it.ff ?? "Calibri", it.bold || r === 0), y0 = rh * r + rh / 2 - ((lines.length - 1) * lh) / 2;
    lines.forEach((l, k) => { if (l) out.push({ t: "text", x: cw * c + cw / 2, y: y0 + k * lh, s: l, size, anchor: "middle", color: it.color, bold: it.bold || r === 0, ff: it.ff }); });
  }
  return out;
}
const nice = (x: number) => { const p = Math.pow(10, Math.floor(Math.log10(x || 1))), f = x / p; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p; };
export function chartPrims(it: Item): Prim[] {
  const ch = it.chart; if (!ch) return []; const W = it.w, H = it.h, out: Prim[] = [], col = it.color, size = Math.max(9, Math.min(13, it.fs * 0.75)), pie = ch.type === "pie" || ch.type === "donut";
  let top = 12; if (it.text) { out.push({ t: "text", x: W / 2, y: 18, s: it.text, size: size + 3, anchor: "middle", color: col, bold: true, ff: it.ff }); top = 34; }
  const left = ch.type === "bar" ? 56 : 40, right = 14, bottom = 40, pw = W - left - right, ph = H - top - bottom, names = pie ? ch.cats : ch.series.map((s) => s.name);
  let lx = 12; names.forEach((n, i) => { out.push({ t: "rect", x: lx, y: H - 17, w: 9, h: 9, fill: CHART_COLORS[i % 6] }); out.push({ t: "text", x: lx + 13, y: H - 12, s: n, size, anchor: "start", color: col, ff: it.ff }); lx += 13 + n.length * size * 0.55 + 14; });
  if (pie) {
    const vals = (ch.series[0]?.vals ?? []).map((v) => Math.max(0, v)), tot = vals.reduce((a, b) => a + b, 0) || 1, cx = W / 2, cy = top + ph / 2, r = Math.max(10, Math.min(pw, ph) / 2), ri = ch.type === "donut" ? r * 0.55 : 0;
    let a0 = -Math.PI / 2; vals.forEach((v, i) => {
      const da = Math.min((v / tot) * Math.PI * 2, Math.PI * 2 - 0.0001), a1 = a0 + da, big = da > Math.PI ? 1 : 0, p = (a: number, rr: number) => `${cx + rr * Math.cos(a)},${cy + rr * Math.sin(a)}`;
      const d = ri ? `M${p(a0, r)}A${r},${r} 0 ${big} 1 ${p(a1, r)}L${p(a1, ri)}A${ri},${ri} 0 ${big} 0 ${p(a0, ri)}Z` : `M${cx},${cy}L${p(a0, r)}A${r},${r} 0 ${big} 1 ${p(a1, r)}Z`;
      if (v > 0) out.push({ t: "path", d, fill: CHART_COLORS[i % 6], stroke: "#ffffff", sw: 1 }); a0 += da;
    });
    return out;
  }
  const all = ch.series.flatMap((s) => s.vals), step = nice(Math.max(1, ...all) / 4), maxT = step * Math.ceil(Math.max(1, ...all) / step), n = Math.max(1, ch.cats.length), ns = Math.max(1, ch.series.length), horiz = ch.type === "bar";
  for (let v = 0; v <= maxT + 1e-9; v += step) {
    if (horiz) { const x = left + (v / maxT) * pw; out.push({ t: "line", x1: x, y1: top, x2: x, y2: top + ph, stroke: "#d9d9d9", sw: 1 }); out.push({ t: "text", x, y: top + ph + 11, s: String(+v.toFixed(2)), size: size - 1, anchor: "middle", color: col, ff: it.ff }); }
    else { const y = top + ph - (v / maxT) * ph; out.push({ t: "line", x1: left, y1: y, x2: left + pw, y2: y, stroke: "#d9d9d9", sw: 1 }); out.push({ t: "text", x: left - 5, y, s: String(+v.toFixed(2)), size: size - 1, anchor: "end", color: col, ff: it.ff }); }
  }
  const band = (horiz ? ph : pw) / n;
  ch.cats.forEach((c, i) => { if (horiz) out.push({ t: "text", x: left - 5, y: top + band * i + band / 2, s: c, size, anchor: "end", color: col, ff: it.ff }); else out.push({ t: "text", x: left + band * i + band / 2, y: top + ph + 12, s: c, size, anchor: "middle", color: col, ff: it.ff }); });
  const val = (si: number, i: number) => Math.max(0, ch.series[si].vals[i] ?? 0);
  if (ch.type === "column" || horiz) {
    const gw = band * 0.7, bw = gw / ns;
    for (let si = 0; si < ns; si++) for (let i = 0; i < n; i++) {
      const v = val(si, i), len = (v / maxT) * (horiz ? pw : ph), off = band * i + (band - gw) / 2 + bw * si;
      out.push(horiz ? { t: "rect", x: left, y: top + off, w: len, h: bw, fill: CHART_COLORS[si % 6] } : { t: "rect", x: left + off, y: top + ph - len, w: bw, h: len, fill: CHART_COLORS[si % 6] });
    }
  } else {
    for (let si = 0; si < ns; si++) {
      const pts = ch.cats.map((_, i) => [left + band * i + band / 2, top + ph - (val(si, i) / maxT) * ph]), line = pts.map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join("");
      if (ch.type === "area" && pts.length) out.push({ t: "path", d: `${line}L${pts[pts.length - 1][0]},${top + ph}L${pts[0][0]},${top + ph}Z`, fill: CHART_COLORS[si % 6], fo: 0.35 });
      out.push({ t: "path", d: line, stroke: CHART_COLORS[si % 6], sw: 2 });
      pts.forEach((p) => out.push({ t: "rect", x: p[0] - 2.5, y: p[1] - 2.5, w: 5, h: 5, fill: CHART_COLORS[si % 6] }));
    }
  }
  out.push({ t: "line", x1: left, y1: top + ph, x2: left + pw, y2: top + ph, stroke: col, sw: 1 }); out.push({ t: "line", x1: left, y1: top, x2: left, y2: top + ph, stroke: col, sw: 1 });
  return out;
}
