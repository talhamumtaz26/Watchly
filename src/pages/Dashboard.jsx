import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getWatched, getWatchLater, getWatchTimeStats } from '../utils/storage';
import { FiCheckCircle, FiClock, FiCalendar, FiList } from 'react-icons/fi';
import { MdMovie, MdTv } from 'react-icons/md';

const Dashboard = () => {
  const [stats, setStats] = useState({
    watched: [],
    watchLater: [],
    watchTime: {},
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = () => {
    const watched = getWatched();
    const watchLater = getWatchLater();
    const watchTime = getWatchTimeStats();

    setStats({
      watched,
      watchLater,
      watchTime,
    });
  };

  // Calculate genre statistics
  const getGenreStats = () => {
    const genreCounts = {};
    stats.watched.forEach((item) => {
      // Note: We'd need to store genres with items for this to work perfectly
      // For now, we'll use a placeholder
    });
    return genreCounts;
  };

  // Calculate type statistics
  const getTypeStats = () => {
    const movies = stats.watched.filter((item) => item.media_type === 'movie').length;
    const tvShows = stats.watched.filter((item) => item.media_type === 'tv').length;
    const total = movies + tvShows;

    return {
      movies,
      tvShows,
      total,
      moviePercentage: total > 0 ? Math.round((movies / total) * 100) : 0,
      tvPercentage: total > 0 ? Math.round((tvShows / total) * 100) : 0,
    };
  };

  // Calculate rating distribution by categories
  const getRatingDistribution = () => {
    const distribution = {
      excellent: 0, // 8-10
      good: 0,      // 6-7.9
      average: 0,   // 4-5.9
      poor: 0,      // 0-3.9
    };

    stats.watched.forEach((item) => {
      const rating = item.vote_average || 0;
      if (rating >= 8) distribution.excellent++;
      else if (rating >= 6) distribution.good++;
      else if (rating >= 4) distribution.average++;
      else distribution.poor++;
    });

    return distribution;
  };

  // Get recent activity
  const getRecentActivity = () => {
    return stats.watched
      .sort((a, b) => new Date(b.watchedDate) - new Date(a.watchedDate))
      .slice(0, 5);
  };

  // Get top rated watched
  const getTopRated = () => {
    return stats.watched
      .filter((item) => item.vote_average > 0)
      .sort((a, b) => b.vote_average - a.vote_average)
      .slice(0, 5);
  };

  const typeStats = getTypeStats();
  const ratingDist = getRatingDistribution();
  const recentActivity = getRecentActivity();
  const topRated = getTopRated();

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-200">
      <div className="container mx-auto px-4 py-8">
        {/* Header - Minimal & Clean */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-text-light dark:text-text-dark">
            Dashboard
          </h1>
        </div>

        {/* Overview Stats - Clean & Minimal */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <FiCheckCircle className="text-blue-500 text-2xl mb-3" />
            <h3 className="text-2xl font-bold text-text-light dark:text-text-dark mb-1">
              {stats.watched.length}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Watched</p>
          </div>

          <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <FiList className="text-purple-500 text-2xl mb-3" />
            <h3 className="text-2xl font-bold text-text-light dark:text-text-dark mb-1">
              {stats.watchLater.length}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Watch Later</p>
          </div>

          <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <FiClock className="text-green-500 text-2xl mb-3" />
            <h3 className="text-2xl font-bold text-text-light dark:text-text-dark mb-1">
              {(() => {
                const hours = stats.watchTime.hours || 0;
                const mins = stats.watchTime.totalMinutes ? stats.watchTime.totalMinutes % 60 : 0;
                if (hours === 0) return `${mins}m`;
                if (mins === 0) return `${hours}h`;
                return `${hours}h ${mins}m`;
              })()}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Time</p>
          </div>

          <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <FiCalendar className="text-orange-500 text-2xl mb-3" />
            <h3 className="text-2xl font-bold text-text-light dark:text-text-dark mb-1">
              {stats.watchTime.days || 0}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Days</p>
          </div>

          <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <MdMovie className="text-blue-400 text-2xl mb-3" />
            <h3 className="text-2xl font-bold text-text-light dark:text-text-dark mb-1">
              {typeStats.movies}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Movies</p>
          </div>

          <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <MdTv className="text-purple-400 text-2xl mb-3" />
            <h3 className="text-2xl font-bold text-text-light dark:text-text-dark mb-1">
              {typeStats.tvShows}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Series</p>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="mb-8">
          <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-text-light dark:text-text-dark mb-4 text-center">
              Rating Distribution
            </h2>
            {stats.watched.length > 0 ? (
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-text-light dark:text-text-dark font-medium">
                      Excellent (8-10)
                    </span>
                    <span className="text-text-light dark:text-text-dark font-bold text-sm">
                      {ratingDist.excellent}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          stats.watched.length > 0
                            ? (ratingDist.excellent / stats.watched.length) * 100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-text-light dark:text-text-dark font-medium">
                      Good (6-7.9)
                    </span>
                    <span className="text-text-light dark:text-text-dark font-bold text-sm">
                      {ratingDist.good}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          stats.watched.length > 0
                            ? (ratingDist.good / stats.watched.length) * 100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-text-light dark:text-text-dark font-medium">
                      Average (4-5.9)
                    </span>
                    <span className="text-text-light dark:text-text-dark font-bold text-sm">
                      {ratingDist.average}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          stats.watched.length > 0
                            ? (ratingDist.average / stats.watched.length) * 100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-text-light dark:text-text-dark font-medium">
                      Poor (0-3.9)
                    </span>
                    <span className="text-text-light dark:text-text-dark font-bold text-sm">
                      {ratingDist.poor}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          stats.watched.length > 0
                            ? (ratingDist.poor / stats.watched.length) * 100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No data available yet
              </p>
            )}
          </div>
        </div>

        {/* Recent Activity & Top Rated */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Activity */}
          <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-text-light dark:text-text-dark mb-4 text-center">
              Recent Activity
            </h2>
            {recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((item) => (
                  <Link
                    key={`${item.id}-${item.media_type}`}
                    to={`/details/${item.media_type}/${item.id}`}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <img
                      src={
                        item.poster_path
                          ? `https://image.tmdb.org/t/p/w92${item.poster_path}`
                          : 'https://via.placeholder.com/92x138/1F2937/9CA3AF?text=No+Image'
                      }
                      alt={item.title}
                      className="w-12 h-18 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-text-light dark:text-text-dark line-clamp-1">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(item.watchedDate).toLocaleDateString()}
                      </p>
                    </div>
                    {item.vote_average > 0 && (
                      <span className="text-yellow-500 text-sm">
                        ⭐ {item.vote_average.toFixed(1)}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No recent activity
              </p>
            )}
          </div>

          {/* Top Rated */}
          <div className="bg-card-light dark:bg-card-dark rounded-lg p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-text-light dark:text-text-dark mb-4 text-center">
              Your Top Rated
            </h2>
            {topRated.length > 0 ? (
              <div className="space-y-3">
                {topRated.map((item, index) => (
                  <Link
                    key={`${item.id}-${item.media_type}`}
                    to={`/details/${item.media_type}/${item.id}`}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="text-2xl font-bold text-primary-light dark:text-primary-dark w-8">
                      #{index + 1}
                    </div>
                    <img
                      src={
                        item.poster_path
                          ? `https://image.tmdb.org/t/p/w92${item.poster_path}`
                          : 'https://via.placeholder.com/92x138/1F2937/9CA3AF?text=No+Image'
                      }
                      alt={item.title}
                      className="w-12 h-18 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-text-light dark:text-text-dark line-clamp-1">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {item.media_type === 'movie' ? 'Movie' : 'TV Show'}
                      </p>
                    </div>
                    <span className="text-yellow-500 font-bold">
                      ⭐ {item.vote_average.toFixed(1)}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No rated content yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
