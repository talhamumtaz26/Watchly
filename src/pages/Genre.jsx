import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMoviesByGenre, getTVShowsByGenre, getImageUrl } from '../utils/api';
import { FiArrowLeft, FiFilm, FiTv } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';

const Genre = () => {
  const { id, name } = useParams();
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [tvShows, setTVShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('movies');
  const [moviePage, setMoviePage] = useState(1);
  const [tvPage, setTVPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreMovies, setHasMoreMovies] = useState(true);
  const [hasMoreTV, setHasMoreTV] = useState(true);

  useEffect(() => {
    loadGenreData();
    // Reload when the route genre changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadGenreData = async () => {
    setLoading(true);
    try {
      const [moviesData, tvData] = await Promise.all([
        getMoviesByGenre(id, 1),
        getTVShowsByGenre(id, 1),
      ]);

      setMovies(moviesData.results);
      setTVShows(tvData.results);
      setMoviePage(1);
      setTVPage(1);
      setHasMoreMovies(moviesData.page < moviesData.total_pages);
      setHasMoreTV(tvData.page < tvData.total_pages);
    } catch (error) {
      console.error('Error loading genre data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreMovies = async () => {
    if (!hasMoreMovies || loadingMore) return;
    
    setLoadingMore(true);
    const nextPage = moviePage + 1;
    
    try {
      const data = await getMoviesByGenre(id, nextPage);
      setMovies([...movies, ...data.results]);
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
      const data = await getTVShowsByGenre(id, nextPage);
      setTVShows([...tvShows, ...data.results]);
      setTVPage(nextPage);
      setHasMoreTV(data.page < data.total_pages);
    } catch (error) {
      console.error('Error loading more TV shows:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleItemClick = (item, mediaType) => {
    navigate(`/details/${mediaType}/${item.id}`);
  };

  if (loading) {
    return <LoadingSpinner fullScreen={true} message="Loading genre content..." />;
  }

  const displayItems = activeTab === 'movies' ? movies : tvShows;
  const hasMore = activeTab === 'movies' ? hasMoreMovies : hasMoreTV;
  const loadMore = activeTab === 'movies' ? loadMoreMovies : loadMoreTV;

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-fg-secondary hover:text-fg transition-colors mb-6"
        >
          <FiArrowLeft className="text-xl" />
          <span>Back</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-fg">
            {decodeURIComponent(name)} Genre
          </h1>

          {/* Tab Switcher */}
          <div className="flex gap-2 bg-surface rounded-md p-1">
            <button
              onClick={() => setActiveTab('movies')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold transition-colors ${
                activeTab === 'movies'
                  ? 'bg-brand text-on-brand'
                  : 'text-fg-secondary hover:text-fg'
              }`}
            >
              <FiFilm />
              Movies ({movies.length})
            </button>
            <button
              onClick={() => setActiveTab('tv')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold transition-colors ${
                activeTab === 'tv'
                  ? 'bg-brand text-on-brand'
                  : 'text-fg-secondary hover:text-fg'
              }`}
            >
              <FiTv />
              TV Shows ({tvShows.length})
            </button>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="container mx-auto px-4 pb-8">
        {displayItems.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {displayItems.map((item) => {
                const title = item.title || item.name;
                const year = item.release_date?.split('-')[0] || item.first_air_date?.split('-')[0];

                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item, activeTab === 'movies' ? 'movie' : 'tv')}
                    className="cursor-pointer group"
                  >
                    <div className="relative">
                      <img
                        src={getImageUrl(item.poster_path, 'w500')}
                        alt={title}
                        className="w-full rounded-md  group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/placeholder-image.svg';
                        }}
                      />
                      {item.vote_average > 0 && (
                        <div className="absolute top-2 right-2 bg-bg/95 text-brand px-2 py-1 rounded-md text-xs font-bold">
                          ⭐ {item.vote_average.toFixed(1)}
                        </div>
                      )}
                    </div>
                    <h3 className="text-fg font-semibold mt-2 line-clamp-2 group-hover:text-brand transition-colors">
                      {title}
                    </h3>
                    <p className="text-fg-secondary text-sm mt-1">
                      {year && `${year} • `}
                      <span className="text-fg-secondary">{activeTab === 'movies' ? 'Movie' : 'Series'}</span>
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="bg-brand hover:bg-brand-hover text-on-brand px-8 py-3 rounded-md font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingMore ? 'Loading...' : `Load More ${activeTab === 'movies' ? 'Movies' : 'TV Shows'}`}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-fg mb-2">
              No {activeTab === 'movies' ? 'movies' : 'TV shows'} found
            </h2>
            <p className="text-fg-secondary">
              Try switching to {activeTab === 'movies' ? 'TV shows' : 'movies'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Genre;
