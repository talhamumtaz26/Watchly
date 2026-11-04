import {
  clearAllData,
  exportData,
  getWatchLater,
  getWatched,
  importData,
  markEpisodeWatched,
  setStorageUser,
  validateImportedData,
} from '../storage';

beforeEach(() => {
  localStorage.clear();
  setStorageUser('test-user');
});

describe('storage import, export, and account isolation', () => {
  test.each([
    [null, 'Import file must contain a JSON object'],
    [{ watched: [], watchLater: [], totalTime: 0 }, 'episodeTracking has an invalid format'],
    [{ watched: [{}], watchLater: [], totalTime: 0, episodeTracking: {} }, 'watched must be an array of valid movie or TV items'],
    [{ watched: [], watchLater: [], totalTime: -1, episodeTracking: {} }, 'totalTime must be a non-negative number'],
  ])('rejects malformed import data without crashing', (data, message) => {
    expect(() => validateImportedData(data)).toThrow(message);
  });

  test('imports valid data and export includes episode history', () => {
    const data = {
      watched: [{ id: 1, title: 'Movie', media_type: 'movie' }],
      watchLater: [{ id: 2, name: 'Show', media_type: 'tv' }],
      totalTime: 90,
      episodeTracking: { 2: { episodes: { S1E1: { watched: true } }, seasons: {} } },
    };
    importData(data);
    expect(getWatched()).toEqual(data.watched);
    expect(getWatchLater()).toEqual(data.watchLater);
    expect(exportData().episodeTracking).toEqual(data.episodeTracking);
  });

  test('isolates records by active user', () => {
    importData({
      watched: [{ id: 1, title: 'A', media_type: 'movie' }],
      watchLater: [],
      totalTime: 0,
      episodeTracking: {},
    });
    setStorageUser('other-user');
    expect(getWatched()).toEqual([]);
    expect(getWatchLater()).toEqual([]);
    setStorageUser('test-user');
    expect(getWatched()).toHaveLength(1);
  });

  test('clear all removes library and episode history', () => {
    importData({
      watched: [{ id: 1, title: 'Show', media_type: 'tv' }],
      watchLater: [{ id: 2, title: 'Movie', media_type: 'movie' }],
      totalTime: 45,
      episodeTracking: { 1: { episodes: {}, seasons: { 1: { watched: 1 } } } },
    });
    clearAllData();
    expect(getWatched()).toEqual([]);
    expect(getWatchLater()).toEqual([]);
    expect(exportData().episodeTracking).toEqual({});
  });

  test('episode history is written by the normal tracking path', () => {
    markEpisodeWatched(10, 1, 1, 45);
    expect(exportData().episodeTracking[10].episodes.S1E1.watched).toBe(true);
  });
});
