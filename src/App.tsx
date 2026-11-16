import { getCurrentWindow } from "@tauri-apps/api/window";
import { LogicalSize } from "@tauri-apps/api/dpi";
import { useEffect } from "react";
import { t, setLang } from "./i18n";
import { addImage, attachImageFile, bgImageFile, bootOpen, handleFiles, importFile, openAny, saveTab, tryQuit } from "./io";
import { curTab, needsSave, useDocs, useSettings } from "./store";
import { TitleBar } from "./components/TitleBar";
import { Ribbon } from "./components/Ribbon";
import { Canvas } from "./components/Canvas";
import { Bar, PageBar, Ruler } from "./components/Chrome";
import { ShapesPanel } from "./components/ShapesPanel";
import { NavPane } from "./components/NavPane";
import { StartScreen } from "./components/StartScreen";
import { ContextMenu } from "./components/ContextMenu";
import { Presenter } from "./components/Presenter";
import { AboutModal, ChartDialog, ChartEditor, CloseAsk, CommentList, Drawer, KeysModal, LinkWarn, SaveAsDialog, Settings, SizeDialog, TableDialog, TemplateGallery } from "./components/Panels";
import { StatusBar } from "./components/StatusBar";

function calcMin(scale: number) {
  const tabs = document.querySelector(".ribbon-tabs"), tb = document.querySelector(".titlebar"), rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  let a = 0, b = 90; if (tabs) Array.from(tabs.children).forEach((c) => { if (!c.classList.contains("grow")) a += (c as HTMLElement).offsetWidth; });
  if (tb) Array.from(tb.children).forEach((c) => { const e = c as HTMLElement; if (!e.classList.contains("tabs")) b += (e.classList.contains("search") ? rem * 9 : e.offsetWidth) + 8; });
  try { getCurrentWindow().setMinSize(new LogicalSize(Math.ceil(Math.max(a + 24, b, 520)), Math.round((540 * scale) / 100))); } catch {}
}
const pick = (id: string, fn: (f: File) => void) => (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) fn(f); e.target.value = ""; };
export default function App() {
  const { theme, scale, ruler, lang } = useSettings(), S = useDocs();
  setLang(lang);
  useEffect(() => { bootOpen(); }, []);
  useEffect(() => {
    const mq = matchMedia("(prefers-color-scheme: dark)"), apply = () => (document.documentElement.dataset.theme = theme === "system" ? (mq.matches ? "dark" : "light") : theme);
    apply(); mq.addEventListener("change", apply); return () => mq.removeEventListener("change", apply);
  }, [theme]);
  useEffect(() => { document.documentElement.style.fontSize = `${scale}%`; }, [scale]);
  useEffect(() => { const id = setTimeout(() => calcMin(scale), 300); return () => clearTimeout(id); }, [scale, lang, S.fresh, S.booting]);
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  useEffect(() => { const f = () => { if (!document.fullscreenElement) { const s = useDocs.getState(); s.setPresent(false); s.setFocus(false); } }; document.addEventListener("fullscreenchange", f); return () => document.removeEventListener("fullscreenchange", f); }, []);
  useEffect(() => { // no browser/OS "Back, Reload, Save as…" menu anywhere except in text fields
    const f = (e: MouseEvent) => { if (!["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) e.preventDefault(); };
    addEventListener("contextmenu", f); return () => removeEventListener("contextmenu", f);
  }, []);
  useEffect(() => {
    let un: (() => void) | undefined;
    try { getCurrentWindow().onCloseRequested((e) => { const s = useDocs.getState(); if (!s.fresh && s.tabs.some(needsSave)) { e.preventDefault(); tryQuit(); } }).then((u) => { un = u; }).catch(() => {}); } catch {}
    return () => un?.();
  }, []);
  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      const s = useDocs.getState(), c = e.ctrlKey || e.metaKey, k = e.key.toLowerCase(), sel = s.sel, step = e.shiftKey ? 10 : 1;
      if (k === "escape") { s.setCtx(null); s.toggle("aboutOpen", false); s.toggle("keysOpen", false); if (s.bgEdit) useDocs.setState({ bgEdit: false, bgSel: null }); if (s.bgDelMode) useDocs.setState({ bgDelMode: false, bgMarks: [] }); }
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement).tagName)) return;
      if (c && k === "o") { e.preventDefault(); openAny(); return; }
      if (c && k === "n") { e.preventDefault(); s.newTab(); return; }
      if (c && k === "s" && !s.fresh) { e.preventDefault(); saveTab(e.shiftKey); return; }
      if (s.start) return;
      if (c && k === "z") { e.preventDefault(); e.shiftKey ? s.redo() : s.undo(); }
      else if (c && k === "y") { e.preventDefault(); s.redo(); }
      else if (c && k === "c") s.copy(); else if (c && k === "x") s.cut(); else if (c && k === "v") s.paste();
      else if (c && k === "d") { e.preventDefault(); s.duplicate(); }
      else if (c && k === "a") { e.preventDefault(); s.selectAll(); }
      else if (e.shiftKey && !c && k === "a") { e.preventDefault(); s.selectConns(); }
      else if (k === "delete" || k === "backspace") s.remove(sel);
      else if (k === "tab") { e.preventDefault(); if (sel[0] && curTab(s).doc.items[sel[0]]) s.addChild(sel[0]); }
      else if (k === "enter") { e.preventDefault(); if (sel[0] && curTab(s).doc.items[sel[0]]) s.addSibling(sel[0]); }
      else if (k === "f5") { e.preventDefault(); s.setPresent(true); }
      else if (k === "f2") { if (sel[0]) s.setEditing(sel[0]); }
      else if (k === "escape") { s.setTool("select"); s.setPainter(null); s.setSel([]); if (s.present) s.setPresent(false); if (s.focus) s.setFocus(false); }
      else if (k === "arrowleft") { e.preventDefault(); s.nudge(-step, 0); } else if (k === "arrowright") { e.preventDefault(); s.nudge(step, 0); }
      else if (k === "arrowup") { e.preventDefault(); s.nudge(0, -step); } else if (k === "arrowdown") { e.preventDefault(); s.nudge(0, step); }
    };
    addEventListener("keydown", f); return () => removeEventListener("keydown", f);
  }, []);
  return (
    <div key={lang} className={"app" + (S.focus ? " focus" : "")} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { if (e.dataTransfer.files.length) { e.preventDefault(); handleFiles(e.dataTransfer.files); } }}>
      <input id="canomind-open" type="file" hidden accept=".canomind,.json,.xmind,.mm" onChange={pick("o", importFile)} />
      <input id="canomind-img" type="file" hidden accept="image/*" onChange={pick("i", addImage)} />
      <input id="canomind-bg" type="file" hidden accept="image/png,image/jpeg" onChange={pick("b", bgImageFile)} />
      <input id="canomind-img-attach" type="file" hidden accept="image/*" onChange={pick("a", (f) => { const id = useDocs.getState().imgTarget; if (id) attachImageFile(f, id); })} />
      <TitleBar />
      <Ribbon />
      {S.booting ? null : S.start ? <StartScreen /> : <>
        <div className="body">
          <ShapesPanel />
          <NavPane />
          <div className="center">
            {ruler && <div className="rrow"><div className="corner" /><Ruler o="h" /></div>}
            <div className="mrow">{ruler && <Ruler o="v" />}<Canvas /><div className="vbar"><Bar o="v" /></div></div>
            <PageBar />
            {S.focus && <button className="exitpres" onClick={() => S.setFocus(false)}>Esc ✕</button>}
          </div>
          <Drawer side="right" title={t("comments.title")} open={S.commentsOpen} onClose={() => S.toggle("commentsOpen", false)}><CommentList /></Drawer>
        </div>
        <StatusBar />
      </>}
      <Settings />
      <TemplateGallery />
      <AboutModal />
      <KeysModal />
      <ContextMenu />
      <SaveAsDialog />
      <TableDialog />
      <SizeDialog />
      <ChartDialog />
      <ChartEditor />
      <CloseAsk />
      <LinkWarn />
      <Presenter />
    </div>
  );
}
