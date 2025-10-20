import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';
import { getWatchLater, removeFromWatchLater, addToWatched } from '../utils/storage';
import { getWatchLaterCloud, removeFromWatchLaterCloud, addToWatchedCloud } from '../utils/cloudStorage';
import MovieCard from '../components/MovieCard';
import { FiClock, FiTrash2, FiCheckCircle } from 'react-icons/fi';
import { MdMovie, MdTv } from 'react-icons/md';

const Watched = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const { user } = useAuth();

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
    <div className="min-h-screen pt-20 pb-24 px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-4">
            Watch Later
          </h1>
          <p className="text-base md:text-lg text-gray-400">
            Your personalized watchlist
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-slide-up">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-card backdrop-blur-sm border border-white/5">
            <div className="flex items-center gap-3 mb-2">
              <FiClock className="text-2xl text-red-500" />
              <span className="text-sm text-gray-400">Total Items</span>
            </div>
            <p className="text-3xl font-display font-bold text-white">{items.length}</p>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-card backdrop-blur-sm border border-white/5">
            <div className="flex items-center gap-3 mb-2">
              <MdMovie className="text-2xl text-blue-500" />
              <span className="text-sm text-gray-400">Movies</span>
            </div>
            <p className="text-3xl font-display font-bold text-white">{movieCount}</p>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-card backdrop-blur-sm border border-white/5">
            <div className="flex items-center gap-3 mb-2">
              <MdTv className="text-2xl text-purple-500" />
              <span className="text-sm text-gray-400">TV Shows</span>
            </div>
            <p className="text-3xl font-display font-bold text-white">{tvCount}</p>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-card backdrop-blur-sm border border-white/5">
            <div className="flex items-center gap-3 mb-2">
              <FiClock className="text-2xl text-green-500" />
              <span className="text-sm text-gray-400">Est. Time</span>
            </div>
            <p className="text-3xl font-display font-bold text-white">
              {formatTime(totalTime)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {items.map((item) => (
            <div key={`${item.media_type}-${item.id}`} className="animate-fade-in">
              <MovieCard item={item} />
              
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => handleMarkAsWatched(item)}
                  className="flex-1 bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                  title="Mark as Watched"
                >
                  <FiCheckCircle className="text-sm" />
                  <span>Watched</span>
                </button>
                
                <button
                  onClick={() => handleRemove(item.id, item.media_type)}
                  className="bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded-lg text-xs font-semibold transition-all"
                  title="Remove"
                >
                  <FiTrash2 className="text-sm" />
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
