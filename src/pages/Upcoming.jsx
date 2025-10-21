import React, { useState, useEffect } from 'react';
import { getUpcomingMovies, getUpcomingTVShows, getUpcomingAnime } from '../utils/api';
import { useToast } from '../components/Toast';
import MovieCard from '../components/MovieCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Upcoming = () => {
  const [upcomingItems, setUpcomingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'movies', 'tv', 'anime'
  const toast = useToast();

  useEffect(() => {
    loadUpcoming();
  }, []);

  const loadUpcoming = async () => {
    setLoading(true);
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

      const [moviePages, tvPages, animePages] = await Promise.all([
        Promise.all(moviePromises),
        Promise.all(tvPromises),
        Promise.all(animePromises)
      ]);

      // Combine all results
      const allMovies = moviePages.flatMap(page => 
        page.results.map(m => ({ ...m, media_type: 'movie' }))
      );

      const allTVShows = tvPages.flatMap(page => 
        page.results.map(t => ({ ...t, media_type: 'tv' }))
      );

      const allAnime = animePages.flatMap(page => 
        page.results.map(a => ({ ...a, media_type: 'tv', isAnime: true }))
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
          index === self.findIndex(t => t.id === item.id && t.media_type === item.media_type)
        );

      console.log('Upcoming content loaded:', filtered.length, 'items');
      setUpcomingItems(filtered);
    } catch (error) {
      console.error('Error loading upcoming content:', error);
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
    if (filter === 'movies') return item.media_type === 'movie';
    if (filter === 'tv') return item.media_type === 'tv' && !item.isAnime;
    if (filter === 'anime') return item.isAnime;
    return true;
  });

  return (
    <div className="min-h-screen bg-black transition-colors duration-200">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Upcoming Releases
          </h1>
          <p className="text-sm text-gray-400">
            Movies, TV Shows & Anime releasing soon
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex justify-center gap-2 mb-8 overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all text-xs whitespace-nowrap ${
              filter === 'all'
                ? 'bg-red-600 text-white'
                : 'bg-card-darker text-gray-400 hover:text-white hover:bg-card-dark border border-white/10'
            }`}
          >
            All ({upcomingItems.length})
          </button>
          <button
            onClick={() => setFilter('movies')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all text-xs whitespace-nowrap ${
              filter === 'movies'
                ? 'bg-red-600 text-white'
                : 'bg-card-darker text-gray-400 hover:text-white hover:bg-card-dark border border-white/10'
            }`}
          >
            Movies ({upcomingItems.filter(i => i.media_type === 'movie').length})
          </button>
          <button
            onClick={() => setFilter('tv')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all text-xs whitespace-nowrap ${
              filter === 'tv'
                ? 'bg-red-600 text-white'
                : 'bg-card-darker text-gray-400 hover:text-white hover:bg-card-dark border border-white/10'
            }`}
          >
            Series ({upcomingItems.filter(i => i.media_type === 'tv' && !i.isAnime).length})
          </button>
          <button
            onClick={() => setFilter('anime')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all text-xs whitespace-nowrap ${
              filter === 'anime'
                ? 'bg-red-600 text-white'
                : 'bg-card-darker text-gray-400 hover:text-white hover:bg-card-dark border border-white/10'
            }`}
          >
            Anime ({upcomingItems.filter(i => i.isAnime).length})
          </button>
        </div>

        {/* Upcoming Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📅</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              No upcoming releases found
            </h2>
            <p className="text-gray-400">
              Check back later for new releases
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
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
