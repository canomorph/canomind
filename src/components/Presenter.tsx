import { useEffect, useMemo, useState } from "react";
import { buildTree, readable } from "../model";
import { curTab, useDocs, useIsDark } from "../store";
import { Icon } from "./Icon";

interface Slide { id: string; own: boolean; imgs: { id: string; src: string }[]; notes: { id: string; text: string; ff?: string; fill: string }[] }
export function Presenter() {
  const S = useDocs(), dark = useIsDark(), d = curTab(S).doc, [i, setI] = useState(0);
  const slides = useMemo<Slide[]>(() => {
    if (!S.present) return [];
    const { kids, parent } = buildTree(d), pos = (x: string) => d.items[x].y * 1e4 + d.items[x].x, seen = new Set<string>(), out: Slide[] = [];
    const attach = (k: string) => d.items[k].kind === "image" || d.items[k].kind === "note";
    const walk = (id: string) => {
      if (seen.has(id) || !d.items[id]) return; seen.add(id);
      const it = d.items[id], ch = (kids[id] || []).slice().sort((a, b) => pos(a) - pos(b));
      const imgs = ch.filter((k) => d.items[k].kind === "image").map((k) => ({ id: k, src: d.items[k].src ?? "" })), notes = ch.filter((k) => d.items[k].kind === "note").map((k) => ({ id: k, text: d.items[k].text, ff: d.items[k].ff, fill: d.items[k].fill }));
      if (it.img) imgs.unshift({ id: id + "i", src: it.img }); if (it.note) notes.unshift({ id: id + "n", text: it.note, ff: it.ff, fill: "#fff3a3" });
      if (it.kind === "image") out.push({ id, own: true, imgs: [{ id, src: it.src ?? "" }], notes: [] });
      else if (it.kind === "note") out.push({ id, own: true, imgs: [], notes: [{ id, text: it.text, ff: it.ff, fill: it.fill }] });
      else if (it.text.trim() || imgs.length || notes.length) out.push({ id, own: false, imgs, notes });
      ch.filter((k) => !attach(k)).forEach(walk);
    };
    d.order.filter((x) => d.items[x] && !parent[x]).sort((a, b) => pos(a) - pos(b)).forEach(walk);
    d.order.forEach(walk);
    return out;
  }, [S.present, d]);
  useEffect(() => { if (S.present) { const k = slides.findIndex((x) => x.id === S.sel[0]); setI(k >= 0 ? k : 0); } }, [S.present]);
  const n = slides.length, next = () => setI((x) => Math.min(n - 1, x + 1)), prev = () => setI((x) => Math.max(0, x - 1));
  useEffect(() => {
    if (!S.present) return;
    const f = (e: KeyboardEvent) => {
      if (["ArrowRight", "ArrowDown", "PageDown", " ", "Enter"].includes(e.key)) { e.preventDefault(); next(); }
      else if (["ArrowLeft", "ArrowUp", "PageUp", "Backspace"].includes(e.key)) { e.preventDefault(); prev(); }
      else if (e.key === "Home") setI(0); else if (e.key === "End") setI(n - 1);
    };
    addEventListener("keydown", f); return () => removeEventListener("keydown", f);
  }, [S.present, n]);
  if (!S.present) return null;
  const sl = slides[Math.min(i, n - 1)], it = sl ? d.items[sl.id] : null, ff = (f?: string) => `${f ?? "Calibri"}, "Segoe UI", system-ui, sans-serif`;
  return (
    <div className="pres" onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); if (e.clientX > r.left + r.width / 3) next(); else prev(); }}>
      <button className="presx" onClick={(e) => { e.stopPropagation(); S.setPresent(false); }}><Icon name="close" size={22} /></button>
      {sl && it && (
        <div className="slide">
          {sl.imgs.map((im) => <img key={im.id} src={im.src} alt="" />)}
          {!sl.own && <div className="stext" style={{ fontFamily: ff(it.ff), fontWeight: it.bold ? 700 : 400, fontStyle: it.italic ? "italic" : "normal", textDecoration: [it.ul ? "underline" : "", it.st ? "line-through" : ""].join(" ").trim() || undefined, fontSize: `${Math.max(1.6, (it.fs / 16) * 3.2)}rem`, color: readable(it.color, dark) }}>{it.text}</div>}
          {sl.notes.map((nt) => <div key={nt.id} className="snote" style={{ fontFamily: ff(nt.ff), background: nt.fill === "none" ? "transparent" : nt.fill, color: "#1a1a1a" }}>{nt.text}</div>)}
        </div>
      )}
      <div className="pcount">{n ? Math.min(i, n - 1) + 1 : 0} / {n}</div>
    </div>
  );
}
