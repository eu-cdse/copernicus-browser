// Structural checks for a machine (AI) translation of one gettext entry. They do not judge the
// wording; they reject a translation that would break at runtime or render wrongly: a lost or
// renamed `${ var }` placeholder (ttag interpolates it), a changed link target, unbalanced HTML,
// whitespace the UI relies on, or the wrong number of plural forms for the target language.

export type TranslationEntry = {
  msgid: string;
  msgid_plural?: string;
};

const PLACEHOLDER_RE = /\$\{\s*[^}]*?\s*\}/g;
const MARKDOWN_LINK_TARGET_RE = /\]\(([^)]+)\)/g;
// Markdown image alt text is used as a lookup key (e.g. src/Tutorial/TutorialIcons.tsx), so it must stay as in the source.
const MARKDOWN_IMAGE_RE = /!\[([^\]]*)\]\(/g;
const URL_RE = /https?:\/\/[^\s)\]>"'`]+/g;
const HTML_TAG_RE = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g;

const normalisePlaceholder = (placeholder: string): string => placeholder.replace(/\s+/g, '');

const collect = (text: string, re: RegExp, group = 0): string[] =>
  Array.from(text.matchAll(re), (m) => m[group]).sort();

const sameMultiset = (a: string[], b: string[]): boolean =>
  a.length === b.length && a.every((value, i) => value === b[i]);

export const extractPlaceholders = (text: string): string[] =>
  collect(text, PLACEHOLDER_RE).map(normalisePlaceholder).sort();

export const extractLinkTargets = (text: string): string[] =>
  collect(text, MARKDOWN_LINK_TARGET_RE, 1).map(normalisePlaceholder).sort();

export const extractImageAlts = (text: string): string[] => collect(text, MARKDOWN_IMAGE_RE, 1);

export const extractUrls = (text: string): string[] => collect(text, URL_RE);

export const extractHtmlTags = (text: string): string[] =>
  Array.from(
    text.matchAll(HTML_TAG_RE),
    (m) => `${m[0].startsWith('</') ? '/' : ''}${m[1].toLowerCase()}`,
  ).sort();

// Soft hyphen and zero-width characters: invisible, but break search and copy-paste.
const INVISIBLE_CHAR_RE = /[\u00AD\u200B-\u200D\u2060\uFEFF]/;

const leadingWhitespace = (text: string): string => text.match(/^\s*/)?.[0] ?? '';
const trailingWhitespace = (text: string): string => text.match(/\s*$/)?.[0] ?? '';

/** Parses `nplurals` out of a PO `Plural-Forms` header value; defaults to 2 when absent. */
export const parseNplurals = (pluralFormsHeader: string | undefined): number => {
  const match = pluralFormsHeader?.match(/nplurals\s*=\s*(\d+)/);
  return match ? parseInt(match[1], 10) : 2;
};

/** Compares one translated string against the source string it translates. */
export const validateTranslatedString = (source: string, translation: string): string[] => {
  const errors: string[] = [];

  if (translation.trim() === '') {
    errors.push('translation is empty');
    return errors;
  }
  if (!sameMultiset(extractPlaceholders(source), extractPlaceholders(translation))) {
    errors.push(
      `placeholders differ: expected [${extractPlaceholders(source).join(', ')}], got [${extractPlaceholders(
        translation,
      ).join(', ')}]`,
    );
  }
  if (!sameMultiset(extractLinkTargets(source), extractLinkTargets(translation))) {
    errors.push('markdown link targets differ');
  }
  if (!sameMultiset(extractImageAlts(source), extractImageAlts(translation))) {
    errors.push('markdown image alt texts differ (they are lookup keys)');
  }
  if (!sameMultiset(extractUrls(source), extractUrls(translation))) {
    errors.push('URLs differ');
  }
  if (!sameMultiset(extractHtmlTags(source), extractHtmlTags(translation))) {
    errors.push('HTML tags differ');
  }
  if (INVISIBLE_CHAR_RE.test(translation) && !INVISIBLE_CHAR_RE.test(source)) {
    errors.push('contains invisible characters (soft hyphen / zero-width)');
  }
  if (leadingWhitespace(source) !== leadingWhitespace(translation)) {
    errors.push('leading whitespace differs');
  }
  if (trailingWhitespace(source) !== trailingWhitespace(translation)) {
    errors.push('trailing whitespace differs');
  }

  return errors;
};

/**
 * Validates every form of a translated entry. Singular entries must have exactly one form;
 * plural entries must have `nplurals` forms, each checked against the plural source (which carries
 * the same placeholders as the singular one).
 */
export const validateTranslation = (
  entry: TranslationEntry,
  msgstr: string[],
  nplurals: number,
): string[] => {
  const expectedForms = entry.msgid_plural ? nplurals : 1;

  if (!Array.isArray(msgstr) || msgstr.some((form) => typeof form !== 'string')) {
    return ['translation must be an array of strings'];
  }
  if (msgstr.length !== expectedForms) {
    return [`expected ${expectedForms} form(s), got ${msgstr.length}`];
  }

  return msgstr.flatMap((form, i) => {
    const source = entry.msgid_plural && i > 0 ? entry.msgid_plural : entry.msgid;
    return validateTranslatedString(source, form).map((error) =>
      expectedForms > 1 ? `form ${i}: ${error}` : error,
    );
  });
};

// Dataset / product labels (e.g. "FAPAR 300m 10-daily V1 RT0", "Sentinel-2 Quarterly Mosaics") are
// official product names and stay in English in every language. They are the `t\`…\`` values of the
// collection-id maps in the data source handlers: `[SOME_COLLECTION_ID]: t\`Label\``.
const DATASET_LABEL_RE = /^\s*\[[A-Z0-9_]+\]: t`([^`$]+)`/gm;
// Generic UI words that happen to live in those maps and are translated normally.
const NON_DATASET_LABELS = new Set(['Cloud', 'Disabled', 'Other']);
// Descriptive gas names (Sentinel-5P) contain a translatable explanation in parentheses.
const DESCRIPTIVE_LABEL_RE = /^[A-Z0-9 ]+ \([A-Z][a-z]+( [A-Za-z][a-z]+)*\)$/;

/** Extracts the dataset labels (kept untranslated) from the sources of the data source handlers. */
export const extractDatasetLabels = (sources: string[]): Set<string> => {
  const labels = new Set<string>();
  for (const source of sources) {
    for (const match of source.matchAll(DATASET_LABEL_RE)) {
      const label = match[1];
      if (!NON_DATASET_LABELS.has(label) && !DESCRIPTIVE_LABEL_RE.test(label)) {
        labels.add(label);
      }
    }
  }
  return labels;
};
