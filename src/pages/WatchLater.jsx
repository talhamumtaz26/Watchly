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
    try {
      if (user) {
        await removeFromWatchLaterCloud(user.uid, id, mediaType);
      } else {
        removeFromWatchLater(id, mediaType);
      }
      toast.info('Removed from Watch Later');
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
      return total + (item.runtime || 0);
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
      <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 4rem)' }}>
        <div className="text-center animate-fade-in">
          <div className="mb-6 text-6xl">📺</div>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-3">
            No Items Yet
          </h2>
          <p className="text-base md:text-lg text-gray-400 mb-6 max-w-md mx-auto px-4">
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
    );
  }

  const totalTime = calculateTotalTime();
  const movieCount = items.filter((item) => item.media_type === 'movie').length;
  const tvCount = items.filter((item) => item.media_type === 'tv').length;

  return (
    <div className="min-h-screen bg-black pt-10 pb-24 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2">
            Watch Later
          </h1>
          <p className="text-sm md:text-base text-gray-400">
            Your saved movies and TV shows to watch
          </p>
        </div>

        {/* Stats Card */}
        {items.length > 0 && (
          <section className="mb-8">
            <div className="bg-[#111722] border border-[#1e2431] rounded-3xl px-6 py-5 shadow-[0_20px_40px_rgba(0,0,0,0.35)]">
              <div className="grid grid-cols-4 divide-x divide-[#1f2533] text-center">
                <div className="px-3">
                  <p className="text-2xl md:text-3xl font-semibold text-white">
                    {items.length}
                  </p>
                  <p className="mt-1 text-xs md:text-sm uppercase tracking-wide text-gray-400">
                    Total Items
                  </p>
                </div>
                <div className="px-3">
                  <p className="text-2xl md:text-3xl font-semibold text-white">
                    {movieCount}
                  </p>
                  <p className="mt-1 text-xs md:text-sm uppercase tracking-wide text-gray-400">
                    Movies
                  </p>
                </div>
                <div className="px-3">
                  <p className="text-2xl md:text-3xl font-semibold text-white">
                    {tvCount}
                  </p>
                  <p className="mt-1 text-xs md:text-sm uppercase tracking-wide text-gray-400">
                    TV Shows
                  </p>
                </div>
                <div className="px-3">
                  <p className="text-2xl md:text-3xl font-semibold text-white whitespace-nowrap">
                    {formatTime(totalTime)}
                  </p>
                  <p className="mt-1 text-xs md:text-sm uppercase tracking-wide text-gray-400">
                    Est. Time
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Movies Section */}
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="text-6xl mb-4">🎬</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              No Items Yet
            </h2>
            <p className="text-gray-400 text-center mb-6">
              Start adding movies and TV shows to watch later
            </p>
            <button
              onClick={() => navigate("/search")}
              className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Browse Content
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
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
                    onClick={() => handleRemove(item.id)}
                    className="bg-red-600 text-white py-2 px-3 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchLater;