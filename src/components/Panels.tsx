import { Fragment, ReactNode, useState } from "react";
import { CHART_COLORS } from "../prims";
import { t } from "../i18n";
import { curTab, Theme, useDocs, useSettings } from "../store";
import { FORMATS, cancelSave, closeChoice, confirmSaveAs, openLink } from "../io";
import { TEMPLATES } from "../templates";
import { Icon } from "./Icon";

export const Drawer = ({ side, title, open, onClose, children }: { side: string; title: string; open: boolean; onClose: () => void; children?: ReactNode }) =>
  open ? <aside className={"panel " + side}><div className="phead"><b>{title}</b><button className="iconbtn" onClick={onClose}><Icon name="close" size={14} /></button></div>{children}</aside> : null;

export function CommentList() {
  const S = useDocs(), T = curTab(S), spellLang = useSettings((s) => s.spellLang), [txt, setTxt] = useState("");
  const tgt = S.commentTarget && T.doc.items[S.commentTarget] ? S.commentTarget : null;
  const lbl = (id: string) => T.doc.items[id]?.text.replace(/\n/g, " ").trim() || "…";
  const add = () => { if (txt.trim()) { S.addComment(txt.trim(), tgt ?? undefined); setTxt(""); S.setCommentTarget(null); } };
  return <div className="list">
    {tgt && <div className="cchip">{t("Comment on")}: {lbl(tgt)} <button className="iconbtn" onClick={() => S.setCommentTarget(null)}><Icon name="close" size={10} /></button></div>}
    <textarea autoFocus={!!tgt} spellCheck={S.spell} lang={spellLang} value={txt} placeholder={t("Add a comment…")} onChange={(e) => setTxt(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); add(); } }} />
    {[...T.comments].reverse().map((c) => <div key={c.id} className="cmt"><small>{new Date(c.at).toLocaleString()}</small>
      {c.itemId && T.doc.items[c.itemId] && <div><button className="cchip" onClick={() => S.goTo(c.itemId!)}>{lbl(c.itemId)}</button></div>}
      <p>{c.text}</p><button className="iconbtn" onClick={() => S.delComment(c.id)}><Icon name="delete" size={14} /></button></div>)}
  </div>;
}
export function Settings() {
  const s = useSettings(), { settingsOpen, toggle } = useDocs();
  if (!settingsOpen) return null;
  return (
    <div className="modal" onClick={() => toggle("settingsOpen", false)}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <div className="phead"><b>{t("settings.title")}</b><button className="iconbtn" onClick={() => toggle("settingsOpen", false)}><Icon name="close" size={14} /></button></div>
        <label>{t("settings.theme")}<select value={s.theme} onChange={(e) => s.set({ theme: e.target.value as Theme })}>{(["system", "light", "sepia", "dark", "black"] as Theme[]).map((v) => <option key={v} value={v}>{t("theme." + v)}</option>)}</select></label>
        <label>{t("settings.scale")}<select value={s.scale} onChange={(e) => s.set({ scale: +e.target.value })}>{[50, 75, 100, 125, 150].map((v) => <option key={v} value={v}>{v}%</option>)}</select></label>
        <label>{t("settings.lang")}<select value={s.lang} onChange={(e) => s.set({ lang: e.target.value as "en" | "tr" })}><option value="en">English</option><option value="tr">Türkçe</option></select></label>
      </div>
    </div>
  );
}
export function TemplateGallery() {
  const S = useDocs(); if (!S.templatesOpen) return null;
  return (
    <div className="modal" onClick={() => S.toggle("templatesOpen", false)}>
      <div className="dialog wide" onClick={(e) => e.stopPropagation()}>
        <div className="phead"><b>{t("Template gallery")}</b><button className="iconbtn" onClick={() => S.toggle("templatesOpen", false)}><Icon name="close" size={14} /></button></div>
        <div className="tgrid">{TEMPLATES.map((x) => <button key={x.id} className="tcard" onClick={() => { S.newTab(t(x.name), x.build()); S.toggle("templatesOpen", false); }}><Icon name={x.icon} size={36} /><span>{t(x.name)}</span></button>)}</div>
      </div>
    </div>
  );
}
export function AboutModal() {
  const S = useDocs(); if (!S.aboutOpen) return null;
  return (
    <div className="modal" onClick={() => S.toggle("aboutOpen", false)}>
      <div className="dialog about" style={{ position: "relative" }} onClick={(e) => e.stopPropagation()}>
        <button className="iconbtn mclose" onClick={() => S.toggle("aboutOpen", false)}><Icon name="close" size={14} /></button>
        <div>{t("about.dev")} Canomorph Creative</div><b>Canomind</b><div>{t("about.ver")} 0.4.0</div>
      </div>
    </div>
  );
}
const KEYS: [string, string][] = [["Ctrl+N", "New"], ["Ctrl+O", "Open"], ["Ctrl+S", "Save"], ["Ctrl+Shift+S", "Save As"], ["Ctrl+Z", "Undo"], ["Ctrl+Y", "Redo"], ["Ctrl+C", "Copy"], ["Ctrl+X", "Cut"], ["Ctrl+V", "Paste"], ["Ctrl+D", "Duplicate"], ["Ctrl+A", "Select all"],
  ["Delete", "Delete"], ["Tab", "Add subtopic"], ["Enter", "Add sibling"], ["F2", "Edit text"], ["Double-click", "Edit text"], ["Right-click", "Context menu"], ["Shift+Click", "Multi-select"], ["Ctrl+Wheel", "Zoom"], ["Arrows keys", "Move selection"], ["Shift+Arrows keys", "Move selection by 10"], ["F5", "Presentation"], ["Drag", "Select"], ["Shift+Wheel", "Pan horizontally"], ["Alt+Drag", "Pan"], ["Middle button", "Pan"], ["Esc", "Cancel"]];
const KT = ["Double-click", "Right-click", "Click", "Wheel", "Arrows keys", "Drag", "Middle button"];
export function KeysModal() {
  const S = useDocs(); if (!S.keysOpen) return null;
  return (
    <div className="modal" onClick={() => S.toggle("keysOpen", false)}>
      <div className="dialog" style={{ position: "relative", padding: 0 }} onClick={(e) => e.stopPropagation()}>
        <button className="iconbtn mclose" onClick={() => S.toggle("keysOpen", false)}><Icon name="close" size={14} /></button>
        <div className="keys">{KEYS.map(([k, l]) => <Fragment key={k}><span>{k.split("+").map((x) => (KT.includes(x) ? t(x) : x)).join("+")}</span><span>{t(l)}</span></Fragment>)}</div>
      </div>
    </div>
  );
}

const stop = (e: React.MouseEvent) => e.stopPropagation();
const Seg = ({ opts, val, on, dis }: { opts: [string, string][]; val: string; on: (v: string) => void; dis?: boolean }) => (
  <div className="seg">{opts.map(([v, l]) => <button key={v} disabled={dis} className={val === v ? "on" : ""} onClick={() => on(v)}>{t(l)}</button>)}</div>
);
export function SaveAsDialog() { const S = useDocs(); return S.saveDlg ? <SaveAsInner key={S.saveDlg.fmt} fmt0={S.saveDlg.fmt} /> : null; }
function SaveAsInner({ fmt0 }: { fmt0: string }) {
  const T = curTab(useDocs()), [fmt, setFmt] = useState(fmt0), [view, setView] = useState("map"), [area, setArea] = useState("all"), [grid, setGrid] = useState(T.grid);
  const img = ["png", "jpg", "svg", "pdf"].includes(fmt), eff = fmt === "md" ? "list" : img ? view : "map", canMap = img && eff === "map", canGrid = fmt === "canomind" || canMap;
  return (
    <div className="modal" onClick={cancelSave}>
      <div className="dialog" onClick={stop}>
        <div className="phead"><b>{t("Save As")}</b><button className="iconbtn" onClick={cancelSave}><Icon name="close" size={14} /></button></div>
        <label>{t("File format")}<select value={fmt} onChange={(e) => setFmt(e.target.value)}>{FORMATS.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}</select></label>
        <div className="swrow"><span>{t("View")}</span><Seg dis={!img} val={eff} on={setView} opts={[["map", "Mind map"], ["list", "List"]]} /></div>
        <div className="swrow"><span>{t("Area")}</span><Seg dis={!canMap} val={canMap ? area : "all"} on={setArea} opts={[["visible", "Visible area"], ["all", "Entire work"]]} /></div>
        <div className="swrow"><span>{t("Grid")}</span><button disabled={!canGrid} className={"tgl" + (canGrid && grid ? " on" : "")} onClick={() => setGrid(!grid)}><Icon name="grid" size={16} /> {canGrid && grid ? t("On") : t("Off")}</button></div>
        <div className="dfoot"><button className="dbtn" onClick={cancelSave}>{t("Cancel")}</button><button className="dbtn pri" onClick={() => confirmSaveAs(fmt, { view: eff === "list" ? "list" : "map", area: canMap && area === "visible" ? "visible" : "all", grid: canGrid && grid })}>{t("Save")}</button></div>
      </div>
    </div>
  );
}
export function TableDialog() { const S = useDocs(); return S.tableDlg ? <TableInner /> : null; }
const TABLE_DEF = { r: 3, c: 3, fill: "#ffffff", stroke: "#079a4a" };
function TableInner() {
  const S = useDocs(), st = useSettings(), init = st.tableRemember && st.tableDef ? st.tableDef : TABLE_DEF;
  const [r, setR] = useState(init.r), [c, setC] = useState(init.c), [fill, setFill] = useState(init.fill), [stroke, setStroke] = useState(init.stroke), [rem, setRem] = useState(st.tableRemember);
  const num = (v: string) => Math.max(1, Math.min(20, +v || 1)), close = () => S.toggle("tableDlg", false);
  const toggleRem = (on: boolean) => { setRem(on); if (!on) { setR(TABLE_DEF.r); setC(TABLE_DEF.c); setFill(TABLE_DEF.fill); setStroke(TABLE_DEF.stroke); st.set({ tableDef: null, tableRemember: false }); } };
  const create = () => { st.set(rem ? { tableDef: { r, c, fill, stroke }, tableRemember: true } : { tableDef: null, tableRemember: false }); S.addTable(r, c, fill, stroke); };
  return (
    <div className="modal" onClick={close}>
      <div className="dialog" onClick={stop}>
        <div className="phead"><b>{t("Table")}</b><button className="iconbtn" onClick={close}><Icon name="close" size={14} /></button></div>
        <div className="swrow"><span>{t("Rows")}</span><input type="number" min={1} max={20} value={r} onChange={(e) => setR(num(e.target.value))} /></div>
        <div className="swrow"><span>{t("Columns")}</span><input type="number" min={1} max={20} value={c} onChange={(e) => setC(num(e.target.value))} /></div>
        <div className="swrow"><span>{t("Fill color")}</span><input type="color" value={fill} onChange={(e) => setFill(e.target.value)} /></div>
        <div className="swrow"><span>{t("Line color")}</span><input type="color" value={stroke} onChange={(e) => setStroke(e.target.value)} /></div>
        <label className="chk"><input type="checkbox" checked={rem} onChange={(e) => toggleRem(e.target.checked)} />{t("Remember my choice")}</label>
        <div className="dfoot"><button className="dbtn pri" onClick={create}>{t("Create table")}</button><button className="dbtn" onClick={close}>{t("Cancel")}</button></div>
      </div>
    </div>
  );
}
export const CHART_TYPES: [string, string, string][] = [["column", "charcol", "Column"], ["bar", "charbar", "Bar"], ["line", "charline", "Line"], ["pie", "charpie", "Pie"], ["donut", "chardonut", "Donut"], ["area", "chararea", "Area"]];
export function ChartDialog() {
  const S = useDocs(), [ty, setTy] = useState("column"); if (!S.chartDlg) return null; const close = () => S.toggle("chartDlg", false);
  return (
    <div className="modal" onClick={close}>
      <div className="dialog" onClick={stop}>
        <div className="phead"><b>{t("Chart")}</b><button className="iconbtn" onClick={close}><Icon name="close" size={14} /></button></div>
        <div className="chartgrid">{CHART_TYPES.map(([k, ic, n]) => <button key={k} className={"cgb" + (ty === k ? " on" : "")} onClick={() => setTy(k)}><Icon name={ic} size={34} /><span>{t(n)}</span></button>)}</div>
        <div className="dfoot"><button className="dbtn pri" onClick={() => S.addChart(ty)}>{t("Create chart")}</button><button className="dbtn" onClick={close}>{t("Cancel")}</button></div>
      </div>
    </div>
  );
}
export function ChartEditor() {
  const S = useDocs(), T = curTab(S), it = S.chartEdit ? T.doc.items[S.chartEdit] : null; if (!it?.chart) return null;
  const ch = it.chart, set = (c: typeof ch) => S.patch([it.id], { chart: c }), close = () => useDocs.setState({ chartEdit: null });
  const num = (v: string) => (isNaN(+v) ? 0 : +v);
  return (
    <div className="modal" onClick={close}>
      <div className="dialog wide cedit" onClick={stop}>
        <div className="phead"><b>{t("Chart")}</b><button className="iconbtn" onClick={close}><Icon name="close" size={14} /></button></div>
        <div className="chartgrid sm">{CHART_TYPES.map(([k, ic, n]) => <button key={k} title={t(n)} className={"cgb" + (ch.type === k ? " on" : "")} onClick={() => set({ ...ch, type: k })}><Icon name={ic} size={22} /></button>)}</div>
        <input value={it.text} placeholder={t("Chart")} onChange={(e) => S.patch([it.id], { text: e.target.value })} />
        <div className="ctable"><table><thead><tr><th />{ch.series.map((s, j) => <th key={j}><input value={s.name} style={{ borderBottom: `3px solid ${CHART_COLORS[j % 6]}` }} onChange={(e) => set({ ...ch, series: ch.series.map((x, k) => (k === j ? { ...x, name: e.target.value } : x)) })} /></th>)}</tr></thead>
          <tbody>{ch.cats.map((c, i) => <tr key={i}><td><input value={c} onChange={(e) => set({ ...ch, cats: ch.cats.map((x, k) => (k === i ? e.target.value : x)) })} /></td>
            {ch.series.map((s, j) => <td key={j}><input type="number" value={s.vals[i] ?? 0} onChange={(e) => set({ ...ch, series: ch.series.map((x, k) => (k === j ? { ...x, vals: ch.cats.map((_, m) => (m === i ? num(e.target.value) : x.vals[m] ?? 0)) } : x)) })} /></td>)}</tr>)}</tbody></table></div>
        <div className="dfoot wrap">
          <button className="dbtn" onClick={() => set({ ...ch, cats: [...ch.cats, "New"], series: ch.series.map((s) => ({ ...s, vals: [...s.vals, 0] })) })}>{t("Add row")}</button>
          <button className="dbtn" disabled={ch.cats.length < 2} onClick={() => set({ ...ch, cats: ch.cats.slice(0, -1), series: ch.series.map((s) => ({ ...s, vals: s.vals.slice(0, -1) })) })}>{t("Remove row")}</button>
          <button className="dbtn" disabled={ch.series.length > 5} onClick={() => set({ ...ch, series: [...ch.series, { name: `${t("Series")} ${ch.series.length + 1}`, vals: ch.cats.map(() => 0) }] })}>{t("Add series")}</button>
          <button className="dbtn" disabled={ch.series.length < 2} onClick={() => set({ ...ch, series: ch.series.slice(0, -1) })}>{t("Remove series")}</button>
          <button className="dbtn pri" onClick={close}>{t("Close")}</button></div>
      </div>
    </div>
  );
}
export function CloseAsk() {
  const S = useDocs(), ask = S.closeAsk; if (!ask) return null; const tb = S.tabs.find((x) => x.id === ask.tabId);
  return (
    <div className="modal" onClick={() => closeChoice("cancel")}>
      <div className="dialog" onClick={stop}>
        <p style={{ margin: 0 }}>{t("Save changes to")} “{tb?.name}”?</p>
        <div className="dfoot wrap"><button className="dbtn pri" onClick={() => closeChoice("save")}>{t("Save")}</button><button className="dbtn" onClick={() => closeChoice("saveas")}>{t("Save As")}</button><button className="dbtn" onClick={() => closeChoice("discard")}>{t("Don't save")}</button><button className="dbtn" onClick={() => closeChoice("cancel")}>{t("Cancel")}</button></div>
      </div>
    </div>
  );
}
export function LinkWarn() {
  const S = useDocs(), url = S.linkAsk; if (!url) return null; const close = () => useDocs.setState({ linkAsk: null });
  return (
    <div className="modal" onClick={close}>
      <div className="dialog" onClick={stop}>
        <p style={{ margin: 0 }}>{t("link.warn")}</p>
        <code className="lurl">{url}</code>
        <p style={{ margin: 0, opacity: 0.8 }}>{t("link.hint")}</p>
        <div className="dfoot"><button className="dbtn pri" onClick={() => { close(); openLink(url); }}>{t("Open link")}</button><button className="dbtn" onClick={close}>{t("Cancel")}</button></div>
      </div>
    </div>
  );
}
