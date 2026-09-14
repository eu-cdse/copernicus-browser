import { JSHINT } from 'jshint';

// evalscript-code-editor lints evalscripts with these exact JSHint options
// (see @sentinel-hub/evalscript-code-editor's CodeEditor implementation).
const JSHINT_OPTIONS = { asi: true, esversion: 6 };

// This only exercises jshint's lodash usage (jshint.js/lex.js/messages.js/scope-manager.js).
// The `minimatch` override is used exclusively by jshint's CLI `--exclude` glob handling
// (src/cli.js), which JSHINT() never reaches, so it has no coverage here.
describe('evalscript CodeEditor JSHint linting (via overridden lodash)', () => {
  it('reports no errors for a valid evalscript', () => {
    const validEvalscript = `
      function setup() {
        return {
          input: ["B04", "B03", "B02"],
          output: { bands: 3 }
        };
      }
      function evaluatePixel(sample) {
        return [sample.B04, sample.B03, sample.B02];
      }
    `;

    JSHINT(validEvalscript, JSHINT_OPTIONS);

    expect(JSHINT.errors).toEqual([]);
  });

  it('reports a syntax error for an invalid evalscript', () => {
    const invalidEvalscript = `
      function setup() {
        return {
          input: ["B04" "B03", "B02"],
          output: { bands: 3 }
        };
      }
    `;

    JSHINT(invalidEvalscript, JSHINT_OPTIONS);

    expect(JSHINT.errors.length).toBeGreaterThan(0);
    expect(JSHINT.errors[0]?.reason).toContain("Expected ']' to match '['");
  });
});
