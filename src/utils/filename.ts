/**
 * Sanitizes a string for use as a filename segment.
 */
export function sanitizeFilenameSegment(str: string | undefined | null): string {
  if (!str) {
    return '';
  }

  return str.replace(/[^a-zA-Z0-9_-]/g, '_');
}
