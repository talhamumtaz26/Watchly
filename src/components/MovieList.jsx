import React from 'react';
import MovieCard from './MovieCard';

const MovieList = ({ title, items, loading = false, emptyMessage = 'No items to display', icon }) => {
  if (loading) {
    return (
      <div className="mb-12 animate-fade-in">
        <h2 className="text-2xl md:text-3xl font-display font-bold mb-6 text-white flex items-center gap-3">
          {icon && <span className="text-3xl md:text-4xl">{icon}</span>}
          {title}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {[...Array(12)].map((_, index) => (
            <div
              key={index}
              className="animate-pulse bg-card-darker rounded-2xl aspect-[2/3] shadow-card"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="mb-12 animate-fade-in">
        <h2 className="text-2xl md:text-3xl font-display font-bold mb-6 text-white flex items-center gap-3">
          {icon && <span className="text-3xl md:text-4xl">{icon}</span>}
          {title}
        </h2>
        <div className="text-center py-16 text-text-muted bg-card-darker rounded-2xl shadow-card">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-lg">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-12 animate-fade-in">
      <h2 className="text-2xl md:text-3xl font-display font-bold text-white flex items-center gap-3 mb-6">
        {icon && <span className="text-3xl md:text-4xl">{icon}</span>}
        {title}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {items.map((item) => (
          <MovieCard key={`${item.id}-${item.media_type}`} item={item} />
        ))}
      </div>
    </div>
  );
};

export default MovieList;
