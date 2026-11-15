import { ReactNode, useEffect, useRef, useState } from "react";
import { t } from "../i18n";
import { Icon } from "./Icon";

export function Drop({ i, l = "", mode = "sm", swatch, up, children }: { i?: string; l?: string; mode?: "big" | "sm" | "icon" | "text"; swatch?: string; up?: boolean; children: (close: () => void) => ReactNode }) {
  const [o, setO] = useState(false), [pos, setPos] = useState<any>({});
  const box = useRef<HTMLDivElement>(null), btn = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (!o) return; const f = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setO(false); }; addEventListener("mousedown", f); return () => removeEventListener("mousedown", f); }, [o]);
  const toggle = () => {
    if (o) return setO(false);
    const r = btn.current!.getBoundingClientRect(), p: any = {};
    if (r.left > innerWidth - 280) p.right = innerWidth - r.right; else p.left = r.left;
    if (up) p.bottom = innerHeight - r.top; else p.top = r.bottom;
    setPos(p); setO(true);
  };
  const ic = i ? <span className="ic"><Icon name={i} size={mode === "big" ? 28 : 16} />{swatch && <b className="bar" style={{ background: swatch }} />}</span> : null;
  return (
    <div className="drop" ref={box}>
      <button ref={btn} data-drop="" className={mode === "icon" ? "ib" : mode === "text" ? "sbtn" : "rb" + (mode === "sm" ? " sm" : "") + (o ? " act" : "")} title={t(l)} onClick={toggle}>
        {ic}{mode !== "icon" && <span>{t(l)} <Icon name="chevdown" size={9} /></span>}{mode === "icon" && <Icon name="chevdown" size={8} />}
      </button>
      {o && <div className="menu" style={{ position: "fixed", ...pos }}>{children(() => setO(false))}</div>}
    </div>
  );
}
export const MI = ({ i, l, on, close, dis, act }: { i?: string; l: string; on: () => void; close: () => void; dis?: boolean; act?: boolean }) => (
  <button className={"mi" + (act ? " act" : "")} disabled={dis} onClick={() => { on(); close(); }}>{i ? <Icon name={i} size={16} /> : <span className="ph" />}{t(l)}</button>
);

export function FloatMenu({ x, y, onClose, children }: { x: number; y: number; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { const f = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) onClose(); }; addEventListener("mousedown", f); return () => removeEventListener("mousedown", f); }, []);
  return <div ref={ref} className="menu" style={{ position: "fixed", left: Math.min(x, innerWidth - 260), bottom: innerHeight - y }}>{children}</div>;
}
