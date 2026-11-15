import { create } from "zustand";
import { persist } from "zustand/middleware";
import { t as tr } from "./i18n";
import { DEFAULT_QS, DEFAULT_SCHEMES, GREEN_QS, SwStyle } from "./swatches";
import { BgImg, Conn, Doc, Item, Kind, autoLayout, defSize, emptyDoc, growToFit, mkItem, pageOf, uid, wrap } from "./model";

export type Theme = "light" | "sepia" | "dark" | "black" | "system";
interface Settings { theme: Theme; scale: number; lang: "en" | "tr"; spellLang: string; grid: boolean; snap: boolean; ruler: boolean; quickStyles: SwStyle[]; schemes: SwStyle[]; rulerMarks: string[]; tableDef: { r: number; c: number; fill: string; stroke: string } | null; tableRemember: boolean; set: (p: Partial<Omit<Settings, "set">>) => void }
export const useSettings = create<Settings>()(persist((set) => ({ theme: "system", scale: 100, lang: "en", spellLang: "en-US", grid: true, snap: true, ruler: false, quickStyles: DEFAULT_QS, schemes: DEFAULT_SCHEMES, rulerMarks: ["A4"], tableDef: null, tableRemember: false, set: (p) => set(p) }), { name: "canomind-settings-v2", version: 4, migrate: (p: any, v: number) => { const o = { ...p }; if (v < 3) { o.grid = true; o.ruler = false; } if (v < 4 && Array.isArray(o.quickStyles)) o.quickStyles = o.quickStyles.map((q: any) => GREEN_QS[q.id] ?? q); return o; } }));

export type Pane = "none" | "shapes" | "nav";
export type Tool = "select" | "connect" | { place: Kind };
export interface Comment { id: string; text: string; at: number; itemId?: string }
export interface View { x: number; y: number; k: number }
export interface PageData { id: string; name: string; doc: Doc; past: Doc[]; future: Doc[]; view: View; color?: string }
export type EditSub = { k: "note" } | { k: "cell"; r: number; c: number } | null;
export interface Tab { id: string; name: string; doc: Doc; past: Doc[]; future: Doc[]; comments: Comment[]; view: View; pages: PageData[]; page: number; path?: string; grid: boolean; gridType: string; dirty: boolean }
type Flag = "tableDlg" | "chartDlg" | "aboutOpen" | "keysOpen" | "commentsOpen" | "settingsOpen" | "templatesOpen" | "spell";

interface S {
  tabs: Tab[]; active: string; sel: string[]; tool: Tool; editing: string | null; clip: Doc | null; connStyle: Conn["style"];
  start: boolean; booting: boolean; ctx: { x: number; y: number; id: string | null } | null; commentTarget: string | null; aboutOpen: boolean; keysOpen: boolean;
  setCtx: (c: { x: number; y: number; id: string | null } | null) => void; setCommentTarget: (id: string | null) => void; setFile: (path: string, name: string) => void; addAtCenter: (k: Kind) => void;
  focus: boolean; saveDlg: { fmt: string } | null; fresh: boolean; closeAsk: { tabId: string; mode: "tab" | "quit" } | null; linkAsk: string | null; tableDlg: boolean; chartDlg: boolean; chartEdit: string | null; bgEdit: boolean; bgSel: string | null; editSub: EditSub; imgTarget: string | null; bgDelMode: boolean; bgMarks: string[];
  setGridType: (g: string) => void; setPageSize: (w: number, h: number) => void; setOrientation: (landscape: boolean) => void; expandPage: (dir: "r" | "b") => void; ganttAdd: () => void; ganttDel: () => void;
  setStart: (v: boolean) => void; moveTab: (a: number, b: number) => void; setPageColor: (i: number, c?: string) => void; addMain: (near: string) => void; attachImage: (id: string, src: string, aspect: number) => void; addNote: (id: string) => void; setNote: (id: string, text: string) => void;
  addTable: (r: number, c: number, fill?: string, stroke?: string) => void; addChart: (type: string) => void; setCell: (id: string, r: number, c: number, text: string) => void; bgColor: (c?: string) => void; bgAdd: (src: string, w: number, h: number) => void; bgPatch: (id: string, p: Partial<BgImg>, rec?: boolean) => void; bgDel: () => void; fonts: string[]; setFocus: (v: boolean) => void; setFonts: (f: string[]) => void; setGrid: (v: boolean) => void;
  pane: Pane; commentsOpen: boolean; settingsOpen: boolean; templatesOpen: boolean; spell: boolean; present: boolean; query: string; size: { w: number; h: number }; painter: Partial<Item> | null;
  setSize: (s: { w: number; h: number }) => void; setPane: (p: Pane) => void; goTo: (id: string) => void; setPainter: (p: Partial<Item> | null) => void;
  setPage: (i: number) => void; addPage: () => void; renamePage: (i: number, n: string) => void; deletePage: (i: number) => void; dupPage: (i: number) => void; openPages: (name: string, pages: { name: string; doc: Doc }[], path?: string, grid?: boolean) => void;
  align: (m: "l" | "c" | "r" | "t" | "m" | "b") => void; distribute: (ax: "h" | "v") => void; group: (on: boolean) => void; quickStyle: (fill: string, stroke: string, color: string) => void;
  selectSame: () => void; selectConns: () => void; invert: () => void;
  toggle: (k: Flag, v?: boolean) => void; setQuery: (q: string) => void; setPresent: (v: boolean) => void;
  setTool: (t: Tool) => void; setSel: (s: string[]) => void; setEditing: (id: string | null, sub?: EditSub) => void; setView: (v: View) => void; setConnStyle: (s: Conn["style"]) => void;
  mutate: (fn: (d: Doc) => void, rec?: boolean) => void;
  addItem: (k: Kind, x: number, y: number, w?: number, h?: number, text?: string, extra?: Partial<Item>) => string;
  addChild: (pid: string, dir?: "r" | "l" | "t" | "b", edit?: boolean, styleFrom?: string) => void; addSibling: (id: string, edit?: boolean) => void; connect: (a: string, b: string) => void;
  remove: (ids: string[]) => void; patch: (ids: string[], p: Partial<Item>, rec?: boolean) => void; patchConns: (ids: string[], p: Partial<Conn>) => void;
  z: (front: boolean) => void; undo: () => void; redo: () => void; copy: () => void; cut: () => void; paste: () => void; duplicate: () => void; selectAll: () => void;
  layout: () => void; palette: (fill: string, stroke: string, color?: string) => void;
  newTab: (name?: string, doc?: Doc, path?: string, grid?: boolean) => void; closeTab: (id: string) => void; setActive: (id: string) => void;

  addComment: (text: string, itemId?: string) => void; delComment: (id: string) => void; fit: (margin?: number) => void; zoom100: () => void; ganttRowAdd: () => void; ganttRowDel: () => void; todoAdd: () => void; todoDel: () => void; zoom: (f: number) => void; nudge: (dx: number, dy: number) => void;
}
const mkPage = (name: string, doc: Doc = emptyDoc()): PageData => ({ id: uid(), name, doc, past: [], future: [], view: { x: 60, y: 60, k: 1 } });
const mkTab = (name: string, doc?: Doc, pgs?: { name: string; doc: Doc }[], path?: string, grid = true): Tab => { const pages = pgs && pgs.length ? pgs.map((p) => mkPage(p.name, p.doc)) : [mkPage("Page-1", doc)]; const p = pages[0];
  return { id: uid(), name, doc: p.doc, past: [], future: [], comments: [], view: p.view, pages, page: 0, path, grid, gridType: "dots", dirty: false }; };
const addTab = (s: S, tb: Tab) => (s.fresh ? { tabs: [tb], active: tb.id, start: false, fresh: false, sel: [] as string[], editing: null } : { tabs: [...s.tabs, tb], active: tb.id, start: false, sel: [] as string[], editing: null });
const sync = (t: Tab): PageData[] => t.pages.map((p, i) => (i === t.page ? { ...p, doc: t.doc, past: t.past, future: t.future, view: t.view } : p));
const load = (t: Tab, pages: PageData[], i: number): Tab => ({ ...t, pages, page: i, doc: pages[i].doc, past: pages[i].past, future: pages[i].future, view: pages[i].view });
export const curTab = (s: S) => s.tabs.find((t) => t.id === s.active)!;
const upd = (s: S, f: (t: Tab) => Tab) => ({ tabs: s.tabs.map((t) => (t.id === s.active ? f(t) : t)) });
const r0 = mkItem("ellipse", 300, 200, 170, 64, "Central topic", { fill: "#079a4a", color: "#fff", bold: true });
const first = mkTab("Untitled 1", { items: { [r0.id]: r0 }, conns: {}, order: [r0.id] });
let lk = "", lt = 0, n = 1;

const subPath = (d: Doc, id: string): number[] => { const out: number[] = []; let cur = id, g = 0; const cs = Object.values(d.conns);
  while (g++ < 100) { const c = cs.find((k) => k.to === cur); if (!c) break; out.unshift(cs.filter((k) => k.from === c.from).findIndex((k) => k.id === c.id) + 1); cur = c.from; } return out; };
const styleOf = (p: Item): Partial<Item> => (p.kind === "text" || p.kind === "image" ? {} : { fill: p.fill, stroke: p.stroke, sw: p.sw, color: p.color, ff: p.ff, fs: p.fs, bold: p.bold, italic: p.italic, dash: p.dash, shadow: p.shadow, ul: p.ul, st: p.st });
export const useDocs = create<S>((set, get) => ({
  tabs: [first], active: first.id, sel: [], tool: "select", editing: null, clip: null, connStyle: "curve",
  focus: false, saveDlg: null, fresh: true, closeAsk: null, linkAsk: null, tableDlg: false, chartDlg: false, chartEdit: null, bgEdit: false, bgSel: null, editSub: null, imgTarget: null, bgDelMode: false, bgMarks: [], fonts: [],
  setFocus: (v) => { set({ focus: v }); try { v ? document.documentElement.requestFullscreen?.() : document.fullscreenElement && document.exitFullscreen(); } catch {} if (v) setTimeout(() => get().fit(12), 250); },
  setFonts: (fonts) => set({ fonts }), setGrid: (v) => set((s) => upd(s, (tb) => ({ ...tb, grid: v }))),
  start: true, booting: true, ctx: null, commentTarget: null, aboutOpen: false, keysOpen: false,
  setCtx: (ctx) => set({ ctx }), setCommentTarget: (commentTarget) => set({ commentTarget }), setFile: (path, name) => set((s) => upd(s, (tb) => ({ ...tb, path, name, dirty: false }))),
  addAtCenter: (k) => { const s = get(), v = curTab(s).view, [w, h] = defSize(k), d = curTab(s).doc;
    let x = Math.round(((s.size.w / 2 - v.x) / v.k - w / 2) / 10) * 10, y = Math.round(((s.size.h / 2 - v.y) / v.k - h / 2) / 10) * 10;
    while (Object.values(d.items).some((i) => i.x === x && i.y === y)) { x += 20; y += 20; }
    const id = s.addItem(k, x, y, w, h, k === "text" ? tr("Text") : ""); set({ sel: [id], tool: "select", editing: k === "text" || k === "notepad" || k === "todo" ? id : null, editSub: null }); },
  pane: "none", commentsOpen: false, settingsOpen: false, templatesOpen: false, spell: true, present: false, query: "", size: { w: 800, h: 500 }, painter: null,
  setSize: (size) => set({ size }), setPane: (pane) => set({ pane }),
  goTo: (id) => { const s = get(), it = curTab(s).doc.items[id]; if (!it) return; const v = curTab(s).view; set({ sel: [id] }); get().setView({ ...v, x: s.size.w / 2 - (it.x + it.w / 2) * v.k, y: s.size.h / 2 - (it.y + it.h / 2) * v.k }); }, setPainter: (painter) => set({ painter }),
  toggle: (k, v) => set((s) => ({ [k]: v ?? !s[k] }) as any), setQuery: (query) => set({ query }),
  setPresent: (v) => { set({ present: v }); try { v ? document.documentElement.requestFullscreen?.() : document.fullscreenElement && document.exitFullscreen(); } catch {} },
  setTool: (tool) => set({ tool }), setSel: (sel) => set({ sel }), setEditing: (editing, sub = null) => { const s = get(), prev = s.editing;
    if (prev && s.editSub?.k === "note" && !(editing === prev && sub?.k === "note")) { const it = curTab(s).doc.items[prev]; if (it && it.note !== undefined && !it.note.trim()) get().patch([prev], { note: undefined, nh: 0, h: it.h - (it.nh ?? 0) }, true); }
    set({ editing, editSub: editing ? sub : null }); }, setConnStyle: (connStyle) => set({ connStyle }),
  setView: (view) => set((s) => { const p = pageOf(curTab(s).doc), m = 60, cl = (v: number, size: number, len: number) => (len + 2 * m <= size ? (size - len) / 2 : Math.min(m, Math.max(size - len - m, v)));
    return upd(s, (t) => ({ ...t, view: { k: view.k, x: cl(view.x, s.size.w, p.w * view.k), y: cl(view.y, s.size.h, p.h * view.k) } })); }),
  mutate: (fn, rec = true) => set((s) => { const t = curTab(s); const d: Doc = { items: { ...t.doc.items }, conns: { ...t.doc.conns }, order: [...t.doc.order], bg: t.doc.bg, page: t.doc.page }; fn(d); { const pg = pageOf(d); for (const id in d.items) { const it = d.items[id], x = Math.min(Math.max(0, it.x), Math.max(0, pg.w - it.w)), y = Math.min(Math.max(0, it.y), Math.max(0, pg.h - it.h)); if (x !== it.x || y !== it.y) d.items[id] = { ...it, x, y }; } }
    return upd(s, (x) => ({ ...x, doc: d, past: rec ? [...x.past.slice(-99), x.doc] : x.past, future: rec ? [] : x.future, dirty: true })); }),
  addItem: (k, x, y, w = 140, h = 80, text = "", extra = {}) => { const it = mkItem(k, x, y, w, h, text, extra); get().mutate((d) => { d.items[it.id] = it; d.order.push(it.id); }); return it.id; },
  addChild: (pid, dir = "r", edit = true, styleFrom) => {
    const d = curTab(get()).doc, p = d.items[pid]; if (!p) return;
    const c = Object.values(d.conns).filter((k) => k.from === pid).length, w = 140, h = 44;
    const pos = { r: [p.x + p.w + 80, p.y + (p.h - h) / 2 + c * (h + 16)], l: [p.x - 80 - w, p.y + (p.h - h) / 2 + c * (h + 16)], t: [p.x + c * (w + 16), p.y - h - 70], b: [p.x + c * (w + 16), p.y + p.h + 70] }[dir];
    const sp = d.items[styleFrom ?? pid] ?? p; const it = mkItem("round", pos[0], pos[1], w, h, `${tr("node.new")} ${[...subPath(d, pid), c + 1].join(".")}`, styleOf(sp)); Object.assign(it, growToFit(it)); const st = get().connStyle;
    get().mutate((m) => { m.items[it.id] = it; m.order.push(it.id); const id = uid(); m.conns[id] = { id, from: pid, to: it.id, style: st, arrow: st !== "curve", dash: false, color: "#6b7280" }; });
    set({ sel: [it.id], editing: edit ? it.id : null, editSub: null });
  },
  addSibling: (id, edit = true) => { const d = curTab(get()).doc, c = Object.values(d.conns).find((k) => k.to === id); if (c) return get().addChild(c.from, "r", edit, id);
    const p = d.items[id]; if (!p) return; const it = mkItem("round", p.x, p.y + p.h + 30, 140, 44, tr("Topic"), styleOf(p)); Object.assign(it, growToFit(it));
    get().mutate((m) => { m.items[it.id] = it; m.order.push(it.id); }); set({ sel: [it.id], editing: edit ? it.id : null, editSub: null }); },
  connect: (a, b) => { if (Object.values(curTab(get()).doc.conns).some((k) => k.from === a && k.to === b)) return; const st = get().connStyle; get().mutate((m) => { const id = uid(); m.conns[id] = { id, from: a, to: b, style: st, arrow: st !== "curve", dash: false, color: "#6b7280" }; }); },
  remove: (ids) => { if (!ids.length) return; get().mutate((d) => { ids.forEach((i) => { delete d.items[i]; delete d.conns[i]; }); d.order = d.order.filter((i) => d.items[i]);
    Object.values(d.conns).forEach((c) => { if (!d.items[c.from] || !d.items[c.to]) delete d.conns[c.id]; }); }); set({ sel: [], editing: null }); },
  patch: (ids, p, rec) => { const key = ids.join() + Object.keys(p).join(), now = Date.now(); const r = rec ?? (key !== lk || now - lt > 900); lk = key; lt = now;
    const grow = Object.keys(p).some((k) => ["text", "note", "fs", "ff", "bold", "italic", "img", "ih", "bul", "bt", "ind", "kind"].includes(k));
    get().mutate((d) => { ids.forEach((i) => { if (d.items[i]) { let it = { ...d.items[i], ...p }; if (grow) it = { ...it, ...growToFit(it) }; d.items[i] = it; } }); }, r); },
  patchConns: (ids, p) => { if (p.style) set({ connStyle: p.style }); const cs = ids.filter((i) => curTab(get()).doc.conns[i]); if (!cs.length) return;
    get().mutate((d) => { cs.forEach((i) => (d.conns[i] = { ...d.conns[i], ...p })); }); },
  z: (front) => get().mutate((d) => { const s = get().sel; const rest = d.order.filter((i) => !s.includes(i)), mine = d.order.filter((i) => s.includes(i)); d.order = front ? [...rest, ...mine] : [...mine, ...rest]; }),
  undo: () => set((s) => ({ sel: [], ...upd(s, (t) => (t.past.length ? { ...t, doc: t.past[t.past.length - 1], past: t.past.slice(0, -1), future: [t.doc, ...t.future] } : t)) })),
  redo: () => set((s) => ({ sel: [], ...upd(s, (t) => (t.future.length ? { ...t, doc: t.future[0], future: t.future.slice(1), past: [...t.past, t.doc] } : t)) })),
  copy: () => { const s = get(), d = curTab(s).doc; const items: Doc["items"] = {}, conns: Doc["conns"] = {}; s.sel.forEach((i) => { if (d.items[i]) items[i] = d.items[i]; });
    Object.values(d.conns).forEach((c) => { if (items[c.from] && items[c.to]) conns[c.id] = c; }); set({ clip: { items, conns, order: d.order.filter((i) => items[i]) } }); },
  cut: () => { get().copy(); get().remove(get().sel); },
  paste: () => { const c = get().clip; if (!c) return; const map: Record<string, string> = {};
    get().mutate((d) => { c.order.forEach((i) => { const id = uid(); map[i] = id; d.items[id] = { ...c.items[i], id, x: c.items[i].x + 24, y: c.items[i].y + 24 }; d.order.push(id); });
      Object.values(c.conns).forEach((k) => { const id = uid(); d.conns[id] = { ...k, id, from: map[k.from], to: map[k.to] }; }); }); set({ sel: Object.values(map) }); },
  duplicate: () => { get().copy(); get().paste(); },
  selectAll: () => set((s) => ({ sel: curTab(s).doc.order })),
  layout: () => get().mutate((d) => { d.items = autoLayout(d).items; }),
  palette: (fill, stroke, color) => { const s = get(), d = curTab(s).doc; const ids = (s.sel.length ? s.sel : d.order).filter((i) => d.items[i] && d.items[i].kind !== "text" && d.items[i].kind !== "image"); get().patch(ids, color ? { fill, stroke, color } : { fill, stroke }, true); },
  newTab: (name, doc, path, grid) => { const tb = mkTab(name ?? (get().fresh ? `${tr("Untitled")} 1` : `${tr("Untitled")} ${++n}`), doc, undefined, path, grid); set((s) => addTab(s, tb)); setTimeout(() => get().zoom100(), 80); },
  openPages: (name, pgs, path, grid) => { const tb = mkTab(name, undefined, pgs, path, grid); set((s) => addTab(s, tb)); setTimeout(() => get().zoom100(), 80); },
  closeTab: (id) => set((s) => { if (s.tabs.length === 1) { const t = mkTab("Untitled 1"); n = 1; return { tabs: [t], active: t.id, sel: [], start: true, fresh: true }; }
    const tabs = s.tabs.filter((t) => t.id !== id); return { tabs, active: s.active === id ? tabs[0].id : s.active, sel: [] }; }),
  setActive: (id) => set({ active: id, sel: [], editing: null }),
  setPage: (i) => set((s) => ({ sel: [], editing: null, ...upd(s, (t) => (i === t.page || !t.pages[i] ? t : load(t, sync(t), i))) })),
  addPage: () => set((s) => ({ sel: [], editing: null, ...upd(s, (t) => { const pages = [...sync(t), mkPage(`Page-${t.pages.length + 1}`)]; return { ...load(t, pages, pages.length - 1), dirty: true }; }) })),
  renamePage: (i, name) => set((s) => upd(s, (t) => ({ ...t, dirty: true, pages: t.pages.map((p, j) => (j === i ? { ...p, name } : p)) }))),
  deletePage: (i) => set((s) => ({ sel: [], ...upd(s, (t) => { if (t.pages.length < 2) return t; const pages = sync(t).filter((_, j) => j !== i); return { ...load(t, pages, Math.min(i, pages.length - 1)), dirty: true }; }) })),
  dupPage: (i) => set((s) => ({ sel: [], ...upd(s, (t) => { const all = sync(t), src = all[i], cp = { ...mkPage(src.name + " (2)", src.doc), view: src.view }; return { ...load(t, [...all.slice(0, i + 1), cp, ...all.slice(i + 1)], i + 1), dirty: true }; }) })),
  align: (m) => { const s = get(), d = curTab(s).doc, its = s.sel.map((i) => d.items[i]).filter(Boolean); if (its.length < 2) return;
    const x0 = Math.min(...its.map((i) => i.x)), x1 = Math.max(...its.map((i) => i.x + i.w)), y0 = Math.min(...its.map((i) => i.y)), y1 = Math.max(...its.map((i) => i.y + i.h));
    get().mutate((dd) => its.forEach((it) => { const q = { ...it }; if (m === "l") q.x = x0; if (m === "r") q.x = x1 - it.w; if (m === "c") q.x = (x0 + x1) / 2 - it.w / 2; if (m === "t") q.y = y0; if (m === "b") q.y = y1 - it.h; if (m === "m") q.y = (y0 + y1) / 2 - it.h / 2; dd.items[it.id] = q; })); },
  distribute: (ax) => { const s = get(), d = curTab(s).doc, h = ax === "h", its = s.sel.map((i) => d.items[i]).filter(Boolean).sort((a, b) => (h ? a.x - b.x : a.y - b.y)); if (its.length < 3) return;
    const sz = (i: Item) => (h ? i.w : i.h), st = (i: Item) => (h ? i.x : i.y), last = its[its.length - 1], gap = (st(last) + sz(last) - st(its[0]) - its.reduce((a, i) => a + sz(i), 0)) / (its.length - 1);
    get().mutate((dd) => { let p = st(its[0]); its.forEach((it) => { dd.items[it.id] = { ...it, [h ? "x" : "y"]: p } as Item; p += sz(it) + gap; }); }); },
  group: (on) => { const s = get(); get().patch(s.sel, { g: on ? uid() : undefined }, true); },
  quickStyle: (fill, stroke, color) => get().patch(get().sel, { fill, stroke, color }, true),
  selectSame: () => { const s = get(), d = curTab(s).doc, f = d.items[s.sel[0]]; if (f) set({ sel: d.order.filter((i) => d.items[i].kind === f.kind) }); },
  selectConns: () => set((s) => ({ sel: Object.keys(curTab(s).doc.conns) })),
  invert: () => set((s) => ({ sel: curTab(s).doc.order.filter((i) => !s.sel.includes(i)) })),
  setStart: (v) => set(v ? { start: true } : { start: false, fresh: false }),
  moveTab: (a, b) => set((s) => { const tabs = [...s.tabs]; const [x] = tabs.splice(a, 1); tabs.splice(b, 0, x); return { tabs }; }),
  setPageColor: (i, c) => set((s) => upd(s, (t) => ({ ...t, dirty: true, pages: t.pages.map((p, j) => (j === i ? { ...p, color: c } : p)) }))),
  addMain: (near) => { // new parent heading placed at the top-left of the box, always named "Main topic"
    const d = curTab(get()).doc, p = d.items[near]; if (!p) return;
    const it = mkItem("round", p.x - 30, p.y - 74, 140, 44, tr("Main topic"), styleOf(p)); Object.assign(it, growToFit(it));
    get().mutate((m) => { m.items[it.id] = it; m.order.push(it.id); const old = Object.values(m.conns).find((k) => k.to === near);
      if (old) m.conns[old.id] = { ...old, to: it.id }; const id = uid(); m.conns[id] = { id, from: it.id, to: near, style: get().connStyle, arrow: get().connStyle !== "curve", dash: false, color: "#6b7280" }; });
    set({ sel: [it.id], editing: null, editSub: null }); },
  attachImage: (id, src, aspect) => { const it = curTab(get()).doc.items[id]; if (!it) return; const nih = Math.round(Math.min(160, Math.max(50, (it.w - 16) * aspect)) + 12); get().patch([id], { img: src, ih: nih, h: it.h - (it.ih ?? 0) + nih }, true); },
  addNote: (id) => { const it = curTab(get()).doc.items[id]; if (!it) return; if (it.note === undefined) get().patch([id], { note: "", nh: 34, h: it.h + 34 }, true); set({ sel: [id] }); get().setEditing(id, { k: "note" }); },
  setNote: (id, text) => { if (curTab(get()).doc.items[id]) get().patch([id], { note: text }); },
  addTable: (r, c, fill = "#ffffff", stroke = "#079a4a") => { const s = get(), v = curTab(s).view, w = c * 100, h = r * 36, x = Math.round(((s.size.w / 2 - v.x) / v.k - w / 2) / 10) * 10, y = Math.round(((s.size.h / 2 - v.y) / v.k - h / 2) / 10) * 10;
    const cells = Array.from({ length: r }, () => Array.from({ length: c }, () => "")); const id = s.addItem("table", x, y, w, h, "", { tbl: { r, c, cells }, fill, stroke, fs: 14 }); set({ sel: [id], tableDlg: false }); },
  addChart: (type) => { const s = get(), v = curTab(s).view, w = 380, h = 260, x = Math.round(((s.size.w / 2 - v.x) / v.k - w / 2) / 10) * 10, y = Math.round(((s.size.h / 2 - v.y) / v.k - h / 2) / 10) * 10, pie = type === "pie" || type === "donut";
    const series = [{ name: "Series 1", vals: [4, 7, 5, 9] }, ...(pie ? [] : [{ name: "Series 2", vals: [6, 3, 8, 5] }])];
    const id = s.addItem("chart", x, y, w, h, tr("Chart"), { chart: { type, cats: ["A", "B", "C", "D"], series }, fill: "#ffffff", stroke: "#bdbdbd", sw: 1, fs: 14 }); set({ sel: [id], chartDlg: false }); },
  setCell: (id, r, c, text) => { const it = curTab(get()).doc.items[id]; if (!it?.tbl) return; const cells = it.tbl.cells.map((row, i) => (i === r ? row.map((x, j) => (j === c ? text : x)) : row)); get().patch([id], { tbl: { ...it.tbl, cells } }); },
  bgColor: (c) => get().mutate((d) => { d.bg = { imgs: d.bg?.imgs ?? [], color: c }; }),
  bgAdd: (src, w, h) => { const s = get(), v = curTab(s).view, k = Math.min(1, (s.size.w / v.k * 0.6) / w), bw = w * k, bh = h * k, id = uid(), x = (s.size.w / 2 - v.x) / v.k - bw / 2, y = (s.size.h / 2 - v.y) / v.k - bh / 2;
    get().mutate((d) => { d.bg = { color: d.bg?.color, imgs: [...(d.bg?.imgs ?? []), { id, src, x, y, w: bw, h: bh }] }; }); set({ bgEdit: true, bgSel: id }); },
  bgPatch: (id, p, rec) => get().mutate((d) => { if (d.bg) d.bg = { ...d.bg, imgs: d.bg.imgs.map((i) => (i.id === id ? { ...i, ...p } : i)) }; }, rec ?? true),
  bgDel: () => { const s = get(), imgs = curTab(s).doc.bg?.imgs ?? []; if (!imgs.length) return;
    if (!s.bgDelMode) { set({ bgDelMode: true, bgMarks: [], bgEdit: false, bgSel: null }); return; }
    if (s.bgMarks.length) get().mutate((m) => { m.bg = { color: m.bg?.color, imgs: imgs.filter((i) => !s.bgMarks.includes(i.id)) }; });
    set({ bgDelMode: false, bgMarks: [] }); },
  setGridType: (g) => set((s) => upd(s, (t) => ({ ...t, gridType: g }))),
  setPageSize: (w, h) => { const p0 = pageOf(curTab(get()).doc), land = p0.w >= p0.h, a = Math.max(w, h), b = Math.min(w, h); get().mutate((d) => { d.page = land ? { w: a, h: b } : { w: b, h: a }; }); setTimeout(() => get().fit(), 30); },
  setOrientation: (land) => { const p = pageOf(curTab(get()).doc); if ((p.w >= p.h) === land) return; get().mutate((d) => { d.page = { w: p.h, h: p.w }; }); setTimeout(() => get().fit(), 30); },
  expandPage: (dir) => { const p = pageOf(curTab(get()).doc); get().mutate((d) => { d.page = dir === "r" ? { w: Math.round(p.w * 1.1), h: p.h } : { w: p.w, h: Math.round(p.h * 1.1) }; }); },
  ganttAdd: () => { const d = curTab(get()).doc, its = Object.values(d.items).filter((i) => i.gt), heads = its.filter((i) => i.gt!.k === "head"); if (!heads.length) return;
    const last = heads.reduce((a, b) => (b.gt!.c! > a.gt!.c! ? b : a)), L = last.gt!.c!;
    get().mutate((m) => { const add = (src: Item, text?: string) => { const it: Item = { ...src, id: uid(), x: src.x + last.w, text: text ?? src.text, gt: { ...src.gt!, c: L + 1 } }; m.items[it.id] = it; m.order.push(it.id); };
      add(last, `W${L + 2}`); its.filter((i) => i.gt!.k === "cell" && i.gt!.c === L).forEach((c) => add(c));
      const p = pageOf(m), right = last.x + last.w * 2 + 40; if (right > p.w) m.page = { w: Math.ceil(right), h: p.h }; }); },
  ganttDel: () => { const d = curTab(get()).doc, heads = Object.values(d.items).filter((i) => i.gt?.k === "head"); if (heads.length < 2) return;
    const last = heads.reduce((a, b) => (b.gt!.c! > a.gt!.c! ? b : a)), L = last.gt!.c!, wk = last.w;
    get().mutate((m) => { Object.values(m.items).forEach((i) => { const g = i.gt; if (!g) return;
      if ((g.k === "head" || g.k === "cell") && g.c === L) delete m.items[i.id];
      else if (g.k === "bar") { if (g.c! >= L) delete m.items[i.id]; else if (g.c! + g.s! - 1 >= L) { const ns = L - g.c!; m.items[i.id] = { ...i, w: Math.max(8, ns * wk - 8), gt: { ...g, s: ns } }; } } });
      m.order = m.order.filter((id) => m.items[id]); Object.values(m.conns).forEach((c) => { if (!m.items[c.from] || !m.items[c.to]) delete m.conns[c.id]; }); }); },
  ganttRowAdd: () => { const d = curTab(get()).doc, its = Object.values(d.items).filter((i) => i.gt), labels = its.filter((i) => i.gt!.k === "label" && i.gt!.r! >= 0); if (!labels.length) return;
    const last = labels.reduce((a, b) => (b.gt!.r! > a.gt!.r! ? b : a)), R = last.gt!.r!, prev = labels.find((i) => i.gt!.r === R - 1), step = prev ? last.y - prev.y : last.h + 12;
    get().mutate((m) => { const add = (src: Item, text?: string) => { const it: Item = { ...src, id: uid(), y: src.y + step, text: text ?? src.text, gt: { ...src.gt!, r: R + 1 } }; m.items[it.id] = it; m.order.push(it.id); };
      add(last, tr("Task")); its.filter((i) => i.gt!.k === "cell" && i.gt!.r === R).forEach((c) => add(c)); const p = pageOf(m), bottom = last.y + step + last.h + 40; if (bottom > p.h) m.page = { w: p.w, h: Math.ceil(bottom) }; }); },
  ganttRowDel: () => { const d = curTab(get()).doc, labels = Object.values(d.items).filter((i) => i.gt?.k === "label" && i.gt.r! >= 0); if (labels.length < 2) return; const R = labels.reduce((a, b) => (b.gt!.r! > a.gt!.r! ? b : a)).gt!.r!;
    get().mutate((m) => { Object.values(m.items).forEach((i) => { if (i.gt && i.gt.k !== "head" && i.gt.r === R) delete m.items[i.id]; }); m.order = m.order.filter((id) => m.items[id]); Object.values(m.conns).forEach((c) => { if (!m.items[c.from] || !m.items[c.to]) delete m.conns[c.id]; }); }); },
  todoAdd: () => { const todos = Object.values(curTab(get()).doc.items).filter((i) => i.kind === "todo"); if (!todos.length) return; const last = todos.reduce((a, b) => (b.y > a.y ? b : a));
    get().mutate((m) => { const it: Item = { ...last, id: uid(), y: last.y + last.h + 10, text: tr("New task"), done: false }; m.items[it.id] = it; m.order.push(it.id); const p = pageOf(m), bottom = it.y + it.h + 40; if (bottom > p.h) m.page = { w: p.w, h: Math.ceil(bottom) }; }); },
  todoDel: () => { const todos = Object.values(curTab(get()).doc.items).filter((i) => i.kind === "todo"); if (todos.length < 2) return; const last = todos.reduce((a, b) => (b.y > a.y ? b : a));
    get().mutate((m) => { delete m.items[last.id]; m.order = m.order.filter((id) => m.items[id]); Object.values(m.conns).forEach((c) => { if (!m.items[c.from] || !m.items[c.to]) delete m.conns[c.id]; }); }); },
  addComment: (text, itemId) => set((s) => upd(s, (t) => ({ ...t, dirty: true, comments: [...t.comments, { id: uid(), text, at: Date.now(), itemId }] }))),
  delComment: (id) => set((s) => upd(s, (t) => ({ ...t, comments: t.comments.filter((c) => c.id !== id) }))),
  fit: (margin) => { const mg = typeof margin === "number" ? margin : 80; const el = document.querySelector(".canvas") as HTMLElement | null; if (!el) return; const p = pageOf(curTab(get()).doc), W = el.clientWidth, H = el.clientHeight, k = Math.min(2, Math.max(0.1, Math.min((W - mg) / p.w, (H - mg) / p.h)));
    get().setView({ k, x: (W - p.w * k) / 2, y: (H - p.h * k) / 2 }); },
  zoom100: () => { const el = document.querySelector(".canvas") as HTMLElement | null; if (!el) return; const p = pageOf(curTab(get()).doc); get().setView({ k: 1, x: (el.clientWidth - p.w) / 2, y: (el.clientHeight - p.h) / 2 }); },
  zoom: (f) => { const v = curTab(get()).view, el = document.querySelector(".canvas") as HTMLElement | null, cx = (el?.clientWidth ?? 600) / 2, cy = (el?.clientHeight ?? 400) / 2;
    const k = Math.min(4, Math.max(.1, v.k * f)); get().setView({ k, x: cx - (cx - v.x) * (k / v.k), y: cy - (cy - v.y) * (k / v.k) }); },
  nudge: (dx, dy) => { const s = get(); if (!s.sel.length) return; get().mutate((d) => s.sel.forEach((i) => { if (d.items[i]) d.items[i] = { ...d.items[i], x: d.items[i].x + dx, y: d.items[i].y + dy }; })); },
}));

export const needsSave = (t: Tab) => t.dirty || (!t.path && t.pages.some((p, i) => Object.keys((i === t.page ? t.doc : p.doc).items).length > 0));
export const useIsDark = () => { const th = useSettings((s) => s.theme); return th === "dark" || th === "black" || (th === "system" && matchMedia("(prefers-color-scheme: dark)").matches); };
