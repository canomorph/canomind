import { tr } from "./tr";
import { zh } from "./zh";
let lang = "en";
export const setLang = (l: string) => { lang = l === "tr" ? "tr" : l === "zh" ? "zh" : "en"; };
const en: Record<string, string> = {
  "app.name": "CanoMind", "search.placeholder": "Search", "search.title": "Search", "comments.title": "Comments", "comments.btn": "Comments",
  "settings.title": "Settings", "settings.theme": "Theme", "settings.scale": "UI scale", "settings.lang": "Language",
  "theme.light": "Light", "theme.sepia": "Sepia", "theme.dark": "Dark", "theme.black": "Black", "theme.system": "System",
  "status.page": "Page", "status.present": "Present", "status.fit": "Fit to screen", "node.root": "Central topic", "node.new": "Subtopic", "ribbon.more": "More",
  "about.dev": "Developer:", "about.ver": "Version:",
};
export const t = (k: string) => (lang === "tr" && tr[k]) || (lang === "zh" && zh[k]) || en[k] || k;
