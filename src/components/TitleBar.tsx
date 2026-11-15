import { getCurrentWindow } from "@tauri-apps/api/window";
import { useEffect, useState } from "react";
import { t } from "../i18n";
import { EXPORT_ORDER, openSaveAs, printSheet, saveTab } from "../io";
import { curTab, needsSave, useDocs } from "../store";
import { Icon } from "./Icon";
import { Drop, MI } from "./Menu";

const win = () => { try { return getCurrentWindow(); } catch { return null; } };
export function TitleBar() {
  const S = useDocs(), [max, setMax] = useState(false), [drag, setDrag] = useState<number | null>(null), home = S.fresh;
  useEffect(() => { const w = win(); if (!w) return; const f = () => w.isMaximized().then(setMax).catch(() => {}); f(); const un = w.onResized(f); return () => { un.then((u) => u()).catch(() => {}); }; }, []);
  return (
    <header className="titlebar" data-tauri-drag-region>
      <img className="appicon" src="/icon.png" alt="" draggable={false} data-tauri-drag-region />
      <strong className="brand" data-tauri-drag-region>{t("app.name")}</strong>
      {!home && <div className="qat">
        <button className="iconbtn" title={t("Save") + " (Ctrl+S)"} onClick={() => saveTab()}><Icon name="save" size={16} /></button>
        <button className="iconbtn" title={t("Save As") + " (Ctrl+Shift+S)"} onClick={() => saveTab(true)}><Icon name="saveas" size={16} /></button>
        <button className="iconbtn" title={t("Undo") + " (Ctrl+Z)"} onClick={S.undo}><Icon name="undo" size={16} /></button>
        <button className="iconbtn" title={t("Redo") + " (Ctrl+Y)"} onClick={S.redo}><Icon name="redo" size={16} /></button>
        <Drop mode="icon" i="export" l="Export">{(c) => <>{EXPORT_ORDER.map(([id, l]) => <MI key={id} l={l} on={() => openSaveAs(id)} close={c} />)}</>}</Drop>
        <button className="iconbtn" title={t("Print")} onClick={() => printSheet(curTab(S))}><Icon name="print" size={16} /></button>
      </div>}
      <div className="tabs" data-tauri-drag-region>
        {!home && S.tabs.map((tb, i) => (
          <div key={tb.id} className={"tab" + (tb.id === S.active && !S.start ? " active" : "")} draggable onClick={() => S.setActive(tb.id)}
            onDragStart={(e) => { setDrag(i); e.dataTransfer.setData("text/tab", String(i)); e.dataTransfer.effectAllowed = "move"; }} onDragOver={(e) => { if (drag !== null) e.preventDefault(); }}
            onDrop={(e) => { e.preventDefault(); if (drag !== null && drag !== i) S.moveTab(drag, i); setDrag(null); }} onDragEnd={() => setDrag(null)}>
            <span>{tb.name}{tb.dirty ? " •" : ""}</span><button className="iconbtn x" onClick={(e) => { e.stopPropagation(); if (needsSave(tb)) useDocs.setState({ closeAsk: { tabId: tb.id, mode: "tab" } }); else S.closeTab(tb.id); }}><Icon name="close" size={10} /></button>
          </div>
        ))}
        {!home && <button className="iconbtn" title={t("New")} onClick={() => S.newTab()}><Icon name="plus" size={14} /></button>}
      </div>
      {!home && <label className="search">
        <Icon name="search" size={14} />
        <input placeholder={t("search.placeholder")} value={S.query} onChange={(e) => { S.setQuery(e.target.value); S.setPane("nav"); }} onFocus={() => S.setPane("nav")} />
      </label>}
      <button className="iconbtn" onClick={() => S.toggle("settingsOpen", true)} title={t("settings.title")}><Icon name="settings" /></button>
      <div className="wc">
        <button title={t("Minimize")} onClick={() => win()?.minimize()}><Icon name="wmin" size={14} /></button>
        <button title={t("Maximize")} onClick={() => win()?.toggleMaximize()}><Icon name={max ? "wres" : "wmax"} size={14} /></button>
        <button className="close" title={t("Close")} onClick={() => win()?.close()}><Icon name="wclose" size={14} /></button>
      </div>
    </header>
  );
}
