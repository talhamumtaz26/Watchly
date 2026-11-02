const DEFAULT_TV_EPISODE_RUNTIME = 45;
const DEFAULT_TV_EPISODE_COUNT = 10;

export const normalizeMinutes = (value) => {
  const minutes = Number(value);
  return Number.isFinite(minutes) && minutes > 0 ? minutes : 0;
};

export const getItemRuntime = (item) => {
  const runtime = normalizeMinutes(item.runtime);
  if (runtime > 0) return runtime;

  if (item.media_type === 'tv') {
    const episodeRuntime = normalizeMinutes(item.episode_run_time?.[0]) || DEFAULT_TV_EPISODE_RUNTIME;
    const episodeCount = normalizeMinutes(item.number_of_episodes)
      || (normalizeMinutes(item.number_of_seasons) * DEFAULT_TV_EPISODE_COUNT)
      || DEFAULT_TV_EPISODE_COUNT;
    return episodeRuntime * episodeCount;
  }

  return 0;
};

export const calculateWatchTimeMinutes = (items = []) => (
  items.reduce((total, item) => total + getItemRuntime(item), 0)
);

export const formatWatchTime = (minutes) => {
  const totalMinutes = Math.floor(normalizeMinutes(minutes));
  const hours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  if (hours === 0) return `${remainingMinutes}m`;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}m`;
};

export const getWatchTimeStats = (items = []) => {
  const totalMinutes = calculateWatchTimeMinutes(items);
  const hours = Math.floor(totalMinutes / 60);

  return {
    totalMinutes,
    hours,
    days: Math.floor(hours / 24),
    remainingHours: hours % 24,
    formatted: formatWatchTime(totalMinutes),
  };
};

export const normalizeDate = (value) => {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value.toDate === 'function') {
    return normalizeDate(value.toDate());
  }

  if (typeof value === 'object' && Number.isFinite(value.seconds)) {
    return normalizeDate(value.seconds * 1000);
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const getItemDate = (item) => (
  normalizeDate(item.watchedDate)
  || normalizeDate(item.watchedAt)
  || normalizeDate(item.addedDate)
);

export const formatItemDate = (item) => {
  const date = getItemDate(item);
  return date ? date.toLocaleDateString() : 'Earlier';
};
