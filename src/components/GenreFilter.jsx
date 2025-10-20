import React, { useState, useEffect } from 'react';
import { getMovieDetails } from '../utils/api';

const GenreFilter = ({ onGenreSelect, selectedGenre }) => {
  const [genres, setGenres] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  // TMDb genre IDs and names
  const movieGenres = [
    { id: 28, name: 'Action' },
    { id: 12, name: 'Adventure' },
    { id: 16, name: 'Animation' },
    { id: 35, name: 'Comedy' },
    { id: 80, name: 'Crime' },
    { id: 99, name: 'Documentary' },
    { id: 18, name: 'Drama' },
    { id: 10751, name: 'Family' },
    { id: 14, name: 'Fantasy' },
    { id: 36, name: 'History' },
    { id: 27, name: 'Horror' },
    { id: 10402, name: 'Music' },
    { id: 9648, name: 'Mystery' },
    { id: 10749, name: 'Romance' },
    { id: 878, name: 'Sci-Fi' },
    { id: 10770, name: 'TV Movie' },
    { id: 53, name: 'Thriller' },
    { id: 10752, name: 'War' },
    { id: 37, name: 'Western' },
  ];

  useEffect(() => {
    setGenres(movieGenres);
  }, []);

  const handleGenreClick = (genreId) => {
    onGenreSelect(genreId === selectedGenre ? null : genreId);
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-display font-bold text-white">
          Filter by Genre
        </h3>
        {selectedGenre && (
          <button
            onClick={() => onGenreSelect(null)}
            className="text-sm text-accent-purple hover:text-accent-blue transition-colors font-medium"
          >
            Clear Filter
          </button>
        )}
      </div>

      {/* Desktop View - All Chips Visible */}
      <div className="hidden md:flex flex-wrap gap-3">
        {genres.map((genre) => (
          <button
            key={genre.id}
            onClick={() => handleGenreClick(genre.id)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
              selectedGenre === genre.id
                ? 'bg-gradient-purple text-white scale-105 shadow-purple'
                : 'bg-card-darker text-text-muted hover:text-white hover:bg-card-dark hover:scale-105 shadow-card'
            }`}
          >
            {genre.name}
          </button>
        ))}
      </div>

      {/* Mobile View - Dropdown */}
      <div className="md:hidden relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 bg-card-darker rounded-xl text-left flex items-center justify-between border border-white/10 shadow-card hover:border-accent-purple/50 transition-colors"
        >
          <span className="text-white font-medium">
            {selectedGenre
              ? genres.find((g) => g.id === selectedGenre)?.name || 'All Genres'
              : 'All Genres'}
          </span>
          <span className="text-text-muted">{isOpen ? '▲' : '▼'}</span>
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute top-full mt-2 w-full bg-card-darker rounded-xl shadow-card-hover border border-white/10 z-50 max-h-80 overflow-y-auto backdrop-blur-custom">
              <button
                onClick={() => {
                  onGenreSelect(null);
                  setIsOpen(false);
                }}
                className="w-full px-4 py-3 text-left hover:bg-card-dark text-white border-b border-white/10 font-medium"
              >
                All Genres
              </button>
              {genres.map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => {
                    handleGenreClick(genre.id);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left hover:bg-card-dark border-b border-white/10 last:border-b-0 font-medium ${
                    selectedGenre === genre.id
                      ? 'bg-gradient-purple text-white'
                      : 'text-text-muted hover:text-white'
                  }`}
                >
                  {genre.name}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GenreFilter;
