import { textW } from "./measure";
import { Conn, Doc, Item, bulletize, connPath, readable, shapePath, wrap } from "./model";
import { Prim, chartPrims, tablePrims } from "./prims";
import { Checker, issues } from "./spell";

export type SpellCtx = { sp: Checker; lang: string } | null | undefined;
export const Defs = () => (
  <defs><marker id="arr" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0L10,5L0,10z" fill="context-stroke" /></marker></defs>
);
const URL_RE = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
const runs = (l: string) => l.split(URL_RE).map((p, i) => (i % 2 ? <tspan key={i} data-link={p.startsWith("www.") ? "https://" + p : p} fill="#4da3ff" textDecoration="underline" style={{ pointerEvents: "visiblePainted", cursor: "pointer" }}>{p}</tspan> : p));
const squig = (x: number, y: number, w: number, color: string, key: string) => {
  let d = `M${x},${y}`; const n = Math.max(2, Math.round(w / 1.5)); for (let i = 1; i <= n; i++) d += `L${x + (w * i) / n},${y + (i % 2 ? 1.5 : 0)}`;
  return <path key={key} d={d} fill="none" stroke={color} strokeWidth={1} pointerEvents="none" />;
};
// red wavy = misspelled word, blue wavy = repeated word
function marks(line: string, startX: number, cy: number, fs: number, it: Item, sp: SpellCtx, key: string, first = false) {
  if (!sp) return null; const f = it.ff ?? "Calibri";
  return issues(line, sp.sp, sp.lang, first).map((s, k) => squig(startX + textW(line.slice(0, s.i), fs, f, it.bold, it.italic), cy + fs * 0.55, textW(s.w, fs, f, it.bold, it.italic), s.kind === "spell" ? "#e53935" : "#1e88e5", key + k));
}
export function PrimsSvg({ prims, ff }: { prims: Prim[]; ff: string }) {
  return <>{prims.map((p, i) => {
    if (p.t === "rect") return <rect key={i} x={p.x} y={p.y} width={p.w} height={p.h} fill={p.fill ?? "none"} fillOpacity={p.fo} stroke={p.stroke ?? "none"} strokeWidth={p.sw} />;
    if (p.t === "path") return <path key={i} d={p.d} fill={p.fill ?? "none"} fillOpacity={p.fo} stroke={p.stroke ?? "none"} strokeWidth={p.sw} strokeLinejoin="round" />;
    if (p.t === "line") return <line key={i} x1={p.x1} y1={p.y1} x2={p.x2} y2={p.y2} stroke={p.stroke} strokeWidth={p.sw} />;
    return <text key={i} x={p.x} y={p.y} textAnchor={p.anchor} dominantBaseline="central" fontSize={p.size} fill={p.color} fontWeight={p.bold ? 700 : 400} fontFamily={ff} style={{ pointerEvents: "none", userSelect: "none" }}>{p.s}</text>;
  })}</>;
}
export function ItemView({ it, hide, dark, spell }: { it: Item; hide?: "text" | "note"; dark?: boolean; spell?: SpellCtx }) {
  const col = dark === undefined || it.fill !== "none" ? it.color : readable(it.color, dark), f = it.ff ?? "Calibri", ff = `${f}, "Segoe UI", system-ui, sans-serif`;
  const shadow = it.shadow ? { filter: "drop-shadow(3px 4px 3px rgba(0,0,0,.35))" } : undefined;
  if (it.kind === "image") return <g data-id={it.id} transform={`translate(${it.x},${it.y})`}><image href={it.src} width={it.w} height={it.h} preserveAspectRatio="none" style={shadow} /></g>;
  const ha = it.ha ?? "center", va = it.va ?? "middle", ind = (it.ind ?? 0) * 14, ih = it.ih ?? 0, nh = it.nh ?? 0, left = it.kind === "todo" ? 34 : 0, done = it.kind === "todo" && !!it.done;
  const deco = [it.ul ? "underline" : "", it.st || done ? "line-through" : ""].join(" ").trim() || undefined;
  const base = <path d={shapePath(it.kind === "table" || it.kind === "chart" || it.kind === "notepad" || it.kind === "todo" ? "round" : it.kind, it.w, it.h)} fill={it.fill === "none" ? "transparent" : it.fill} fillOpacity={it.fo ?? 1} stroke={it.sw ? it.stroke : "none"} strokeOpacity={it.so ?? 1} strokeWidth={it.sw} strokeDasharray={it.dash ? "6 4" : undefined} strokeLinejoin="round" fillRule="evenodd" style={shadow} />;
  const tstyle = { pointerEvents: "none" as const, userSelect: "none" as const };
  let body: React.ReactNode = null;
  if (it.kind === "table") body = <PrimsSvg prims={tablePrims(it)} ff={ff} />;
  else if (it.kind === "chart") body = <PrimsSvg prims={chartPrims(it)} ff={ff} />;
  else if (it.kind === "notepad") {
    const lh = Math.max(20, it.fs * 1.6), lines = hide === "text" ? [] : wrap(it.text, it.w - 44, it.fs, f, it.bold, it.italic), rules: React.ReactNode[] = [];
    for (let y = 8 + lh, k = 0; y < it.h - 4; y += lh, k++) rules.push(<line key={k} x1={0} x2={it.w} y1={y} y2={y} stroke="#a8c7e8" strokeWidth={1} />);
    body = <>{rules}<line x1={30} x2={30} y1={0} y2={it.h} stroke="#e57373" strokeWidth={1} />
      {lines.map((l, i) => { const y = 8 + (i + 1) * lh - 5; return <g key={i}><text x={38} y={y} fontSize={it.fs} fill={col} fontWeight={it.bold ? 700 : 400} fontStyle={it.italic ? "italic" : "normal"} textDecoration={deco} fontFamily={ff} style={tstyle}>{runs(l)}</text>{marks(l, 38, y - it.fs * 0.3, it.fs, it, spell, "m", i === 0)}</g>; })}</>;
  } else {
    const raw = bulletize(it), lines = hide === "text" ? [] : wrap(raw, it.w - ind - left, it.fs, f, it.bold, it.italic), lh = it.fs * 1.25, n = lines.length, top = ih, bottom = it.h - nh;
    const y0 = va === "top" ? top + 8 + lh / 2 : va === "bottom" ? bottom - 8 - (n - 1) * lh - lh / 2 : (top + bottom) / 2 - ((n - 1) * lh) / 2;
    const tx = ha === "left" ? 8 + left + ind : ha === "right" ? it.w - 8 : left + (it.w - left) / 2 + ind / 2;
    const nfs = Math.max(10, it.fs * 0.8), nl = it.note !== undefined && hide !== "note" ? wrap(it.note, it.w - 16, nfs, f) : [];
    body = <>
      {it.img && ih > 0 && <image href={it.img} x={8} y={6} width={it.w - 16} height={ih - 12} preserveAspectRatio="xMidYMid meet" />}
      {it.kind === "todo" && <><rect data-check="" x={9} y={it.h / 2 - 9} width={18} height={18} rx={3} fill="#ffffff" stroke={it.stroke} strokeWidth={2} style={{ cursor: "pointer" }} />{done && <path d={`M13,${it.h / 2}l4,4l7,-8`} stroke="#07a352" strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" pointerEvents="none" />}</>}
      {lines.map((l, i) => { const lw = textW(l, it.fs, f, it.bold, it.italic), sx = ha === "left" ? tx : ha === "right" ? tx - lw : tx - lw / 2, y = y0 + i * lh;
        return <g key={i}><text x={tx} y={y} textAnchor={ha === "left" ? "start" : ha === "right" ? "end" : "middle"} dominantBaseline="central" fontSize={it.fs} fontWeight={it.bold ? 700 : 400} fontStyle={it.italic ? "italic" : "normal"} fill={col} fillOpacity={done ? 0.6 : 1} textDecoration={deco} fontFamily={ff} style={tstyle}>{runs(l)}</text>{marks(l, sx, y, it.fs, it, spell, "m", i === 0)}</g>; })}
      {nh > 0 && <line x1={8} x2={it.w - 8} y1={it.h - nh} y2={it.h - nh} stroke={col} strokeOpacity={0.35} strokeWidth={1} />}
      {nl.map((l, i) => { const y = it.h - nh + 8 + nfs * 0.65 + i * nfs * 1.25, lw = textW(l, nfs, f);
        return <g key={"n" + i}><text x={it.w / 2} y={y} textAnchor="middle" dominantBaseline="central" fontSize={nfs} fill={col} fillOpacity={0.9} fontFamily={ff} style={tstyle}>{runs(l)}</text>{marks(l, it.w / 2 - lw / 2, y, nfs, { ...it, bold: false, italic: false }, spell, "mn")}</g>; })}
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
