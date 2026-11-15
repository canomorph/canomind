// Copies Hunspell dictionaries from the "dictionary-*" npm packages into public/dict (used by the spell checker).
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
const map = { "en-US": "dictionary-en", "en-GB": "dictionary-en-gb", "tr-TR": "dictionary-tr", "de-DE": "dictionary-de", "fr-FR": "dictionary-fr", "es-ES": "dictionary-es", "it-IT": "dictionary-it", "pt-PT": "dictionary-pt-pt", "ru-RU": "dictionary-ru", "nl-NL": "dictionary-nl", "pl-PL": "dictionary-pl", "sv-SE": "dictionary-sv", "uk-UA": "dictionary-uk", "cs-CZ": "dictionary-cs", "el-GR": "dictionary-el", "hu-HU": "dictionary-hu", "ro-RO": "dictionary-ro", "da-DK": "dictionary-da" };
mkdirSync("public/dict", { recursive: true });
for (const [code, pkg] of Object.entries(map)) {
  const dir = `node_modules/${pkg}`;
  if (existsSync(`${dir}/index.aff`) && existsSync(`${dir}/index.dic`)) { copyFileSync(`${dir}/index.aff`, `public/dict/${code}.aff`); copyFileSync(`${dir}/index.dic`, `public/dict/${code}.dic`); }
}
