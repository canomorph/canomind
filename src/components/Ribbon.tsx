import { ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import { t } from "../i18n";
import { BULLETS, Conn, Item, Kind, pageOf, uid } from "../model";
import { A_SIZES, B_SIZES, MARK_SIZES, SCREENS, cm, inch, markColor, mm2px } from "../pages";
import { STENCILS } from "../shapes";
import { curTab, useDocs, useSettings } from "../store";
import { SwStyle, moveItem, sameSw } from "../swatches";
import { ColorPick } from "./ColorPick";
import { Icon } from "./Icon";
import { Drop, MI } from "./Menu";
import { Thumb } from "./Thumb";

const Btn = ({ i, l, on, act, sm, dis }: { i: string; l: string; on?: () => void; act?: boolean; sm?: boolean; dis?: boolean }) => (
  <button className={"rb" + (sm ? " sm" : "") + (act ? " act" : "")} disabled={dis} title={t(l)} onClick={on}><Icon name={i} size={sm ? 16 : 28} /><span>{t(l)}</span></button>
);
const IB = ({ i, l, on, act, dis }: { i: string; l: string; on?: () => void; act?: boolean; dis?: boolean }) => (
  <button className={"ib" + (act ? " act" : "")} disabled={dis} title={t(l)} onClick={on}><Icon name={i} size={16} /></button>
);
const Stack = ({ children }: { children: ReactNode }) => <div className="stack">{children}</div>;
const Row = ({ children }: { children: ReactNode }) => <div className="row">{children}</div>;
interface G { n: string; i: string; c: ReactNode }
const grp = (n: string, i: string, c: ReactNode): G => ({ n, i, c });
const hex = (v?: string, d = "#ffffff") => (v && /^#[0-9a-f]{6}$/i.test(v) ? v : d);
const FONTS = ["Calibri", "Segoe UI", "Arial", "Times New Roman", "Courier New", "Georgia", "Verdana"];
const PICK: (keyof Item)[] = ["fill", "stroke", "sw", "color", "fs", "bold", "italic", "ul", "st", "ff", "ha", "va", "dash", "shadow", "fo", "so", "bt"];
const COLL_W = 76;

function ColorMenu({ i, l, v, on, none, mode = "sm", opacity, onOpacity, extra }: { i: string; l: string; v: string; on: (c: string) => void; none?: boolean; mode?: "sm" | "icon"; opacity?: number; onOpacity?: (o: number) => void; extra?: (c: () => void) => ReactNode }) {
  return <Drop i={i} l={l} mode={mode} swatch={v === "none" ? "transparent" : v}>{(c) => <><ColorPick value={v} opacity={opacity} onOpacity={onOpacity} none={none} onColor={on} close={c} />{extra?.(c)}</>}</Drop>;
}
const Expanded = ({ g }: { g: G }) => <div className="grp"><div className="gbtns">{g.c}</div><div className="gname">{t(g.n)}</div></div>;
const closeOnBtn = (close: () => void) => (e: React.MouseEvent) => { const b = (e.target as Element).closest("button"); if (b && !b.hasAttribute("data-drop")) close(); };
const Collapsed = ({ g }: { g: G }) => <div className="grp coll"><button className="rb" tabIndex={-1}><span className="ic"><Icon name={g.i} size={28} /></span><span>{t(g.n)} <Icon name="chevdown" size={9} /></span></button></div>;
// Office-style responsive groups: groups collapse (last first) into drop-down buttons; when even that is too wide, buttons shrink ("dense").
function Groups({ items }: { items: G[] }) {
  const box = useRef<HTMLDivElement>(null), mE = useRef<HTMLDivElement>(null), mC = useRef<HTMLDivElement>(null), [wid, setWid] = useState(0), [coll, setColl] = useState(0), [dense, setDense] = useState(false);
  useEffect(() => { const ro = new ResizeObserver(() => setWid(box.current!.clientWidth)); ro.observe(box.current!); setWid(box.current!.clientWidth); return () => ro.disconnect(); }, []);
  useLayoutEffect(() => {
    const we = Array.from(mE.current!.children).map((e) => (e as HTMLElement).offsetWidth), wc = Array.from(mC.current!.children).map((e) => (e as HTMLElement).offsetWidth), avail = wid - 24;
    const total = (k: number) => we.reduce((a, w, i) => a + (i >= we.length - k ? wc[i] : w), 0), needDense = total(we.length) > avail;
    let n = 0; if (needDense) n = we.length; else while (n < we.length && total(n) > avail) n++;
    if (n !== coll) setColl(n); if (needDense !== dense) setDense(needDense);
  });
  return (
    <div className="gwrap" ref={box}>
      <div className="mwrap"><div className="mflex" ref={mE}>{items.map((g) => <Expanded key={g.n} g={g} />)}</div><div className="mflex" ref={mC}>{items.map((g) => <Collapsed key={g.n} g={g} />)}</div></div>
      <div className={"gvis" + (dense ? " dense" : "")}>{items.map((g, i) => i >= items.length - coll
        ? <div key={g.n} className="grp coll"><Drop mode="big" i={g.i} l={g.n}>{(close) => <div className="gpop" onClick={closeOnBtn(close)}>{g.c}</div>}</Drop></div>
        : <Expanded key={g.n} g={g} />)}</div>
    </div>
  );
}
interface SwGridProps { list: SwStyle[]; text?: boolean; del: boolean; marks: string[]; onMark: (id: string) => void; onApply: (s: SwStyle) => void; onMove: (f: number, t: number) => void }
const SwGrid = ({ list, text, del, marks, onMark, onApply, onMove }: SwGridProps) => <>{list.map((s, i) => (
  <button key={s.id} className={"schm" + (text ? " txt" : "")} style={{ background: s.fill, borderColor: s.stroke, color: s.color }} draggable
    onDragStart={(e) => { e.dataTransfer.setData("text/sw", String(i)); e.dataTransfer.effectAllowed = "move"; }} onDragOver={(e) => { if (e.dataTransfer.types.includes("text/sw")) e.preventDefault(); }}
    onDrop={(e) => { if (!e.dataTransfer.types.includes("text/sw")) return; e.preventDefault(); const f = +e.dataTransfer.getData("text/sw"); if (f !== i) onMove(f, i); }}
    onClick={() => (del ? onMark(s.id) : onApply(s))}>
    {text && "Abc"}{del && <i className={"mk" + (marks.includes(s.id) ? " on" : "")}>{marks.includes(s.id) ? "✓" : ""}</i>}
  </button>))}</>;

export function Ribbon() {
  const [tab, setTab] = useState("Home"), [pop, setPop] = useState<string | null>(null), [w, setW] = useState(innerWidth), [collapsed, setCollapsed] = useState(false);
  const [delQS, setDelQS] = useState(false), [mkQS, setMkQS] = useState<string[]>([]), [delSC, setDelSC] = useState(false), [mkSC, setMkSC] = useState<string[]>([]);
  const nav = useRef<HTMLElement>(null);
  useEffect(() => { const f = () => setW(innerWidth); addEventListener("resize", f); return () => removeEventListener("resize", f); }, []);
  useEffect(() => { if (!pop) return; const f = (e: MouseEvent) => { if (!nav.current?.contains(e.target as Node)) setPop(null); }; addEventListener("mousedown", f); return () => removeEventListener("mousedown", f); }, [pop]);
  const S = useDocs(), st = useSettings(), T = curTab(S), doc = T.doc, sel = S.sel, qs = st.quickStyles, sc = st.schemes;
  const it = sel.map((i) => doc.items[i]).find(Boolean) as Item | undefined, hasSel = sel.length > 0, multi = sel.length > 1;
  const pat = (p: Partial<Item>) => S.patch(sel, p), pc = (p: Partial<Conn>) => S.patchConns(sel, p);
  const cStyle = (sel.map((i) => doc.conns[i]).find(Boolean) as Conn | undefined)?.style ?? S.connStyle;
  const recase = (f: (s: string) => string) => S.mutate((d) => sel.forEach((i) => { if (d.items[i]) d.items[i] = { ...d.items[i], text: f(d.items[i].text) }; }));
  const gallery = (c: () => void, fn: (k: Kind) => void) => <div className="mgrid">{STENCILS["Basic Shapes"].concat(STENCILS["Arrows"], STENCILS["Callouts & Notes"]).map((s, n) => <button key={n} className="gi" title={t(s.n)} onClick={() => { fn(s.k); c(); }}><Thumb k={s.k} /></button>)}</div>;
  const fontList = S.fonts.length ? S.fonts : FONTS, curF = it?.ff ?? "Calibri", fopts = fontList.includes(curF) ? fontList : [curF, ...fontList];
  const pg = pageOf(doc), land = pg.w >= pg.h, isSize = (w: number, h: number) => (pg.w === w && pg.h === h) || (pg.w === h && pg.h === w);
  const sizeRow = (c: () => void, label: string, w: number, h: number, extra: string) => <MI key={label} l={`${label}   ${extra}`} act={isSize(w, h)} on={() => S.setPageSize(w, h)} close={c} />;
  const navToggle = () => S.setPane(S.pane === "nav" ? "none" : "nav");
  const bgc = doc.bg?.color, bgn = doc.bg?.imgs.length ?? 0, el = (id: string) => document.getElementById(id);
  const mkSw = (): SwStyle | null => (it ? { id: uid(), fill: it.fill, stroke: it.stroke, color: it.color } : null);
  const addQS = () => { const sw = mkSw(); if (!sw) return; const u: any = {}; if (!qs.some((x) => sameSw(x, sw))) u.quickStyles = [...qs, sw]; if (!sc.some((x) => sameSw(x, sw))) u.schemes = [...sc, { ...sw, id: uid() }]; if (Object.keys(u).length) st.set(u); };
  const addSC = () => { const sw = mkSw(); if (sw && !sc.some((x) => sameSw(x, sw))) st.set({ schemes: [...sc, sw] }); };
  const delToggle = (which: "qs" | "sc") => {
    if (which === "qs") { if (delQS) { st.set({ quickStyles: qs.filter((x) => !mkQS.includes(x.id)) }); setMkQS([]); } setDelQS(!delQS); }
    else { if (delSC) { st.set({ schemes: sc.filter((x) => !mkSC.includes(x.id)) }); setMkSC([]); } setDelSC(!delSC); }
  };
  const flip = (a: string[], id: string) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]);

  const tabs: Record<string, G[]> = {
    File: [],
    Home: [
      grp("Clipboard", "paste", <><Btn i="paste" l="Paste" on={S.paste} dis={!S.clip} />
        <Stack><Btn sm i="cut" l="Cut" on={S.cut} dis={!hasSel} /><Btn sm i="copy" l="Copy" on={S.copy} dis={!hasSel} />
          <Btn sm i="formatpainter" l="Format Painter" act={!!S.painter} dis={!it && !S.painter} on={() => { if (S.painter) S.setPainter(null); else if (it) { const p: any = {}; PICK.forEach((k) => { p[k] = (it as any)[k]; }); S.setPainter(p); } }} /></Stack></>),
      grp("Font", "fontcolor", <div className="col2">
        <Row><select className="rsel ff" title={t("Font")} value={curF} onChange={(e) => pat({ ff: e.target.value })}>{fopts.map((f) => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}</select>
          <select className="rsel fs" title={t("Font size")} value={it?.fs ?? 16} onChange={(e) => pat({ fs: +e.target.value })}>{[8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 64].map((n) => <option key={n} value={n}>{n}pt.</option>)}</select>
          <IB i="grow" l="Increase font size" on={() => pat({ fs: Math.min(96, (it?.fs ?? 16) + 2) })} /><IB i="shrink" l="Decrease font size" on={() => pat({ fs: Math.max(6, (it?.fs ?? 16) - 2) })} /></Row>
        <Row><IB i="bold" l="Bold" act={!!it?.bold} on={() => pat({ bold: !it?.bold })} /><IB i="italic" l="Italic" act={!!it?.italic} on={() => pat({ italic: !it?.italic })} />
          <IB i="underline" l="Underline" act={!!it?.ul} on={() => pat({ ul: !it?.ul })} /><IB i="strike" l="Strikethrough" act={!!it?.st} on={() => pat({ st: !it?.st })} />
          <Drop mode="icon" i="case" l="Change case">{(c) => <><MI l="UPPERCASE" on={() => recase((s) => s.toUpperCase())} close={c} /><MI l="lowercase" on={() => recase((s) => s.toLowerCase())} close={c} /><MI l="Capitalize Each Word" on={() => recase((s) => s.replace(/\b\w/g, (m) => m.toUpperCase()))} close={c} /></>}</Drop>
          <ColorMenu mode="icon" i="fontcolor" l="Font color" v={hex(it?.color, "#c00000")} on={(c) => pat({ color: c })} /></Row></div>),
      grp("Paragraph", "alignl", <div className="col2">
        <Row><IB i="valtop" l="Top" act={it?.va === "top"} on={() => pat({ va: "top" })} /><IB i="valmid" l="Middle" act={(it?.va ?? "middle") === "middle"} on={() => pat({ va: "middle" })} /><IB i="valbot" l="Bottom" act={it?.va === "bottom"} on={() => pat({ va: "bottom" })} /><Drop mode="icon" i="bullets" l="Bullets">{(c) => <>{BULLETS.map(([v, l]) => <MI key={v} l={l} act={(it?.bt ?? (it?.bul ? "dot" : "none")) === v} on={() => pat({ bt: v === "none" ? undefined : v, bul: false })} close={c} />)}</>}</Drop></Row>
        <Row><IB i="alignl" l="Align left" act={it?.ha === "left"} on={() => pat({ ha: "left" })} /><IB i="alignc" l="Center" act={(it?.ha ?? "center") === "center"} on={() => pat({ ha: "center" })} /><IB i="alignr" l="Align right" act={it?.ha === "right"} on={() => pat({ ha: "right" })} />
          <IB i="outdent" l="Decrease indent" on={() => pat({ ind: Math.max(0, (it?.ind ?? 0) - 1) })} /><IB i="indent" l="Increase indent" on={() => pat({ ind: Math.min(8, (it?.ind ?? 0) + 1) })} /></Row></div>),
      grp("Shape Styles", "quickstyles", <>
        <Drop mode="big" i="quickstyles" l="Quick Styles">{(c) => <div>
          <div className="mgrid q"><SwGrid list={qs} text del={delQS} marks={mkQS} onMark={(id) => setMkQS(flip(mkQS, id))} onApply={(s) => { S.quickStyle(s.fill, s.stroke, s.color); c(); }} onMove={(f, to) => st.set({ quickStyles: moveItem(qs, f, to) })} /></div>
          <div className="qsfoot"><button className="mi" disabled={!it} onClick={addQS}><Icon name="plus" size={16} />{t("Add")}</button><button className={"mi" + (delQS ? " act" : "")} onClick={() => delToggle("qs")}><Icon name="delete" size={16} />{t("Delete")}</button></div></div>}</Drop>
        <Stack>
          <ColorMenu i="fill" l="Fill" v={hex(it?.fill === "none" ? "#ffffff" : it?.fill)} none opacity={it?.fo} onOpacity={(o) => pat({ fo: o })} on={(c) => pat({ fill: c })} />
          <ColorMenu i="linecolor" l="Line" v={hex(it?.stroke, "#079a4a")} none opacity={it?.so} onOpacity={(o) => pat({ so: o })} on={(c) => (c === "none" ? pat({ sw: 0 }) : pat({ stroke: c, sw: it?.sw || 2 }))} extra={(c) => <>
            <div className="mrow">{[1, 2, 3, 4, 6].map((n) => <button key={n} className={"mini" + (it?.sw === n ? " act" : "")} onClick={() => { pat({ sw: n }); c(); }}>{n}px</button>)}</div>
            <MI i="dashed" l="Dashed" act={!!it?.dash} on={() => pat({ dash: !it?.dash })} close={c} /></>} />
          <Drop mode="sm" i="effects" l="Effects">{(c) => <MI i="effects" l="Shadow" act={!!it?.shadow} on={() => pat({ shadow: !it?.shadow })} close={c} />}</Drop></Stack></>),
      grp("Arrange", "align", <>
        <Drop mode="big" i="align" l="Align">{(c) => <>{([["l", "Align Left"], ["c", "Align Center"], ["r", "Align Right"], ["t", "Align Top"], ["m", "Align Middle"], ["b", "Align Bottom"]] as const).map(([m, n]) => <MI key={m} l={n} dis={!multi} on={() => S.align(m)} close={c} />)}
          <div className="msep" /><MI l="Distribute Horizontally" dis={sel.length < 3} on={() => S.distribute("h")} close={c} /><MI l="Distribute Vertically" dis={sel.length < 3} on={() => S.distribute("v")} close={c} /></>}</Drop>
        <Stack><Btn sm i="front" l="Bring to Front" dis={!hasSel} on={() => S.z(true)} /><Btn sm i="back" l="Send to Back" dis={!hasSel} on={() => S.z(false)} />
          <Drop mode="sm" i="group" l="Group">{(c) => <><MI i="group" l="Group" dis={!multi} on={() => S.group(true)} close={c} /><MI l="Ungroup" dis={!hasSel} on={() => S.group(false)} close={c} /></>}</Drop></Stack></>),
      grp("Editing", "select", <Stack><Btn sm i="search" l="Find" act={S.pane === "nav"} on={navToggle} />
        <Drop mode="sm" i="layers" l="Layers">{(c) => <><MI i="lock" l="Lock shape" dis={!hasSel} on={() => pat({ lock: true })} close={c} /><MI l="Unlock shape" dis={!hasSel} on={() => pat({ lock: false })} close={c} /></>}</Drop>
        <Drop mode="sm" i="select" l="Select">{(c) => <><MI i="selectall" l="Select All" on={S.selectAll} close={c} /><MI l="Select None" on={() => S.setSel([])} close={c} /><MI l="Invert Selection" on={S.invert} close={c} /><MI l="Select Same Shape" dis={!it} on={S.selectSame} close={c} /><MI l="Select All Connectors" on={S.selectConns} close={c} /></>}</Drop></Stack>),
    ],
    Insert: [
      grp("Shapes", "rectangle", <><Drop mode="big" i="changeshape" l="Change Shape">{(c) => gallery(c, (k) => pat({ kind: k }))}</Drop><Btn i="templates" l="Shapes" act={S.pane === "shapes"} on={() => S.setPane(S.pane === "shapes" ? "none" : "shapes")} /></>),
      grp("Mind map", "child", <><Btn i="child" l="Subtopic" on={() => sel[0] && S.addChild(sel[0], "r", false)} dis={!it} /><Btn i="sibling" l="Sibling" on={() => sel[0] && S.addSibling(sel[0], false)} dis={!it} /></>),
      grp("Text", "textbox", <><Btn i="notepad" l="Note" on={() => S.addAtCenter("notepad")} /><Btn i="note" l="Sticky note" on={() => S.addAtCenter("note")} /><Btn i="textbox" l="Text box" on={() => S.addAtCenter("text")} /><Btn i="todo" l="To-do box" on={() => S.addAtCenter("todo")} /></>),
      grp("Media", "image", <Btn i="image" l="Picture" on={() => el("canomind-img")?.click()} />),
      grp("Tables & Charts", "table", <><Btn i="table" l="Table" on={() => S.toggle("tableDlg", true)} /><Btn i="chart" l="Chart" on={() => S.toggle("chartDlg", true)} /></>),
    ],
    Design: [
      grp("Page", "pagesize", <>
        <Drop mode="big" i="pagesize" l="Page size">{(c) => <>
          <div className="lbl hd">{t("A series (cm)")}</div>{A_SIZES.map(([n, w, h]) => sizeRow(c, n, mm2px(w), mm2px(h), `${cm(w)} × ${cm(h)} cm`))}
          <div className="lbl hd">{t("B series (inch)")}</div>{B_SIZES.map(([n, w, h]) => sizeRow(c, n, mm2px(w), mm2px(h), `${inch(w)} × ${inch(h)} in`))}
          <div className="lbl hd">{t("Screen (px)")}</div>{SCREENS.map(([n, w, h]) => sizeRow(c, n, w, h, `${w} × ${h} px`))}</>}</Drop>
        <Stack><Btn sm i="portrait" l="Portrait" act={!land} on={() => S.setOrientation(false)} /><Btn sm i="landscape" l="Landscape" act={land} on={() => S.setOrientation(true)} /></Stack></>),
      grp("Layout", "autolayout", <Btn i="autolayout" l="Auto layout" on={S.layout} />),
      grp("Connector style", "connector", <><Btn i="curve" l="Curved" act={cStyle === "curve"} on={() => pc({ style: "curve" })} /><Btn i="straight" l="Straight" act={cStyle === "straight"} on={() => pc({ style: "straight" })} /><Btn i="elbow" l="Elbow" act={cStyle === "elbow"} on={() => pc({ style: "elbow" })} /></>),
      grp("Color schemes", "palette", <><div className="schemes"><SwGrid list={sc} del={delSC} marks={mkSC} onMark={(id) => setMkSC(flip(mkSC, id))} onApply={(s) => S.palette(s.fill, s.stroke, s.color)} onMove={(f, to) => st.set({ schemes: moveItem(sc, f, to) })} /></div>
        <Stack><Btn sm i="plus" l="Add" dis={!it} on={addSC} /><Btn sm i="delete" l="Delete" act={delSC} on={() => delToggle("sc")} /></Stack></>),
    ],
    Review: [
      grp("Proofing", "spell", <Btn i="spell" l="Spell check" act={S.spell} on={() => S.toggle("spell")} />),
      grp("Comments", "comment", <Btn i="comment" l="New comment" on={() => { if (sel[0]) S.setCommentTarget(sel[0]); S.toggle("commentsOpen", true); }} />),
    ],
    View: [
      grp("Show", "ruler", <>
        <Stack><Btn sm i="ruler" l="Ruler" act={st.ruler} on={() => st.set({ ruler: !st.ruler })} />
          <Drop mode="sm" i="ruler" l="Page marks">{() => <>{MARK_SIZES.map(([n, w, h]) => { const on = st.rulerMarks.includes(n); return <button key={n} className="mi" onClick={() => st.set({ rulerMarks: on ? st.rulerMarks.filter((x) => x !== n) : [...st.rulerMarks, n] })}><i className={"cbx" + (on ? " on" : "")}>{on ? "✓" : ""}</i><b className="sw" style={{ background: markColor(n) }} />{n}<small style={{ marginLeft: "auto", opacity: 0.7 }}>{n.startsWith("A") ? `${cm(w)} × ${cm(h)} cm` : `${inch(w)} × ${inch(h)} in`}</small></button>; })}</>}</Drop></Stack>
        <Stack><Btn sm i="grid" l="Grid" act={T.grid} on={() => S.setGrid(!T.grid)} />
          <Drop mode="sm" i="gridtype" l="Grid type">{(c) => <>{([["square", "Squared"], ["lines", "Lined"], ["dots", "Dotted"], ["iso", "Isometric"], ["isodots", "Isometric dots"]] as const).map(([v, n]) => <MI key={v} l={n} act={T.gridType === v} on={() => S.setGridType(v)} close={c} />)}</>}</Drop></Stack>
        <Btn i="snap" l="Snap" act={st.snap} on={() => st.set({ snap: !st.snap })} /><Btn i="nav" l="Navigation" act={S.pane === "nav"} on={navToggle} /></>),
      grp("Background", "bgimg", <>
        <div className="bgrow">{([["Auto", undefined, "var(--canvas)"], ["White", "#ffffff", "#ffffff"], ["Sepia", "#f4ecd8", "#f4ecd8"], ["Dark", "#2b2b2b", "#2b2b2b"], ["Black", "#000000", "#000000"]] as [string, string | undefined, string][]).map(([n, v, bg]) => (
          <button key={n} className={"bgb" + (bgc === v ? " act" : "")} onClick={() => S.bgColor(v)}><b className="sw big" style={{ background: bg }} /><span>{t(n)}</span></button>))}
          <label className="bgb"><Icon name="palette" size={22} /><span>{t("Custom")}</span><input type="color" value={hex(bgc, "#ffffff")} onChange={(e) => S.bgColor(e.target.value)} /></label></div>
        <Btn i="bgimg" l="Background picture" on={() => el("canomind-bg")?.click()} />
        <Stack><Btn sm i="edit" l="Edit" act={S.bgEdit} dis={!bgn || S.bgDelMode} on={() => useDocs.setState({ bgEdit: !S.bgEdit, bgSel: null })} /><Btn sm i="delete" l="Delete" act={S.bgDelMode} dis={!bgn} on={S.bgDel} /></Stack></>),
    ],
    Help: [
      grp("Help", "help", <><Btn i="help" l="About" on={() => S.toggle("aboutOpen", true)} /><Btn i="keyboard" l="Keyboard shortcuts" on={() => S.toggle("keysOpen", true)} /></>),
    ],
  };

  const compact = collapsed || w < 420, toggleCollapse = () => { setCollapsed(!collapsed); setPop(null); };
  const active = (k: string) => (k === "File" ? S.start : !S.start && tab === k);
  return (
    <nav className="ribbon" ref={nav}>
      <div className="ribbon-tabs" onDoubleClick={toggleCollapse}>
        {Object.keys(tabs).map((k) => (
          <button key={k} className={"rtab" + (active(k) ? " active" : "")} onClick={() => { if (k === "File") { S.setStart(true); setPop(null); } else { S.setStart(false); setTab(k); setPop(compact ? (pop === k ? null : k) : null); } }}>{t(k)}</button>
        ))}
        <button className="rtab collbtn" title={t(collapsed ? "Expand ribbon" : "Collapse ribbon")} onClick={toggleCollapse} onDoubleClick={(e) => e.stopPropagation()}><Icon name={collapsed ? "chevdown" : "chevron"} size={14} /></button>
        <span className="grow" />
        <button className={"sharebtn" + (S.commentsOpen ? " on" : "")} onClick={() => S.toggle("commentsOpen")} onDoubleClick={(e) => e.stopPropagation()}><Icon name="comment" size={14} /> {t("comments.btn")}</button>
      </div>
      {compact && pop && !S.start && <div className="rpop" onClick={closeOnBtn(() => setPop(null))}><Groups key={pop} items={tabs[pop]} /></div>}
      {!compact && !S.start && <div className="ribbon-body"><Groups key={tab} items={tabs[tab]} /></div>}
    </nav>
  );
}
