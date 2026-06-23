import { sanitizeFilenameSegment } from './filename';

describe('sanitizeFilenameSegment', () => {
  describe('falsy inputs', () => {
    it('returns empty string for null', () => {
      expect(sanitizeFilenameSegment(null)).toBe('');
    });

    it('returns empty string for undefined', () => {
      expect(sanitizeFilenameSegment(undefined)).toBe('');
    });

    it('returns empty string for empty string', () => {
      expect(sanitizeFilenameSegment('')).toBe('');
    });
  });

  describe('valid characters are kept unchanged', () => {
    it('keeps alphanumeric characters', () => {
      expect(sanitizeFilenameSegment('abc123ABC')).toBe('abc123ABC');
    });

    it('keeps hyphens', () => {
      expect(sanitizeFilenameSegment('foo-bar')).toBe('foo-bar');
    });

    it('keeps underscores', () => {
      expect(sanitizeFilenameSegment('foo_bar')).toBe('foo_bar');
    });

    it('keeps a mix of alphanumeric, hyphens, and underscores', () => {
      expect(sanitizeFilenameSegment('abc-123_XYZ')).toBe('abc-123_XYZ');
    });
  });

  describe('invalid characters are replaced', () => {
    it('replaces a single space with underscore', () => {
      expect(sanitizeFilenameSegment('a b')).toBe('a_b');
    });

    it('replaces all spaces with underscores', () => {
      expect(sanitizeFilenameSegment('a b c')).toBe('a_b_c');
    });

    it('replaces multiple different invalid chars', () => {
      expect(sanitizeFilenameSegment('a!b@c#d')).toBe('a_b_c_d');
    });

    it('replaces dots and slashes', () => {
      expect(sanitizeFilenameSegment('path/to.file')).toBe('path_to_file');
    });

    it('replaces parentheses', () => {
      expect(sanitizeFilenameSegment('foo(bar)')).toBe('foo_bar_');
    });
  });
});
