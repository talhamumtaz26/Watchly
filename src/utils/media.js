const hasAnimationGenre = (item) => (
  item.genre_ids?.includes(16)
  || item.genres?.some((genre) => genre.id === 16)
);

const hasJapaneseOrigin = (item) => (
  item.original_language === 'ja'
  || item.origin_country?.includes('JP')
);

const hasAnimeMetadata = (item) => (
  hasAnimationGenre(item) && hasJapaneseOrigin(item)
);

export const hasSavedItemClassificationMetadata = (item = {}) => (
  item.media_type !== 'tv'
  || (
    (Array.isArray(item.genre_ids) || Array.isArray(item.genres))
    && (item.original_language !== undefined || Array.isArray(item.origin_country))
  )
);

export const isAnimeItem = (item, sourceHint) => (
  getMediaType(item, sourceHint) === 'tv'
  && hasAnimeMetadata(item)
);

export const getMediaType = (item = {}, sourceHint) => {
  if (sourceHint === 'movie') return 'movie';
  if (sourceHint === 'tv') return 'tv';
  if (item.media_type === 'movie') return 'movie';
  if (item.media_type === 'tv' || item.media_type === 'anime') return 'tv';
  if (item.media_type === 'person') return 'person';
  if (item.title && !item.name) return 'movie';
  if (item.name && !item.title) return 'tv';
  return 'tv';
};

export const getMediaTypeLabel = (item, sourceHint) => {
  if (isAnimeItem(item, sourceHint)) return 'Anime';
  return getMediaType(item, sourceHint) === 'movie' ? 'Movie' : 'Series';
};

export const normalizeSavedItem = (item = {}) => {
  if (item.media_type === 'movie') return { ...item, media_type: 'movie' };
  if (item.media_type === 'tv' && hasAnimeMetadata(item)) {
    return { ...item, media_type: 'anime' };
  }
  return { ...item };
};

export const getSavedItemType = (item = {}) => {
  const normalized = normalizeSavedItem(item);
  if (normalized.media_type === 'anime') return 'anime';
  if (normalized.media_type === 'movie') return 'movie';
  return normalized.media_type;
};

export const getSavedMediaTypeImpact = (items = []) => items.filter((item) => {
  const inferredType = item.title && !item.name
    ? 'movie'
    : item.name && !item.title
      ? 'tv'
      : null;
  return !['movie', 'tv'].includes(item.media_type)
    || (inferredType && inferredType !== item.media_type);
}).length;
