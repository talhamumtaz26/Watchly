export const isAnimeItem = (item) => (
  item.isAnime
  || item.media_type === 'anime'
  || item.genre_ids?.includes(16)
  || item.genres?.some((genre) => genre.id === 16)
);

export const getMediaTypeLabel = (item) => {
  if (isAnimeItem(item)) return 'Anime';
  return item.media_type === 'movie' ? 'Movie' : 'Series';
};
