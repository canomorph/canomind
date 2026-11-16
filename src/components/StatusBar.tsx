import { useEffect, useState } from "react";
import { t } from "../i18n";
import { LANGS, langName } from "../langs";
import { availableLangs } from "../spell";
import { curTab, useDocs, useSettings } from "../store";
import { Icon } from "./Icon";
import { Drop, FloatMenu, MI } from "./Menu";

export function StatusBar() {
  const S = useDocs(), st = useSettings(), T = curTab(S), pct = Math.round(T.view.k * 100), [m, setM] = useState<{ x: number; y: number } | null>(null), [avail, setAvail] = useState<string[]>([]);
  const refresh = () => availableLangs(LANGS.map((l) => l[0])).then(setAvail);
  useEffect(() => { refresh(); }, []);
  const langs = Array.from(new Set([...avail, st.spellLang]));
  const items = (c: () => void) => <>
    <MI i="spell" l={S.spell ? "Turn off spell check" : "Turn on spell check"} on={() => S.toggle("spell")} close={c} />
    <div className="msep" />
    {langs.map((code) => <MI key={code} l={langName(code)} act={st.spellLang === code} on={() => st.set({ spellLang: code })} close={c} />)}
  </>;
  return (
    <footer className="statusbar">
      <span>{t("status.page")} {T.page + 1} {t("of")} {T.pages.length}</span>
      <button className={"sbtn" + (S.spell ? " on" : "")} title={t("Spell check")} onClick={() => S.toggle("spell")} onContextMenu={(e) => { e.preventDefault(); setM({ x: e.clientX, y: e.clientY }); }}>{langName(st.spellLang)}</button>
      <Drop mode="icon" i="language" l="Spelling language" up>{items}</Drop>
      {m && <FloatMenu x={m.x} y={m.y} onClose={() => setM(null)}>{items(() => setM(null))}</FloatMenu>}
      <span className="grow" />
      <button className="iconbtn" title="100%" onClick={() => S.zoom100()}><Icon name="zoom100" size={15} /></button>
      <button className="iconbtn" title={t("status.fit")} onClick={() => S.fit()}><Icon name="fit" size={15} /></button>
      <button className="iconbtn" title={t("Full screen")} onClick={() => S.setFocus(true)}><Icon name="fullscreen" size={15} /></button>
      <button className="iconbtn" title={t("status.present")} onClick={() => S.setPresent(true)}><Icon name="present" size={15} /></button>
      <button className="iconbtn" title={t("Zoom out")} onClick={() => S.zoom(1 / 1.2)}>−</button>
      <input type="range" className="zoom" min={10} max={400} value={pct} onChange={(e) => S.zoom(+e.target.value / 100 / T.view.k)} />
      <button className="iconbtn" title={t("Zoom in")} onClick={() => S.zoom(1.2)}>+</button>
      <span className="pct">{pct}%</span>
    </footer>
  );
}
