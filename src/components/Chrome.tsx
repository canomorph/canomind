import { useRef, useState } from "react";
import { t } from "../i18n";
import { pageOf } from "../model";
import { MARK_SIZES, markColor, mm2px } from "../pages";
import { curTab, useDocs, useSettings } from "../store";
import { Icon } from "./Icon";
import { Drop, FloatMenu, MI } from "./Menu";

export function Ruler({ o }: { o: "h" | "v" }) {
  const size = useDocs((s) => s.size), view = useDocs((s) => curTab(s).view), pgd = useDocs((s) => pageOf(curTab(s).doc)), marks = useSettings((s) => s.rulerMarks), len = o === "h" ? size.w : size.h, off = o === "h" ? view.x : view.y, k = view.k;
  let step = 96; while (step * k < 64) step *= 2; while (step * k > 140 && step > 6) step /= 2;
  const a = Math.floor(-off / k / step) - 1, b = Math.ceil((len - off) / k / step) + 1, els: JSX.Element[] = [];
  for (let i = a; i <= b; i++) {
    const p = off + i * step * k, label = +((i * step) / 96).toFixed(2);
    els.push(o === "h" ? <g key={i}><path d={`M${p},3V20`} /><text x={p + 3} y={11}>{label}</text></g> : <g key={i}><path d={`M3,${p}H20`} /><text transform={`translate(11,${p - 3}) rotate(-90)`}>{label}</text></g>);
    for (let j = 1; j < 4; j++) { const q = p + (j * step * k) / 4; els.push(o === "h" ? <path key={i + "m" + j} d={`M${q},${j === 2 ? 12 : 15}V20`} /> : <path key={i + "m" + j} d={`M${j === 2 ? 12 : 15},${q}H20`} />); }
  }
  const land = pgd.w >= pgd.h;
  marks.forEach((id) => { const sz = MARK_SIZES.find((x) => x[0] === id); if (!sz) return; const lp = o === "h" ? mm2px(land ? sz[2] : sz[1]) : mm2px(land ? sz[1] : sz[2]), p = off + lp * k, c = markColor(id); if (p < -20 || p > len + 20) return;
    els.push(o === "h" ? <g key={"mk" + id}><path d={`M${p},0V20`} style={{ stroke: c, opacity: 1, strokeWidth: 2 }} /><text x={p - 3} y={9} textAnchor="end" style={{ fill: c, opacity: 1, fontWeight: 700 }}>{id}</text></g>
      : <g key={"mk" + id}><path d={`M0,${p}H20`} style={{ stroke: c, opacity: 1, strokeWidth: 2 }} /><text transform={`translate(11,${p - 3}) rotate(-90)`} style={{ fill: c, opacity: 1, fontWeight: 700 }}>{id}</text></g>); });
  return <svg className={"ruler " + o} width={o === "h" ? len : 20} height={o === "h" ? 20 : len}>{els}</svg>;
}

export function Bar({ o }: { o: "h" | "v" }) {
  const tab = useDocs((s) => curTab(s)), size = useDocs((s) => s.size), view = tab.view, k = view.k, horiz = o === "h";
  const track = useRef<HTMLDivElement>(null), drag = useRef<any>(null);
  const vl = (horiz ? size.w : size.h) / k, vp0 = (horiz ? -view.x : -view.y) / k, vp1 = vp0 + vl;
  const pgx = pageOf(tab.doc), b0 = 0, b1 = horiz ? pgx.w : pgx.h;
  const e0 = drag.current ? drag.current.e0 : Math.min(vp0, b0 - 60), e1 = drag.current ? drag.current.e1 : Math.max(vp1, b1 + 60);
  const T = (horiz ? track.current?.clientWidth : track.current?.clientHeight) || 200, tl = Math.max(24, ((vp1 - vp0) / (e1 - e0)) * T), tp = Math.min(T - tl, Math.max(0, ((vp0 - e0) / (e1 - e0)) * T));
  const setV = (n: number) => { const v = curTab(useDocs.getState()).view; useDocs.getState().setView(horiz ? { ...v, x: -n * v.k } : { ...v, y: -n * v.k }); };
  const down = (e: React.PointerEvent) => { e.currentTarget.setPointerCapture(e.pointerId); drag.current = { p: horiz ? e.clientX : e.clientY, v: vp0, e0, e1, T, tl, vl }; };
  const move = (e: React.PointerEvent) => { const d = drag.current; if (!d) return; const dv = (((horiz ? e.clientX : e.clientY) - d.p) / Math.max(1, d.T - d.tl)) * (d.e1 - d.e0 - d.vl); setV(d.v + dv); };
  const pan = (dx: number) => setV(vp0 + dx / k);
  return (
    <div className={"sbar " + o}>
      <button className="bb" onClick={() => pan(-60)}>{horiz ? "◂" : "▴"}</button>
      <div className="track" ref={track}><div className="thumb" style={horiz ? { left: tp, width: tl } : { top: tp, height: tl }} onPointerDown={down} onPointerMove={move} onPointerUp={() => (drag.current = null)} /></div>
      <button className="bb" onClick={() => pan(60)}>{horiz ? "▸" : "▾"}</button>
    </div>
  );
}

const PAGE_COLORS = ["#e53935", "#fb8c00", "#fdd835", "#43a047", "#00897b", "#1e88e5", "#8e24aa", "#757575"];
export function PageBar() {
  const S = useDocs(), T = curTab(S), [menu, setMenu] = useState<{ x: number; y: number; i: number } | null>(null), [ren, setRen] = useState<number | null>(null);
  return (
    <div className="pagebar">
      <div className="ptabs">{T.pages.map((p, i) => ren === i
        ? <input key={p.id} className="ptab-input" autoFocus defaultValue={p.name} onFocus={(e) => e.currentTarget.select()} onBlur={(e) => { S.renamePage(i, e.target.value.trim() || p.name); setRen(null); }} onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); else if (e.key === "Escape") setRen(null); }} />
        : <button key={p.id} className={"ptab" + (i === T.page ? " on" : "")} style={p.color ? { background: p.color + "33", borderBottomColor: p.color } : undefined} onClick={() => S.setPage(i)} onDoubleClick={() => setRen(i)} onContextMenu={(e) => { e.preventDefault(); setMenu({ x: e.clientX, y: e.clientY, i }); }}>{p.name}</button>)}</div>
      <Drop mode="text" l="All" up>{(c) => <>{T.pages.map((p, i) => <MI key={p.id} l={p.name} act={i === T.page} on={() => S.setPage(i)} close={c} />)}</>}</Drop>
      <button className="iconbtn" title={t("New page")} onClick={S.addPage}><Icon name="plus" size={14} /></button>
      <div className="hbar"><Bar o="h" /></div>
      {menu && <FloatMenu x={menu.x} y={menu.y} onClose={() => setMenu(null)}>
        <MI i="textbox" l="Rename" on={() => setRen(menu.i)} close={() => setMenu(null)} />
        <MI i="duplicate" l="Duplicate" on={() => S.dupPage(menu.i)} close={() => setMenu(null)} />
        <div className="lbl" style={{ padding: ".25rem .5rem 0", fontSize: ".75rem", opacity: 0.7 }}>{t("Tab color")}</div>
        <div className="swg">{PAGE_COLORS.map((x) => <button key={x} style={{ background: x }} onClick={() => { S.setPageColor(menu.i, x); setMenu(null); }} />)}</div>
        <MI l="None" on={() => S.setPageColor(menu.i, undefined)} close={() => setMenu(null)} />
        <div className="msep" />
        <MI i="delete" l="Delete" dis={T.pages.length < 2} on={() => S.deletePage(menu.i)} close={() => setMenu(null)} />
      </FloatMenu>}
    </div>
  );
}
