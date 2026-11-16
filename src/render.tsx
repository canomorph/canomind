import { textW } from "./measure";
import { Conn, Doc, Item, LLine, Run, TStyle, baseStyle, bulletPrefix, connPath, layoutText, rangeW, readable, shapePath, styleAt } from "./model";
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
function segNodes(sub: string, st: TStyle, baseCol: string, base: TStyle, key: string) {
  return sub.split(URL_RE).map((p, i) => { if (!p) return null; const link = i % 2 === 1;
    return <tspan key={key + i} data-link={link ? (p.startsWith("www.") ? "https://" + p : p) : undefined} fontSize={st.z} fontWeight={st.b ? 700 : 400} fontStyle={st.i ? "italic" : "normal"} fill={link ? "#4da3ff" : st.c === base.c ? baseCol : st.c}
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
function lineEl(ln: LLine, text: string, x: number, cy: number, anchor: "start" | "middle" | "end", bs: TStyle, col: string, key: string, fo = 1) {
  return <text key={key} x={x} y={cy} textAnchor={anchor} dominantBaseline="central" fontSize={bs.z} fill={col} fillOpacity={fo} fontFamily={fam(bs.f)} style={tstyle}>
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
export function ItemView({ it, hide, dark, spell }: { it: Item; hide?: "text" | "note"; dark?: boolean; spell?: SpellCtx }) {
  const col = dark === undefined || it.fill !== "none" ? it.color : readable(it.color, dark), ff = fam(it.ff ?? "Calibri");
  const shadow = it.shadow ? { filter: "drop-shadow(3px 4px 3px rgba(0,0,0,.35))" } : undefined;
  if (it.kind === "image") return <g data-id={it.id} transform={`translate(${it.x},${it.y})`}><image href={it.src} width={it.w} height={it.h} preserveAspectRatio="none" style={shadow} /></g>;
  const ha = it.ha ?? "center", va = it.va ?? "middle", ind = (it.ind ?? 0) * 14, ih = it.ih ?? 0, nh = it.nh ?? 0, left = it.kind === "todo" ? 34 : 0, done = it.kind === "todo" && !!it.done, bs = baseStyle(it, "text");
  const base = <path d={shapePath(it.kind === "table" || it.kind === "chart" || it.kind === "notepad" || it.kind === "todo" ? "round" : it.kind, it.w, it.h)} fill={it.fill === "none" ? "transparent" : it.fill} fillOpacity={it.fo ?? 1} stroke={it.sw ? it.stroke : "none"} strokeOpacity={it.so ?? 1} strokeWidth={it.sw} strokeDasharray={it.dash ? "6 4" : undefined} strokeLinejoin="round" fillRule="evenodd" style={shadow} />;
  let body: React.ReactNode = null;
  if (it.kind === "table") body = <PrimsSvg prims={tablePrims(it)} ff={ff} />;
  else if (it.kind === "chart") body = <PrimsSvg prims={chartPrims(it)} ff={ff} />;
  else if (it.kind === "notepad") {
    const lh = Math.max(20, it.fs * 1.6), lines = hide === "text" ? [] : layoutText(it.text, it.runs, bs, it.w - 60), rules: React.ReactNode[] = [];
    for (let y = 8 + lh, k = 0; y < it.h - 4; y += lh, k++) rules.push(<line key={k} x1={0} x2={it.w} y1={y} y2={y} stroke="#a8c7e8" strokeWidth={1} />);
    body = <>{rules}<line x1={30} x2={30} y1={0} y2={it.h} stroke="#e57373" strokeWidth={1} />
      {lines.map((ln, i) => { const cy = 8 + (i + 0.5) * lh + 2; return <g key={i}>{lineEl(ln, it.text, 38, cy, "start", bs, col, "n" + i)}{marks(ln, it.text, 38, cy, bs, it.runs, spell, "m", i === 0)}</g>; })}</>;
  } else {
    const lines = hide === "text" ? [] : layoutText(it.text, it.runs, bs, it.w - ind - left - 16, (pi) => bulletPrefix(it, pi)), th = lines.reduce((a, l) => a + l.h, 0), top = ih, bottom = it.h - nh;
    let y = va === "top" ? top + 8 : va === "bottom" ? bottom - 8 - th : (top + bottom) / 2 - th / 2;
    const tx = ha === "left" ? 8 + left + ind : ha === "right" ? it.w - 8 : left + (it.w - left) / 2 + ind / 2, anchor = ha === "left" ? "start" : ha === "right" ? "end" : "middle";
    const ns = baseStyle(it, "note"), nl = it.note !== undefined && hide !== "note" ? layoutText(it.note, it.nruns, ns, it.w - 32) : [], ncol = ns.c === it.color ? col : ns.c; let ny = it.h - nh + 8;
    body = <>
      {it.img && ih > 0 && <image href={it.img} x={8} y={6} width={it.w - 16} height={ih - 12} preserveAspectRatio="xMidYMid meet" />}
      {it.kind === "todo" && <><rect data-check="" x={9} y={it.h / 2 - 9} width={18} height={18} rx={3} fill="#ffffff" stroke={it.stroke} strokeWidth={2} style={{ cursor: "pointer" }} />{done && <path d={`M13,${it.h / 2}l4,4l7,-8`} stroke="#07a352" strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" pointerEvents="none" />}</>}
      {lines.map((ln, i) => { const cy = y + ln.h / 2, sx = ha === "left" ? tx : ha === "right" ? tx - ln.w : tx - ln.w / 2; y += ln.h;
        return <g key={i}>{lineEl(ln, it.text, tx, cy, anchor, bs, col, "t" + i, done ? 0.6 : 1)}{marks(ln, it.text, sx, cy, bs, it.runs, spell, "m", i === 0)}</g>; })}
      {nh > 0 && <line x1={8} x2={it.w - 8} y1={it.h - nh} y2={it.h - nh} stroke={col} strokeOpacity={0.35} strokeWidth={1} />}
      {nl.map((ln, i) => { const cy = ny + ln.h / 2; ny += ln.h; return <g key={"n" + i}>{lineEl(ln, it.note ?? "", it.w / 2, cy, "middle", ns, ncol, "q" + i)}{marks(ln, it.note ?? "", it.w / 2 - ln.w / 2, cy, ns, it.nruns, spell, "mn", i === 0)}</g>; })}
    </>;
  }
  return <g data-id={it.id} transform={`translate(${it.x},${it.y})`}>{base}{body}</g>;
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
    </>
  );
}
