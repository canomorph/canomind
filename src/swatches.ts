export interface SwStyle { id: string; fill: string; stroke: string; color: string }
export const HUES: [string, string][] = [["#e53935", "#b71c1c"], ["#fb8c00", "#e65100"], ["#fdd835", "#f9a825"], ["#43a047", "#2e7d32"], ["#00897b", "#00695c"], ["#1e88e5", "#1565c0"], ["#3949ab", "#283593"], ["#8e24aa", "#6a1b9a"], ["#ec407a", "#c2185b"], ["#757575", "#424242"]];
export const DEFAULT_SCHEMES: SwStyle[] = [0, 1, 2].flatMap((row) => HUES.map(([a, b], i) => ({ id: `sc-${row}-${i}`, fill: row === 0 ? a : row === 1 ? "#ffffff" : "#000000", stroke: row === 0 ? b : a, color: row === 0 ? (i === 2 ? "#000000" : "#ffffff") : row === 1 ? "#1a1a1a" : "#ffffff" })));
const Q: [string, string, string][] = [
  ["#079a4a", "#056d34", "#ffffff"], ["#ffffff", "#079a4a", "#1a1a1a"], ["#000000", "#079a4a", "#ffffff"],
  ["#000000", "#000000", "#ffffff"], ["#ffffff", "#000000", "#000000"], ["#000000", "#ffffff", "#ffffff"],
  ["#616161", "#424242", "#ffffff"], ["#ffffff", "#424242", "#1a1a1a"], ["#000000", "#424242", "#ffffff"],
  ["#e0e0e0", "#bdbdbd", "#1a1a1a"], ["#ffffff", "#bdbdbd", "#1a1a1a"], ["#000000", "#bdbdbd", "#ffffff"]];
export const DEFAULT_QS: SwStyle[] = Q.map(([fill, stroke, color], i) => ({ id: `qs2-${i}`, fill, stroke, color }));
export const sameSw = (a: { fill: string; stroke: string; color: string }, b: { fill: string; stroke: string; color: string }) => a.fill === b.fill && a.stroke === b.stroke && a.color === b.color;
export const moveItem = <T,>(list: T[], from: number, to: number) => { const a = [...list]; const [x] = a.splice(from, 1); a.splice(to, 0, x); return a; };

const hx = (c: string) => { let h = c.replace("#", ""); if (h.length === 3) h = h.split("").map((x) => x + x).join(""); const n = parseInt(h, 16) || 0; return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
export const mixColor = (a: string, b: string, t: number) => { const x = hx(a), y = hx(b); return "#" + x.map((v, i) => Math.round(v * (1 - t) + y[i] * t).toString(16).padStart(2, "0")).join(""); };
// Themes: the main box gets the color, sub boxes get lighter pastel tones of the same color (like XMind color themes)
export const THEMES: [string, string][] = [["Green", "#079a4a"], ["Blue", "#1e88e5"], ["Indigo", "#3949ab"], ["Purple", "#8e24aa"], ["Pink", "#d81b60"], ["Red", "#e53935"], ["Orange", "#fb8c00"], ["Gold", "#f9a825"], ["Teal", "#00897b"], ["Brown", "#6d4c41"], ["Slate", "#546e7a"], ["Black", "#212121"]];
