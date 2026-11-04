import {
  calculateWatchTimeMinutes,
  formatWatchTime,
  getWatchTimeStats,
} from '../watchStats';
import { getWatchTimeStats as getStorageWatchTimeStats } from '../storage';

describe('watch-time calculations', () => {
  test.each([
    [0, '0m'],
    [7, '7m'],
    [120, '2h'],
    [150, '2h 30m'],
    [24 * 60, '24h'],
    [1000000, '16666h 40m'],
  ])('formats %s minutes', (minutes, expected) => {
    expect(formatWatchTime(minutes)).toBe(expected);
  });

  test('calculates totals and day statistics', () => {
    const items = [
      { media_type: 'movie', runtime: 90 },
      { media_type: 'tv', episode_run_time: [30], number_of_episodes: 3 },
    ];
    expect(calculateWatchTimeMinutes(items)).toBe(180);
    expect(getWatchTimeStats(items)).toMatchObject({
      totalMinutes: 180,
      hours: 3,
      days: 0,
      remainingHours: 3,
      formatted: '3h',
    });
  });

  test('storage and dashboard-facing stats use the same implementation', () => {
    expect(getStorageWatchTimeStats()).toEqual(getWatchTimeStats([]));
  });
});
