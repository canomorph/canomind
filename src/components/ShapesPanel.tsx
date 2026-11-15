import { useState } from "react";
import { t } from "../i18n";
import { MORE, STENCILS } from "../shapes";
import { useDocs } from "../store";
import { Icon } from "./Icon";
import { Thumb } from "./Thumb";

export function ShapesPanel() {
  const S = useDocs(), [list, setList] = useState(["Quick Shapes", "Basic Shapes"]), [act, setAct] = useState("Basic Shapes"), [q, setQ] = useState(""), [more, setMore] = useState(false);
  if (S.pane !== "shapes") return null;
  const seen = new Set<string>(), ql = q.toLowerCase(), found = q ? Object.values(STENCILS).flat().filter((s) => (s.n.toLowerCase().includes(ql) || t(s.n).toLowerCase().includes(ql)) && !seen.has(s.k + s.n) && (seen.add(s.k + s.n), true)) : STENCILS[act];
  return (
    <aside className="shapes">
      <div className="shhead"><h2>{t("Shapes")}</h2><button className="iconbtn" title={t("Close")} onClick={() => S.setPane("none")}><Icon name="close" size={14} /></button></div>
      <div className="shsearch"><input placeholder={t("Search shapes")} value={q} onChange={(e) => setQ(e.target.value)} /><Icon name="search" size={14} /></div>
      <div className="stencils">
        <button className="st" onClick={() => setMore(!more)}>{t("More Shapes")} ›</button>
        {more && <div className="flyout">{MORE.filter((m) => !list.includes(m)).map((m) => <button key={m} className="st" onClick={() => { setList([...list, m]); setAct(m); setQ(""); setMore(false); }}>{t(m)}</button>)}{MORE.every((m) => list.includes(m)) && <i>—</i>}</div>}
        {list.map((n) => <button key={n} className={"st" + (act === n && !q ? " on" : "")} onClick={() => { setAct(n); setQ(""); }}>{t(n)}</button>)}
      </div>
      <div className="shgrid">
        {found.map((s) => (
          <button key={s.k + s.n} className="shi" title={t(s.n)} draggable onDragStart={(e) => { e.dataTransfer.setData("text/kind", s.k); e.dataTransfer.effectAllowed = "copy"; }} onClick={() => S.addAtCenter(s.k)}>
            <Thumb k={s.k} /><span>{t(s.n)}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
