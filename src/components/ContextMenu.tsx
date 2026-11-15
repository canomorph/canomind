import { useState } from "react";
import { t } from "../i18n";
import { curTab, useDocs } from "../store";
import { ColorPick } from "./ColorPick";
import { Icon } from "./Icon";
import { MI } from "./Menu";

export function ContextMenu() {
  const S = useDocs(), c = S.ctx, [open, setOpen] = useState<"fill" | "line" | null>(null); if (!c) return null;
  const T = curTab(S), close = () => { S.setCtx(null); setOpen(null); }, it = c.id ? T.doc.items[c.id] : null, cn = c.id ? T.doc.conns[c.id] : null, id = c.id;
  const box = !!it && it.kind !== "image" && it.kind !== "table" && it.kind !== "chart";
  const acc = (key: "fill" | "line", label: string, icon: string, body: React.ReactNode) => (
    <div><button className="mi" onClick={() => setOpen(open === key ? null : key)}><Icon name={icon} size={16} />{t(label)}<span style={{ marginLeft: "auto" }}>›</span></button>{open === key && body}</div>
  );
  return (
    <>
      <div className="ctxov" onMouseDown={close} onContextMenu={(e) => { e.preventDefault(); close(); }} />
      <div className="menu ctxm" style={{ position: "fixed", left: Math.min(c.x, innerWidth - 270), top: Math.max(4, Math.min(c.y, innerHeight - 440)) }} onContextMenu={(e) => e.preventDefault()}>
        {it && id && <>
          {it.kind !== "image" && <MI i="textbox" l="Edit text" on={() => (it.kind === "chart" ? useDocs.setState({ chartEdit: id }) : it.kind === "table" ? S.setEditing(id, { k: "cell", r: 0, c: 0 }) : S.setEditing(id))} close={close} />}
          <MI i="duplicate" l="Duplicate" on={S.duplicate} close={close} />
          {box && <MI i="comment" l="Add comment" on={() => { S.setCommentTarget(id); S.toggle("commentsOpen", true); }} close={close} />}
          {box && <MI i="note" l="Add note" on={() => S.addNote(id)} close={close} />}
          {box && <MI i="image" l="Add image" on={() => { useDocs.setState({ imgTarget: id }); document.getElementById("canomind-img-attach")?.click(); }} close={close} />}
          {it.kind !== "image" && acc("fill", "Fill color", "fill", <ColorPick value={it.fill} opacity={it.fo} none onColor={(x) => S.patch(S.sel, { fill: x }, true)} onOpacity={(o) => S.patch(S.sel, { fo: o })} close={close} />)}
          {it.kind !== "image" && acc("line", "Line color", "linecolor", <ColorPick value={it.stroke} opacity={it.so} none onColor={(x) => (x === "none" ? S.patch(S.sel, { sw: 0 }, true) : S.patch(S.sel, { stroke: x, sw: it.sw || 2 }, true))} onOpacity={(o) => S.patch(S.sel, { so: o })} close={close} />)}
          <MI i="child" l="Add main topic" on={() => S.addMain(id)} close={close} />
          <MI i="sibling" l="Add sibling" on={() => S.addSibling(id, false)} close={close} />
          <MI i="child" l="Add subtopic" on={() => S.addChild(id, "r", false)} close={close} />
          <MI i={it.lock ? "unlock" : "lock"} l={it.lock ? "Unlock" : "Lock"} on={() => S.patch(S.sel, { lock: !it.lock }, true)} close={close} />
          <MI i="delete" l="Delete" on={() => S.remove(S.sel)} close={close} />
        </>}
        {cn && id && <MI i="delete" l="Delete" on={() => S.remove([id])} close={close} />}
        {!it && !cn && <>
          <MI i="paste" l="Paste" dis={!S.clip} on={S.paste} close={close} />
          <MI i="selectall" l="Select All" on={S.selectAll} close={close} />
        </>}
      </div>
    </>
  );
}
