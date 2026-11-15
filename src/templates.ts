import { A4L, Conn, Doc, Item, Kind, autoLayout, emptyDoc, mkItem, uid } from "./model";
const B = () => {
  const d = emptyDoc();
  const add = (k: Kind, x: number, y: number, w: number, h: number, t = "", ex: Partial<Item> = {}) => { const it = mkItem(k, x, y, w, h, t, ex); d.items[it.id] = it; d.order.push(it.id); return it.id; };
  const link = (a: string, b: string, style: Conn["style"] = "curve") => { const id = uid(); d.conns[id] = { id, from: a, to: b, style, arrow: style !== "curve", dash: false, color: "#6b7280" }; };
  return { d, add, link };
};
export interface Tree { t: string; c: Tree[] }
export const T = (t: string, ...c: Tree[]): Tree => ({ t, c });
export function treeToDoc(tr: Tree): Doc {
  const { d, add, link } = B(); let y = 0;
  const go = (n: Tree, depth: number, pid?: string) => {
    const w = Math.min(260, Math.max(depth ? 100 : 140, n.t.length * 9 + 24));
    const id = add(depth ? "round" : "ellipse", 0, y, w, depth ? 44 : 64, n.t, depth ? { fill: "#ffffff" } : { fill: "#079a4a", color: "#ffffff", bold: true }); y += 60;
    if (pid) link(pid, id); n.c.forEach((k) => go(k, depth + 1, id));
  };
  go(tr, 0); return autoLayout(d);
}
// Imported / legacy documents: keep sizes, move content away from the page edge and grow the page when needed.
export function autoPage(d: Doc, margin = 60): Doc {
  const its = Object.values(d.items); if (!its.length) return { ...d, page: d.page ?? A4L };
  const dx = d.page ? 0 : margin - Math.min(...its.map((i) => i.x)), dy = d.page ? 0 : margin - Math.min(...its.map((i) => i.y)), items: Record<string, Item> = {};
  its.forEach((i) => { items[i.id] = { ...i, x: i.x + dx, y: i.y + dy }; });
  const mx = Math.max(...Object.values(items).map((i) => i.x + i.w)), my = Math.max(...Object.values(items).map((i) => i.y + i.h));
  return { ...d, items, page: { w: Math.max(d.page?.w ?? A4L.w, Math.ceil(mx + margin)), h: Math.max(d.page?.h ?? A4L.h, Math.ceil(my + margin)) } };
}
// Templates are scaled down if needed and centered on an A4 landscape page.
export function fitDoc(d: Doc, W = A4L.w, H = A4L.h, m = 50): Doc {
  const its = Object.values(d.items); if (!its.length) return { ...d, page: { w: W, h: H } };
  const x0 = Math.min(...its.map((i) => i.x)), y0 = Math.min(...its.map((i) => i.y)), x1 = Math.max(...its.map((i) => i.x + i.w)), y1 = Math.max(...its.map((i) => i.y + i.h));
  const bw = x1 - x0, bh = y1 - y0, s = Math.min(1, (W - 2 * m) / bw, (H - 2 * m) / bh), ox = (W - bw * s) / 2, oy = (H - bh * s) / 2, items: Record<string, Item> = {};
  its.forEach((i) => { items[i.id] = { ...i, x: (i.x - x0) * s + ox, y: (i.y - y0) * s + oy, w: i.w * s, h: i.h * s, fs: s < 1 ? Math.max(8, Math.round(i.fs * s)) : i.fs }; });
  return { ...d, items, page: { w: W, h: H } };
}
export interface Template { id: string; name: string; icon: string; build: () => Doc }
const G = "#8a8f98";
const mk = (id: string, name: string, icon: string, raw: () => Doc): Template => ({ id, name, icon, build: () => fitDoc(raw()) });

export const TEMPLATES: Template[] = [
  { id: "blank", name: "Blank", icon: "new", build: () => ({ ...emptyDoc(), page: A4L }) },
  mk("mindmap", "Mind map", "child", () => treeToDoc(T("Main topic", ...["Idea A", "Idea B", "Idea C", "Idea D"].map((n) => T(n, T(n + ".1"), T(n + ".2")))))),
  mk("todo", "To-do List", "todo", () => {
    const { d, add } = B(); add("text", 0, 0, 300, 40, "To-do List", { bold: true, fs: 24 });
    ["Plan the week", "Reply to emails", "Prepare the presentation", "Buy groceries", "Call the dentist", "Read 20 pages"].forEach((n, i) => add("todo", 0, 56 + i * 54, 360, 44, n, { done: i < 2, ha: "left" }));
    return d; }),
  mk("planner", "Event Planner", "table", () => {
    const { d, add } = B(); add("text", 0, 0, 300, 40, "Event & Task Planner", { bold: true, fs: 24 });
    const cells = Array.from({ length: 9 }, (_, r) => Array.from({ length: 5 }, (_, c) => (r === 0 ? ["Date", "Event / Task", "Owner", "Status", "Notes"][c] : "")));
    add("table", 0, 56, 900, 9 * 40, "", { tbl: { r: 9, c: 5, cells }, fill: "#ffffff", stroke: G, fs: 14 }); return d; }),
  mk("swot", "SWOT Analysis", "grid", () => {
    const { d, add } = B(); ([["Strengths", "#e6f4ea", 0, 0], ["Weaknesses", "#fce8f3", 240, 0], ["Opportunities", "#e8f0fe", 0, 190], ["Threats", "#fef0e0", 240, 190]] as [string, string, number, number][]).forEach(([n, f, x, y]) => add("rect", x, y, 230, 180, n, { fill: f, va: "top", bold: true }));
    return d; }),
  mk("eisen", "Eisenhower Matrix", "grid", () => {
    const { d, add } = B(); ([["Do first", "#fce8f3", 0, 0], ["Schedule", "#e8f0fe", 240, 0], ["Delegate", "#fff3a3", 0, 190], ["Eliminate", "#eceff1", 240, 190]] as [string, string, number, number][]).forEach(([n, f, x, y]) => add("rect", x, y, 230, 180, n, { fill: f, va: "top", bold: true }));
    add("text", 0, -34, 230, 28, "Urgent"); add("text", 240, -34, 230, 28, "Not urgent"); return d; }),
  mk("proscons", "Pros and Cons", "grid", () => {
    const { d, add } = B(); add("rect", 0, 0, 230, 300, "Pros", { fill: "#e6f4ea", stroke: "#1e8e3e", va: "top", bold: true }); add("rect", 240, 0, 230, 300, "Cons", { fill: "#fce8f3", stroke: "#c2185b", va: "top", bold: true }); return d; }),
  mk("bmc", "Business Model Canvas", "grid", () => {
    const { d, add } = B(); ([["Key Partners", 0, 0, 200, 400], ["Key Activities", 200, 0, 200, 200], ["Key Resources", 200, 200, 200, 200], ["Value Propositions", 400, 0, 200, 400], ["Customer Relationships", 600, 0, 200, 200], ["Channels", 600, 200, 200, 200], ["Customer Segments", 800, 0, 200, 400], ["Cost Structure", 0, 400, 500, 150], ["Revenue Streams", 500, 400, 500, 150]] as [string, number, number, number, number][])
      .forEach(([n, x, y, w, h]) => add("rect", x, y, w, h, n, { fill: "#f6f8fb", stroke: G, va: "top", bold: true, sw: 1 })); return d; }),
  mk("kanban", "Kanban Board", "grid", () => {
    const { d, add } = B(); ["To do", "In progress", "Done"].forEach((n, i) => add("rect", i * 260, 0, 240, 360, n, { fill: "#f3f4f6", stroke: G, va: "top", bold: true, sw: 1 }));
    add("note", 14, 50, 212, 60, "Task 1"); add("note", 14, 120, 212, 60, "Task 2"); add("note", 274, 50, 212, 60, "Task 3"); return d; }),
  mk("fishbone", "Fishbone Diagram", "arrow", () => {
    const { d, add, link } = B(); add("rect", 0, 162, 760, 6, "", { fill: "#9aa0a6", stroke: "#9aa0a6", sw: 0 }); const head = add("ellipse", 770, 130, 170, 70, "Problem", { fill: "#079a4a", color: "#ffffff", bold: true });
    ["People", "Process", "Equipment"].forEach((n, i) => { link(add("round", 60 + i * 240, 20, 150, 44, n), head, "straight"); add("text", 60 + i * 240, 80, 150, 28, "Cause"); });
    ["Materials", "Environment", "Management"].forEach((n, i) => { link(add("round", 60 + i * 240, 300, 150, 44, n), head, "straight"); add("text", 60 + i * 240, 250, 150, 28, "Cause"); }); return d; }),
  mk("flow", "Flowchart", "connector", () => {
    const { d, add, link } = B(); const s = add("terminator", 0, 0, 140, 50, "Start"), p = add("rect", 0, 100, 140, 60, "Step 1"), q = add("diamond", 0, 210, 140, 90, "OK?"), p2 = add("rect", 0, 350, 140, 60, "Step 2"), f = add("rect", 230, 225, 140, 60, "Fix"), e = add("terminator", 0, 460, 140, 50, "End");
    link(s, p, "straight"); link(p, q, "straight"); link(q, p2, "straight"); link(q, f, "straight"); link(f, p, "elbow"); link(p2, e, "straight"); return d; }),
  mk("org", "Org chart", "sibling", () => {
    const { d, add, link } = B(); const boss = add("rect", 230, 0, 140, 50, "Director", { fill: "#079a4a", color: "#ffffff" });
    [0, 1, 2].forEach((i) => { const m = add("rect", i * 230, 120, 140, 50, `Manager ${i + 1}`); link(boss, m, "elbow"); [0, 1].forEach((j) => link(m, add("rect", i * 230 + (j ? 80 : -40), 240, 110, 44, `Staff ${i * 2 + j + 1}`, { fill: "#ffffff", fs: 14 }), "elbow")); }); return d; }),
  mk("gantt", "Gantt plan", "grid", () => {
    const { d, add } = B(), wk = 80, LW = 170, X0 = LW + 10, box = { fill: "#e9ecef", stroke: G, sw: 1 };
    add("rect", 0, 0, LW, 30, "Task", { ...box, bold: true, gt: { k: "label", r: -1 } });
    for (let i = 0; i < 8; i++) add("rect", X0 + i * wk, 0, wk, 30, `W${i + 1}`, { ...box, fs: 13, gt: { k: "head", c: i } });
    ([["Planning", 0, 2, "#079a4a"], ["Design", 1, 3, "#8e24aa"], ["Build", 3, 4, "#1e88e5"], ["Test", 6, 2, "#e8710a"], ["Launch", 7, 1, "#c2185b"]] as [string, number, number, string][]).forEach(([n, s, l, c], i) => {
      const y = 40 + i * 44; add("rect", 0, y, LW, 32, n, { ...box, bold: true, gt: { k: "label", r: i } });
      for (let j = 0; j < 8; j++) add("rect", X0 + j * wk, y, wk, 32, "", { fill: "none", stroke: G, sw: 1, gt: { k: "cell", c: j, r: i } });
      add("round", X0 + s * wk + 4, y + 4, l * wk - 8, 24, "", { fill: c, stroke: c, gt: { k: "bar", r: i, c: s, s: l } }); });
    return d; }),
  mk("timeline", "Timeline", "arrow", () => {
    const { d, add, link } = B(); add("rect", 0, 116, 4 * 180 + 36, 4, "", { fill: "#9aa0a6", stroke: "#9aa0a6", sw: 0 });
    ["Kickoff", "Design", "Build", "Test", "Launch"].forEach((n, i) => { const m = add("ellipse", i * 180, 100, 36, 36, String(i + 1), { fill: "#079a4a", color: "#ffffff", fs: 14 });
      link(m, add("text", i * 180 - 40, 150, 116, 30, n), "straight"); link(m, add("text", i * 180 - 40, 60, 116, 30, `Q${i + 1}`, { fs: 13 }), "straight"); }); return d; }),
];
