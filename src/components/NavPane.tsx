import { useEffect, useState } from "react";
import { t } from "../i18n";
import { buildTree, itemLabel } from "../model";
import { curTab, useDocs } from "../store";
import { Icon } from "./Icon";

export function NavPane() {
  const S = useDocs(), d = curTab(S).doc, q = S.query.trim().toLowerCase(), [idx, setIdx] = useState(0);
  const label = (i: string) => itemLabel(d.items[i]);
  const match = (i: string) => !!q && label(i).toLowerCase().includes(q);
  const matches = d.order.filter((i) => d.items[i] && d.items[i].kind !== "image" && match(i));
  useEffect(() => { setIdx(0); if (q && matches[0]) S.goTo(matches[0]); }, [q]);
  if (S.pane !== "nav") return null;

  const { kids, parent } = buildTree(d), hasP = new Set(Object.keys(parent)), show = new Set<string>();
  matches.forEach((m) => { let x: string | undefined = m, g = 0; while (x && !show.has(x) && g++ < 200) { show.add(x); x = parent[x]; } });
  const pos = (i: string) => d.items[i].y * 1e4 + d.items[i].x;
  const hl = (s: string) => { if (!q) return s; const k = s.toLowerCase().indexOf(q); return k < 0 ? s : <>{s.slice(0, k)}<mark>{s.slice(k, k + q.length)}</mark>{s.slice(k + q.length)}</>; };
  const seen = new Set<string>(), rows: JSX.Element[] = [];
  const walk = (id: string, depth: number) => {
    if (seen.has(id) || !d.items[id]) return; seen.add(id);
    const lb = label(id);
    if (d.items[id].kind !== "image" && (lb || kids[id]) && (!q || show.has(id)))
      rows.push(<button key={id} className={"nrow" + (S.sel.includes(id) ? " on" : "")} style={{ paddingLeft: 8 + depth * 16 }} onClick={() => S.goTo(id)}><span className="bul">•</span><span>{hl(lb || "…")}</span></button>);
    (kids[id] || []).slice().sort((a, b) => pos(a) - pos(b)).forEach((k) => walk(k, depth + 1));
  };
  d.order.filter((i) => d.items[i] && !hasP.has(i)).sort((a, b) => pos(a) - pos(b)).forEach((r) => walk(r, 0));
  d.order.forEach((i) => walk(i, 0));
  const next = () => { if (!matches.length) return; const n = (idx + 1) % matches.length; setIdx(n); S.goTo(matches[n]); };
  return (
    <aside className="shapes navpane">
      <div className="shhead"><h2>{t("Navigation")}</h2><button className="iconbtn" title={t("Close")} onClick={() => S.setPane("none")}><Icon name="close" size={14} /></button></div>
      <div className="shsearch"><input autoFocus placeholder={t("Search document")} value={S.query} onChange={(e) => S.setQuery(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") next(); }} /><Icon name="search" size={14} /></div>
      {q && <p className="nres">{matches.length ? `${Math.min(idx + 1, matches.length)} / ${matches.length}` : t("No results")}</p>}
      <div className="nlist">{rows}</div>
    </aside>
  );
}
