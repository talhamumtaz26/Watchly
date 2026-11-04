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
          <h2 className="text-2xl md:text-3xl font-sans font-bold text-fg flex items-center gap-3">
            {icon && <span className="text-3xl md:text-4xl">{icon}</span>}
            {title}
          </h2>
          {viewAllLink && (
            <Link 
              to={viewAllLink}
              aria-label={`View all ${title}`}
              title={`View all ${title}`}
              className="flex items-center gap-2 text-brand hover:text-brand-hover transition-colors font-semibold"
            >
              <FiArrowRight className="text-2xl" />
            </Link>
          )}
        </div>
        <div className="media-grid">
          {[...Array(limit || 12)].map((_, index) => (
            <div
              key={index}
              className="animate-pulse bg-surface rounded-md aspect-[2/3] "
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
          <h2 className="text-2xl md:text-3xl font-sans font-bold text-fg flex items-center gap-3">
            {icon && <span className="text-3xl md:text-4xl">{icon}</span>}
            {title}
          </h2>
          {viewAllLink && (
            <Link 
              to={viewAllLink}
              className="flex items-center gap-2 text-brand hover:text-brand-hover transition-colors font-semibold"
            >
              <FiArrowRight className="text-2xl" />
            </Link>
          )}
        </div>
        <div className="text-center py-16 text-fg-muted bg-surface rounded-md ">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-lg">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-12 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-sans font-bold text-fg flex items-center gap-3">
          {icon && <span className="text-3xl md:text-4xl">{icon}</span>}
          {title}
        </h2>
        {viewAllLink && (
          <Link 
            to={viewAllLink}
            className="flex items-center gap-2 text-brand hover:text-brand-hover transition-colors font-semibold"
          >
            <FiArrowRight className="text-2xl" />
          </Link>
        )}
      </div>
      <div className="media-grid">
        {displayItems.map((item) => (
          <MovieCard key={`${item.id}-${item.media_type}`} item={item} />
        ))}
      </div>
    </div>
  );
};

export default MovieList;
