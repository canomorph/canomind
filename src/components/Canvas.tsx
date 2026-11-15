import { useEffect, useRef, useState } from "react";
import { Kind, defSize, gridPatternSvg, growToFit, lum, pageOf } from "../model";
import { ConnView, Defs, ItemView } from "../render";
import { curTab, useDocs, useIsDark, useSettings } from "../store";
import { Checker, loadSpell } from "../spell";

const HP: [string, number, number][] = [["nw", 0, 0], ["n", .5, 0], ["ne", 1, 0], ["e", 1, .5], ["se", 1, 1], ["s", .5, 1], ["sw", 0, 1], ["w", 0, .5]];
type R = { x: number; y: number; w: number; h: number };
const rectFrom = (o: R, h: string, w: { x: number; y: number }, f: (v: number) => number = (v) => v): R => {
  let x1 = o.x, y1 = o.y, x2 = o.x + o.w, y2 = o.y + o.h;
  if (h.includes("w")) x1 = Math.min(f(w.x), x2 - 20); if (h.includes("e")) x2 = Math.max(f(w.x), x1 + 20);
  if (h.includes("n")) y1 = Math.min(f(w.y), y2 - 20); if (h.includes("s")) y2 = Math.max(f(w.y), y1 + 20);
  return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
};
export function Canvas() {
  const tab = useDocs((s) => curTab(s)), sel = useDocs((s) => s.sel), tool = useDocs((s) => s.tool), editing = useDocs((s) => s.editing), editSub = useDocs((s) => s.editSub), bgEdit = useDocs((s) => s.bgEdit), bgSel = useDocs((s) => s.bgSel), spell = useDocs((s) => s.spell);
  const { snap, spellLang } = useSettings(), themeDark = useIsDark(), { doc, view } = tab, grid = tab.grid, A = useDocs.getState, pg = pageOf(doc), bgDelMode = useDocs((s) => s.bgDelMode), bgMarks = useDocs((s) => s.bgMarks);
  const bgc = doc.bg?.color, dark = bgc ? lum(bgc) < 0.45 : themeDark, bgImgs = doc.bg?.imgs ?? [];
  const root = useRef<HTMLDivElement>(null), svg = useRef<SVGSVGElement>(null), drag = useRef<any>(null);
  const [ghost, setGhost] = useState<any>(null), [line, setLine] = useState<any>(null), [edge, setEdge] = useState<{ d: "r" | "b"; x: number; y: number } | null>(null), [gh, setGh] = useState(false), [gv, setGv] = useState(false), [tv, setTv] = useState(false), [sp, setSp] = useState<{ sp: Checker; lang: string } | null>(null);
  useEffect(() => { let alive = true; setSp(null); if (spell) loadSpell(spellLang).then((ck) => { if (alive && ck) setSp({ sp: ck, lang: spellLang }); }); return () => { alive = false; }; }, [spell, spellLang]);
  const heads = Object.values(doc.items).filter((i) => i.gt?.k === "head"), lastHead = heads.length ? heads.reduce((a, b) => (b.gt!.c! > a.gt!.c! ? b : a)) : null;
  const rows = Object.values(doc.items).filter((i) => i.gt?.k === "label" && i.gt.r! >= 0), lastRow = rows.length ? rows.reduce((a, b) => (b.gt!.r! > a.gt!.r! ? b : a)) : null;
  const todos = Object.values(doc.items).filter((i) => i.kind === "todo"), lastTodo = todos.length ? todos.reduce((a, b) => (b.y > a.y ? b : a)) : null;
  const edgeAt = (w: { x: number; y: number }): "r" | "b" | null => { const b = 10 / view.k; if (w.y >= 0 && w.y <= pg.h + b && w.x >= pg.w - b && w.x <= pg.w + b) return "r"; if (w.x >= 0 && w.x <= pg.w + b && w.y >= pg.h - b && w.y <= pg.h + b) return "b"; return null; };
  const toW = (e: { clientX: number; clientY: number }) => { const r = svg.current!.getBoundingClientRect(); return { x: (e.clientX - r.left - view.x) / view.k, y: (e.clientY - r.top - view.y) / view.k }; };
  const sn = (v: number) => (snap ? Math.round(v / 10) * 10 : v);
  const viewRef = useRef(view); viewRef.current = view;
  const grp = (id: string) => { const g = doc.items[id]?.g; return g ? doc.order.filter((i) => doc.items[i].g === g) : [id]; };
  useEffect(() => {
    const el = svg.current!, ro = new ResizeObserver(() => A().setSize({ w: root.current!.clientWidth, h: root.current!.clientHeight })); ro.observe(root.current!);
    const f = (e: WheelEvent) => { e.preventDefault(); const v = viewRef.current, r = el.getBoundingClientRect();
      if (e.ctrlKey) { const k = Math.min(4, Math.max(.1, v.k * (e.deltaY < 0 ? 1.1 : 1 / 1.1))), mx = e.clientX - r.left, my = e.clientY - r.top; A().setView({ k, x: mx - (mx - v.x) * (k / v.k), y: my - (my - v.y) * (k / v.k) }); }
      else { const horiz = e.shiftKey || (!/win/i.test(navigator.platform) && e.altKey), dx = horiz ? e.deltaX || e.deltaY : e.deltaX, dy = horiz ? 0 : e.deltaY; A().setView({ ...v, x: v.x - dx, y: v.y - dy }); } };
    el.addEventListener("wheel", f, { passive: false }); return () => { el.removeEventListener("wheel", f); ro.disconnect(); };
  }, []);
  const cap = (e: React.PointerEvent) => svg.current!.setPointerCapture(e.pointerId);
  const under = (e: { clientX: number; clientY: number }) => (document.elementFromPoint(e.clientX, e.clientY) as Element | null)?.closest("[data-id]")?.getAttribute("data-id");

  const down = (e: React.PointerEvent) => {
    const tg = e.target as Element, S = A(); if (tg.tagName === "TEXTAREA" || e.button === 2) return;
    if (S.editing) S.setEditing(null);
    const w = toW(e);
    if (e.button === 1 || (e.button === 0 && e.altKey)) { e.preventDefault(); drag.current = { t: "pan", ox: e.clientX - view.x, oy: e.clientY - view.y }; cap(e); return; }
    if (tg.closest("[data-gadd]")) { S.ganttAdd(); return; }
    if (tg.closest("[data-gdel]")) { S.ganttDel(); return; }
    if (tg.closest("[data-gradd]")) { S.ganttRowAdd(); return; }
    if (tg.closest("[data-grdel]")) { S.ganttRowDel(); return; }
    if (tg.closest("[data-tdadd]")) { S.todoAdd(); return; }
    if (tg.closest("[data-tddel]")) { S.todoDel(); return; }
    if (S.bgDelMode) { const bi = tg.closest("[data-bg]")?.getAttribute("data-bg") ?? tg.closest("[data-bgmark]")?.getAttribute("data-bgmark"); if (bi) useDocs.setState({ bgMarks: S.bgMarks.includes(bi) ? S.bgMarks.filter((x) => x !== bi) : [...S.bgMarks, bi] }); return; }
    if (S.bgEdit) {
      const bh = tg.closest("[data-bgh]"), bi = tg.closest("[data-bg]");
      if (bh && S.bgSel) { const im = bgImgs.find((i) => i.id === S.bgSel); if (im) { drag.current = { t: "bgresize", h: bh.getAttribute("data-bgh"), o: { x: im.x, y: im.y, w: im.w, h: im.h }, id: im.id, rec: false }; cap(e); } return; }
      if (bi) { const id = bi.getAttribute("data-bg")!, im = bgImgs.find((i) => i.id === id); if (im) { useDocs.setState({ bgSel: id }); drag.current = { t: "bgmove", s: w, o: { x: im.x, y: im.y }, id, rec: false }; cap(e); } return; }
      useDocs.setState({ bgEdit: false, bgSel: null }); return;
    }
    const eg = edgeAt(w); if (eg) { S.expandPage(eg); return; }
    if (typeof S.tool === "object") { drag.current = { t: "place", s: w, kind: S.tool.place }; setGhost({ x: w.x, y: w.y, w: 0, h: 0 }); cap(e); return; }
    const plus = tg.closest("[data-plus]");
    if (plus) { e.preventDefault(); drag.current = { t: "plus", a: S.sel[0], dir: plus.getAttribute("data-plus"), sx: e.clientX, sy: e.clientY, moved: false }; cap(e); return; }
    const hd = tg.closest("[data-handle]"); if (hd) { const id = S.sel[0]; if (doc.items[id]?.lock) return; drag.current = { t: "resize", h: hd.getAttribute("data-handle"), o: { ...doc.items[id] }, id, rec: false }; cap(e); return; }
    const ck = tg.closest("[data-check]");
    if (ck) { const cid = ck.closest("[data-id]")?.getAttribute("data-id"); if (cid && doc.items[cid]) { S.patch([cid], { done: !doc.items[cid].done }, true); S.setSel([cid]); } return; }
    const id = tg.closest("[data-id]")?.getAttribute("data-id");
    if (id) {
      if (S.painter && doc.items[id]) { S.patch([id], S.painter, true); S.setPainter(null); return; }
      let ns = S.sel; const ids = grp(id);
      if (e.shiftKey || e.ctrlKey) ns = ns.includes(id) ? ns.filter((x) => !ids.includes(x)) : [...ns, ...ids]; else if (!ns.includes(id)) ns = ids;
      S.setSel(ns);
      if (doc.items[id]) { const orig: Record<string, { x: number; y: number }> = {}; ns.forEach((i) => { const it = doc.items[i]; if (it && !it.lock) orig[i] = { x: it.x, y: it.y }; }); drag.current = { t: "move", s: w, orig, rec: false }; cap(e); }
      return;
    }
    const add = e.shiftKey || e.ctrlKey; if (!add) S.setSel([]);
    drag.current = { t: "marq", s: w, base: add ? S.sel : [] }; setGhost({ x: w.x, y: w.y, w: 0, h: 0, marq: true }); cap(e);
  };
  const move = (e: React.PointerEvent) => {
    const d = drag.current; const w = toW(e), S = A();
    if (!d) { const eg = S.bgEdit || S.bgDelMode ? null : edgeAt(w); setEdge(eg ? { d: eg, x: w.x, y: w.y } : null);
      setGh(!!lastHead && !S.bgEdit && w.x >= lastHead.x && w.x <= lastHead.x + lastHead.w + 36 / view.k && w.y >= lastHead.y - 30 / view.k && w.y <= lastHead.y + lastHead.h);
      const g = 36 / view.k; setGv(!!lastRow && !S.bgEdit && w.x >= lastRow.x - g && w.x <= lastRow.x + lastRow.w && w.y >= lastRow.y && w.y <= lastRow.y + lastRow.h + g);
      setTv(!!lastTodo && !S.bgEdit && w.x >= lastTodo.x && w.x <= lastTodo.x + lastTodo.w + g && w.y >= lastTodo.y && w.y <= lastTodo.y + lastTodo.h + g); return; }
    if (d.t === "pan") S.setView({ ...view, x: e.clientX - d.ox, y: e.clientY - d.oy });
    else if (d.t === "move") { const dx = w.x - d.s.x, dy = w.y - d.s.y; if (!d.rec && Math.hypot(dx, dy) * view.k < 4) return;
      S.mutate((m) => { for (const id in d.orig) m.items[id] = { ...m.items[id], x: sn(d.orig[id].x + dx), y: sn(d.orig[id].y + dy) }; }, !d.rec); d.rec = true; }
    else if (d.t === "resize") { const r = rectFrom(d.o, d.h, w, sn); S.mutate((m) => { let it = { ...m.items[d.id], ...r }; const g = growToFit(it); m.items[d.id] = { ...it, ...g }; }, !d.rec); d.rec = true; }
    else if (d.t === "bgmove") { const dx = w.x - d.s.x, dy = w.y - d.s.y; if (!d.rec && Math.hypot(dx, dy) * view.k < 3) return; S.bgPatch(d.id, { x: d.o.x + dx, y: d.o.y + dy }, !d.rec); d.rec = true; }
    else if (d.t === "bgresize") { S.bgPatch(d.id, rectFrom(d.o, d.h, w), !d.rec); d.rec = true; }
    else if (d.t === "place") setGhost({ x: Math.min(w.x, d.s.x), y: Math.min(w.y, d.s.y), w: Math.abs(w.x - d.s.x), h: Math.abs(w.y - d.s.y) });
    else if (d.t === "marq") setGhost({ x: Math.min(w.x, d.s.x), y: Math.min(w.y, d.s.y), w: Math.abs(w.x - d.s.x), h: Math.abs(w.y - d.s.y), marq: true });
    else if (d.t === "plus") { if (!d.moved && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) > 6) d.moved = true; if (d.moved) setLine({ a: d.a, ...w }); }
  };
  const up = (e: React.PointerEvent) => {
    const d = drag.current; drag.current = null; setGhost(null); setLine(null); if (!d) return; const w = toW(e), S = A();
    if (d.t === "place") {
      const small = Math.hypot(w.x - d.s.x, w.y - d.s.y) * view.k < 8, txt = d.kind === "text", [dw, dh] = defSize(d.kind as Kind);
      const x = small ? w.x - dw / 2 : Math.min(w.x, d.s.x), y = small ? w.y - dh / 2 : Math.min(w.y, d.s.y), ww = small ? dw : Math.max(30, Math.abs(w.x - d.s.x)), hh = small ? dh : Math.max(24, Math.abs(w.y - d.s.y));
      const id = S.addItem(d.kind, sn(x), sn(y), ww, hh, txt ? "Text" : ""); S.setTool("select"); S.setSel([id]); if (txt || d.kind === "note") S.setEditing(id);
    } else if (d.t === "plus") {
      if (!d.moved) S.addChild(d.a, d.dir);
      else { const id = under(e); if (id && id !== d.a && doc.items[id]) S.connect(d.a, id); }
    } else if (d.t === "marq") {
      const x1 = Math.min(w.x, d.s.x), x2 = Math.max(w.x, d.s.x), y1 = Math.min(w.y, d.s.y), y2 = Math.max(w.y, d.s.y);
      if ((x2 - x1 + y2 - y1) * view.k < 4) return;
      const hit = new Set<string>(d.base as string[]);
      doc.order.forEach((i) => { const it = doc.items[i]; if (it && it.x < x2 && it.x + it.w > x1 && it.y < y2 && it.y + it.h > y1) grp(i).forEach((g) => hit.add(g)); });
      S.setSel(Array.from(hit));
    } else if (d.t === "move" && !d.rec) {
      const lk = (document.elementFromPoint(e.clientX, e.clientY) as Element | null)?.closest("[data-link]")?.getAttribute("data-link"); if (lk) useDocs.setState({ linkAsk: lk });
    }
  };
  const dbl = (e: React.MouseEvent) => {
    const id = under(e), it = id ? doc.items[id] : null; if (!id || !it) return; const S = A(), w = toW(e); S.setSel([id]);
    if (it.kind === "table" && it.tbl) { const c = Math.min(it.tbl.c - 1, Math.max(0, Math.floor((w.x - it.x) / (it.w / it.tbl.c)))), r = Math.min(it.tbl.r - 1, Math.max(0, Math.floor((w.y - it.y) / (it.h / it.tbl.r)))); S.setEditing(id, { k: "cell", r, c }); }
    else if (it.kind === "chart") useDocs.setState({ chartEdit: id });
    else if (it.note !== undefined && w.y > it.y + it.h - (it.nh ?? 0)) S.setEditing(id, { k: "note" });
    else S.setEditing(id);
  };
  const ctxm = (e: React.MouseEvent) => { e.preventDefault(); const id = (e.target as Element).closest("[data-id]")?.getAttribute("data-id") ?? null, S = A(); if (id && !S.sel.includes(id)) S.setSel([id]); S.setCtx({ x: e.clientX, y: e.clientY, id }); };
  const drop = (e: React.DragEvent) => { const k = e.dataTransfer.getData("text/kind") as Kind; if (!k) return; e.preventDefault(); const w = toW(e), [dw, dh] = defSize(k), S = A();
    const id = S.addItem(k, sn(w.x - dw / 2), sn(w.y - dh / 2), dw, dh, k === "text" ? "Text" : ""); S.setSel([id]); if (k === "text") S.setEditing(id); };

  const items = sel.map((i) => doc.items[i]).filter(Boolean), one = items.length === 1 && sel.length === 1 && !editing && !bgEdit && tool === "select" && !items[0].lock ? items[0] : null, k = view.k, hs = 8 / k, off = 18 / k;
  const ed = editing ? doc.items[editing] : null, selBg = bgEdit ? bgImgs.find((i) => i.id === bgSel) : null;
  let er: R | null = null, val = "", onChange: (v: string) => void = () => {};
  if (ed) {
    if (editSub?.k === "cell" && ed.tbl) { const cw = ed.w / ed.tbl.c, rh = ed.h / ed.tbl.r, rr = editSub.r, cc = editSub.c; er = { x: ed.x + cc * cw, y: ed.y + rr * rh, w: cw, h: rh }; val = ed.tbl.cells[rr]?.[cc] ?? ""; onChange = (v) => A().setCell(ed.id, rr, cc, v); }
    else if (editSub?.k === "note") { er = { x: ed.x, y: ed.y + ed.h - (ed.nh ?? 34), w: ed.w, h: ed.nh ?? 34 }; val = ed.note ?? ""; onChange = (v) => A().setNote(ed.id, v); }
    else { er = { x: ed.x, y: ed.y + (ed.ih ?? 0), w: ed.w, h: Math.max(24, ed.h - (ed.ih ?? 0) - (ed.nh ?? 0)) }; val = ed.text; onChange = (v) => A().patch([ed.id], { text: v }); }
  }
  return (
    <div ref={root} className={"canvas" + (tool !== "select" || useDocs.getState().painter ? " tool" : "")} onDragOver={(e) => e.preventDefault()} onDrop={drop} onContextMenu={ctxm}>
      <svg ref={svg} width="100%" height="100%" onPointerDown={down} onPointerMove={move} onPointerUp={up} onDoubleClick={dbl} onPointerLeave={() => { setEdge(null); setGh(false); setGv(false); setTv(false); }} onMouseDown={(e) => { if (e.button === 1) e.preventDefault(); }}>
        <Defs />
        <defs dangerouslySetInnerHTML={{ __html: gridPatternSvg(tab.gridType, dark ? "#555" : "#c3c8cd") + `<clipPath id="pgclip"><rect x="0" y="0" width="${pg.w}" height="${pg.h}"/></clipPath>` }} />
        <g transform={`translate(${view.x},${view.y}) scale(${k})`}>
          <rect x={0} y={0} width={pg.w} height={pg.h} fill={bgc ?? "var(--bg)"} stroke="var(--line)" strokeWidth={1 / k} pointerEvents="none" />
          {grid && <rect x={0} y={0} width={pg.w} height={pg.h} fill="url(#gp)" pointerEvents="none" />}
          <g clipPath="url(#pgclip)">{bgImgs.map((im) => <image key={im.id} data-bg={im.id} href={im.src} x={im.x} y={im.y} width={im.w} height={im.h} preserveAspectRatio="none" style={{ pointerEvents: bgEdit || bgDelMode ? "auto" : "none" }} />)}</g>
          {bgDelMode && bgImgs.map((im) => <g key={"m" + im.id} data-bgmark={im.id} style={{ cursor: "pointer" }}><rect x={im.x + 4 / k} y={im.y + 4 / k} width={16 / k} height={16 / k} rx={2 / k} fill="#fff" stroke="#555" strokeWidth={1.5 / k} />{bgMarks.includes(im.id) && <path d={`M${im.x + 7 / k},${im.y + 12 / k}l${3 / k},${3 / k}l${6 / k},${-7 / k}`} stroke="#07a352" strokeWidth={3 / k} fill="none" />}</g>)}
          {bgEdit && bgImgs.map((im) => <rect key={"f" + im.id} x={im.x} y={im.y} width={im.w} height={im.h} fill="none" stroke="var(--accent)" strokeWidth={(im.id === bgSel ? 2 : 1) / k} strokeDasharray={`${5 / k}`} pointerEvents="none" />)}
          {selBg && HP.map(([n, fx, fy]) => <rect key={"b" + n} data-bgh={n} x={selBg.x + selBg.w * fx - hs / 2} y={selBg.y + selBg.h * fy - hs / 2} width={hs} height={hs} fill="#fff" stroke="var(--accent)" strokeWidth={1 / k} style={{ cursor: n + "-resize" }} />)}
          {Object.values(doc.conns).map((c) => doc.items[c.from] && doc.items[c.to] && <ConnView key={c.id} c={c} a={doc.items[c.from]} b={doc.items[c.to]} sel={sel.includes(c.id)} />)}
          {doc.order.map((i) => doc.items[i] && <ItemView key={i} it={doc.items[i]} hide={i === editing ? (editSub?.k === "note" ? "note" : editSub?.k === "cell" ? undefined : "text") : undefined} dark={dark} spell={sp} />)}
          {Array.from(new Set(tab.comments.map((cm) => cm.itemId).filter((x) => x && doc.items[x as string]))).map((id) => { const it = doc.items[id as string]; return <g key={"cm" + id} transform={`translate(${it.x + it.w - 4},${it.y - 4})`} pointerEvents="none"><circle r="9" fill="#ffb300" /><text y="4" textAnchor="middle" fontSize="11" fill="#000">✎</text></g>; })}
          {items.map((it) => <rect key={"s" + it.id} x={it.x - 3} y={it.y - 3} width={it.w + 6} height={it.h + 6} fill="none" stroke="var(--accent)" strokeWidth={1.5 / k} strokeDasharray={`${4 / k}`} pointerEvents="none" />)}
          {one && HP.map(([n, fx, fy]) => <rect key={n} data-handle={n} x={one.x + one.w * fx - hs / 2} y={one.y + one.h * fy - hs / 2} width={hs} height={hs} fill="#fff" stroke="var(--accent)" strokeWidth={1 / k} style={{ cursor: n + "-resize" }} />)}
          {one && ([["r", one.x + one.w + off, one.y + one.h / 2], ["l", one.x - off, one.y + one.h / 2], ["t", one.x + one.w / 2, one.y - off], ["b", one.x + one.w / 2, one.y + one.h + off]] as [string, number, number][]).map(([d, cx, cy]) => (
            <g key={d} data-plus={d} style={{ cursor: "pointer" }}><circle cx={cx} cy={cy} r={9 / k} fill="var(--bg)" stroke="var(--accent)" strokeWidth={1.2 / k} /><path d={`M${cx - 4 / k},${cy}H${cx + 4 / k}M${cx},${cy - 4 / k}V${cy + 4 / k}`} stroke="var(--accent)" strokeWidth={1.5 / k} /></g>
          ))}
          {ghost && <rect x={ghost.x} y={ghost.y} width={ghost.w} height={ghost.h} fill={ghost.marq ? "var(--accent)" : "none"} fillOpacity={ghost.marq ? .14 : 1} stroke="var(--accent)" strokeDasharray={ghost.marq ? undefined : `${5 / k}`} strokeWidth={1.2 / k} pointerEvents="none" />}
          {line && doc.items[line.a] && <line x1={doc.items[line.a].x + doc.items[line.a].w / 2} y1={doc.items[line.a].y + doc.items[line.a].h / 2} x2={line.x} y2={line.y} stroke="var(--accent)" strokeWidth={2 / k} strokeDasharray={`${5 / k}`} pointerEvents="none" />}
          {gh && lastHead && <>
            <g data-gadd="" style={{ cursor: "pointer" }}><circle cx={lastHead.x + lastHead.w + 18 / k} cy={lastHead.y + lastHead.h / 2} r={12 / k} fill="#0DF279" /><path d={`M${lastHead.x + lastHead.w + 18 / k - 5 / k},${lastHead.y + lastHead.h / 2}h${10 / k}M${lastHead.x + lastHead.w + 18 / k},${lastHead.y + lastHead.h / 2 - 5 / k}v${10 / k}`} stroke="#064" strokeWidth={2.5 / k} /></g>
            {heads.length > 1 && <g data-gdel="" style={{ cursor: "pointer" }}><circle cx={lastHead.x + lastHead.w / 2} cy={lastHead.y - 16 / k} r={10 / k} fill="#e53935" /><path d={`M${lastHead.x + lastHead.w / 2 - 4 / k},${lastHead.y - 16 / k - 4 / k}l${8 / k},${8 / k}m${-8 / k},0l${8 / k},${-8 / k}`} stroke="#fff" strokeWidth={2.2 / k} /></g>}
          </>}
          {gv && lastRow && <>
            <g data-gradd="" style={{ cursor: "pointer" }}><circle cx={lastRow.x + lastRow.w / 2} cy={lastRow.y + lastRow.h + 18 / k} r={12 / k} fill="#0DF279" /><path d={`M${lastRow.x + lastRow.w / 2 - 5 / k},${lastRow.y + lastRow.h + 18 / k}h${10 / k}M${lastRow.x + lastRow.w / 2},${lastRow.y + lastRow.h + 18 / k - 5 / k}v${10 / k}`} stroke="#064" strokeWidth={2.5 / k} /></g>
            {rows.length > 1 && <g data-grdel="" style={{ cursor: "pointer" }}><circle cx={lastRow.x - 18 / k} cy={lastRow.y + lastRow.h / 2} r={10 / k} fill="#e53935" /><path d={`M${lastRow.x - 18 / k - 4 / k},${lastRow.y + lastRow.h / 2 - 4 / k}l${8 / k},${8 / k}m${-8 / k},0l${8 / k},${-8 / k}`} stroke="#fff" strokeWidth={2.2 / k} /></g>}
          </>}
          {tv && lastTodo && <>
            <g data-tdadd="" style={{ cursor: "pointer" }}><circle cx={lastTodo.x + lastTodo.w / 2} cy={lastTodo.y + lastTodo.h + 18 / k} r={12 / k} fill="#0DF279" /><path d={`M${lastTodo.x + lastTodo.w / 2 - 5 / k},${lastTodo.y + lastTodo.h + 18 / k}h${10 / k}M${lastTodo.x + lastTodo.w / 2},${lastTodo.y + lastTodo.h + 18 / k - 5 / k}v${10 / k}`} stroke="#064" strokeWidth={2.5 / k} /></g>
            {todos.length > 1 && <g data-tddel="" style={{ cursor: "pointer" }}><circle cx={lastTodo.x + lastTodo.w + 18 / k} cy={lastTodo.y + lastTodo.h / 2} r={10 / k} fill="#e53935" /><path d={`M${lastTodo.x + lastTodo.w + 18 / k - 4 / k},${lastTodo.y + lastTodo.h / 2 - 4 / k}l${8 / k},${8 / k}m${-8 / k},0l${8 / k},${-8 / k}`} stroke="#fff" strokeWidth={2.2 / k} /></g>}
          </>}
          {edge && <g pointerEvents="none"><circle cx={edge.d === "r" ? pg.w : Math.min(Math.max(edge.x, 24 / k), pg.w - 24 / k)} cy={edge.d === "b" ? pg.h : Math.min(Math.max(edge.y, 24 / k), pg.h - 24 / k)} r={20 / k} fill="#0DF279" />
            <path d={edge.d === "r" ? `M${pg.w - 9 / k},${Math.min(Math.max(edge.y, 24 / k), pg.h - 24 / k)}h${18 / k}M${pg.w},${Math.min(Math.max(edge.y, 24 / k), pg.h - 24 / k) - 9 / k}v${18 / k}` : `M${Math.min(Math.max(edge.x, 24 / k), pg.w - 24 / k) - 9 / k},${pg.h}h${18 / k}M${Math.min(Math.max(edge.x, 24 / k), pg.w - 24 / k)},${pg.h - 9 / k}v${18 / k}`} stroke="#064" strokeWidth={4 / k} strokeLinecap="round" /></g>}
          {ed && er && <foreignObject x={er.x} y={er.y} width={er.w} height={er.h}>
            <textarea autoFocus spellCheck={spell} lang={spellLang} value={val} onFocus={(e) => e.currentTarget.select()} onChange={(e) => onChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Escape" || (e.key === "Enter" && (e.ctrlKey || e.metaKey))) A().setEditing(null); }}
              style={{ width: "100%", height: "100%", boxSizing: "border-box", resize: "none", border: "2px dashed var(--accent)", background: "var(--bg)", color: "var(--fg)", fontSize: editSub?.k === "note" ? Math.max(10, ed.fs * .8) : ed.fs, fontWeight: ed.bold ? 700 : 400, fontStyle: ed.italic ? "italic" : "normal", textAlign: (ed.kind === "notepad" ? "left" : ed.ha ?? "center") as any, fontFamily: ed.ff ?? "Calibri", padding: (editSub?.k === "note" ? 4 : Math.max(4, (er.h - ed.fs * 1.4) / 2)) + "px 6px 4px", outline: "none" }} />
          </foreignObject>}
        </g>
      </svg>
    </div>
  );
}
