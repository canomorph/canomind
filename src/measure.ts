let ctx: CanvasRenderingContext2D | null = null;
const cache = new Map<string, number>();
export function textW(s: string, fs: number, ff = "Calibri", bold = false, italic = false) {
  if (!ctx) ctx = document.createElement("canvas").getContext("2d");
  const font = `${italic ? "italic " : ""}${bold ? "700 " : ""}${fs}px ${ff}, "Segoe UI", system-ui, sans-serif`, key = font + "|" + s;
  let v = cache.get(key); if (v === undefined) { ctx!.font = font; v = ctx!.measureText(s).width; cache.set(key, v); if (cache.size > 20000) cache.clear(); }
  return v;
}
