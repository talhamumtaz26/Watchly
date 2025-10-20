import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';

// ============ Firestore Helper Functions ============

/**
 * Get user's collection reference
 * @param {string} userId - User ID
 * @param {string} collectionName - Collection name
 */
const getUserCollection = (userId, collectionName) => {
  return collection(db, 'users', userId, collectionName);
};

/**
 * Get user's document reference
 * @param {string} userId - User ID
 * @param {string} collectionName - Collection name
 * @param {string} docId - Document ID
 */
const getUserDoc = (userId, collectionName, docId) => {
  return doc(db, 'users', userId, collectionName, docId);
};

// ============ Watch Later Functions (Cloud) ============

/**
 * Get all items from Watch Later list (cloud)
 * @param {string} userId - User ID
 */
export const getWatchLaterCloud = async (userId) => {
  try {
    const colRef = getUserCollection(userId, 'watchLater');
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map((doc) => ({ ...doc.data(), firestoreId: doc.id }));
  } catch (error) {
    console.error('Error getting watch later from cloud:', error);
    return [];
  }
};

/**
 * Add item to Watch Later list (cloud)
 * @param {string} userId - User ID
 * @param {Object} item - Media item to add
 */
export const addToWatchLaterCloud = async (userId, item) => {
  try {
    const itemId = `${item.media_type}_${item.id}`;
    const docRef = getUserDoc(userId, 'watchLater', itemId);
    
    await setDoc(docRef, {
      ...item,
      addedDate: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    return true;
  } catch (error) {
    console.error('Error adding to watch later cloud:', error);
    return false;
  }
};

/**
 * Remove item from Watch Later list (cloud)
 * @param {string} userId - User ID
 * @param {number} id - Item ID
 * @param {string} mediaType - 'movie' or 'tv'
 */
export const removeFromWatchLaterCloud = async (userId, id, mediaType) => {
  try {
    const itemId = `${mediaType}_${id}`;
    const docRef = getUserDoc(userId, 'watchLater', itemId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error removing from watch later cloud:', error);
    return false;
  }
};

/**
 * Check if item is in Watch Later list (cloud)
 * @param {string} userId - User ID
 * @param {number} id - Item ID
 * @param {string} mediaType - 'movie' or 'tv'
 */
export const isInWatchLaterCloud = async (userId, id, mediaType) => {
  try {
    const itemId = `${mediaType}_${id}`;
    const docRef = getUserDoc(userId, 'watchLater', itemId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
  } catch (error) {
    console.error('Error checking watch later cloud:', error);
    return false;
  }
};

// ============ Watched Functions (Cloud) ============

/**
 * Get all watched items (cloud)
 * @param {string} userId - User ID
 */
export const getWatchedCloud = async (userId) => {
  try {
    const colRef = getUserCollection(userId, 'watched');
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map((doc) => ({ ...doc.data(), firestoreId: doc.id }));
  } catch (error) {
    console.error('Error getting watched from cloud:', error);
    return [];
  }
};

/**
 * Add item to Watched list (cloud)
 * @param {string} userId - User ID
 * @param {Object} item - Media item to add
 */
export const addToWatchedCloud = async (userId, item) => {
  try {
    const itemId = `${item.media_type}_${item.id}`;
    const docRef = getUserDoc(userId, 'watched', itemId);
    
    await setDoc(docRef, {
      ...item,
      watchedDate: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    // Remove from Watch Later if it exists
    await removeFromWatchLaterCloud(userId, item.id, item.media_type);
    
    // Update total watch time in user stats
    if (item.runtime) {
      await updateUserStats(userId, item.runtime);
    }
    
    return true;
  } catch (error) {
    console.error('Error adding to watched cloud:', error);
    return false;
  }
};

/**
 * Remove item from Watched list (cloud)
 * @param {string} userId - User ID
 * @param {number} id - Item ID
 * @param {string} mediaType - 'movie' or 'tv'
 */
export const removeFromWatchedCloud = async (userId, id, mediaType) => {
  try {
    const itemId = `${mediaType}_${id}`;
    const docRef = getUserDoc(userId, 'watched', itemId);
    
    // Get the item to check runtime
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && docSnap.data().runtime) {
      await updateUserStats(userId, -docSnap.data().runtime);
    }
    
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error removing from watched cloud:', error);
    return false;
  }
};

/**
 * Check if item is in Watched list (cloud)
 * @param {string} userId - User ID
 * @param {number} id - Item ID
 * @param {string} mediaType - 'movie' or 'tv'
 */
export const isWatchedCloud = async (userId, id, mediaType) => {
  try {
    const itemId = `${mediaType}_${id}`;
    const docRef = getUserDoc(userId, 'watched', itemId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
  } catch (error) {
    console.error('Error checking watched cloud:', error);
    return false;
  }
};

// ============ User Stats Functions (Cloud) ============

/**
 * Get user stats (cloud)
 * @param {string} userId - User ID
 */
export const getUserStatsCloud = async (userId) => {
  try {
    const docRef = doc(db, 'users', userId, 'stats', 'watchTime');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      // Initialize stats
      const initialStats = { totalMinutes: 0 };
      await setDoc(docRef, initialStats);
      return initialStats;
    }
  } catch (error) {
    console.error('Error getting user stats:', error);
    return { totalMinutes: 0 };
  }
};

/**
 * Update user stats (cloud)
 * @param {string} userId - User ID
 * @param {number} minutesToAdd - Minutes to add (can be negative)
 */
export const updateUserStats = async (userId, minutesToAdd) => {
  try {
    const docRef = doc(db, 'users', userId, 'stats', 'watchTime');
    const docSnap = await getDoc(docRef);
    
    let currentMinutes = 0;
    if (docSnap.exists()) {
      currentMinutes = docSnap.data().totalMinutes || 0;
    }
    
    const newTotal = Math.max(0, currentMinutes + minutesToAdd);
    
    await setDoc(docRef, {
      totalMinutes: newTotal,
      lastUpdated: serverTimestamp(),
    });
    
    return newTotal;
  } catch (error) {
    console.error('Error updating user stats:', error);
    return 0;
  }
};

/**
 * Get watch time stats (cloud)
 * @param {string} userId - User ID
 */
export const getWatchTimeStatsCloud = async (userId) => {
  try {
    const stats = await getUserStatsCloud(userId);
    const totalMinutes = stats.totalMinutes || 0;
    const hours = Math.floor(totalMinutes / 60);
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    
    return {
      totalMinutes,
      hours,
      days,
      remainingHours,
      formatted: formatWatchTime(totalMinutes),
    };
  } catch (error) {
    console.error('Error getting watch time stats:', error);
    return { totalMinutes: 0, hours: 0, days: 0, remainingHours: 0, formatted: '0m' };
  }
};

// ============ Episode Tracking Functions (Cloud) ============

/**
 * Get episode tracking data for a TV show (cloud)
 * @param {string} userId - User ID
 * @param {number} tvId - TV show ID
 */
export const getTVShowProgressCloud = async (userId, tvId) => {
  try {
    const docRef = doc(db, 'users', userId, 'tvProgress', tvId.toString());
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return { episodes: {}, seasons: {} };
  } catch (error) {
    console.error('Error getting TV show progress:', error);
    return { episodes: {}, seasons: {} };
  }
};

/**
 * Mark an episode as watched (cloud)
 * @param {string} userId - User ID
 * @param {number} tvId - TV show ID
 * @param {number} seasonNumber - Season number
 * @param {number} episodeNumber - Episode number
 * @param {number} runtime - Episode runtime in minutes
 */
export const markEpisodeWatchedCloud = async (userId, tvId, seasonNumber, episodeNumber, runtime = 0) => {
  try {
    const docRef = doc(db, 'users', userId, 'tvProgress', tvId.toString());
    const progress = await getTVShowProgressCloud(userId, tvId);
    
    const episodeKey = `S${seasonNumber}E${episodeNumber}`;
    progress.episodes[episodeKey] = {
      watched: true,
      watchedDate: new Date().toISOString(),
      runtime,
    };
    
    await setDoc(docRef, progress);
    
    // Update total watch time
    if (runtime > 0) {
      await updateUserStats(userId, runtime);
    }
    
    return true;
  } catch (error) {
    console.error('Error marking episode watched:', error);
    return false;
  }
};

/**
 * Unmark an episode as watched (cloud)
 * @param {string} userId - User ID
 * @param {number} tvId - TV show ID
 * @param {number} seasonNumber - Season number
 * @param {number} episodeNumber - Episode number
 */
export const unmarkEpisodeWatchedCloud = async (userId, tvId, seasonNumber, episodeNumber) => {
  try {
    const docRef = doc(db, 'users', userId, 'tvProgress', tvId.toString());
    const progress = await getTVShowProgressCloud(userId, tvId);
    
    const episodeKey = `S${seasonNumber}E${episodeNumber}`;
    const episode = progress.episodes[episodeKey];
    
    if (episode && episode.runtime) {
      await updateUserStats(userId, -episode.runtime);
    }
    
    delete progress.episodes[episodeKey];
    await setDoc(docRef, progress);
    
    return true;
  } catch (error) {
    console.error('Error unmarking episode watched:', error);
    return false;
  }
};

/**
 * Check if an episode is watched (cloud)
 * @param {string} userId - User ID
 * @param {number} tvId - TV show ID
 * @param {number} seasonNumber - Season number
 * @param {number} episodeNumber - Episode number
 */
export const isEpisodeWatchedCloud = async (userId, tvId, seasonNumber, episodeNumber) => {
  const progress = await getTVShowProgressCloud(userId, tvId);
  const episodeKey = `S${seasonNumber}E${episodeNumber}`;
  return progress.episodes[episodeKey]?.watched || false;
};

// ============ Utility Functions ============

/**
 * Format minutes to readable format
 * @param {number} minutes - Total minutes
 * @returns {string} - Formatted string
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
 * Sync localStorage data to Firestore
 * @param {string} userId - User ID
 * @param {Object} localData - Local data to sync
 */
export const syncLocalToCloud = async (userId, localData) => {
  try {
    // Sync Watch Later
    if (localData.watchLater && localData.watchLater.length > 0) {
      for (const item of localData.watchLater) {
        await addToWatchLaterCloud(userId, item);
      }
    }
    
    // Sync Watched
    if (localData.watched && localData.watched.length > 0) {
      for (const item of localData.watched) {
        await addToWatchedCloud(userId, item);
      }
    }
    
    console.log('Data synced to cloud successfully');
    return true;
  } catch (error) {
    console.error('Error syncing to cloud:', error);
    return false;
  }
};
