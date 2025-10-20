import React, { useState, useEffect } from 'react';
import { getUpcomingMovies } from '../utils/api';
import { useToast } from '../components/Toast';
import MovieCard from '../components/MovieCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Upcoming = () => {
  const [upcomingItems, setUpcomingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    loadUpcoming();
  }, []);

  const loadUpcoming = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const sixMonthsLater = new Date();
      sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);

      // Fetch upcoming movies from multiple pages to get more results
      const moviePromises = [];
      for (let page = 1; page <= 10; page++) {
        moviePromises.push(getUpcomingMovies(page));
      }

      const moviePages = await Promise.all(moviePromises);

      // Combine all movie results
      const allMovies = moviePages.flatMap(page => 
        page.results.map(m => ({ ...m, media_type: 'movie' }))
      );

      // Filter for next 6 months
      const filtered = allMovies
        .filter(item => {
          const releaseDate = item.release_date;
          if (!releaseDate) return false;
          const date = new Date(releaseDate);
          return date >= today && date <= sixMonthsLater;
        })
        .sort((a, b) => {
          const dateA = new Date(a.release_date);
          const dateB = new Date(b.release_date);
          return dateA - dateB;
        })
        // Remove duplicates
        .filter((item, index, self) => 
          index === self.findIndex(t => t.id === item.id)
        );

      console.log('Upcoming movies loaded:', filtered.length, 'items for next 6 months');
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

  return (
    <div className="min-h-screen bg-black transition-colors duration-200">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Upcoming Releases
          </h1>
          <p className="text-sm text-gray-400">
            Movies releasing in the next 6 months
          </p>
        </div>

        {/* Upcoming Items Grid */}
        {upcomingItems.length === 0 ? (
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
            {upcomingItems.map((item) => {
              // Create a modified item with release date in place of rating
              const modifiedItem = {
                ...item,
                vote_average: 0, // Hide rating
                upcoming_release_date: item.release_date, // Show release date
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
