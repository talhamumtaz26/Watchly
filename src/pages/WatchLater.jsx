import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';
import { getWatchLater, removeFromWatchLater, addToWatched } from '../utils/storage';
import { getWatchLaterCloud, removeFromWatchLaterCloud, addToWatchedCloud } from '../utils/cloudStorage';
import MovieCard from '../components/MovieCard';
import { FiClock, FiTrash2, FiCheckCircle } from 'react-icons/fi';
import { MdMovie, MdTv } from 'react-icons/md';

const WatchLater = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadItems();
  }, [user]);

  const loadItems = async () => {
    try {
      if (user) {
        const cloudItems = await getWatchLaterCloud(user.uid);
        setItems(cloudItems);
      } else {
        const localItems = getWatchLater();
        setItems(localItems);
      }
    } catch (error) {
      console.error('Error loading watch later:', error);
      toast.error('Failed to load watch later list');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id, mediaType) => {
    // Show confirmation dialog
    const confirmed = window.confirm('Are you sure you want to remove this item from Watch Later?');
    
    if (!confirmed) {
      return; // User cancelled, don't remove
    }

    try {
      if (user) {
        await removeFromWatchLaterCloud(user.uid, id, mediaType);
      } else {
        removeFromWatchLater(id, mediaType);
      }
      // Removed toast notification
      loadItems();
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item');
    }
  };

  const handleMarkAsWatched = async (item) => {
    try {
      if (user) {
        await addToWatchedCloud(user.uid, item);
        await removeFromWatchLaterCloud(user.uid, item.id, item.media_type);
      } else {
        addToWatched(item);
        removeFromWatchLater(item.id, item.media_type);
      }
      toast.success('Marked as Watched! ✅');
      loadItems();
    } catch (error) {
      console.error('Error marking as watched:', error);
      toast.error('Failed to mark as watched');
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
              Your watch later list is empty. Start adding movies and TV shows you want to watch!
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

  return (
    <div className="bg-black transition-colors duration-200">
      <div className="container mx-auto px-4 py-6 pb-24">
        {/* Header Section */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">
            Watch Later
          </h1>
          <p className="text-sm text-gray-400">
            Your saved movies and TV shows to watch
          </p>
        </div>

        {/* Stats Card */}
        {items.length > 0 && (
          <section className="mb-8">
            <div className="bg-[#1c1c1e] rounded-[18px] py-6 px-4 mx-auto max-w-[600px] md:max-w-none">
              <div className="grid grid-cols-[1fr_1fr_1fr_1.4fr] divide-x-2 divide-[#2c2c2e]">
                <div className="flex flex-col items-center justify-center px-2 py-2">
                  <p className="text-[20px] font-bold text-white leading-none mb-1.5">
                    {items.length}
                  </p>
                  <p className="text-[10px] text-[#8e8e93] font-normal whitespace-nowrap">
                    Total Items
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center px-1.5">
                  <p className="text-[20px] font-bold text-white leading-none mb-1.5">
                    {movieCount}
                  </p>
                  <p className="text-[10px] text-[#8e8e93] font-normal whitespace-nowrap">
                    Movies
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center px-1.5">
                  <p className="text-[20px] font-bold text-white leading-none mb-1.5">
                    {tvCount}
                  </p>
                  <p className="text-[10px] text-[#8e8e93] font-normal whitespace-nowrap">
                    Series
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center px-2">
                  <p className="text-[20px] font-bold text-white leading-none mb-1.5 whitespace-nowrap">
                    {formatTime(totalTime)}
                  </p>
                  <p className="text-[10px] text-[#8e8e93] font-normal whitespace-nowrap">
                    Est. Time
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Movies Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">
            {items.map((item) => (
              <div key={item.id} className="relative">
                <MovieCard item={item} />
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => handleMarkAsWatched(item)}
                    className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
                  >
                    <span>✓</span>
                    <span>Watched</span>
                  </button>
                  <button
                    onClick={() => handleRemove(item.id, item.media_type)}
                    className="bg-red-600 text-white py-2 px-3 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default WatchLater;