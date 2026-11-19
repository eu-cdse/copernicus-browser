/* eslint-disable @typescript-eslint/no-require-imports */
describe('evalscriptParsers', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let parsers: any;

  beforeEach(() => {
    jest.resetModules();
    jest.isolateModules(() => {
      parsers = require('./evalscriptParsers');
    });
  });

  afterEach(() => {
    jest.dontMock('esprima');
  });

  it('returns null getters and false flag before loading', () => {
    expect(parsers.getEsprima()).toBeNull();
    expect(parsers.getEscodegen()).toBeNull();
    expect(parsers.areEvalscriptParsersLoaded()).toBe(false);
  });

  it('exposes esprima and escodegen after loading', async () => {
    await parsers.loadEvalscriptParsers();
    expect(typeof parsers.getEsprima().parseScript).toBe('function');
    expect(typeof parsers.getEscodegen().generate).toBe('function');
    expect(parsers.areEvalscriptParsersLoaded()).toBe(true);
  });

  it('returns the same promise for concurrent calls', async () => {
    const p1 = parsers.loadEvalscriptParsers();
    const p2 = parsers.loadEvalscriptParsers();
    expect(p1).toBe(p2);
    await p1;
  });

  it('resets after a failed load so a retry triggers a new import', async () => {
    let attempts = 0;
    jest.resetModules();
    jest.doMock('esprima', () => {
      attempts += 1;
      if (attempts === 1) {
        throw new Error('chunk load failed');
      }
      return jest.requireActual('esprima');
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let isolated: any;
    jest.isolateModules(() => {
      isolated = require('./evalscriptParsers');
    });

    await expect(isolated.loadEvalscriptParsers()).rejects.toThrow('chunk load failed');
    expect(isolated.areEvalscriptParsersLoaded()).toBe(false);

    await isolated.loadEvalscriptParsers();
    expect(attempts).toBe(2);
    expect(isolated.areEvalscriptParsersLoaded()).toBe(true);
  });

  it('requireEsprima/requireEscodegen throw before loading and return the modules after', async () => {
    expect(() => parsers.requireEsprima()).toThrow(parsers.PARSERS_NOT_LOADED_ERROR);
    expect(() => parsers.requireEscodegen()).toThrow(parsers.PARSERS_NOT_LOADED_ERROR);
    await parsers.loadEvalscriptParsers();
    expect(parsers.requireEsprima()).toBe(parsers.getEsprima());
    expect(parsers.requireEscodegen()).toBe(parsers.getEscodegen());
  });
});
