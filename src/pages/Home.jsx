import React, { useState, useEffect } from 'react';
import { getNowPlayingMovies, getStreamingContent, getPopularMovies, getPopularTVShows, getMoviesByGenre, getTVShowsByGenre, getMoviesByRegion } from '../utils/api';
import { getSetting, getWatched } from '../utils/storage';
import MovieList from '../components/MovieList';
import { FaFilm, FaTv, FaTheaterMasks } from 'react-icons/fa';
import { GiJapan } from 'react-icons/gi';
import { MdLiveTv } from 'react-icons/md';

const Home = () => {
  const [theatreMovies, setTheatreMovies] = useState([]);
  const [streamingContent, setStreamingContent] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [popularTVShows, setPopularTVShows] = useState([]);
  const [animeShows, setAnimeShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [searchGenre, setSearchGenre] = useState(null);
  const [searchCategory, setSearchCategory] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [moviePage, setMoviePage] = useState(1);
  const [tvPage, setTVPage] = useState(1);
  const [animePage, setAnimePage] = useState(1);
  const [hasMoreMovies, setHasMoreMovies] = useState(true);
  const [hasMoreTV, setHasMoreTV] = useState(true);
  const [hasMoreAnime, setHasMoreAnime] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filter function to remove watched items if setting is enabled
  const filterWatchedItems = (items, mediaType = null) => {
    const hideWatched = getSetting('hideWatchedFromHome', false);
    if (!hideWatched) return items;
    
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
  }, []);

  useEffect(() => {
    if (selectedGenre) {
      loadFilteredData();
    } else if (selectedCategory) {
      loadCategoryData();
    } else {
      loadData();
    }
  }, [selectedGenre, selectedCategory]);

  const loadData = async () => {
    setLoading(true);
    setMoviePage(1);
    setTVPage(1);
    setAnimePage(1);
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
      setAnimeShows(filterWatchedItems(animeData.results, 'tv'));
      setHasMoreMovies(moviesData.page < moviesData.total_pages);
      setHasMoreTV(tvData.page < tvData.total_pages);
      setHasMoreAnime(animeData.page < animeData.total_pages);
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFilteredData = async () => {
    setLoading(true);
    setMoviePage(1);
    setTVPage(1);
    try {
      const [moviesData, tvData] = await Promise.all([
        getMoviesByGenre(selectedGenre, 1),
        getTVShowsByGenre(selectedGenre, 1),
      ]);

      setPopularMovies(filterWatchedItems(moviesData.results, 'movie'));
      setPopularTVShows(filterWatchedItems(tvData.results, 'tv'));
      setHasMoreMovies(moviesData.page < moviesData.total_pages);
      setHasMoreTV(tvData.page < tvData.total_pages);
    } catch (error) {
      console.error('Error loading filtered data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategoryData = async () => {
    setLoading(true);
    setMoviePage(1);
    setTVPage(1);
    try {
      const moviesData = await getMoviesByRegion(
        selectedCategory.region,
        selectedCategory.language,
        1
      );

      setPopularMovies(filterWatchedItems(moviesData.results, 'movie'));
      setPopularTVShows([]); // Categories only show movies
      setHasMoreMovies(moviesData.page < moviesData.total_pages);
      setHasMoreTV(false);
    } catch (error) {
      console.error('Error loading category data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreMovies = async () => {
    if (!hasMoreMovies || loadingMore) return;
    
    setLoadingMore(true);
    const nextPage = moviePage + 1;
    
    try {
      const data = selectedCategory
        ? await getMoviesByRegion(selectedCategory.region, selectedCategory.language, nextPage)
        : selectedGenre
        ? await getMoviesByGenre(selectedGenre, nextPage)
        : await getPopularMovies(nextPage);
      
      setPopularMovies(prev => [...prev, ...filterWatchedItems(data.results, 'movie')]);
      setMoviePage(nextPage);
      setHasMoreMovies(data.page < data.total_pages);
    } catch (error) {
      console.error('Error loading more movies:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const loadMoreTV = async () => {
    if (!hasMoreTV || loadingMore) return;
    
    setLoadingMore(true);
    const nextPage = tvPage + 1;
    
    try {
      const data = selectedGenre
        ? await getTVShowsByGenre(selectedGenre, nextPage)
        : await getPopularTVShows(nextPage);
      
      setPopularTVShows(prev => [...prev, ...filterWatchedItems(data.results, 'tv')]);
      setTVPage(nextPage);
      setHasMoreTV(data.page < data.total_pages);
    } catch (error) {
      console.error('Error loading more TV shows:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const loadMoreAnime = async () => {
    if (!hasMoreAnime || loadingMore) return;
    
    setLoadingMore(true);
    const nextPage = animePage + 1;
    
    try {
      const data = await getTVShowsByGenre(16, nextPage);
      
      setAnimeShows(prev => [...prev, ...filterWatchedItems(data.results, 'tv')]);
      setAnimePage(nextPage);
      setHasMoreAnime(data.page < data.total_pages);
    } catch (error) {
      console.error('Error loading more anime:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleGenreSelect = (genreId) => {
    setSelectedGenre(genreId);
  };

  const handleSearchGenreSelect = (genreId) => {
    setSearchGenre(genreId);
    // Also apply the filter to the main content
    setSelectedGenre(genreId);
  };

  const handleSearchCategorySelect = (categoryId) => {
    setSearchCategory(categoryId);
  };

  const handleCategoryFilter = (category) => {
    if (category.id === 'all') {
      setSelectedCategory(null);
      setSelectedGenre(null);
    } else {
      setSelectedCategory(category);
      setSelectedGenre(null); // Clear genre filter when category is selected
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
