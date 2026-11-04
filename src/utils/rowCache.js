const CACHE_PREFIX = 'watchly_row_cache_v1_';
const CACHE_VERSION = 1;
const MAX_CACHE_BYTES = 250000;

export const isNetworkError = (error) => (
  !navigator.onLine
  || error?.code === 'ERR_NETWORK'
  || error?.code === 'ECONNABORTED'
  || error?.message?.toLowerCase().includes('network')
);

const getByteLength = (value) => new Blob([value]).size;

const getCacheKeys = () => {
  try {
    return Object.keys(localStorage).filter((key) => key.startsWith(CACHE_PREFIX));
  } catch (error) {
    console.error('Unable to inspect row cache:', error);
    return [];
  }
};

const trimCache = () => {
  const entries = getCacheKeys()
    .map((key) => {
      try {
        const value = JSON.parse(localStorage.getItem(key));
        return { key, timestamp: value?.timestamp || 0, size: getByteLength(localStorage.getItem(key) || '') };
      } catch (error) {
        console.error('Unable to inspect cached row:', error);
        return null;
      }
    })
    .filter(Boolean)
    .sort((a, b) => a.timestamp - b.timestamp);

  let total = entries.reduce((sum, entry) => sum + entry.size, 0);
  while (total > MAX_CACHE_BYTES && entries.length > 0) {
    const oldest = entries.shift();
    try {
      localStorage.removeItem(oldest.key);
      total -= oldest.size;
    } catch (error) {
      console.error('Unable to trim row cache:', error);
      break;
    }
  }
};

const compactItem = (item) => {
  const compact = {
    id: item.id,
    title: item.title,
    name: item.name,
    poster_path: item.poster_path,
    vote_average: item.vote_average,
    release_date: item.release_date,
    first_air_date: item.first_air_date,
    media_type: item.media_type,
  };
  if (item.isAnime) compact.isAnime = true;
  return Object.fromEntries(Object.entries(compact).filter(([, value]) => value !== undefined));
};

export const readRowCache = (key) => {
  try {
    const value = JSON.parse(localStorage.getItem(`${CACHE_PREFIX}${key}`));
    if (!value || value.version !== CACHE_VERSION || !Array.isArray(value.items)) return null;
    return value;
  } catch (error) {
    console.error(`Unable to read row cache (${key}):`, error);
    return null;
  }
};

export const writeRowCache = (key, items) => {
  const value = JSON.stringify({
    version: CACHE_VERSION,
    timestamp: Date.now(),
    items: items.map(compactItem),
  });
  try {
    localStorage.setItem(`${CACHE_PREFIX}${key}`, value);
    trimCache();
  } catch (error) {
    console.error(`Unable to write row cache (${key}):`, error);
  }
};
