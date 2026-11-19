import {
  extractDatasetLabels,
  extractHtmlTags,
  extractLinkTargets,
  extractPlaceholders,
  extractUrls,
  parseNplurals,
  validateTranslatedString,
  validateTranslation,
} from './po-translation-validation';

describe('extractPlaceholders', () => {
  it('normalises whitespace inside ttag placeholders', () => {
    expect(extractPlaceholders('Showing ${ resultsLength } of ${total}')).toEqual([
      '${resultsLength}',
      '${total}',
    ]);
  });
});

describe('extractLinkTargets / extractHtmlTags', () => {
  it('extracts markdown link targets and html tag names', () => {
    expect(extractLinkTargets('See [here](${ link1 }) and [docs](https://x.eu/a)')).toEqual([
      '${link1}',
      'https://x.eu/a',
    ]);
    expect(extractHtmlTags('<b>Bold</b> <br/> <a href="x">y</a>')).toEqual(['/a', '/b', 'a', 'b', 'br']);
  });
});

describe('extractUrls', () => {
  it('extracts bare URLs', () => {
    expect(extractUrls('See https://a.eu/x.pdf, or (http://b.eu).')).toEqual([
      'http://b.eu',
      'https://a.eu/x.pdf,',
    ]);
  });
});

describe('parseNplurals', () => {
  it('reads nplurals from the Plural-Forms header', () => {
    expect(parseNplurals('nplurals=4; plural=(n%100==1 ? 1 : 0);')).toBe(4);
    expect(parseNplurals('nplurals = 3; plural = (n == 1 ? 0 : 1);')).toBe(3);
  });

  it('defaults to 2 when the header is missing', () => {
    expect(parseNplurals(undefined)).toBe(2);
  });
});

describe('validateTranslatedString', () => {
  it('accepts a translation that keeps placeholders, links, tags and edge whitespace', () => {
    expect(
      validateTranslatedString(
        'More info [here](${ link1 }) for <b>${ name }</b> ',
        'Več informacij [tukaj](${link1}) za <b>${ name }</b> ',
      ),
    ).toEqual([]);
  });

  it('rejects empty, renamed placeholders, changed links, tags and whitespace', () => {
    expect(validateTranslatedString('Hello', '  ')).toEqual(['translation is empty']);
    expect(validateTranslatedString('Only ${ supported }', 'Samo ${ podprto }')[0]).toMatch(
      /^placeholders differ/,
    );
    expect(validateTranslatedString('[a](https://a.eu)', '[b](https://b.eu)')).toEqual([
      'markdown link targets differ',
      'URLs differ',
    ]);
    expect(validateTranslatedString('<b>x</b>', 'x')).toEqual(['HTML tags differ']);
    expect(validateTranslatedString('Docs: https://a.eu/v1.1.pdf', 'Doku: https://a.eu/v1.pdf')).toEqual([
      'URLs differ',
    ]);
    expect(validateTranslatedString('not available for ', 'ni na voljo za')).toEqual([
      'trailing whitespace differs',
    ]);
    expect(validateTranslatedString('Line\n', 'Vrstica')).toEqual(['trailing whitespace differs']);
    expect(validateTranslatedString('Click ![Single](icon) now', 'Klikni ![Viena](icon) zdaj')).toEqual([
      'markdown image alt texts differ (they are lookup keys)',
    ]);
    expect(validateTranslatedString('Mouse wheel', 'Maus\u00adrad')).toEqual([
      'contains invisible characters (soft hyphen / zero-width)',
    ]);
  });
});

describe('validateTranslation', () => {
  const plural = {
    msgid: 'Showing ${ n } result',
    msgid_plural: 'Showing ${ n } results',
  };

  it('requires exactly one form for singular entries', () => {
    expect(validateTranslation({ msgid: 'Close' }, ['Zapri'], 4)).toEqual([]);
    expect(validateTranslation({ msgid: 'Close' }, ['Zapri', 'Zapri'], 4)).toEqual([
      'expected 1 form(s), got 2',
    ]);
  });

  it('requires nplurals forms for plural entries and checks each form', () => {
    expect(validateTranslation(plural, ['${ n } a', '${ n } b', '${ n } c'], 3)).toEqual([]);
    expect(validateTranslation(plural, ['${ n } a', '${ n } b'], 3)).toEqual(['expected 3 form(s), got 2']);
    expect(validateTranslation(plural, ['${ n } a', 'b', '${ n } c'], 3)[0]).toMatch(
      /^form 1: placeholders differ/,
    );
  });

  it('rejects non-string forms', () => {
    expect(validateTranslation({ msgid: 'Close' }, [42 as unknown as string], 2)).toEqual([
      'translation must be an array of strings',
    ]);
  });
});

describe('extractDatasetLabels', () => {
  it('collects product labels from collection-id maps, skipping UI words and descriptive gas names', () => {
    const source = [
      'const LABELS = {',
      '  [COPERNICUS_CLMS_FAPAR_300M_10DAILY_RT0]: t`FAPAR 300m 10-daily V1 RT0`,',
      '  [S2_QUARTERLY_MOSAIC]: t`Sentinel-2 Quarterly Mosaics`,',
      '  [S5_CO]: t`CO (Carbon monoxide)`,',
      '  [S5_AER_AI]: t`AER AI (Aerosol Index)`,',
      '  [FILTER_CLOUD]: t`Cloud`,',
      '};',
      'const notAMap = t`FAPAR is a vegetation index`;',
    ].join('\n');

    expect([...extractDatasetLabels([source])]).toEqual([
      'FAPAR 300m 10-daily V1 RT0',
      'Sentinel-2 Quarterly Mosaics',
    ]);
  });
});
