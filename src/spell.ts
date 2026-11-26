import nspell from "nspell";
export interface Checker { correct: (w: string) => boolean }
const cache = new Map<string, Promise<Checker | null>>(), memo = new Map<string, Map<string, boolean>>();
const URL_RE = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
// Dictionaries are copied to /public/dict by scripts/copy-dicts.mjs (npm "dictionary-*" packages).
// Custom dictionaries added by the user (Hunspell .aff + .dic) are kept in IndexedDB, so they work on every platform.
const idb = () => new Promise<IDBDatabase>((res, rej) => { const q = indexedDB.open("canomind-dicts", 1); q.onupgradeneeded = () => q.result.createObjectStore("d", { keyPath: "code" }); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); });
export async function customDicts(): Promise<{ code: string; aff: string; dic: string }[]> {
  try { const db = await idb(); return await new Promise((res, rej) => { const q = db.transaction("d").objectStore("d").getAll(); q.onsuccess = () => res(q.result as any); q.onerror = () => rej(q.error); }); } catch { return []; }
}
export async function addCustomDict(code: string, aff: string, dic: string) {
  const db = await idb(); await new Promise<void>((res, rej) => { const tx = db.transaction("d", "readwrite"); tx.objectStore("d").put({ code, aff, dic }); tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); });
  cache.delete(code); memo.delete(code);
}
export async function availableLangs(codes: string[]): Promise<string[]> {
  const out = (await customDicts()).map((c) => c.code);
  await Promise.all(codes.map(async (c) => { if (out.includes(c)) return; try { const r = await fetch(`/dict/${c}.aff`); if (r.ok && !(await r.text()).trimStart().startsWith("<")) out.push(c); } catch {} }));
  if (!out.includes("zh-CN")) out.push("zh-CN");
  return out;
}
export function loadSpell(lang: string): Promise<Checker | null> {
  if (!cache.has(lang)) cache.set(lang, (async () => {
    try {
      if (lang.startsWith("zh")) return { correct: () => true } as Checker; // no word-based spell checking for Chinese; grammar rules still apply
      const cd = (await customDicts()).find((c) => c.code === lang); if (cd) return nspell(cd.aff, cd.dic);
      const [a, d] = await Promise.all([fetch(`/dict/${lang}.aff`), fetch(`/dict/${lang}.dic`)]); if (!a.ok || !d.ok) return null;
      const dec = new TextDecoder("utf-8"), aff = dec.decode(await a.arrayBuffer()); if (aff.trimStart().startsWith("<")) return null;
      return nspell(aff, dec.decode(await d.arrayBuffer()));
    } catch { return null; }
  })());
  return cache.get(lang)!;
}
const ok = (sp: Checker, lang: string, w: string) => { let m = memo.get(lang); if (!m) memo.set(lang, (m = new Map())); let v = m.get(w); if (v === undefined) { v = sp.correct(w) || sp.correct(w.toLowerCase()); m.set(w, v); } return v; };
export interface SpellOpts { grammar: boolean; caps: boolean; punct: boolean; dup: boolean; upper: boolean }
export const DEFAULT_SPELL_OPTS: SpellOpts = { grammar: true, caps: true, punct: true, dup: true, upper: true };
export interface Issue { i: number; w: string; kind: "spell" | "dup" | "grammar" }
// Language-independent grammar/typography rules (blue wavy line).
export function grammar(line: string, first: boolean, o: SpellOpts = DEFAULT_SPELL_OPTS): Issue[] {
  if (!o.grammar) return [];
  const masked = line.replace(URL_RE, (m) => " ".repeat(m.length)), out: Issue[] = [], add = (i: number, w: string) => out.push({ i, w, kind: "grammar" });
  if (o.punct) {
    for (const m of masked.matchAll(/ {2,}/g)) add(m.index!, m[0]);
    for (const m of masked.matchAll(/ +[,.;:!?]/g)) add(m.index!, m[0]);
    for (const m of masked.matchAll(/\p{L}[,;:!?]\p{L}/gu)) add(m.index! + 1, m[0][1]);
  }
  if (o.caps) for (const m of masked.matchAll(/(?<=\p{L}{3})[.!?] +(\p{Ll})/gu)) add(m.index! + m[0].length - 1, m[1]);
  if (o.caps && first) { const m = /^[^\p{L}]*(\p{Ll})/u.exec(masked); if (m) add(m[0].length - 1, m[1]); }
  return out;
}
export function issues(line: string, sp: Checker, lang: string, first = false, o: SpellOpts = DEFAULT_SPELL_OPTS): Issue[] {
  const masked = line.replace(URL_RE, (m) => " ".repeat(m.length)), out: Issue[] = []; let prev = "";
  for (const m of masked.matchAll(/[\p{L}][\p{L}'’]*/gu)) {
    const w = m[0];
    if (w.length > 1 && !(o.upper && /^[\p{Lu}]{2,}$/u.test(w)) && !ok(sp, lang, w.replace(/’/g, "'"))) out.push({ i: m.index!, w, kind: "spell" });
    else if (o.grammar && o.dup && prev && prev.toLowerCase() === w.toLowerCase()) out.push({ i: m.index!, w, kind: "dup" });
    prev = w;
  }
  return out.concat(grammar(line, first, o));
}
