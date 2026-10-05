import { drainOffsetPages } from './pagination';

describe('drainOffsetPages', () => {
  it('collects all items across multiple pages until an empty page ends it', async () => {
    const fetchPage = jest
      .fn()
      .mockResolvedValueOnce([1, 2])
      .mockResolvedValueOnce([3])
      .mockResolvedValueOnce([]);

    const result = await drainOffsetPages(fetchPage, 10, 'test-label');

    expect(result).toEqual([1, 2, 3]);
  });

  it('does not throw "Maximum call stack size exceeded" for a single very large page', async () => {
    const largePage = new Array(200000).fill(0).map((_, i) => i);
    const fetchPage = jest.fn().mockResolvedValueOnce(largePage).mockResolvedValueOnce([]);

    const result = await drainOffsetPages(fetchPage, 10, 'test-label');

    expect(result).toHaveLength(200000);
  });

  it('advances offset by the number of items actually received, not an assumed page size', async () => {
    const fetchPage = jest
      .fn()
      .mockResolvedValueOnce([1, 2, 3])
      .mockResolvedValueOnce([4])
      .mockResolvedValueOnce([]);

    await drainOffsetPages(fetchPage, 10, 'test-label');

    expect(fetchPage).toHaveBeenNthCalledWith(1, 0);
    expect(fetchPage).toHaveBeenNthCalledWith(2, 3);
    expect(fetchPage).toHaveBeenNthCalledWith(3, 4);
  });

  it('throws a safety-cap error when fetchPage never returns an empty page within maxPages pages', async () => {
    const fetchPage = jest.fn().mockResolvedValue([1]);

    await expect(drainOffsetPages(fetchPage, 3, 'test-label')).rejects.toThrow(
      'test-label: stopped at the 3-page safety cap without an empty page',
    );
  });
});
