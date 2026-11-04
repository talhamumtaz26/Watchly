import React, { useState, useEffect } from 'react';
import { getNowPlayingMovies, getStreamingContent, getPopularMovies, getPopularTVShows, getTVShowsByGenre } from '../utils/api';
import { getSetting, getWatched } from '../utils/storage';
import MovieList from '../components/MovieList';
import { useAuth } from '../contexts/AuthContext';
import { getMediaType } from '../utils/media';
import { isNetworkError, readRowCache, writeRowCache } from '../utils/rowCache';
import RowCacheStatus from '../components/RowCacheStatus';

const HOME_ROWS = ['home-theatre', 'home-streaming', 'home-movies', 'home-tv', 'home-anime'];

const Home = () => {
  const { currentUser } = useAuth();
  const [theatreMovies, setTheatreMovies] = useState([]);
  const [streamingContent, setStreamingContent] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [popularTVShows, setPopularTVShows] = useState([]);
  const [animeShows, setAnimeShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshFailed, setRefreshFailed] = useState(false);
  const [offline, setOffline] = useState(!navigator.onLine);
  const [selectedGenre] = useState(null);
  const [selectedCategory] = useState(null);

  // Filter function to remove watched items if setting is enabled
  const filterWatchedItems = (items, mediaType = null) => {
    const hideWatched = getSetting('hideWatchedFromHome', false);
    if (!hideWatched || !currentUser) return items;
    
    const watchedItems = getWatched();
    const watchedMap = new Map();
    
    // Create a map of watched items by id and media_type
    watchedItems.forEach(item => {
      const key = `${item.id}-${item.media_type}`;
      watchedMap.set(key, true);
    });
    
    return items.filter(item => {
      // For trending items, use their own media_type
      const type = getMediaType(item, mediaType);
      const key = `${item.id}-${type}`;
      return !watchedMap.has(key);
    });
  };

  useEffect(() => {
    const disconnected = () => setOffline(true);
    const connected = () => setOffline(false);
    window.addEventListener('offline', disconnected);
    window.addEventListener('online', connected);

    const cachedRows = HOME_ROWS.map(readRowCache);
    const cachedTimestamps = cachedRows.map((entry) => entry?.timestamp).filter(Boolean);
    if (cachedRows.some(Boolean)) {
      setTheatreMovies(filterWatchedItems(cachedRows[0]?.items || [], 'movie'));
      setStreamingContent(filterWatchedItems(cachedRows[1]?.items || [], 'movie'));
      setPopularMovies(filterWatchedItems(cachedRows[2]?.items || [], 'movie'));
      setPopularTVShows(filterWatchedItems(cachedRows[3]?.items || [], 'tv'));
      setAnimeShows(filterWatchedItems(cachedRows[4]?.items || [], 'tv'));
      setLastUpdated(Math.max(...cachedTimestamps));
      setLoading(false);
    }
    loadData();
    return () => {
      window.removeEventListener('offline', disconnected);
      window.removeEventListener('online', connected);
    };
    // Load the default sections once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    const hasCachedRows = HOME_ROWS.some((key) => readRowCache(key));
    setLoading(!hasCachedRows);
    const requests = [
      [getNowPlayingMovies(1), 'movie', setTheatreMovies, 'home-theatre'],
      [getStreamingContent('movie', 1), 'movie', setStreamingContent, 'home-streaming'],
      [getPopularMovies(1), 'movie', setPopularMovies, 'home-movies'],
      [getPopularTVShows(1), 'tv', setPopularTVShows, 'home-tv'],
      [getTVShowsByGenre(16, 1), 'tv', setAnimeShows, 'home-anime'],
    ];
    const results = await Promise.allSettled(requests.map(([request]) => request));
    let failed = false;
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        failed = true;
        console.error('Error loading home row:', result.reason);
        return;
      }
      const [, mediaType, setRows, cacheKey] = requests[index];
      const rows = result.value.results.map((item) => ({
        ...item,
        media_type: getMediaType(item, mediaType),
      }));
      writeRowCache(cacheKey, rows);
      setRows(filterWatchedItems(rows, mediaType));
      setLastUpdated(Date.now());
    });
    setRefreshFailed(failed);
    if (failed && results.some((result) => result.status === 'rejected' && isNetworkError(result.reason))) {
      setOffline(true);
    }
    setLoading(false);
  };

  const hasRows = [theatreMovies, streamingContent, popularMovies, popularTVShows, animeShows].some((items) => items.length > 0);

  if (offline && !hasRows && !loading) {
    return (
      <div className="min-h-screen bg-bg px-4 py-8">
        <RowCacheStatus
          lastUpdated={lastUpdated}
          refreshFailed={refreshFailed}
          hasCachedRows={false}
          onRetry={loadData}
          offline={offline}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg transition-colors duration-200">
      {/* Content Section */}
      <div className="container mx-auto px-4 py-8">
        <RowCacheStatus
          lastUpdated={lastUpdated}
          refreshFailed={refreshFailed}
          hasCachedRows={hasRows}
          onRetry={loadData}
          offline={offline}
        />
        {/* Popular in Theatres Section - Always show at top unless genre/category filter is active */}
        {!selectedGenre && !selectedCategory && (
          <>
            <div className="mb-16">
              <MovieList
                title="Popular in Theatres"
                items={theatreMovies}
                loading={loading}
                emptyMessage="No movies in theatres available"
                limit={12}
                viewAllLink="/view-all/theatre"
              />
            </div>
            
            {/* Popular on Streaming Section */}
            <div className="mb-16">
              <MovieList
                title="Popular on Streaming"
                items={streamingContent}
                loading={loading}
                emptyMessage="No streaming content available"
                limit={12}
                viewAllLink="/view-all/streaming"
              />
            </div>
          </>
        )}

        {/* Popular Movies */}
        <div className="mb-16">
          <MovieList
            title={selectedCategory ? `${selectedCategory.name}` : selectedGenre ? "Movies in Genre" : "Movies"}
            items={popularMovies}
            loading={loading}
            emptyMessage="No movies available"
            limit={12}
            viewAllLink={!selectedCategory && !selectedGenre ? "/view-all/movies" : null}
          />
        </div>

        {/* Popular TV Shows - Hide when category filter is active */}
        {!selectedCategory && (
          <div className="mb-16">
            <MovieList
              title={selectedGenre ? "TV Shows in Genre" : "Series"}
              items={popularTVShows}
              loading={loading}
              emptyMessage="No TV shows available"
              limit={12}
              viewAllLink={!selectedGenre ? "/view-all/tv" : null}
            />
          </div>
        )}

        {/* Anime Section - Only show if no genre filter */}
        {!selectedGenre && (
          <div className="mb-16">
            <MovieList
              title="Anime"
              items={animeShows}
              loading={loading}
              emptyMessage="No anime shows available"
              limit={12}
              viewAllLink="/view-all/anime"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
