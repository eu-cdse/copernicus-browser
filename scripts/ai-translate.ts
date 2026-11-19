// AI-assisted translation workflow for the ttag/gettext catalogues in public/translations.
//
// The translating itself is done outside this script (by an LLM, e.g. Claude); this script only
// moves strings in and out of the PO files and guarantees that nothing structurally broken lands in
// them. It never overwrites a human translation (only empty entries are filled).
//
//   npm run ai-translate -- export [--langs sl,de] [--out .ai-translate]
//       Writes, per language, the untranslated entries as JSON chunks (`chunk-NN.json`) plus a
//       `glossary.json` of existing short translations to keep terminology consistent. Short UI
//       labels go first (chunk 00, ...), so translating those first seeds the glossary for a new
//       language; re-run `export` after importing them to refresh the glossary. Dataset/product labels
//       (e.g. "FAPAR 300m 10-daily V1 RT0") are not exported: they are filled with the English source.
//       The translator writes `chunk-NN.out.json`: { "<id>": ["form 0", "form 1", ...] }.
//
//   npm run ai-translate -- import [--langs sl,de] [--out .ai-translate]
//       Validates every `chunk-NN.out.json` and fills the still-empty PO entries with the valid
//       translations. Rejected ones are listed in `<lang>/rejects.json` and stay untranslated.
//       Also writes `qa-NN.json` files (source + accepted translation) for a review pass.
//
//   npm run ai-translate -- import-qa [--langs sl,de] [--out .ai-translate]
//       Applies corrections from `qa-NN.out.json` ({ "<id>": [forms] }), but only to entries that
//       still hold the AI translation the QA file was built from.
//
//   npm run ai-translate -- check <dir>/<lang>/chunk-NN.out.json
//       Validates one translator output (or `qa-NN.out.json`) against its chunk, so the translator
//       can fix problems before importing. Exits 1 on any problem.
//
//   npm run ai-translate -- validate [--langs sl,de]
//       Runs `msgfmt --check` on the PO files and reports structural problems in translated
//       entries. Exits 1 if msgfmt fails or, with --strict, if any entry is structurally invalid.
//
// After `import`/`import-qa`, run `npm run translate` to regenerate the .po.json files.
import fs from 'fs';
import os from 'os';
import path from 'path';
import { execFileSync } from 'child_process';
import gettextParser from 'gettext-parser';

import { SUPPORTED_LANGUAGES } from '../src/LanguageSelector/const.js';
import { takeFlagValue } from './utils/args';
import { extractDatasetLabels, parseNplurals, validateTranslation } from './utils/po-translation-validation';

const TRANSLATIONS_DIR = path.join(process.cwd(), 'public/translations');
const DATA_SOURCE_HANDLERS_DIR = path.join(process.cwd(), 'src/Tools/SearchPanel/dataSourceHandlers');
const SOURCE_LANG = 'en';
const CHUNK_CHARS = 20000;
const GLOSSARY_SOURCE_MAX_CHARS = 50;
const GLOSSARY_MAX_ENTRIES = 400;
// Must match `--foldLength=76` in scripts/translate.js, otherwise `npm run translate` re-wraps every file.
const FOLD_LENGTH = 76;

const ENGLISH_LANGUAGE_NAMES = new Intl.DisplayNames(['en'], { type: 'language' });

type PoEntry = { msgid: string; msgid_plural?: string; msgstr: string[]; comments?: Record<string, string> };
type PoFile = { headers: Record<string, string>; translations: Record<string, Record<string, PoEntry>> };

type ChunkEntry = { id: number; msgid: string; msgid_plural?: string };
type Chunk = {
  lang: string;
  language: string;
  nplurals: number;
  pluralForms: string;
  entries: ChunkEntry[];
};
type QaEntry = ChunkEntry & { translation: string[] };
type QaChunk = Omit<Chunk, 'entries'> & { entries: QaEntry[] };
type Translations = Record<string, string[]>;

const poPath = (lang: string): string => path.join(TRANSLATIONS_DIR, `${lang}.po`);

const readPo = (lang: string): PoFile => gettextParser.po.parse(fs.readFileSync(poPath(lang)));

const writePo = (lang: string, po: PoFile): void => {
  fs.writeFileSync(poPath(lang), gettextParser.po.compile(po, { foldLength: FOLD_LENGTH }));
};

const readJson = <T>(file: string): T => JSON.parse(fs.readFileSync(file, 'utf8'));

/** Reads a translator-written output file; returns null (and logs) if it is not valid JSON. */
const readOutputFile = (file: string): Translations | null => {
  try {
    return readJson<Translations>(file);
  } catch (e) {
    console.error(`${file}: invalid JSON (${(e as Error).message}), skipping`);
    return null;
  }
};

const writeJson = (file: string, data: unknown): void => {
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
};

const isTranslated = (entry: PoEntry): boolean => entry.msgstr.some((form) => form !== '');

/** Entries of the default (empty) context, without the header entry. */
const entriesOf = (po: PoFile): PoEntry[] =>
  Object.values(po.translations[''] ?? {}).filter((entry) => entry.msgid !== '');

/** Stable numeric ids: the position of each msgid in the English source catalogue. */
/** Dataset/product labels, which stay in English (see extractDatasetLabels). */
const datasetLabels = (): Set<string> =>
  extractDatasetLabels(
    fs
      .readdirSync(DATA_SOURCE_HANDLERS_DIR)
      .filter((f) => /\.(jsx?|tsx?)$/.test(f))
      .map((f) => fs.readFileSync(path.join(DATA_SOURCE_HANDLERS_DIR, f), 'utf8')),
  );

const sourceIds = (): Map<string, number> => {
  const ids = new Map<string, number>();
  entriesOf(readPo(SOURCE_LANG)).forEach((entry, i) => ids.set(entry.msgid, i));
  return ids;
};

const targetLanguages = (requested: string[] | undefined): string[] => {
  const available = SUPPORTED_LANGUAGES.map((l) => l.langCode).filter(
    (code): code is string => typeof code === 'string' && code !== SOURCE_LANG,
  );
  if (!requested) {
    return available;
  }
  const unknown = requested.filter((code) => !available.includes(code));
  if (unknown.length > 0) {
    console.error(`Unknown or unsupported language(s): ${unknown.join(', ')}`);
    process.exit(1);
  }
  return requested;
};

const languageName = (lang: string): string => ENGLISH_LANGUAGE_NAMES.of(lang) ?? lang;

const chunkFiles = (dir: string, prefix: 'chunk' | 'qa'): string[] =>
  fs.existsSync(dir)
    ? fs
        .readdirSync(dir)
        .filter((f) => new RegExp(`^${prefix}-\\d+\\.json$`).test(f))
        .sort()
    : [];

const outFileFor = (chunkFile: string): string => chunkFile.replace(/\.json$/, '.out.json');

const splitByChars = <T>(items: T[], size: (item: T) => number, maxChars: number): T[][] => {
  const chunks: T[][] = [];
  let current: T[] = [];
  let currentChars = 0;
  for (const item of items) {
    if (current.length > 0 && currentChars + size(item) > maxChars) {
      chunks.push(current);
      current = [];
      currentChars = 0;
    }
    current.push(item);
    currentChars += size(item);
  }
  if (current.length > 0) {
    chunks.push(current);
  }
  return chunks;
};

const exportLanguage = (
  lang: string,
  outDir: string,
  ids: Map<string, number>,
  keepEnglish: Set<string>,
): void => {
  const po = readPo(lang);
  const pluralForms = po.headers['Plural-Forms'] ?? '';
  const nplurals = parseNplurals(pluralForms);
  const entries = entriesOf(po);

  const toChunkEntry = (entry: PoEntry): ChunkEntry => {
    const id = ids.get(entry.msgid);
    if (id === undefined) {
      throw new Error(
        `${lang}: "${entry.msgid.slice(0, 60)}" is not in ${SOURCE_LANG}.po — run \`npm run translate\` first`,
      );
    }
    return {
      id,
      msgid: entry.msgid,
      ...(entry.msgid_plural ? { msgid_plural: entry.msgid_plural } : {}),
    };
  };
  // Dataset labels are not sent to the translator: they get the English source as their translation.
  const labels = entries.filter(
    (entry) => !isTranslated(entry) && keepEnglish.has(entry.msgid) && !entry.msgid_plural,
  );
  labels.forEach((entry) => {
    entry.msgstr = [entry.msgid];
  });
  if (labels.length > 0) {
    writePo(lang, po);
  }
  const untranslated = entries.filter((entry) => !isTranslated(entry)).map(toChunkEntry);
  const isShort = (entry: ChunkEntry): boolean =>
    !entry.msgid_plural && entry.msgid.length <= GLOSSARY_SOURCE_MAX_CHARS;
  const ordered = [...untranslated.filter(isShort), ...untranslated.filter((e) => !isShort(e))];

  const glossary = entries
    .filter((entry) => isTranslated(entry) && !entry.msgid_plural)
    .filter((entry) => entry.msgid.length <= GLOSSARY_SOURCE_MAX_CHARS)
    .slice(0, GLOSSARY_MAX_ENTRIES)
    .map((entry) => ({ source: entry.msgid, translation: entry.msgstr[0] }));

  const langDir = path.join(outDir, lang);
  fs.mkdirSync(langDir, { recursive: true });
  for (const stale of chunkFiles(langDir, 'chunk')) {
    if (!fs.existsSync(path.join(langDir, outFileFor(stale)))) {
      fs.unlinkSync(path.join(langDir, stale));
    }
  }
  const firstIndex =
    Math.max(-1, ...chunkFiles(langDir, 'chunk').map((f) => parseInt(f.match(/\d+/)?.[0] ?? '-1', 10))) + 1;

  const chunks = splitByChars(ordered, (e) => e.msgid.length + (e.msgid_plural?.length ?? 0), CHUNK_CHARS);
  chunks.forEach((chunkEntries, i) => {
    const chunk: Chunk = { lang, language: languageName(lang), nplurals, pluralForms, entries: chunkEntries };
    writeJson(path.join(langDir, `chunk-${String(firstIndex + i).padStart(2, '0')}.json`), chunk);
  });
  writeJson(path.join(langDir, 'glossary.json'), glossary);

  console.log(
    `${lang}: ${untranslated.length} untranslated → ${chunks.length} chunk(s), glossary ${glossary.length}` +
      (labels.length > 0 ? `, ${labels.length} dataset label(s) kept in English` : ''),
  );
};

/** Validates each translation of a chunk; returns per-id errors (unknown ids included). */
const validateAgainstChunk = (
  chunk: Pick<Chunk, 'entries'>,
  translations: Translations,
  nplurals: number,
): { byId: Map<string, ChunkEntry>; errorsById: Record<string, string[]> } => {
  const byId = new Map(chunk.entries.map((entry) => [String(entry.id), entry]));
  const errorsById: Record<string, string[]> = {};
  for (const [id, msgstr] of Object.entries(translations)) {
    const entry = byId.get(id);
    const errors = entry ? validateTranslation(entry, msgstr, nplurals) : ['unknown id for this chunk'];
    if (errors.length > 0) {
      errorsById[id] = errors;
    }
  }
  return { byId, errorsById };
};

/** Writes valid translations into empty entries; returns rejected ids with their errors. */
const applyTranslations = (
  po: PoFile,
  chunk: Chunk,
  translations: Translations,
  canWrite: (entry: PoEntry, chunkEntry: ChunkEntry) => boolean,
): { applied: ChunkEntry[]; rejects: Record<string, string[]> } => {
  const { byId, errorsById: rejects } = validateAgainstChunk(
    chunk,
    translations,
    parseNplurals(po.headers['Plural-Forms']),
  );
  const applied: ChunkEntry[] = [];

  for (const [id, msgstr] of Object.entries(translations)) {
    const chunkEntry = byId.get(id);
    const poEntry = chunkEntry ? po.translations[''][chunkEntry.msgid] : undefined;
    if (id in rejects || !chunkEntry) {
      continue;
    }
    if (!poEntry) {
      rejects[id] = ['msgid no longer in the catalogue'];
      continue;
    }
    if (canWrite(poEntry, chunkEntry)) {
      poEntry.msgstr = msgstr;
      applied.push(chunkEntry);
    }
  }

  return { applied, rejects };
};

const importLanguage = (lang: string, outDir: string): void => {
  const langDir = path.join(outDir, lang);
  const po = readPo(lang);
  const allRejects: Record<string, { msgid: string; errors: string[] }> = {};
  let appliedCount = 0;
  let missingCount = 0;

  for (const file of chunkFiles(langDir, 'chunk')) {
    const chunk = readJson<Chunk>(path.join(langDir, file));
    const outFile = path.join(langDir, outFileFor(file));
    if (!fs.existsSync(outFile)) {
      console.warn(`${lang}: ${outFileFor(file)} missing, skipping`);
      missingCount += chunk.entries.length;
      continue;
    }
    const translations = readOutputFile(outFile);
    if (!translations) {
      missingCount += chunk.entries.length;
      continue;
    }
    const { applied, rejects } = applyTranslations(po, chunk, translations, (entry) => !isTranslated(entry));
    appliedCount += applied.length;
    missingCount += chunk.entries.filter((e) => !(String(e.id) in translations)).length;
    for (const [id, errors] of Object.entries(rejects)) {
      allRejects[id] = { msgid: chunk.entries.find((e) => String(e.id) === id)?.msgid ?? '', errors };
    }

    const qaEntries: QaEntry[] = chunk.entries
      .filter((entry) => String(entry.id) in translations && !(String(entry.id) in rejects))
      .map((entry) => ({ ...entry, translation: translations[String(entry.id)] }));
    writeJson(path.join(langDir, file.replace(/^chunk-/, 'qa-')), { ...chunk, entries: qaEntries });
  }

  writePo(lang, po);
  writeJson(path.join(langDir, 'rejects.json'), allRejects);
  console.log(
    `${lang}: applied ${appliedCount}, rejected ${Object.keys(allRejects).length}, not translated ${missingCount}`,
  );
};

const importQaLanguage = (lang: string, outDir: string): void => {
  const langDir = path.join(outDir, lang);
  const po = readPo(lang);
  let appliedCount = 0;
  let rejectedCount = 0;

  for (const file of chunkFiles(langDir, 'qa')) {
    const outFile = path.join(langDir, outFileFor(file));
    if (!fs.existsSync(outFile)) {
      continue;
    }
    const corrections = readOutputFile(outFile);
    if (!corrections) {
      continue;
    }
    const qa = readJson<QaChunk>(path.join(langDir, file));
    const aiTranslation = new Map(qa.entries.map((entry) => [entry.msgid, entry.translation]));
    const { applied, rejects } = applyTranslations(
      po,
      qa,
      corrections,
      (entry) => JSON.stringify(entry.msgstr) === JSON.stringify(aiTranslation.get(entry.msgid)),
    );
    appliedCount += applied.length;
    rejectedCount += Object.keys(rejects).length;
    if (Object.keys(rejects).length > 0) {
      writeJson(path.join(langDir, file.replace(/\.json$/, '.rejects.json')), rejects);
    }
  }

  writePo(lang, po);
  console.log(`${lang}: QA corrections applied ${appliedCount}, rejected ${rejectedCount}`);
};

/** Checks one translator output file against its chunk; exits 1 if anything is invalid. */
const checkOutputFile = (outFile: string): void => {
  const chunkFile = outFile.replace(/\.out\.json$/, '.json');
  const chunk = readJson<Chunk>(chunkFile);
  const translations = readOutputFile(outFile);
  if (!translations) {
    process.exit(1);
  }
  const { errorsById } = validateAgainstChunk(chunk, translations, chunk.nplurals);
  const problems = Object.entries(errorsById).flatMap(([id, errors]) =>
    errors.map((error) => `${id}: ${error}`),
  );
  const missing = chunk.entries.filter((entry) => !(String(entry.id) in translations)).map((e) => e.id);
  if (missing.length > 0 && !path.basename(chunkFile).startsWith('qa-')) {
    problems.push(`missing ids: ${missing.join(', ')}`);
  }
  problems.forEach((problem) => console.error(problem));
  console.log(problems.length === 0 ? 'OK' : `${problems.length} problem(s)`);
  process.exit(problems.length === 0 ? 0 : 1);
};

const validateLanguage = (lang: string): { msgfmtOk: boolean; invalid: number } => {
  let msgfmtOk = true;
  try {
    execFileSync('msgfmt', ['--check-format', '--check-domain', '-o', os.devNull, poPath(lang)], {
      stdio: ['ignore', 'ignore', 'pipe'],
    });
  } catch (e) {
    msgfmtOk = false;
    console.error(`${lang}: msgfmt failed\n${(e as { stderr?: Buffer }).stderr?.toString() ?? e}`);
  }

  const po = readPo(lang);
  const nplurals = parseNplurals(po.headers['Plural-Forms']);
  const translated = entriesOf(po).filter(isTranslated);
  const invalid = translated.filter((entry) => {
    const errors = validateTranslation(entry, entry.msgstr, nplurals);
    if (errors.length > 0) {
      console.warn(`${lang}: ${JSON.stringify(entry.msgid.slice(0, 80))}: ${errors.join('; ')}`);
    }
    return errors.length > 0;
  }).length;
  const total = entriesOf(po).length;
  console.log(`${lang}: ${translated.length}/${total} translated, ${invalid} structurally invalid`);

  return { msgfmtOk, invalid };
};

const main = (): void => {
  const [command, ...argv] = process.argv.slice(2);
  if (command === 'check') {
    checkOutputFile(path.resolve(takeFlagValue(argv, 0, 'check')));
    return;
  }
  let langs: string[] | undefined;
  let outDir = path.join(process.cwd(), '.ai-translate');
  let strict = false;

  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--langs') {
      langs = takeFlagValue(argv, ++i, '--langs').split(',');
    } else if (argv[i] === '--out') {
      outDir = path.resolve(takeFlagValue(argv, ++i, '--out'));
    } else if (argv[i] === '--strict') {
      strict = true;
    } else {
      console.error(`Unknown argument: ${argv[i]}`);
      process.exit(1);
    }
  }

  const languages = targetLanguages(langs);

  if (command === 'export') {
    const ids = sourceIds();
    const keepEnglish = datasetLabels();
    languages.forEach((lang) => exportLanguage(lang, outDir, ids, keepEnglish));
  } else if (command === 'import') {
    languages.forEach((lang) => importLanguage(lang, outDir));
  } else if (command === 'import-qa') {
    languages.forEach((lang) => importQaLanguage(lang, outDir));
  } else if (command === 'validate') {
    const results = languages.map(validateLanguage);
    const failed = results.some((r) => !r.msgfmtOk || (strict && r.invalid > 0));
    process.exit(failed ? 1 : 0);
  } else {
    console.error(
      'Usage: ai-translate <export|import|import-qa|validate> [--langs xx,yy] [--out dir] [--strict] | check <file>',
    );
    process.exit(1);
  }
};

main();
