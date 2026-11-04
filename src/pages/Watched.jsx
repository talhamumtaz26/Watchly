import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';
import { getWatched, removeFromWatched } from '../utils/storage';
import {
  getWatchedCloud,
  removeFromWatchedCloud,
  subscribeToWatchedCloud,
} from '../utils/cloudStorage';
import { getItemDate, getWatchTimeStats } from '../utils/watchStats';
import MovieCard from '../components/MovieCard';
import { getMediaType, getSavedItemType, normalizeSavedItem } from '../utils/media';

const Watched = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dateWatched');
  const toast = useToast();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      setLoading(true);
      const unsubscribe = subscribeToWatchedCloud(
        currentUser.uid,
        (cloudItems) => {
          setItems(cloudItems.map(normalizeSavedItem));
          setLoading(false);
        },
        () => {
          toast.error('Unable to sync Watched in real time');
          setLoading(false);
        }
      );
      return unsubscribe;
    }

    loadItems();
    // Reload when authentication changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  // Reload items when window regains focus (for cross-device sync)
  useEffect(() => {
    const handleFocus = () => {
      console.log('Window focused, reloading watched items...');
      loadItems();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
    // Reload on focus for cross-device changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const loadItems = async () => {
    try {
      if (currentUser) {
        const cloudItems = await getWatchedCloud(currentUser.uid);
        setItems(cloudItems.map(normalizeSavedItem));
      } else {
        const localItems = getWatched();
        setItems(localItems.map(normalizeSavedItem));
      }
    } catch (error) {
      console.error('Error loading watched:', error);
      toast.error('Failed to load watched list');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id, mediaType) => {
    // Show confirmation dialog
    const confirmed = window.confirm('Are you sure you want to remove this item from Watched?');
    
    if (!confirmed) {
      return; // User cancelled, don't remove
    }

    try {
      if (currentUser) {
        const success = await removeFromWatchedCloud(currentUser.uid, id, mediaType);
        if (!success) throw new Error('Cloud removal failed');
      } else {
        removeFromWatched(id, mediaType);
      }
      // Removed toast notification
      loadItems();
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-hover"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-bg pb-20">
        <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 8rem)' }}>
          <div className="text-center animate-fade-in px-4">
            <h2 className="text-2xl md:text-3xl font-sans font-bold text-fg mb-3">
              No Items Yet
            </h2>
            <p className="text-base md:text-lg text-fg-secondary mb-6 max-w-md mx-auto">
              Your watched list is empty. Start watching movies and TV shows!
            </p>
            <Link
              to="/"
              className="inline-block bg-brand hover:bg-brand-hover text-on-brand px-8 py-3 rounded-md font-bold transition-all "
            >
              Browse Content
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const watchTime = getWatchTimeStats(items);
  const totalTime = watchTime.totalMinutes;
  const movieCount = items.filter((item) => getSavedItemType(item) === 'movie').length;
  const seriesCount = items.filter((item) => getSavedItemType(item) === 'tv').length;
  const animeCount = items.filter((item) => getSavedItemType(item) === 'anime').length;
  const daysWorth = watchTime.days;

  // Filter items based on selected filter
  const filteredItems = items.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'movies') return getSavedItemType(item) === 'movie';
    if (filter === 'series') return getSavedItemType(item) === 'tv';
    if (filter === 'anime') return getSavedItemType(item) === 'anime';
    return true;
  });

  // Sort items based on selected sort option
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === 'dateWatched') {
      return (getItemDate(b)?.getTime() || 0) - (getItemDate(a)?.getTime() || 0);
    }
    if (sortBy === 'name') {
      const nameA = (a.title || a.name || '').toLowerCase();
      const nameB = (b.title || b.name || '').toLowerCase();
      return nameA.localeCompare(nameB);
    }
    if (sortBy === 'rating') {
      return (b.vote_average || 0) - (a.vote_average || 0);
    }
    return 0;
  });

  return (
    <div className="bg-bg transition-colors duration-200">
      <div className="container mx-auto px-4 py-6 pb-24">
        {/* Header Section */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-fg mb-1">
            Watched Collection
          </h1>
          <p className="text-sm text-fg-secondary">
            Your completed movies and TV shows
          </p>
        </div>

        {/* Stats Card */}
        {items.length > 0 && (
          <section className="mb-8">
            <div className="bg-surface rounded-md py-6 px-4 mx-auto max-w-[600px] md:max-w-none">
              <div className="grid grid-cols-[1fr_1fr_1fr_1fr] divide-x-2 divide-line">
                <div className="flex flex-col items-center justify-center px-1.5 py-2">
                  <p className="text-xl font-bold text-fg leading-none mb-1.5">
                    {items.length}
                  </p>
                  <p className="text-xs text-fg-muted font-normal whitespace-nowrap">
                    Total Items
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center px-1.5 py-2">
                  <p className="text-xl font-bold text-fg leading-none mb-1.5">
                    {Math.floor(totalTime / 60)}h
                  </p>
                  <p className="text-xs text-fg-muted font-normal whitespace-nowrap">
                    Hours
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center px-1.5 py-2">
                  <p className="text-xl font-bold text-fg leading-none mb-1.5">
                    {totalTime % 60}m
                  </p>
                  <p className="text-xs text-fg-muted font-normal whitespace-nowrap">
                    Minutes
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center px-1.5 py-2">
                  <p className="text-xl font-bold text-fg leading-none mb-1.5">
                    {daysWorth}
                  </p>
                  <p className="text-xs text-fg-muted font-normal whitespace-nowrap">
                    Days
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Filter and Sort Section */}
        {items.length > 0 && (
          <section className="mb-6">
            <div className="bg-surface rounded-md p-5 mx-auto max-w-[600px] md:max-w-none">
              {/* Filter */}
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-fg mb-2">Filter:</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                      filter === 'all'
                        ? 'bg-brand text-on-brand'
                        : 'bg-line text-fg-secondary hover:bg-surface'
                    }`}
                  >
                    All ({items.length})
                  </button>
                  <button
                    onClick={() => setFilter('movies')}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                      filter === 'movies'
                        ? 'bg-brand text-on-brand'
                        : 'bg-line text-fg-secondary hover:bg-surface'
                    }`}
                  >
                    Movies ({movieCount})
                  </button>
                  <button
                    onClick={() => setFilter('series')}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                      filter === 'series'
                        ? 'bg-brand text-on-brand'
                        : 'bg-line text-fg-secondary hover:bg-surface'
                    }`}
                  >
                    Series ({seriesCount})
                  </button>
                  <button
                    onClick={() => setFilter('anime')}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                      filter === 'anime'
                        ? 'bg-brand text-on-brand'
                        : 'bg-line text-fg-secondary hover:bg-surface'
                    }`}
                  >
                    Anime ({animeCount})
                  </button>
                </div>
              </div>

              {/* Sort */}
              <div>
                <h3 className="text-xs font-semibold text-fg mb-2">Sort by:</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-line text-fg px-3 py-2 rounded-md text-xs border-none outline-none cursor-pointer"
                >
                  <option value="dateWatched">Date Watched</option>
                  <option value="name">Name</option>
                  <option value="rating">Rating</option>
                </select>
              </div>
            </div>
          </section>
        )}

        {/* Movies Section */}
        <div className="media-grid">
          {sortedItems.map((item) => (
            <div key={item.id} className="relative">
              <MovieCard item={item} showWatchedBadge={false} />
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => handleRemove(item.id, getMediaType(item))}
                  className="flex-1 border border-danger text-danger-text py-2 px-3 rounded-md text-sm font-semibold hover:bg-danger/10 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Watched;
