import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import {
  formatWatchTime,
  getWatchTimeStats,
} from './watchStats';
import { getDeletedItems } from './storage';
import { mergeSyncedItems } from './syncMerge';

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

const now = () => new Date().toISOString();

const timestampMillis = (value) => {
  if (!value) return 0;
  if (typeof value === 'string') return Date.parse(value) || 0;
  if (typeof value.toMillis === 'function') return value.toMillis();
  if (value.seconds) return value.seconds * 1000;
  return 0;
};

const isCloudItemVisible = (item) => !item.deleted;

const subscribeToUserDoc = (userId, collectionName, docId, onValue, onError) => {
  const docRef = getUserDoc(userId, collectionName, docId);
  return onSnapshot(
    docRef,
    (snapshot) => onValue(snapshot.exists() ? snapshot.data() : null),
    (error) => {
      console.error(`Error subscribing to ${collectionName} cloud data:`, error);
      onError(error);
    }
  );
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
    return snapshot.docs
      .map((itemDoc) => ({ ...itemDoc.data(), firestoreId: itemDoc.id }))
      .filter(isCloudItemVisible);
  } catch (error) {
    console.error('Error getting watch later from cloud:', error);
    throw error;
  }
};

export const subscribeToWatchLaterCloud = (userId, onItems, onError) => {
  const colRef = getUserCollection(userId, 'watchLater');
  return onSnapshot(
    colRef,
    (snapshot) => {
      onItems(snapshot.docs
        .map((itemDoc) => ({ ...itemDoc.data(), firestoreId: itemDoc.id }))
        .filter(isCloudItemVisible));
    },
    (error) => {
      console.error('Error subscribing to watch later cloud:', error);
      onError(error);
    }
  );
};

export const subscribeToWatchLaterStatusCloud = (userId, id, mediaType, onStatus, onError) => {
  return subscribeToUserDoc(
    userId,
    'watchLater',
    `${mediaType}_${id}`,
    (item) => onStatus(Boolean(item && !item.deleted)),
    onError
  );
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
      updatedAt: now(),
      deleted: false,
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
    await setDoc(docRef, {
      deleted: true,
      deletedAt: now(),
      updatedAt: now(),
    }, { merge: true });
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
    return docSnap.exists() && !docSnap.data().deleted;
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
    return snapshot.docs
      .map((itemDoc) => ({ ...itemDoc.data(), firestoreId: itemDoc.id }))
      .filter(isCloudItemVisible);
  } catch (error) {
    console.error('Error getting watched from cloud:', error);
    throw error;
  }
};

export const subscribeToWatchedCloud = (userId, onItems, onError) => {
  const colRef = getUserCollection(userId, 'watched');
  return onSnapshot(
    colRef,
    (snapshot) => {
      onItems(snapshot.docs.map((itemDoc) => ({ ...itemDoc.data(), firestoreId: itemDoc.id })));
    },
    (error) => {
      console.error('Error subscribing to watched cloud:', error);
      onError(error);
    }
  );
};

export const subscribeToWatchedStatusCloud = (userId, id, mediaType, onStatus, onError) => {
  return subscribeToUserDoc(
    userId,
    'watched',
    `${mediaType}_${id}`,
    (item) => onStatus(Boolean(item && !item.deleted)),
    onError
  );
};

export const subscribeToWatchTimeStatsCloud = (userId, onStats, onError) => {
  return subscribeToUserDoc(
    userId,
    'stats',
    'watchTime',
    (stats) => onStats(stats || { totalMinutes: 0 }),
    onError
  );
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
    const existingDoc = await getDoc(docRef);
    
    await setDoc(docRef, {
      ...item,
      watchedDate: serverTimestamp(),
      updatedAt: now(),
      deleted: false,
    });
    
    // Remove from Watch Later if it exists
    await removeFromWatchLaterCloud(userId, item.id, item.media_type);
    
    // Update total watch time in user stats
    if (!existingDoc.exists() && item.runtime) {
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
    
    await setDoc(docRef, {
      deleted: true,
      deletedAt: now(),
      updatedAt: now(),
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error removing from watched cloud:', error);
    return false;
  }
};

export const updateWatchedRatingCloud = async (userId, id, mediaType, userRating) => {
  try {
    const rating = Number(userRating);
    if (!Number.isFinite(rating) || rating < 1 || rating > 10) return false;
    await setDoc(
      getUserDoc(userId, 'watched', `${mediaType}_${id}`),
      { user_rating: rating, updatedAt: serverTimestamp() },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.error('Error updating watched rating:', error);
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
    return docSnap.exists() && !docSnap.data().deleted;
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
    const watched = await getWatchedCloud(userId);
    const stats = getWatchTimeStats(watched);
    const statsRef = doc(db, 'users', userId, 'stats', 'watchTime');
    await setDoc(statsRef, {
      totalMinutes: stats.totalMinutes,
      lastUpdated: serverTimestamp(),
    });
    return stats;
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
export { formatWatchTime };

/**
 * Sync localStorage data to Firestore
 * @param {string} userId - User ID
 * @param {Object} localData - Local data to sync
 */
export const syncLocalToCloud = async (userId, localData) => {
  const result = {
    uploaded: { watchLater: 0, watched: 0 },
    skipped: { watchLater: 0, watched: 0 },
    failed: [],
  };

  try {
    const [cloudWatchLater, cloudWatched] = await Promise.all([
      getDocs(getUserCollection(userId, 'watchLater')),
      getDocs(getUserCollection(userId, 'watched')),
    ]);
    const cloudRecords = {
      watchLater: new Map(cloudWatchLater.docs.map((itemDoc) => [itemDoc.id, itemDoc.data()])),
      watched: new Map(cloudWatched.docs.map((itemDoc) => [itemDoc.id, itemDoc.data()])),
    };
    const deleted = getDeletedItems();

    const syncCollection = async (items = [], collectionName) => {
      const batch = writeBatch(db);
      let pending = 0;

      items.forEach((item) => {
        const key = `${item.media_type}_${item.id}`;
        const cloudItem = cloudRecords[collectionName].get(key);
        const localTime = timestampMillis(item.updatedAt);
        const cloudTime = timestampMillis(cloudItem?.updatedAt);
        if (cloudItem && cloudTime >= localTime) {
          result.skipped[collectionName]++;
          return;
        }

        const cleanItem = Object.fromEntries(
          Object.entries(item).filter(([, value]) => value !== undefined)
        );
        const docRef = getUserDoc(userId, collectionName, key);
        batch.set(docRef, {
          ...cleanItem,
          ...(collectionName === 'watchLater'
            ? { addedDate: cleanItem.addedDate || serverTimestamp() }
            : { watchedDate: cleanItem.watchedDate || serverTimestamp() }),
          updatedAt: cleanItem.updatedAt || now(),
          deleted: false,
        });
        pending++;
      });

      Object.entries(deleted[collectionName] || {}).forEach(([key, deletedAt]) => {
        const cloudItem = cloudRecords[collectionName].get(key);
        if (cloudItem && timestampMillis(cloudItem.updatedAt) >= timestampMillis(deletedAt)) return;
        batch.set(getUserDoc(userId, collectionName, key), {
          deleted: true,
          deletedAt,
          updatedAt: deletedAt,
        }, { merge: true });
        pending++;
      });

      if (pending === 0) return;
      try {
        await batch.commit();
        result.uploaded[collectionName] = pending;
      } catch (error) {
        result.failed.push(`${collectionName}: ${error.message}`);
      }
    };

    await Promise.all([
      syncCollection(localData.watchLater, 'watchLater'),
      syncCollection(localData.watched, 'watched'),
    ]);

    return result;
  } catch (error) {
    console.error('Error syncing to cloud:', error);
    result.failed.push(`sync: ${error.message}`);
    return result;
  }
};
  
/**  
 * Sync cloud data to localStorage (bidirectional sync) 
 * @param {string} userId - User ID 
 * @returns {Object} - Sync result with counts 
 */ 
export const syncCloudToLocal = async (userId) => { 
  try { 
    const {
      getWatchLater,
      getWatched,
      addToWatchLater: addToWatchLaterLocal,
      addToWatched: addToWatchedLocal,
      removeFromWatchLater: removeFromWatchLaterLocal,
      removeFromWatched: removeFromWatchedLocal,
      recordDeletedItem,
    } = await import('./storage.js');
 
    const [watchLaterSnapshot, watchedSnapshot] = await Promise.all([
      getDocs(getUserCollection(userId, 'watchLater')),
      getDocs(getUserCollection(userId, 'watched')),
    ]);
    const cloudWatchLater = watchLaterSnapshot.docs.map((itemDoc) => ({ ...itemDoc.data(), firestoreId: itemDoc.id }));
    const cloudWatched = watchedSnapshot.docs.map((itemDoc) => ({ ...itemDoc.data(), firestoreId: itemDoc.id }));
    const localWatchLater = getWatchLater(); 
    const localWatched = getWatched(); 
    const deleted = getDeletedItems();
 
    let syncedCounts = { watchLater: 0, watched: 0 };
    const failures = [];
 
    const syncCollection = (
      collectionName,
      localItems,
      cloudItems,
      addLocal,
      removeLocal,
    ) => {
      const mergedItems = mergeSyncedItems(localItems, cloudItems, deleted[collectionName]);
      const mergedKeys = new Set(mergedItems.map((item) => `${item.media_type}_${item.id}`));

      localItems.forEach((localItem) => {
        const key = `${localItem.media_type}_${localItem.id}`;
        if (!mergedKeys.has(key)) {
          const deletion = cloudItems.find((item) => (item.firestoreId || `${item.media_type}_${item.id}`) === key);
          removeLocal(localItem.id, localItem.media_type, false);
          if (deletion) {
            recordDeletedItem(
              collectionName,
              key,
              deleted[collectionName]?.[key] || deletion.deletedAt || deletion.updatedAt
            );
          }
        }
      });

      mergedItems.forEach((mergedItem) => {
        const localItem = localItems.find((item) => `${item.media_type}_${item.id}` === `${mergedItem.media_type}_${mergedItem.id}`);
        if (!localItem || timestampMillis(mergedItem.updatedAt) > timestampMillis(localItem.updatedAt)) {
          addLocal(mergedItem);
          syncedCounts[collectionName]++;
        }
      });
    };

    syncCollection('watchLater', localWatchLater, cloudWatchLater, addToWatchLaterLocal, removeFromWatchLaterLocal);
    syncCollection('watched', localWatched, cloudWatched, addToWatchedLocal, removeFromWatchedLocal);
 
    return { success: failures.length === 0, counts: syncedCounts, failures };
  } catch (error) { 
    console.error('Error syncing cloud to local:', error); 
    return { success: false, counts: { watchLater: 0, watched: 0 }, failures: [error.message] };
  } 
}; 
 
/** 
 * Bidirectional sync: Sync local to cloud AND cloud to local 
 * @param {string} userId - User ID 
 * @param {Object} localData - Local data to sync 
 * @returns {Object} - Sync result 
 */ 
export const syncBidirectional = async (userId, localData) => { 
  try { 
    const uploadResult = await syncLocalToCloud(userId, localData);
    const downloadResult = await syncCloudToLocal(userId);
    const watched = await getWatchedCloud(userId);
    const watchTime = getWatchTimeStats(watched);
    await setDoc(doc(db, 'users', userId, 'stats', 'watchTime'), {
      totalMinutes: watchTime.totalMinutes,
      lastUpdated: serverTimestamp(),
    });
    const failures = [...uploadResult.failed, ...(downloadResult.failures || [])];
    return {
      success: failures.length === 0,
      uploaded: uploadResult.uploaded,
      skipped: uploadResult.skipped,
      downloaded: downloadResult.counts || { watchLater: 0, watched: 0 },
      failures,
    };

  } catch (error) { 
    console.error('Error in bidirectional sync:', error); 
    return {
      success: false,
      uploaded: { watchLater: 0, watched: 0 },
      skipped: { watchLater: 0, watched: 0 },
      downloaded: { watchLater: 0, watched: 0 },
      failures: [error.message],
    };

  } 
};

export const clearCloudData = async (userId) => {
  const [watchLater, watched, progress] = await Promise.all([
    getDocs(getUserCollection(userId, 'watchLater')),
    getDocs(getUserCollection(userId, 'watched')),
    getDocs(getUserCollection(userId, 'tvProgress')),
  ]);
  const batch = writeBatch(db);
  const deletedAt = now();
  [...watchLater.docs, ...watched.docs].forEach((itemDoc) => {
    batch.set(itemDoc.ref, { deleted: true, deletedAt, updatedAt: deletedAt }, { merge: true });
  });
  progress.docs.forEach((progressDoc) => batch.delete(progressDoc.ref));
  batch.delete(getUserDoc(userId, 'stats', 'watchTime'));
  await batch.commit();
};
