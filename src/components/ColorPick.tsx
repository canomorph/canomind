import { t } from "../i18n";
import { MI } from "./Menu";

export const SWATCH = ["#000000", "#ffffff", "#7f7f7f", "#c00000", "#ff0000", "#ffc000", "#ffff00", "#92d050", "#00b050", "#00b0f0", "#0070c0", "#7030a0", "#e8f0fe", "#fff3a3", "#fce8f3", "#e6f4ea"];
const hex = (v?: string) => (v && /^#[0-9a-f]{6}$/i.test(v) ? v : "#ffffff");
export function ColorPick({ value, opacity, onColor, onOpacity, none, close }: { value?: string; opacity?: number; onColor: (c: string) => void; onOpacity?: (o: number) => void; none?: boolean; close?: () => void }) {
  const op = Math.round((opacity ?? 1) * 100);
  return (
    <div className="cm">
      <div className="swg">{SWATCH.map((x) => <button key={x} title={x} style={{ background: x }} onClick={() => { onColor(x); close?.(); }} />)}</div>
      {none && <MI l="Transparent" on={() => onColor("none")} close={close ?? (() => {})} />}
      <label className="mi"><span className="ph" />{t("More colors…")}<input type="color" value={hex(value)} onChange={(e) => onColor(e.target.value)} /></label>
      {onOpacity && <div className="oprow"><span>{t("Opacity")}</span><input type="range" min={0} max={100} value={op} onChange={(e) => onOpacity(+e.target.value / 100)} /><span>{op}%</span></div>}
    </div>
  );
}
