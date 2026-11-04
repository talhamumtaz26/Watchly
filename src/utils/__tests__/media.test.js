import { getMediaType, getMediaTypeLabel, normalizeSavedItem } from '../media';

describe('media type helper', () => {
  test('keeps animated movie endpoint results as movies', () => {
    const movie = { id: 1, title: 'Animated Movie', genre_ids: [16], original_language: 'ja' };
    expect(getMediaType(movie, 'movie')).toBe('movie');
    expect(getMediaTypeLabel(movie, 'movie')).toBe('Movie');
  });

  test('classifies Japanese animation TV results as anime', () => {
    const anime = { id: 2, name: 'Anime Series', genre_ids: [16], original_language: 'ja' };
    expect(getMediaTypeLabel(anime, 'tv')).toBe('Anime');
  });

  test('classifies normal TV results as TV', () => {
    expect(getMediaType({ id: 3, name: 'Drama', genre_ids: [18] }, 'tv')).toBe('tv');
    expect(getMediaTypeLabel({ id: 3, name: 'Drama', genre_ids: [18] }, 'tv')).toBe('Series');
  });

  test('normalizes saved item types without mutating the source item', () => {
    const movie = { id: 4, title: 'Movie', media_type: 'movie', genre_ids: [16], original_language: 'ja' };
    const anime = { id: 5, name: 'Jujutsu Kaisen', media_type: 'tv', genre_ids: [16], original_language: 'ja' };
    const animatedSeries = { id: 6, name: 'Animated Series', media_type: 'tv', genre_ids: [16], original_language: 'en' };
    const missingMetadata = { id: 7, name: 'Unknown Series', media_type: 'tv' };

    expect(normalizeSavedItem(movie).media_type).toBe('movie');
    expect(normalizeSavedItem(anime).media_type).toBe('anime');
    expect(normalizeSavedItem(animatedSeries).media_type).toBe('tv');
    expect(normalizeSavedItem(missingMetadata)).toEqual(missingMetadata);
    expect(anime.media_type).toBe('tv');
  });
});
