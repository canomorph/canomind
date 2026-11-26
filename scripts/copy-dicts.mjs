// Copies Hunspell dictionaries from the "dictionary-*" npm packages into public/dict (used by the spell checker).
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
const map = { "en-US": "dictionary-en", "en-GB": "dictionary-en-gb", "tr-TR": "dictionary-tr", "de-DE": "dictionary-de", "fr-FR": "dictionary-fr", "es-ES": "dictionary-es", "es-MX": "dictionary-es-mx", "es-AR": "dictionary-es-ar", "it-IT": "dictionary-it", "pt-BR": "dictionary-pt", "pt-PT": "dictionary-pt-pt", "ru-RU": "dictionary-ru", "nl-NL": "dictionary-nl", "pl-PL": "dictionary-pl", "sv-SE": "dictionary-sv", "da-DK": "dictionary-da", "nb-NO": "dictionary-nb", "uk-UA": "dictionary-uk", "bg-BG": "dictionary-bg", "cs-CZ": "dictionary-cs", "sk-SK": "dictionary-sk", "sl-SI": "dictionary-sl", "hr-HR": "dictionary-hr", "sr-RS": "dictionary-sr", "hu-HU": "dictionary-hu", "ro-RO": "dictionary-ro", "el-GR": "dictionary-el", "lt-LT": "dictionary-lt", "lv-LV": "dictionary-lv", "ca-ES": "dictionary-ca", "gl-ES": "dictionary-gl", "is-IS": "dictionary-is", "he-IL": "dictionary-he", "ar": "dictionary-ar", "ko-KR": "dictionary-ko", "id-ID": "dictionary-id", "vi-VN": "dictionary-vi" };
mkdirSync("public/dict", { recursive: true });
for (const [code, pkg] of Object.entries(map)) {
  const dir = `node_modules/${pkg}`;
  if (existsSync(`${dir}/index.aff`) && existsSync(`${dir}/index.dic`)) { copyFileSync(`${dir}/index.aff`, `public/dict/${code}.aff`); copyFileSync(`${dir}/index.dic`, `public/dict/${code}.dic`); }
}
