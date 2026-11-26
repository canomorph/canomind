import { textW } from "./measure";
import { Conn, Doc, Item, LLine, Run, Stroke, TStyle, baseStyle, connPath, foldSize, hasShadow, inkPath, placeLines, rangeW, readable, rotXform, shapePath, styleAt } from "./model";
import { Prim, chartPrims, tablePrims } from "./prims";
import { Checker, SpellOpts, issues } from "./spell";

export type SpellCtx = { sp: Checker; lang: string; opts: SpellOpts } | null | undefined;
export const Defs = () => (
  <defs><marker id="arr" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0L10,5L0,10z" fill="context-stroke" /></marker></defs>
);
const URL_RE = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
const fam = (f: string) => `${f}, "Segoe UI", system-ui, sans-serif`;
const decoOf = (st: TStyle) => [st.u ? "underline" : "", st.k ? "line-through" : ""].join(" ").trim() || undefined;
const tstyle = { pointerEvents: "none" as const, userSelect: "none" as const };
const fxAttrs = (it: Item) => (it.te === "outline" ? { stroke: it.tec ?? "#000000", strokeWidth: (it.tes ?? 2) * 2, paintOrder: "stroke" as const, strokeLinejoin: "round" as const } : {});
const fxStyle = (it: Item) => (it.te === "shadow" ? { filter: `drop-shadow(${it.tes ?? 2}px ${it.tes ?? 2}px ${Math.max(1, (it.tes ?? 2) / 2)}px ${it.tec ?? "#000000"})` } : {});
function segNodes(sub: string, st: TStyle, baseCol: string, base: TStyle, key: string) {
  return sub.split(URL_RE).map((p, i) => { if (!p) return null; const url = i % 2 === 1 ? (p.startsWith("www.") ? "https://" + p : p) : st.h, link = !!url;
    return <tspan key={key + i} data-link={url} fontSize={st.z} fontWeight={st.b ? 700 : 400} fontStyle={st.i ? "italic" : "normal"} fill={link ? "#4da3ff" : st.c === base.c ? baseCol : st.c}
      textDecoration={link ? "underline" : decoOf(st)} fontFamily={fam(st.f)} style={link ? { pointerEvents: "visiblePainted", cursor: "pointer" } : undefined}>{p}</tspan>; });
}
const squig = (x: number, y: number, w: number, color: string, key: string) => {
  let d = `M${x},${y}`; const n = Math.max(2, Math.round(w / 1.5)); for (let i = 1; i <= n; i++) d += `L${x + (w * i) / n},${y + (i % 2 ? 1.5 : 0)}`;
  return <path key={key} d={d} fill="none" stroke={color} strokeWidth={1} pointerEvents="none" />;
};
// red wavy = misspelled word, blue wavy = grammar / repeated word
function marks(ln: LLine, text: string, sx: number, cy: number, base: TStyle, runs: Run[] | undefined, sp: SpellCtx, key: string, first: boolean) {
  if (!sp) return null; const plain = ln.prefix + text.slice(ln.start, ln.end), pl = ln.prefix.length, pw = ln.prefix ? textW(ln.prefix, base.z, base.f, base.b, base.i) : 0;
  return issues(plain, sp.sp, sp.lang, first, sp.opts).filter((s) => s.i >= pl).map((s, k) => {
    const a = ln.start + (s.i - pl); return squig(sx + pw + rangeW(text, ln.start, a, base, runs), cy + styleAt(base, runs, a).z * 0.55, rangeW(text, a, a + s.w.length, base, runs), s.kind === "spell" ? "#e53935" : "#1e88e5", key + k);
  });
}
function lineEl(ln: LLine, text: string, x: number, cy: number, bs: TStyle, col: string, key: string, it: Item, fo = 1) {
  return <text key={key} x={x} y={cy} textAnchor="start" dominantBaseline="central" fontSize={bs.z} fill={col} fillOpacity={fo} fontFamily={fam(bs.f)} {...fxAttrs(it)} style={{ ...tstyle, ...fxStyle(it) }}>
    {ln.prefix && <tspan>{ln.prefix}</tspan>}{ln.segs.map((g, k) => segNodes(text.slice(g.s, g.e), g.st, col, bs, `${key}-${k}-`))}</text>;
}
export function PrimsSvg({ prims, ff }: { prims: Prim[]; ff: string }) {
  return <>{prims.map((p, i) => {
    if (p.t === "rect") return <rect key={i} x={p.x} y={p.y} width={p.w} height={p.h} fill={p.fill ?? "none"} fillOpacity={p.fo} stroke={p.stroke ?? "none"} strokeWidth={p.sw} />;
    if (p.t === "path") return <path key={i} d={p.d} fill={p.fill ?? "none"} fillOpacity={p.fo} stroke={p.stroke ?? "none"} strokeWidth={p.sw} strokeLinejoin="round" />;
    if (p.t === "line") return <line key={i} x1={p.x1} y1={p.y1} x2={p.x2} y2={p.y2} stroke={p.stroke} strokeWidth={p.sw} />;
    return <text key={i} x={p.x} y={p.y} textAnchor={p.anchor} dominantBaseline="central" fontSize={p.size} fill={p.color} fontWeight={p.bold ? 700 : 400} fontFamily={ff} style={tstyle}>{p.s}</text>;
  })}</>;
}
export function InkView({ strokes }: { strokes: Stroke[] }) {
  return <>{strokes.map((s) => <path key={s.id} d={inkPath(s.pts)} fill="none" stroke={s.c} strokeWidth={s.w} strokeOpacity={s.o} strokeLinecap="round" strokeLinejoin="round" style={s.hl ? { mixBlendMode: "multiply" } : undefined} pointerEvents="none" />)}</>;
}
export function ItemView({ it, dark, spell }: { it: Item; dark?: boolean; spell?: SpellCtx }) {
  const col = dark === undefined || it.fill !== "none" ? it.color : readable(it.color, dark), ff = fam(it.ff ?? "Calibri");
  const shadow = hasShadow(it) ? { filter: "drop-shadow(3px 4px 3px rgba(0,0,0,.35))" } : undefined;
  if (it.kind === "image") return <g data-id={it.id} transform={`translate(${it.x},${it.y})`}><image href={it.src} width={it.w} height={it.h} preserveAspectRatio="none" style={shadow} /></g>;
  const ih = it.ih ?? 0, nh = it.nh ?? 0, done = it.kind === "todo" && !!it.done, bs = baseStyle(it, "text");
  const base = <path d={shapePath(it.kind === "table" || it.kind === "chart" || it.kind === "notepad" || it.kind === "todo" ? "round" : it.kind, it.w, it.h)} fill={it.fill === "none" ? "transparent" : it.fill} fillOpacity={it.fo ?? 1} stroke={it.sw ? it.stroke : "none"} strokeOpacity={it.so ?? 1} strokeWidth={it.sw} strokeDasharray={it.dash ? "6 4" : undefined} strokeLinejoin="round" fillRule="evenodd" style={shadow} />;
  const fold = it.kind === "note" ? (() => { const f = foldSize(it.w, it.h); return <path d={`M${it.w - f},${it.h}L${it.w},${it.h - f}L${it.w - f},${it.h - f}Z`} fill="#000000" fillOpacity={0.2} pointerEvents="none" />; })() : null;
  let body: React.ReactNode = null;
  if (it.kind === "table") body = <PrimsSvg prims={tablePrims(it)} ff={ff} />;
  else if (it.kind === "chart") body = <PrimsSvg prims={chartPrims(it)} ff={ff} />;
  else {
    const lines = placeLines(it, "text"), rt = rotXform(it), rules: React.ReactNode[] = [];
    if (it.kind === "notepad") { const lh = Math.max(20, it.fs * 1.6); for (let y = 8 + lh, k = 0; y < it.h - 4; y += lh, k++) rules.push(<line key={k} x1={0} x2={it.w} y1={y} y2={y} stroke="#a8c7e8" strokeWidth={1} />); rules.push(<line key="m" x1={30} x2={30} y1={0} y2={it.h} stroke="#e57373" strokeWidth={1} />); }
    const ns = baseStyle(it, "note"), nl = it.note !== undefined ? placeLines(it, "note") : [], ncol = ns.c === it.color ? col : ns.c;
    body = <>
      {rules}
      {it.img && ih > 0 && <image href={it.img} x={8} y={6} width={it.w - 16} height={ih - 12} preserveAspectRatio="xMidYMid meet" />}
      {it.kind === "todo" && <><rect data-check="" x={9} y={it.h / 2 - 9} width={18} height={18} rx={3} fill="#ffffff" stroke={it.stroke} strokeWidth={2} style={{ cursor: "pointer" }} />{done && <path d={`M13,${it.h / 2}l4,4l7,-8`} stroke="#07a352" strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" pointerEvents="none" />}</>}
      <g transform={rt || undefined}>{lines.map((p, i) => { const cy = p.y + p.h / 2; return <g key={i}>{lineEl(p.ln, it.text, p.sx, cy, bs, col, "t" + i, it, done ? 0.6 : 1)}{marks(p.ln, it.text, p.sx, cy, bs, it.runs, spell, "m", i === 0)}</g>; })}</g>
      {nh > 0 && <line x1={8} x2={it.w - 8} y1={it.h - nh} y2={it.h - nh} stroke={col} strokeOpacity={0.35} strokeWidth={1} />}
      {nl.map((p, i) => { const cy = p.y + p.h / 2; return <g key={"n" + i}>{lineEl(p.ln, it.note ?? "", p.sx, cy, ns, ncol, "q" + i, it)}{marks(p.ln, it.note ?? "", p.sx, cy, ns, it.nruns, spell, "mn", i === 0)}</g>; })}
    </>;
  }
  return <g data-id={it.id} transform={`translate(${it.x},${it.y})`}>{base}{fold}{body}</g>;
}
export function ConnView({ c, a, b, sel }: { c: Conn; a: Item; b: Item; sel?: boolean }) {
  const d = connPath(a, b, c.style);
  return (
    <g data-id={c.id}>
      <path d={d} stroke="transparent" strokeWidth={14} fill="none" />
      <path d={d} fill="none" stroke={sel ? "#0DF279" : c.color} strokeWidth={sel ? 3 : 2} strokeDasharray={c.dash ? "6 4" : undefined} markerEnd={c.arrow ? "url(#arr)" : undefined} style={{ pointerEvents: "none" }} />
    </g>
  );
}
export function DocBody({ doc, dark }: { doc: Doc; dark?: boolean }) {
  return (
    <>
      <Defs />
      {(doc.bg?.imgs ?? []).map((b) => <image key={b.id} href={b.src} x={b.x} y={b.y} width={b.w} height={b.h} preserveAspectRatio="none" />)}
      {Object.values(doc.conns).map((c) => doc.items[c.from] && doc.items[c.to] && <ConnView key={c.id} c={c} a={doc.items[c.from]} b={doc.items[c.to]} />)}
      {doc.order.map((i) => doc.items[i] && <ItemView key={i} it={doc.items[i]} dark={dark} />)}
      <InkView strokes={doc.ink ?? []} />
    </>
  );
}
