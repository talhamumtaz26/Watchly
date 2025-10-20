import React from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../utils/api';
import { FiStar, FiFilm, FiTv } from 'react-icons/fi';
import { isWatched } from '../utils/storage';

const MovieCard = ({ item, showType = true }) => {
  // Determine media type
  const mediaType = item.media_type || (item.title ? 'movie' : 'tv');
  const title = item.title || item.name;
  const releaseDate = item.release_date || item.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : 'N/A';
  
  // Check if item is watched
  const watched = isWatched(item.id, mediaType);
  
  // Format date as "Month Day, Year"
  const formatDate = (dateString) => {
    if (!dateString) return 'Coming Soon';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Link
      to={`/details/${mediaType}/${item.id}`}
      className="group block bg-card-darker rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] animate-fade-in overflow-hidden"
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
        <img
          src={getImageUrl(item.poster_path)}
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/500x750/1E293B/94A3B8?text=No+Image';
          }}
        />
        
        {/* Watched Badge - Top Left */}
        {watched && (
          <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 shadow-lg animate-fade-in">
            <span>✓</span>
            <span>Watched</span>
          </div>
        )}
        
        {/* Rating Badge - Top Right (or Release Date for upcoming) */}
        {item.upcoming_release_date ? (
          <div className="absolute top-2 right-2 bg-black/95 text-white px-2 py-1 rounded-md text-xs font-bold">
            {new Date(item.upcoming_release_date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
        ) : item.vote_average > 0 ? (
          <div className="absolute top-2 right-2 bg-black/95 text-white px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1">
            <span className="text-yellow-400">⭐</span>
            <span>{item.vote_average.toFixed(1)}</span>
          </div>
        ) : null}
      </div>

      {/* Title and Info Section - Below Poster with darker background */}
      <div className="p-3 bg-[#1a1d29]">
        {/* Title */}
        <h3 className="font-semibold text-sm text-white line-clamp-1 mb-1 leading-tight">
          {title}
        </h3>
        
        {/* Year and Type Row - Year First */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <span className="font-medium">{year}</span>
          <span className="text-gray-600">•</span>
          <span className="font-medium text-red-600 capitalize">{mediaType === 'movie' ? 'Movie' : 'Series'}</span>
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;
