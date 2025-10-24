import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';
import { getWatched, removeFromWatched } from '../utils/storage';
import { getWatchedCloud, removeFromWatchedCloud } from '../utils/cloudStorage';
import MovieCard from '../components/MovieCard';

const Watched = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dateWatched');
  const toast = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadItems();
  }, [user]);

  // Reload items when window regains focus (for cross-device sync)
  useEffect(() => {
    const handleFocus = () => {
      console.log('Window focused, reloading watched items...');
      loadItems();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user]);

  const loadItems = async () => {
    try {
      if (user) {
        const cloudItems = await getWatchedCloud(user.uid);
        setItems(cloudItems);
      } else {
        const localItems = getWatched();
        setItems(localItems);
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
      if (user) {
        await removeFromWatchedCloud(user.uid, id, mediaType);
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

  const calculateTotalTime = () => {
    return items.reduce((total, item) => {
      // If runtime is already provided (total runtime), use it directly
      if (item.runtime) {
        return total + item.runtime;
      }
      
      // For TV shows without runtime, calculate based on episodes
      if (item.media_type === 'tv') {
        const episodeRuntime = item.episode_run_time?.[0] || 45; // Default 45 min per episode
        const numberOfEpisodes = item.number_of_episodes || item.number_of_seasons * 10 || 10;
        return total + (episodeRuntime * numberOfEpisodes);
      }
      
      return total;
    }, 0);
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  const calculateDaysWorth = (minutes) => {
    const hours = minutes / 60;
    const days = Math.floor(hours / 24);
    return days;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-black pb-20">
        <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 8rem)' }}>
          <div className="text-center animate-fade-in px-4">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-3">
              No Items Yet
            </h2>
            <p className="text-base md:text-lg text-gray-400 mb-6 max-w-md mx-auto">
              Your watched list is empty. Start watching movies and TV shows!
            </p>
            <Link
              to="/"
              className="inline-block bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-card hover:shadow-card-hover"
            >
              Browse Content
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalTime = calculateTotalTime();
  const movieCount = items.filter((item) => item.media_type === 'movie').length;
  const tvCount = items.filter((item) => item.media_type === 'tv').length;
  const daysWorth = calculateDaysWorth(totalTime);

  // Filter items based on selected filter
  const filteredItems = items.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'movies') return item.media_type === 'movie';
    if (filter === 'tv') return item.media_type === 'tv';
    return true;
  });

  // Sort items based on selected sort option
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === 'dateWatched') {
      return new Date(b.watchedDate || b.addedDate) - new Date(a.watchedDate || a.addedDate);
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
    <div className="bg-black transition-colors duration-200">
      <div className="container mx-auto px-4 py-6 pb-24">
        {/* Header Section */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">
            Watched Collection
          </h1>
          <p className="text-sm text-gray-400">
            Your completed movies and TV shows
          </p>
        </div>

        {/* Stats Card */}
        {items.length > 0 && (
          <section className="mb-8">
            <div className="bg-[#1c1c1e] rounded-[18px] py-6 px-4 mx-auto max-w-[600px] md:max-w-none">
              <div className="grid grid-cols-[1fr_1fr_1fr_1fr] divide-x-2 divide-[#2c2c2e]">
                <div className="flex flex-col items-center justify-center px-1.5 py-2">
                  <p className="text-[20px] font-bold text-white leading-none mb-1.5">
                    {items.length}
                  </p>
                  <p className="text-[10px] text-[#8e8e93] font-normal whitespace-nowrap">
                    Total Items
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center px-1.5 py-2">
                  <p className="text-[20px] font-bold text-white leading-none mb-1.5">
                    {Math.floor(totalTime / 60)}h
                  </p>
                  <p className="text-[10px] text-[#8e8e93] font-normal whitespace-nowrap">
                    Hours
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center px-1.5 py-2">
                  <p className="text-[20px] font-bold text-white leading-none mb-1.5">
                    {totalTime % 60}m
                  </p>
                  <p className="text-[10px] text-[#8e8e93] font-normal whitespace-nowrap">
                    Minutes
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center px-1.5 py-2">
                  <p className="text-[20px] font-bold text-white leading-none mb-1.5">
                    {daysWorth}
                  </p>
                  <p className="text-[10px] text-[#8e8e93] font-normal whitespace-nowrap">
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
            <div className="bg-[#1c1c1e] rounded-[18px] p-5 mx-auto max-w-[600px] md:max-w-none">
              {/* Filter */}
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-white mb-2">Filter:</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      filter === 'all'
                        ? 'bg-red-600 text-white'
                        : 'bg-[#2c2c2e] text-gray-400 hover:bg-[#3c3c3e]'
                    }`}
                  >
                    All ({items.length})
                  </button>
                  <button
                    onClick={() => setFilter('movies')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      filter === 'movies'
                        ? 'bg-red-600 text-white'
                        : 'bg-[#2c2c2e] text-gray-400 hover:bg-[#3c3c3e]'
                    }`}
                  >
                    Movies ({movieCount})
                  </button>
                  <button
                    onClick={() => setFilter('tv')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      filter === 'tv'
                        ? 'bg-red-600 text-white'
                        : 'bg-[#2c2c2e] text-gray-400 hover:bg-[#3c3c3e]'
                    }`}
                  >
                    TV Shows ({tvCount})
                  </button>
                </div>
              </div>

              {/* Sort */}
              <div>
                <h3 className="text-xs font-semibold text-white mb-2">Sort by:</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-[#2c2c2e] text-white px-3 py-2 rounded-lg text-xs border-none outline-none cursor-pointer"
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">
          {sortedItems.map((item) => (
            <div key={item.id} className="relative">
              <MovieCard item={item} />
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => handleRemove(item.id, item.media_type)}
                  className="flex-1 bg-red-600 text-white py-2 px-3 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
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
