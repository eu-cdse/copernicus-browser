# AI-assisted translations

The UI strings live in gettext catalogues in `public/translations/<lang>.po` (the app loads the generated
`<lang>.po.json`). Human translations are always preferred: the AI workflow below never overwrites one,
it only fills entries that are still empty. (To have a broken human translation redone — e.g. one whose
`${ placeholder }` name was translated, which breaks interpolation — clear its `msgstr` first.) Translations made this way are a best effort, as stated
in the README's disclaimer.

`scripts/ai-translate.ts` moves strings in and out of the PO files and rejects anything structurally
broken. The translating and the review are done by an LLM (e.g. Claude agents) following the
instructions in this file.

## Workflow

```bash
npm run translate                       # extract new strings into every .po file
npm run ai-translate -- export          # untranslated entries → .ai-translate/<lang>/chunk-NN.json
# translate: an agent per language writes chunk-NN.out.json (see "Translator instructions")
npm run ai-translate -- import          # validate + fill the PO files, write qa-NN.json
# review: an agent per language writes qa-NN.out.json with corrections (see "Reviewer instructions")
npm run ai-translate -- import-qa       # apply the corrections
npm run translate                       # regenerate the .po.json files
npm run ai-translate -- validate        # msgfmt + structural check of every catalogue
```

`validate` needs GNU gettext's `msgfmt` on the `PATH` (`brew install gettext`, `apt install gettext`).

Every command takes `--langs sl,de` to limit the languages and `--out <dir>` for the work directory
(default `.ai-translate/`, git-ignored). `npm run ai-translate -- check <file>` validates a single
`chunk-NN.out.json` or `qa-NN.out.json` and is meant to be run by the translator itself.

For a language with no human translations, translate `chunk-00` first (it holds the short UI labels),
import it, and re-run `export` so `glossary.json` carries those terms into the remaining chunks — or
let the first translator write a `terms.json` that the others read, as described below.

The review step (`qa-NN` / `import-qa`) is recommended for bulk runs such as adding a language; for
the incremental case — a few new or changed strings after a feature — it can be skipped.

Afterwards, upload the changed `.po` files to POEditor so it stays the single source of truth.

## Translator instructions

You translate UI strings of **Copernicus Browser**, a web application of the Copernicus Data Space
Ecosystem for searching, visualising, comparing and downloading Earth-observation satellite imagery
(Sentinel missions, Copernicus Land Monitoring Service products, etc.).

### Input

`chunk-NN.json`:

```json
{
  "lang": "sl",
  "language": "Slovenian",
  "nplurals": 4,
  "pluralForms": "nplurals=4; plural=(...);",
  "entries": [{ "id": 136, "msgid": "Generate" }, { "id": 900, "msgid": "${ n } pin", "msgid_plural": "${ n } pins" }]
}
```

Also read, when present in the language directory:

- `glossary.json` — existing human translations of short strings. **Follow their terminology.**
- `terms.json` — terminology chosen by the translator of an earlier part of the same language. Follow it.

### Output

Write `chunk-NN.out.json` next to the chunk — a JSON object mapping each id (as a string) to an
array of translated forms:

```json
{ "136": ["Ustvari"], "900": ["${ n } oznaka", "${ n } oznaki", "${ n } oznake", "${ n } oznak"] }
```

- Singular entries: exactly **one** form. Plural entries (`msgid_plural` present): exactly
  **`nplurals`** forms, ordered as the `pluralForms` formula numbers them.
- Translate every entry. It must be valid JSON: escape `"` as `\"` and newlines as `\n`.
- Then run `npm run -s ai-translate -- check <path to chunk-NN.out.json>` from the repository root and
  fix every reported problem until it prints `OK`.

### Rules

1. Keep every `${ ... }` placeholder **exactly** as in the source — same variable name, never
   translated — and the same number of times. Reorder them within the sentence if grammar needs it.
2. Keep markdown syntax intact: headings (`#`), lists, `**bold**`, `` `code` ``, line breaks, and
   link targets `[text](target)` unchanged — translate only the link text.
3. Keep HTML tags and their attributes unchanged. Keep leading/trailing spaces and newlines exactly.
4. Do not translate proper names and identifiers: Copernicus, Copernicus Browser, Copernicus Data
   Space Ecosystem, CDSE, Sentinel-1/2/3/5P, Landsat, MODIS, CLMS, openEO, Sentinel Hub, EO Browser,
   band names (B04, VV, ...), index acronyms (NDVI, NDWI, ...), units, file formats, code, URLs, and
   evalscript code. Translate generic words around them.
5. Use the register usual for software UIs in the language (e.g. formal *Sie*/*vous*/*Vi* where the
   language distinguishes it), keep buttons and labels short, and stay consistent with the glossary.
6. Use the established remote-sensing terminology of the language (e.g. "true colour", "false
   colour", "cloud coverage", "time-lapse", "area of interest", "band").
7. Never leave the source text in English unless it is a proper name or identifier.
8. Dataset and product labels (e.g. "FAPAR 300m 10-daily V1 RT0", "LST 5km Hourly V1",
   "Sentinel-2 Quarterly Mosaics") stay in English in every language — they are official product names.
   `export` does not send the ones from the data source handlers' collection maps to you; if one
   still appears (e.g. inside a sentence), keep the label itself unchanged.

## Reviewer instructions

You review AI translations for the same application, as a different model than the translator.
Read `qa-NN.json` (like a chunk, but every entry also has `translation`: the accepted forms) and the
`glossary.json` / `terms.json` of the language.

For each entry check meaning against the source, grammar, terminology consistency, the plural forms,
untranslated English, and the rules above. Write `qa-NN.out.json` with **only the entries you
correct**, in the same `{ "<id>": [forms] }` format (an empty `{}` if nothing needs changing), then
run `npm run -s ai-translate -- check <path to qa-NN.out.json>` until it prints `OK`. Do not rewrite
acceptable translations for style alone.
