import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchMedia } from '../utils/api';
import { FiSearch } from 'react-icons/fi';
import { MdKeyboardArrowDown } from 'react-icons/md';

const SearchBar = ({ onGenreSelect, selectedGenre, onCategorySelect, selectedCategory }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showGenreDropdown, setShowGenreDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [localSelectedCategory, setLocalSelectedCategory] = useState('all');
  const navigate = useNavigate();

  const categories = [
    { id: 'all', name: 'All Categories', region: null, language: null },
    { id: 'hollywood', name: 'Hollywood Movies', region: 'US', language: 'en' },
    { id: 'bollywood', name: 'Bollywood Movies', region: 'IN', language: 'hi' },
    { id: 'pakistani', name: 'Pakistani Movies', region: 'PK', language: 'ur' },
    { id: 'korean', name: 'Korean Movies', region: 'KR', language: 'ko' },
    { id: 'japanese', name: 'Japanese Movies', region: 'JP', language: 'ja' },
    { id: 'turkish', name: 'Turkish Movies', region: 'TR', language: 'tr' },
  ];

  const genres = [
    { id: null, name: 'All Genre' },
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
    { id: 53, name: 'Thriller' },
    { id: 10752, name: 'War' },
    { id: 37, name: 'Western' },
  ];

  useEffect(() => {
    // Debounce search
    const timeoutId = setTimeout(() => {
      if (query.trim().length > 2) {
        handleSearch();
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const data = await searchMedia(query, 'multi', 1);
      setResults(data.results.slice(0, 6)); // Show top 6 results
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = (item) => {
    const mediaType = item.media_type || (item.title ? 'movie' : 'tv');
    navigate(`/details/${mediaType}/${item.id}`);
    setQuery('');
    setShowResults(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // If there's a search query, search for it
    if (query.trim().length > 0 && results.length > 0) {
      handleResultClick(results[0]);
    } 
    // If category is selected, pass it to parent
    else if (localSelectedCategory && localSelectedCategory !== 'all') {
      const category = categories.find(c => c.id === localSelectedCategory);
      if (category && onCategorySelect) {
        onCategorySelect(category);
      }
      setShowResults(false);
    }
    // If only genre is selected, filter the home page
    else if (selectedGenre) {
      if (onGenreSelect) {
        onGenreSelect(selectedGenre);
      }
      setShowResults(false);
    }
  };

  const selectedGenreName = genres.find(g => g.id === selectedGenre)?.name || 'All Genre';
  const selectedCategoryName = categories.find(c => c.id === localSelectedCategory)?.name || 'All Categories';

  return (
    <div className="relative w-full max-w-5xl">
      <form onSubmit={handleSubmit} className="relative">
        {/* Responsive Layout */}
        <div className="flex flex-col md:flex-row gap-2">
          {/* Category Dropdown */}
          <div className="relative w-full md:w-48">
            <button
              type="button"
              onClick={() => {
                setShowCategoryDropdown(!showCategoryDropdown);
                setShowGenreDropdown(false);
              }}
              className="w-full px-3 py-2.5 md:px-4 md:py-3 rounded-md bg-card-dark text-white hover:bg-card-darker transition-colors flex items-center justify-between font-medium text-sm border border-white/10"
            >
              <span className="truncate">{selectedCategoryName}</span>
              <MdKeyboardArrowDown className="w-5 h-5 flex-shrink-0" />
            </button>

            {showCategoryDropdown && (
              <>
                <div
                  className="fixed inset-0 z-[998]"
                  onClick={() => setShowCategoryDropdown(false)}
                />
                <div className="absolute top-full mt-1 left-0 w-full bg-card-darker rounded-md shadow-2xl border border-white/10 z-[999] max-h-80 overflow-y-auto">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => {
                        setLocalSelectedCategory(category.id);
                        onCategorySelect && onCategorySelect(category);
                        setShowCategoryDropdown(false);
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-card-dark border-b border-white/5 last:border-b-0 transition-colors text-sm ${
                        localSelectedCategory === category.id
                          ? 'bg-gradient-purple text-white font-semibold'
                          : 'text-text-muted hover:text-white'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Genre Dropdown */}
          <div className="relative w-full md:w-40">
            <button
              type="button"
              onClick={() => {
                setShowGenreDropdown(!showGenreDropdown);
                setShowCategoryDropdown(false);
              }}
              className="w-full px-3 py-2.5 md:px-4 md:py-3 rounded-md bg-card-dark text-white hover:bg-card-darker transition-colors flex items-center justify-between font-medium text-sm border border-white/10"
            >
              <span className="truncate">{selectedGenreName}</span>
              <MdKeyboardArrowDown className="w-5 h-5 flex-shrink-0" />
            </button>

            {showGenreDropdown && (
              <>
                <div
                  className="fixed inset-0 z-[998]"
                  onClick={() => setShowGenreDropdown(false)}
                />
                <div className="absolute top-full mt-1 left-0 w-full bg-card-darker rounded-md shadow-2xl border border-white/10 z-[999] max-h-80 overflow-y-auto">
                  {genres.map((genre) => (
                    <button
                      key={genre.id || 'all'}
                      type="button"
                      onClick={() => {
                        onGenreSelect && onGenreSelect(genre.id);
                        setShowGenreDropdown(false);
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-card-dark border-b border-white/5 last:border-b-0 transition-colors text-sm ${
                        selectedGenre === genre.id
                          ? 'bg-gradient-purple text-white font-semibold'
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

          {/* Search Input */}
          <div className="relative flex-1 flex gap-2">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-text-muted w-4 h-4 md:w-5 md:h-5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => query.length > 2 && setShowResults(true)}
                placeholder="Search movies..."
                className="w-full pl-10 md:pl-12 pr-3 py-2.5 md:py-3 rounded-md border border-white/10 bg-card-dark text-white placeholder-text-muted focus:outline-none focus:border-accent-purple transition-colors text-sm"
              />
              {loading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin h-4 w-4 md:h-5 md:w-5 border-2 border-accent-purple border-t-transparent rounded-full"></div>
                </div>
              )}
            </div>
            <button
              type="submit"
              className="px-4 md:px-6 py-2.5 md:py-3 bg-gradient-purple hover:shadow-purple text-white rounded-md font-medium transition-all text-sm flex-shrink-0"
            >
              GO
            </button>
          </div>
        </div>
      </form>

      {/* Search Results Dropdown */}
      {showResults && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-card-darker rounded-lg shadow-2xl border border-white/10 z-50 max-h-96 overflow-y-auto">
          {results.map((item) => {
            const title = item.title || item.name;
            const mediaType = item.media_type || (item.title ? 'movie' : 'tv');
            const year = item.release_date || item.first_air_date;
            
            return (
              <button
                key={`${item.id}-${mediaType}`}
                onClick={() => handleResultClick(item)}
                className="w-full flex items-center p-3 hover:bg-card-dark transition-colors border-b border-white/5 last:border-b-0"
              >
                <div className="w-12 h-16 bg-card-dark rounded overflow-hidden flex-shrink-0">
                  {item.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                      alt={title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-muted">
                      🎬
                    </div>
                  )}
                </div>
                <div className="ml-3 flex-1 text-left">
                  <p className="font-semibold text-white line-clamp-1">
                    {title}
                  </p>
                  <p className="text-sm text-text-muted">
                    {year ? new Date(year).getFullYear() : 'N/A'} • {mediaType === 'movie' ? 'Movie' : 'TV Show'}
                  </p>
                  {item.vote_average > 0 && (
                    <p className="text-xs text-accent-yellow">
                      ⭐ {item.vote_average.toFixed(1)}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Click outside to close */}
      {showResults && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  );
};

export default SearchBar;
