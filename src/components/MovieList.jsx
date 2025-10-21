import React from 'react';
import { Link } from 'react-router-dom';
import MovieCard from './MovieCard';
import { FiArrowRight } from 'react-icons/fi';

const MovieList = ({ title, items, loading = false, emptyMessage = 'No items to display', icon, limit, viewAllLink }) => {
  // Limit the items if a limit is provided
  const displayItems = limit ? items?.slice(0, limit) : items;

  if (loading) {
    return (
      <div className="mb-12 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-white flex items-center gap-3">
            {icon && <span className="text-3xl md:text-4xl">{icon}</span>}
            {title}
          </h2>
          {viewAllLink && (
            <Link 
              to={viewAllLink}
              className="flex items-center gap-2 text-red-600 hover:text-red-500 transition-colors font-semibold"
            >
              <FiArrowRight className="text-2xl" />
            </Link>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {[...Array(limit || 12)].map((_, index) => (
            <div
              key={index}
              className="animate-pulse bg-card-darker rounded-2xl aspect-[2/3] shadow-card"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!displayItems || displayItems.length === 0) {
    return (
      <div className="mb-12 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-white flex items-center gap-3">
            {icon && <span className="text-3xl md:text-4xl">{icon}</span>}
            {title}
          </h2>
          {viewAllLink && (
            <Link 
              to={viewAllLink}
              className="flex items-center gap-2 text-red-600 hover:text-red-500 transition-colors font-semibold"
            >
              <FiArrowRight className="text-2xl" />
            </Link>
          )}
        </div>
        <div className="text-center py-16 text-text-muted bg-card-darker rounded-2xl shadow-card">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-lg">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-12 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-white flex items-center gap-3">
          {icon && <span className="text-3xl md:text-4xl">{icon}</span>}
          {title}
        </h2>
        {viewAllLink && (
          <Link 
            to={viewAllLink}
            className="flex items-center gap-2 text-red-600 hover:text-red-500 transition-colors font-semibold"
          >
            <FiArrowRight className="text-2xl" />
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {displayItems.map((item) => (
          <MovieCard key={`${item.id}-${item.media_type}`} item={item} />
        ))}
      </div>
    </div>
  );
};

export default MovieList;
