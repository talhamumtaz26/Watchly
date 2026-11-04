import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getWatched, getWatchLater, getWatchTimeStats } from '../utils/storage';
import {
  getWatchedCloud,
  getWatchLaterCloud,
  subscribeToWatchedCloud,
  subscribeToWatchLaterCloud,
} from '../utils/cloudStorage';
import {
  formatItemDate,
  getItemDate,
  getWatchTimeStats as getWatchTimeStatsFromItems,
} from '../utils/watchStats';
import { getMediaType, getSavedItemType, normalizeSavedItem } from '../utils/media';
import { useAuth } from '../contexts/AuthContext';
import { FiCheckCircle, FiClock, FiCalendar, FiList } from 'react-icons/fi';
import { MdMovie, MdTv } from 'react-icons/md';
import { FiPlayCircle } from 'react-icons/fi';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    watched: [],
    watchLater: [],
    watchTime: {},
  });

  useEffect(() => {
    if (currentUser) {
      const handleSubscriptionError = () => {
        console.error('Unable to sync dashboard data in real time');
      };
      const unsubscribeWatched = subscribeToWatchedCloud(
        currentUser.uid,
        (watched) => setStats((previous) => ({
          ...previous,
          watched: watched.map(normalizeSavedItem),
          watchTime: getWatchTimeStatsFromItems(watched),
        })),
        handleSubscriptionError
      );
      const unsubscribeWatchLater = subscribeToWatchLaterCloud(
        currentUser.uid,
        (watchLater) => setStats((previous) => ({ ...previous, watchLater: watchLater.map(normalizeSavedItem) })),
        handleSubscriptionError
      );
      return () => {
        unsubscribeWatched();
        unsubscribeWatchLater();
      };
    }

    loadStats();
    // Reload when authentication changes; the loader reads currentUser.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const loadStats = async () => {
    if (currentUser) {
      const [watched, watchLater] = await Promise.all([
        getWatchedCloud(currentUser.uid),
        getWatchLaterCloud(currentUser.uid),
      ]);

      setStats({
        watched: watched.map(normalizeSavedItem),
        watchLater: watchLater.map(normalizeSavedItem),
        watchTime: getWatchTimeStatsFromItems(watched),
      });
      return;
    }

    setStats({
      watched: getWatched().map(normalizeSavedItem),
      watchLater: getWatchLater().map(normalizeSavedItem),
      watchTime: getWatchTimeStats(),
    });
  };

  // Calculate type statistics
  const getTypeStats = () => {
    const movies = stats.watched.filter((item) => getSavedItemType(item) === 'movie').length;
    const anime = stats.watched.filter((item) => getSavedItemType(item) === 'anime').length;
    const tvShows = stats.watched.filter((item) => getSavedItemType(item) === 'tv').length;
    const total = movies + tvShows + anime;

    return {
      movies,
      tvShows,
      anime,
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
      const rating = Number(item.user_rating);
      if (!Number.isFinite(rating) || rating < 1) return;
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
      .slice()
      .sort((a, b) => (getItemDate(b)?.getTime() || 0) - (getItemDate(a)?.getTime() || 0))
      .slice(0, 5);
  };

  // Get top rated watched
  const getTopRated = () => {
    return stats.watched
      .filter((item) => Number.isFinite(Number(item.user_rating)) && Number(item.user_rating) >= 1)
      .sort((a, b) => Number(b.user_rating) - Number(a.user_rating))
      .slice(0, 5);
  };

  const typeStats = getTypeStats();
  const ratingDist = getRatingDistribution();
  const recentActivity = getRecentActivity();
  const topRated = getTopRated();
  const ratedCount = stats.watched.filter((item) => Number(item.user_rating) >= 1).length;

  return (
    <div className="min-h-screen bg-bg transition-colors duration-200">
      <div className="container mx-auto px-4 py-8">
        {/* Header - Minimal & Clean */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-fg ">
            Dashboard
          </h1>
        </div>

        {/* Overview Stats - Clean & Minimal */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div className="bg-surface rounded-md p-6   transition-shadow">
            <FiCheckCircle className="text-fg-secondary text-2xl mb-3" />
            <h3 className="text-2xl font-bold text-fg  mb-1">
              {stats.watched.length}
            </h3>
            <p className="text-sm text-fg-muted dark:text-fg-secondary">Watched</p>
          </div>

          <div className="bg-surface rounded-md p-6   transition-shadow">
            <FiList className="text-fg-secondary text-2xl mb-3" />
            <h3 className="text-2xl font-bold text-fg  mb-1">
              {stats.watchLater.length}
            </h3>
            <p className="text-sm text-fg-muted dark:text-fg-secondary">Watch Later</p>
          </div>

          <div className="bg-surface rounded-md p-6   transition-shadow">
            <FiClock className="text-fg-secondary text-2xl mb-3" />
            <h3 className="text-2xl font-bold text-fg  mb-1">
              {(() => {
                return stats.watchTime.formatted || '0m';
              })()}
            </h3>
            <p className="text-sm text-fg-muted dark:text-fg-secondary">Total Time</p>
          </div>

          <div className="bg-surface rounded-md p-6   transition-shadow">
            <FiCalendar className="text-fg-secondary text-2xl mb-3" />
            <h3 className="text-2xl font-bold text-fg  mb-1">
              {stats.watchTime.days || 0}
            </h3>
            <p className="text-sm text-fg-muted dark:text-fg-secondary">Days</p>
          </div>

          <div className="bg-surface rounded-md p-6   transition-shadow">
            <MdMovie className="text-fg-secondary text-2xl mb-3" />
            <h3 className="text-2xl font-bold text-fg  mb-1">
              {typeStats.movies}
            </h3>
            <p className="text-sm text-fg-muted dark:text-fg-secondary">Movies</p>
          </div>

          <div className="bg-surface rounded-md p-6   transition-shadow">
            <MdTv className="text-fg-secondary text-2xl mb-3" />
            <h3 className="text-2xl font-bold text-fg  mb-1">
              {typeStats.tvShows}
            </h3>
            <p className="text-sm text-fg-muted dark:text-fg-secondary">Series</p>
          </div>

          <div className="bg-surface rounded-md p-6   transition-shadow">
            <FiPlayCircle className="text-fg-secondary text-2xl mb-3" />
            <h3 className="text-2xl font-bold text-fg  mb-1">
              {typeStats.anime}
            </h3>
            <p className="text-sm text-fg-muted dark:text-fg-secondary">Anime</p>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="mb-8">
          <div className="bg-surface rounded-md p-6 ">
            <h2 className="text-lg font-semibold text-fg  mb-4 text-center">
              Your Rating Distribution
            </h2>
            {ratedCount > 0 ? (
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-fg  font-medium">
                      Excellent (8-10)
                    </span>
                    <span className="text-fg  font-bold text-sm">
                      {ratingDist.excellent}
                    </span>
                  </div>
                  <div className="w-full bg-fg-secondary dark:bg-line rounded-full h-2">
                    <div
                      className="bg-brand h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          ratedCount > 0
                            ? (ratingDist.excellent / ratedCount) * 100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-fg  font-medium">
                      Good (6-7.9)
                    </span>
                    <span className="text-fg  font-bold text-sm">
                      {ratingDist.good}
                    </span>
                  </div>
                  <div className="w-full bg-fg-secondary dark:bg-line rounded-full h-2">
                    <div
                      className="bg-brand h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          ratedCount > 0
                            ? (ratingDist.good / ratedCount) * 100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-fg  font-medium">
                      Average (4-5.9)
                    </span>
                    <span className="text-fg  font-bold text-sm">
                      {ratingDist.average}
                    </span>
                  </div>
                  <div className="w-full bg-fg-secondary dark:bg-line rounded-full h-2">
                    <div
                      className="bg-brand h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          ratedCount > 0
                            ? (ratingDist.average / ratedCount) * 100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-fg  font-medium">
                      Poor (0-3.9)
                    </span>
                    <span className="text-fg  font-bold text-sm">
                      {ratingDist.poor}
                    </span>
                  </div>
                  <div className="w-full bg-fg-secondary dark:bg-line rounded-full h-2">
                    <div
                      className="bg-brand-hover h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          ratedCount > 0
                            ? (ratingDist.poor / ratedCount) * 100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-fg-muted dark:text-fg-secondary text-center py-8">
                No data available yet
              </p>
            )}
          </div>
        </div>

        {/* Recent Activity & Top Rated */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Activity */}
          <div className="bg-surface rounded-md p-6 ">
            <h2 className="text-lg font-semibold text-fg  mb-4 text-center">
              Recent Activity
            </h2>
            {recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((item) => (
                  <Link
                    key={`${item.id}-${item.media_type}`}
                    to={`/details/${item.media_type}/${item.id}`}
                    className="flex items-center space-x-3 p-3 rounded-md hover:bg-surface dark:hover:bg-line transition-colors"
                  >
                    <img
                      src={
                        item.poster_path
                          ? `https://image.tmdb.org/t/p/w92${item.poster_path}`
                          : '/placeholder-image.svg'
                      }
                      alt={item.title || item.name || 'Watched item'}
                      className="w-12 h-18 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-fg  line-clamp-1">
                        {item.title}
                      </p>
                      <p className="text-xs text-fg-muted dark:text-fg-secondary">
                        {formatItemDate(item)}
                      </p>
                    </div>
                    {Number(item.user_rating) >= 1 && (
                      <span className="text-brand text-sm">
                        ⭐ {Number(item.user_rating).toFixed(1)}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-fg-muted dark:text-fg-secondary text-center py-8">
                No recent activity
              </p>
            )}
          </div>

          {/* Top Rated */}
          <div className="bg-surface rounded-md p-6 ">
            <h2 className="text-lg font-semibold text-fg  mb-4 text-center">
              Your Top Rated
            </h2>
            {topRated.length > 0 ? (
              <div className="space-y-3">
                {topRated.map((item, index) => (
                  <Link
                    key={`${item.id}-${item.media_type}`}
                    to={`/details/${item.media_type}/${item.id}`}
                    className="flex items-center space-x-3 p-3 rounded-md hover:bg-surface dark:hover:bg-line transition-colors"
                  >
                    <div className="text-2xl font-bold text-primary-light dark:text-primary-dark w-8">
                      #{index + 1}
                    </div>
                    <img
                      src={
                        item.poster_path
                          ? `https://image.tmdb.org/t/p/w92${item.poster_path}`
                          : '/placeholder-image.svg'
                      }
                      alt={item.title || item.name || 'Top-rated item'}
                      className="w-12 h-18 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-fg  line-clamp-1">
                        {item.title}
                      </p>
                      <p className="text-xs text-fg-muted dark:text-fg-secondary">
                        {getMediaType(item) === 'movie' ? 'Movie' : 'Series'}
                      </p>
                    </div>
                    <span className="text-brand font-bold">
                      ⭐ {Number(item.user_rating).toFixed(1)}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-fg-muted dark:text-fg-secondary text-center py-8">
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
