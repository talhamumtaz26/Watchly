import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchMedia, getImageUrl } from '../utils/api';
import { FiSearch } from 'react-icons/fi';
import { useToast } from '../components/Toast';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const searchSequence = useRef(0);

  useEffect(() => {
    const sequence = ++searchSequence.current;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      if (query.trim().length > 2) {
        handleSearch(controller.signal, sequence);
      } else {
        setResults([]);
      }
      // Search is debounced and runs when the query changes.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, 500);
    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
    // Search is debounced and runs when the query changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, toast]);

  const handleSearch = async (signal, sequence) => {
    setLoading(true);
    try {
      const data = await searchMedia(query, 'multi', 1, signal);
      if (sequence === searchSequence.current) setResults(data.results.slice(0, 20));
    } catch (error) {
      if (error.code === 'ERR_CANCELED' || error.name === 'CanceledError') return;
      console.error('Search error:', error);
      toast.error('Search is temporarily unavailable. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = (item) => {
    if (item.media_type === 'person') {
      navigate(`/actor/${item.id}`);
      return;
    }
    const mediaType = item.media_type || (item.title ? 'movie' : 'tv');
    navigate(`/details/${mediaType}/${item.id}`);
  };

  const isEmptyState = results.length === 0 && query.trim().length === 0;
  const isNoResults = query.trim().length > 2 && !loading && results.length === 0;

  return (
    <div className={`bg-black ${isEmptyState || isNoResults ? 'h-screen overflow-hidden fixed inset-0 pt-16' : 'min-h-screen'}`}>
      <div className={`bg-black border-b border-gray-800 ${isEmptyState || isNoResults ? '' : 'sticky top-16'} z-30`}>
        <div className="container mx-auto px-4 py-4">
          <div className="max-w-2xl mx-auto relative">
            <div className="relative">
              <label htmlFor="media-search" className="sr-only">Search for movies, TV shows, or actors</label>
              <input id="media-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search for movies, TV shows, actors..." className="w-full px-5 py-3 pl-12 bg-card-dark text-white rounded-xl border border-gray-800 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/50 transition-all text-base" autoFocus />
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
            </div>
            {loading && (<div className="absolute right-4 top-1/2 transform -translate-y-1/2"><div className="animate-spin h-5 w-5 border-2 border-red-600 border-t-transparent rounded-full"></div></div>)}
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4">
        {isEmptyState ? (
          <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 12rem)' }}>
            <div className="text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-2xl font-bold text-white mb-2">Start Searching</h2>
              <p className="text-gray-400">Type to search for movies, TV shows, and more...</p>
            </div>
          </div>
        ) : results.length > 0 ? (
          <div className="py-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {results.map((item) => {
                const title = item.title || item.name;
                const mediaType = item.media_type || (item.title ? 'movie' : 'tv');
                const year = item.release_date?.split('-')[0] || item.first_air_date?.split('-')[0];
                return (
                  <button type="button" key={`${mediaType}-${item.id}`} onClick={() => handleResultClick(item)} className="text-left w-full bg-card-dark rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-300 shadow-lg">
                    <div className="relative">
                      <img src={getImageUrl(item.poster_path, 'w500')} alt={title} className="w-full h-72 object-cover" onError={(e) => {e.currentTarget.onerror = null; e.currentTarget.src = '/placeholder-image.svg';}} />
                      {item.vote_average > 0 && (
                        <div className="absolute top-2 right-2 bg-black/95 text-yellow-500 px-2 py-1 rounded-lg text-xs font-bold">
                          ⭐ {item.vote_average.toFixed(1)}
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="text-white font-semibold text-sm line-clamp-2 mb-1">{title}</h3>
                      <p className="text-xs text-gray-400">
                        <span className="text-red-600 capitalize">{mediaType}</span>
                        {year && ` • ${year}`}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : isNoResults ? (
          <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 12rem)' }}>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">No results found</h2>
              <p className="text-gray-400">Try searching with different keywords</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Search;