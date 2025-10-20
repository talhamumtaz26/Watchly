// LocalStorage keys
const WATCH_LATER_KEY = 'watchly_watch_later';
const WATCHED_KEY = 'watchly_watched';
const TOTAL_TIME_KEY = 'watchly_total_time';
const THEME_KEY = 'watchly_theme';
const EPISODE_TRACKING_KEY = 'watchly_episode_tracking';
const SETTINGS_KEY = 'watchly_settings';

/**
 * Get data from localStorage
 * @param {string} key - Storage key
 * @returns {any} - Parsed data or default value
 */
const getFromStorage = (key, defaultValue = []) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return defaultValue;
  }
};

/**
 * Save data to localStorage
 * @param {string} key - Storage key
 * @param {any} value - Data to save
 */
const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error);
  }
};

// ============ Watch Later Functions ============

/**
 * Get all items from Watch Later list
 */
export const getWatchLater = () => {
  return getFromStorage(WATCH_LATER_KEY, []);
};

/**
 * Add item to Watch Later list
 * @param {Object} item - Media item to add
 */
export const addToWatchLater = (item) => {
  const watchLater = getWatchLater();
  
  // Check if item already exists
  const exists = watchLater.some(
    (existingItem) => existingItem.id === item.id && existingItem.media_type === item.media_type
  );
  
  if (!exists) {
    const newItem = {
      ...item,
      addedDate: new Date().toISOString(),
    };
    watchLater.push(newItem);
    saveToStorage(WATCH_LATER_KEY, watchLater);
    return true;
  }
  return false;
};

/**
 * Remove item from Watch Later list
 * @param {number} id - Item ID
 * @param {string} mediaType - 'movie' or 'tv'
 */
export const removeFromWatchLater = (id, mediaType) => {
  const watchLater = getWatchLater();
  const filtered = watchLater.filter(
    (item) => !(item.id === id && item.media_type === mediaType)
  );
  saveToStorage(WATCH_LATER_KEY, filtered);
};

/**
 * Check if item is in Watch Later list
 * @param {number} id - Item ID
 * @param {string} mediaType - 'movie' or 'tv'
 */
export const isInWatchLater = (id, mediaType) => {
  const watchLater = getWatchLater();
  return watchLater.some(
    (item) => item.id === id && item.media_type === mediaType
  );
};

// ============ Watched Functions ============

/**
 * Get all watched items
 */
export const getWatched = () => {
  return getFromStorage(WATCHED_KEY, []);
};

/**
 * Add item to Watched list
 * @param {Object} item - Media item to add
 */
export const addToWatched = (item) => {
  const watched = getWatched();
  
  // Check if item already exists
  const exists = watched.some(
    (existingItem) => existingItem.id === item.id && existingItem.media_type === item.media_type
  );
  
  if (!exists) {
    const newItem = {
      ...item,
      watchedDate: new Date().toISOString(),
    };
    watched.push(newItem);
    saveToStorage(WATCHED_KEY, watched);
    
    // Update total watch time
    if (item.runtime) {
      updateTotalWatchTime(item.runtime);
    }
    
    // Remove from Watch Later if it exists there
    removeFromWatchLater(item.id, item.media_type);
    
    return true;
  }
  return false;
};

/**
 * Remove item from Watched list
 * @param {number} id - Item ID
 * @param {string} mediaType - 'movie' or 'tv'
 */
export const removeFromWatched = (id, mediaType) => {
  const watched = getWatched();
  const itemToRemove = watched.find(
    (item) => item.id === id && item.media_type === mediaType
  );
  
  if (itemToRemove && itemToRemove.runtime) {
    // Subtract runtime from total time
    updateTotalWatchTime(-itemToRemove.runtime);
  }
  
  // If it's a TV show, also clear all episode tracking data
  if (mediaType === 'tv') {
    const allTracking = getFromStorage(EPISODE_TRACKING_KEY, {});
    if (allTracking[id]) {
      // Calculate total watched episode time to subtract
      const episodes = allTracking[id].episodes || {};
      let totalEpisodeTime = 0;
      Object.values(episodes).forEach((episode) => {
        if (episode.runtime) {
          totalEpisodeTime += episode.runtime;
        }
      });
      
      // Subtract episode watch time
      if (totalEpisodeTime > 0) {
        updateTotalWatchTime(-totalEpisodeTime);
      }
      
      // Remove episode tracking data for this TV show
      delete allTracking[id];
      saveToStorage(EPISODE_TRACKING_KEY, allTracking);
    }
  }
  
  const filtered = watched.filter(
    (item) => !(item.id === id && item.media_type === mediaType)
  );
  saveToStorage(WATCHED_KEY, filtered);
};

/**
 * Check if item is in Watched list
 * @param {number} id - Item ID
 * @param {string} mediaType - 'movie' or 'tv'
 */
export const isWatched = (id, mediaType) => {
  const watched = getWatched();
  return watched.some(
    (item) => item.id === id && item.media_type === mediaType
  );
};

/**
 * Move item from Watch Later to Watched
 * @param {Object} item - Media item to move
 */
export const moveToWatched = (item) => {
  addToWatched(item);
};

// ============ Watch Time Functions ============

/**
 * Get total watch time in minutes
 */
export const getTotalWatchTime = () => {
  return getFromStorage(TOTAL_TIME_KEY, 0);
};

/**
 * Update total watch time
 * @param {number} minutes - Minutes to add (can be negative)
 */
export const updateTotalWatchTime = (minutes) => {
  const currentTime = getTotalWatchTime();
  const newTime = Math.max(0, currentTime + minutes);
  saveToStorage(TOTAL_TIME_KEY, newTime);
};

/**
 * Format minutes to readable format
 * @param {number} minutes - Total minutes
 * @returns {string} - Formatted string (e.g., "2h 30m" or "143 hours")
 */
export const formatWatchTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}m`;
  }
  
  if (mins === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${mins}m`;
};

/**
 * Get watch time stats
 * @returns {Object} - Stats object with hours, days, etc.
 */
export const getWatchTimeStats = () => {
  // Get watched items to verify stats
  const watched = getWatched();
  
  // If no watched items, return zero stats and reset total time
  if (watched.length === 0) {
    saveToStorage(TOTAL_TIME_KEY, 0);
    return {
      totalMinutes: 0,
      hours: 0,
      days: 0,
      remainingHours: 0,
      formatted: '0m',
    };
  }
  
  // Calculate actual total time from watched items to ensure accuracy
  const actualTotalMinutes = watched.reduce((total, item) => {
    return total + (item.runtime || 0);
  }, 0);
  
  // Update stored total time if it's different
  const storedTotalMinutes = getTotalWatchTime();
  if (storedTotalMinutes !== actualTotalMinutes) {
    saveToStorage(TOTAL_TIME_KEY, actualTotalMinutes);
  }
  
  const hours = Math.floor(actualTotalMinutes / 60);
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  
  return {
    totalMinutes: actualTotalMinutes,
    hours,
    days,
    remainingHours,
    formatted: formatWatchTime(actualTotalMinutes),
  };
};

// ============ Theme Functions ============

/**
 * Get current theme
 */
export const getTheme = () => {
  return getFromStorage(THEME_KEY, 'dark');
};

/**
 * Set theme
 * @param {string} theme - 'light' or 'dark'
 */
export const setTheme = (theme) => {
  saveToStorage(THEME_KEY, theme);
};

/**
 * Toggle theme
 * @returns {string} - New theme value
 */
export const toggleTheme = () => {
  const currentTheme = getTheme();
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
  return newTheme;
};

// ============ Settings Functions ============

/**
 * Get app settings
 * @returns {Object} - Settings object
 */
export const getSettings = () => {
  return getFromStorage(SETTINGS_KEY, {
    hideWatchedFromHome: false,
  });
};

/**
 * Update app settings
 * @param {Object} settings - Settings object to save
 */
export const saveSettings = (settings) => {
  saveToStorage(SETTINGS_KEY, settings);
};

/**
 * Get specific setting
 * @param {string} key - Setting key
 * @param {any} defaultValue - Default value if not set
 */
export const getSetting = (key, defaultValue = false) => {
  const settings = getSettings();
  return settings[key] !== undefined ? settings[key] : defaultValue;
};

/**
 * Update specific setting
 * @param {string} key - Setting key
 * @param {any} value - Value to set
 */
export const updateSetting = (key, value) => {
  const settings = getSettings();
  settings[key] = value;
  saveSettings(settings);
};

// ============ Clear All Data ============

/**
 * Clear all app data from localStorage
 */
export const clearAllData = () => {
  localStorage.removeItem(WATCH_LATER_KEY);
  localStorage.removeItem(WATCHED_KEY);
  localStorage.removeItem(TOTAL_TIME_KEY);
  // Don't clear theme preference
};

/**
 * Export all data for backup
 */
export const exportData = () => {
  return {
    watchLater: getWatchLater(),
    watched: getWatched(),
    totalTime: getTotalWatchTime(),
    exportDate: new Date().toISOString(),
  };
};

/**
 * Import data from backup
 * @param {Object} data - Data object to import
 */
export const importData = (data) => {
  if (data.watchLater) saveToStorage(WATCH_LATER_KEY, data.watchLater);
  if (data.watched) saveToStorage(WATCHED_KEY, data.watched);
  if (data.totalTime !== undefined) saveToStorage(TOTAL_TIME_KEY, data.totalTime);
  if (data.episodeTracking) saveToStorage(EPISODE_TRACKING_KEY, data.episodeTracking);
};

// ============ Episode Tracking Functions ============

/**
 * Get episode tracking data for a TV show
 * @param {number} tvId - TV show ID
 */
export const getTVShowProgress = (tvId) => {
  const allTracking = getFromStorage(EPISODE_TRACKING_KEY, {});
  return allTracking[tvId] || { episodes: {}, seasons: {} };
};

/**
 * Mark an episode as watched
 * @param {number} tvId - TV show ID
 * @param {number} seasonNumber - Season number
 * @param {number} episodeNumber - Episode number
 * @param {number} runtime - Episode runtime in minutes
 */
export const markEpisodeWatched = (tvId, seasonNumber, episodeNumber, runtime = 0) => {
  const allTracking = getFromStorage(EPISODE_TRACKING_KEY, {});
  
  if (!allTracking[tvId]) {
    allTracking[tvId] = { episodes: {}, seasons: {} };
  }
  
  const episodeKey = `S${seasonNumber}E${episodeNumber}`;
  allTracking[tvId].episodes[episodeKey] = {
    watched: true,
    watchedDate: new Date().toISOString(),
    runtime,
  };
  
  saveToStorage(EPISODE_TRACKING_KEY, allTracking);
  
  // Update total watch time
  if (runtime > 0) {
    updateTotalWatchTime(runtime);
  }
};

/**
 * Unmark an episode as watched
 * @param {number} tvId - TV show ID
 * @param {number} seasonNumber - Season number
 * @param {number} episodeNumber - Episode number
 */
export const unmarkEpisodeWatched = (tvId, seasonNumber, episodeNumber) => {
  const allTracking = getFromStorage(EPISODE_TRACKING_KEY, {});
  
  if (!allTracking[tvId]) return;
  
  const episodeKey = `S${seasonNumber}E${episodeNumber}`;
  const episode = allTracking[tvId].episodes[episodeKey];
  
  if (episode && episode.runtime) {
    updateTotalWatchTime(-episode.runtime);
  }
  
  delete allTracking[tvId].episodes[episodeKey];
  saveToStorage(EPISODE_TRACKING_KEY, allTracking);
};

/**
 * Check if an episode is watched
 * @param {number} tvId - TV show ID
 * @param {number} seasonNumber - Season number
 * @param {number} episodeNumber - Episode number
 */
export const isEpisodeWatched = (tvId, seasonNumber, episodeNumber) => {
  const progress = getTVShowProgress(tvId);
  const episodeKey = `S${seasonNumber}E${episodeNumber}`;
  return progress.episodes[episodeKey]?.watched || false;
};

/**
 * Get season progress
 * @param {number} tvId - TV show ID
 * @param {number} seasonNumber - Season number
 * @param {number} totalEpisodes - Total episodes in season
 */
export const getSeasonProgress = (tvId, seasonNumber, totalEpisodes) => {
  const progress = getTVShowProgress(tvId);
  let watchedCount = 0;
  
  for (let i = 1; i <= totalEpisodes; i++) {
    const episodeKey = `S${seasonNumber}E${i}`;
    if (progress.episodes[episodeKey]?.watched) {
      watchedCount++;
    }
  }
  
  return {
    watched: watchedCount,
    total: totalEpisodes,
    percentage: totalEpisodes > 0 ? Math.round((watchedCount / totalEpisodes) * 100) : 0,
  };
};

/**
 * Get overall TV show progress
 * @param {number} tvId - TV show ID
 * @param {number} totalEpisodes - Total episodes in the show
 */
export const getTVShowOverallProgress = (tvId, totalEpisodes) => {
  const progress = getTVShowProgress(tvId);
  const watchedCount = Object.keys(progress.episodes).length;
  
  return {
    watched: watchedCount,
    total: totalEpisodes,
    percentage: totalEpisodes > 0 ? Math.round((watchedCount / totalEpisodes) * 100) : 0,
  };
};
