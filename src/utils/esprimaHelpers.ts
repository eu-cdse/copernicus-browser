import { parseScript } from 'esprima';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AstNode = any;

// Tries to parse the evalscript as a complete script. If parsing fails (e.g. because the script
// is truncated), up to 5 closing braces are appended one at a time until it succeeds.
export function tryParseScript(code: string, range = false): AstNode | null {
  for (let closingBraces = 0; closingBraces <= 5; closingBraces++) {
    try {
      return parseScript(code + '\n}'.repeat(closingBraces), range ? { range: true } : undefined);
    } catch {
      continue;
    }
  }
  return null;
}
