import React, { useState, useEffect } from 'react';
import { getUpcomingMovies, getUpcomingTVShows, getUpcomingAnime } from '../utils/api';
import { useToast } from '../components/Toast';
import MovieCard from '../components/MovieCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { getMediaType, isAnimeItem } from '../utils/media';
import { isNetworkError, readRowCache, writeRowCache } from '../utils/rowCache';
import RowCacheStatus from '../components/RowCacheStatus';

const Upcoming = () => {
  const [upcomingItems, setUpcomingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'movies', 'tv', 'anime'
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshFailed, setRefreshFailed] = useState(false);
  const [offline, setOffline] = useState(!navigator.onLine);
  const toast = useToast();

  useEffect(() => {
    const disconnected = () => setOffline(true);
    const connected = () => setOffline(false);
    const cached = readRowCache('upcoming');
    window.addEventListener('offline', disconnected);
    window.addEventListener('online', connected);
    if (cached) {
      setUpcomingItems(cached.items);
      setLastUpdated(cached.timestamp);
      setLoading(false);
    }
    loadUpcoming();
    return () => {
      window.removeEventListener('offline', disconnected);
      window.removeEventListener('online', connected);
    };
    // Load upcoming releases once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUpcoming = async () => {
    const cached = readRowCache('upcoming');
    setLoading(!cached);
    try {
      const today = new Date();

      // Fetch upcoming content from multiple pages
      const moviePromises = [];
      const tvPromises = [];
      const animePromises = [];

      for (let page = 1; page <= 5; page++) {
        moviePromises.push(getUpcomingMovies(page));
        tvPromises.push(getUpcomingTVShows(page));
        animePromises.push(getUpcomingAnime(page));
      }

      const [movieResult, tvResult, animeResult] = await Promise.allSettled([
        Promise.all(moviePromises),
        Promise.all(tvPromises),
        Promise.all(animePromises)
      ]);
      if ([movieResult, tvResult, animeResult].some((result) => result.status === 'rejected')) {
        const error = [movieResult, tvResult, animeResult].find((result) => result.status === 'rejected').reason;
        throw error;
      }
      const moviePages = movieResult.value;
      const tvPages = tvResult.value;
      const animePages = animeResult.value;

      // Combine all results
      const allMovies = moviePages.flatMap(page => 
        page.results
          .filter((m) => m.original_language === 'en' && m.poster_path && (m.title || m.original_title))
          .map(m => ({ ...m, media_type: getMediaType(m, 'movie') }))
      );

      const allTVShows = tvPages.flatMap(page => 
        page.results
          .filter((t) => t.original_language === 'en' && t.poster_path && (t.name || t.original_name))
          .map(t => ({ ...t, media_type: getMediaType(t, 'tv') }))
      );

      const allAnime = animePages.flatMap(page => 
        page.results
          .filter((a) => a.poster_path && (a.name || a.original_name))
          .map(a => ({ ...a, media_type: getMediaType(a, 'tv') }))
      );

      // Combine and filter
      const allItems = [...allMovies, ...allTVShows, ...allAnime];

      const filtered = allItems
        .filter(item => {
          const releaseDate = item.release_date || item.first_air_date;
          if (!releaseDate) return false;
          const date = new Date(releaseDate);
          return date >= today;
        })
        .sort((a, b) => {
          const dateA = new Date(a.release_date || a.first_air_date);
          const dateB = new Date(b.release_date || b.first_air_date);
          return dateA - dateB;
        })
        // Remove duplicates
        .filter((item, index, self) => 
          index === self.findIndex(t => (
            t.id === item.id
            && t.media_type === item.media_type
            && isAnimeItem(t) === isAnimeItem(item)
          ))
        );

      console.log('Upcoming content loaded:', filtered.length, 'items');
      writeRowCache('upcoming', filtered);
      setUpcomingItems(filtered);
      setLastUpdated(Date.now());
      setRefreshFailed(false);
    } catch (error) {
      console.error('Error loading upcoming content:', error);
      setRefreshFailed(true);
      if (isNetworkError(error)) setOffline(true);
      toast.error('Unable to load upcoming releases. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <LoadingSpinner fullScreen={true} message="Loading upcoming releases..." />;
  }

  // Filter items based on selected filter
  const filteredItems = upcomingItems.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'movies') return getMediaType(item) === 'movie';
    if (filter === 'tv') return getMediaType(item) === 'tv' && !isAnimeItem(item);
    if (filter === 'anime') return isAnimeItem(item);
    return true;
  });
  const hasCachedRows = upcomingItems.length > 0;

  return (
    <div className="min-h-screen bg-bg transition-colors duration-200">
      <div className="container mx-auto px-4 py-8">
        <RowCacheStatus
          lastUpdated={lastUpdated}
          refreshFailed={refreshFailed}
          hasCachedRows={hasCachedRows}
          onRetry={loadUpcoming}
          offline={offline}
        />
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-fg mb-2">
            Upcoming Releases
          </h1>
          <p className="text-sm text-fg-secondary">
            Movies, TV Shows & Anime releasing soon
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex justify-center gap-2 mb-8 overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all text-xs whitespace-nowrap ${
              filter === 'all'
                ? 'bg-brand text-on-brand'
                : 'bg-surface text-fg-secondary hover:text-fg hover:bg-surface border border-line/10'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('movies')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all text-xs whitespace-nowrap ${
              filter === 'movies'
                ? 'bg-brand text-on-brand'
                : 'bg-surface text-fg-secondary hover:text-fg hover:bg-surface border border-line/10'
            }`}
          >
            Movies
          </button>
          <button
            onClick={() => setFilter('tv')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all text-xs whitespace-nowrap ${
              filter === 'tv'
                ? 'bg-brand text-on-brand'
                : 'bg-surface text-fg-secondary hover:text-fg hover:bg-surface border border-line/10'
            }`}
          >
            Series
          </button>
          <button
            onClick={() => setFilter('anime')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all text-xs whitespace-nowrap ${
              filter === 'anime'
                ? 'bg-brand text-on-brand'
                : 'bg-surface text-fg-secondary hover:text-fg hover:bg-surface border border-line/10'
            }`}
          >
            Anime
          </button>
        </div>

        {/* Upcoming Items Grid */}
        {offline && !hasCachedRows ? null : filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📅</div>
            <h2 className="text-2xl font-bold text-fg mb-2">
              No upcoming releases found
            </h2>
            <p className="text-fg-secondary">
              Check back later for new releases
            </p>
          </div>
        ) : (
          <div className="media-grid">
            {filteredItems.map((item) => {
              // Create a modified item with release date in place of rating
              const modifiedItem = {
                ...item,
                vote_average: 0, // Hide rating
                upcoming_release_date: item.release_date || item.first_air_date, // Show release date
              };

              return (
                <div key={`${item.media_type}-${item.id}`} className="relative">
                  <MovieCard item={modifiedItem} showType={true} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Upcoming;
