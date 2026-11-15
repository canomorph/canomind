import { Kind, defSize, shapePath } from "../model";
export const Thumb = ({ k, w = 26, h = 20 }: { k: Kind; w?: number; h?: number }) => {
  if (k === "text") return <svg width={w + 4} height={h + 4}><text x={(w + 4) / 2} y={(h + 4) / 2 + 5} textAnchor="middle" fontSize="15" fill="currentColor">A</text></svg>;
  const [dw, dh] = defSize(k), s = Math.min(w / dw, h / dh), ww = dw * s, hh = dh * s;
  return <svg width={w + 4} height={h + 4} viewBox={`${-2 - (w - ww) / 2} ${-2 - (h - hh) / 2} ${w + 4} ${h + 4}`}><path d={shapePath(k, ww, hh)} fill="none" stroke="currentColor" strokeWidth="1.2" fillRule="evenodd" strokeLinejoin="round" /></svg>;
};
