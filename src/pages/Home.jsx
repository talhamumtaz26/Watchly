import React, { useState, useEffect } from 'react';
import { getNowPlayingMovies, getStreamingContent, getPopularMovies, getPopularTVShows, getTVShowsByGenre } from '../utils/api';
import { getSetting, getWatched } from '../utils/storage';
import MovieList from '../components/MovieList';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { currentUser } = useAuth();
  const [theatreMovies, setTheatreMovies] = useState([]);
  const [streamingContent, setStreamingContent] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [popularTVShows, setPopularTVShows] = useState([]);
  const [animeShows, setAnimeShows] = useState([]);
  const [loading, setLoading] = useState(true);
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
      const type = item.media_type || mediaType;
      const key = `${item.id}-${type}`;
      return !watchedMap.has(key);
    });
  };

  useEffect(() => {
    loadData();
    // Load the default sections once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [theatreData, streamingData, moviesData, tvData, animeData] = await Promise.all([
        getNowPlayingMovies(1),
        getStreamingContent('movie', 1),
        getPopularMovies(1),
        getPopularTVShows(1),
        getTVShowsByGenre(16, 1), // Genre 16 is Animation
      ]);

      setTheatreMovies(filterWatchedItems(theatreData.results, 'movie'));
      setStreamingContent(filterWatchedItems(streamingData.results, 'movie'));
      setPopularMovies(filterWatchedItems(moviesData.results, 'movie'));
      setPopularTVShows(filterWatchedItems(tvData.results, 'tv'));
      setAnimeShows(filterWatchedItems(
        animeData.results.map((item) => ({ ...item, media_type: 'tv', isAnime: true })),
        'tv'
      ));
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black transition-colors duration-200">
      {/* Content Section */}
      <div className="container mx-auto px-4 py-8">
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
