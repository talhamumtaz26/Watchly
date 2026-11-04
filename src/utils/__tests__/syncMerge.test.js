import { mergeSyncedItems } from '../syncMerge';

describe('sync merge', () => {
  const item = (id, updatedAt, title = `Item ${id}`) => ({
    id,
    title,
    media_type: 'movie',
    updatedAt,
  });

  test('newer deletion wins and stale copies do not resurrect an item', () => {
    const deletedAt = '2026-01-02T00:00:00.000Z';
    const stale = item(1, '2026-01-01T00:00:00.000Z');
    expect(mergeSyncedItems([stale], [stale], { movie_1: deletedAt })).toEqual([]);
    expect(mergeSyncedItems([], [item(1, '2026-01-01T00:00:00.000Z')], { movie_1: deletedAt })).toEqual([]);
  });

  test('newest update wins per item', () => {
    const local = item(1, '2026-01-01T00:00:00.000Z', 'Local');
    const cloud = item(1, '2026-01-02T00:00:00.000Z', 'Cloud');
    expect(mergeSyncedItems([local], [cloud])).toEqual([cloud]);
    expect(mergeSyncedItems([cloud], [local])).toEqual([cloud]);
  });
});
