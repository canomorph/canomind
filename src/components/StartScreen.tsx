import { useMemo } from "react";
import { t } from "../i18n";
import { EXPORT_ORDER, importDialog, openAny, openSaveAs, printSheet, saveTab, svgString } from "../io";
import { emptyDoc } from "../model";
import { curTab, useDocs } from "../store";
import { TEMPLATES } from "../templates";
import { Icon } from "./Icon";

export function StartScreen() {
  const S = useDocs(), prev = useMemo(() => TEMPLATES.filter((x) => x.id !== "blank").map((x) => { const doc = x.build(); return { x, doc, svg: svgString(doc, "#ffffff") }; }), []);
  return (
    <div className="start">
      <div className="sh"><img className="appicon" style={{ width: "2.4rem", height: "2.4rem" }} src="/icon.png" alt="" draggable={false} /><h1>CanoMind</h1></div>
      <div className="bigbtns">
        <button className="bigbtn" onClick={() => S.newTab(undefined, emptyDoc())}><Icon name="new" size={40} /><span>{t("New")}</span></button>
        <button className="bigbtn" onClick={openAny}><Icon name="open" size={40} /><span>{t("Open")}</span></button>
        {!S.fresh && <>
          <button className="bigbtn" onClick={() => saveTab()}><Icon name="save" size={40} /><span>{t("Save")}</span></button>
          <button className="bigbtn" onClick={() => saveTab(true)}><Icon name="saveas" size={40} /><span>{t("Save As")}</span></button>
        </>}
        <button className="bigbtn" onClick={() => importDialog(() => document.getElementById("canomind-open")?.click())}><Icon name="import" size={40} /><span>{t("Import")}</span></button>
        {!S.fresh && <button className="bigbtn" onClick={() => printSheet(curTab(S))}><Icon name="print" size={40} /><span>{t("Print")}</span></button>}
      </div>
      {!S.fresh && <><h3>{t("Export")}</h3><div className="bigbtns small">{EXPORT_ORDER.map(([f, l]) => <button key={f} className="bigbtn" onClick={() => openSaveAs(f)}><Icon name="export" size={24} /><span>{l}</span></button>)}</div></>}
      <h3>{t("Templates")}</h3>
      <div className="tpl">{prev.map(({ x, doc, svg }) => (
        <button key={x.id} className="tcard2" onClick={() => S.newTab(t(x.name), doc)}><div className="tprev" dangerouslySetInnerHTML={{ __html: svg }} /><span>{t(x.name)}</span></button>
      ))}</div>
    </div>
  );
}
