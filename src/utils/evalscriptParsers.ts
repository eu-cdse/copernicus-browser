// esprima and escodegen are only needed when an evalscript is parsed or rewritten, so they are
// loaded on demand (in their own chunk) instead of being part of the main bundle.
// Callers must `await loadEvalscriptParsers()` before parsing; until the modules are loaded the
// sync getters return null and the parse helpers behave as if parsing failed.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ParserModule = any;

let esprima: ParserModule | null = null;
let escodegen: ParserModule | null = null;
let loading: Promise<void> | null = null;

export function loadEvalscriptParsers(): Promise<void> {
  if (!loading) {
    loading = Promise.all([import('esprima'), import('escodegen')]).then(
      ([esprimaModule, escodegenModule]) => {
        esprima = (esprimaModule as ParserModule).default ?? esprimaModule;
        escodegen = (escodegenModule as ParserModule).default ?? escodegenModule;
      },
    );
    // allow a retry if the chunk failed to load (e.g. network error)
    loading.catch(() => {
      loading = null;
    });
  }
  return loading;
}

export function areEvalscriptParsersLoaded(): boolean {
  return esprima !== null && escodegen !== null;
}

export function getEsprima(): ParserModule | null {
  return esprima;
}

export function getEscodegen(): ParserModule | null {
  return escodegen;
}

export const PARSERS_NOT_LOADED_ERROR =
  'Evalscript parsers are not loaded, call loadEvalscriptParsers() first';

// Throwing variants of the getters, for callers that already treat an exception as a parse failure.
export function requireEsprima(): ParserModule {
  if (!esprima) {
    throw new Error(PARSERS_NOT_LOADED_ERROR);
  }
  return esprima;
}

export function requireEscodegen(): ParserModule {
  if (!escodegen) {
    throw new Error(PARSERS_NOT_LOADED_ERROR);
  }
  return escodegen;
}
