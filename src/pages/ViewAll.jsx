import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getNowPlayingMovies, getStreamingContent, getPopularMovies, getPopularTVShows, getTVShowsByGenre } from '../utils/api';
import { getSetting, getWatched } from '../utils/storage';
import MovieCard from '../components/MovieCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

const ViewAll = () => {
  const { type } = useParams(); // theatre, streaming, movies, tv, anime
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [items, setItems] = useState([]);
  const [allItems, setAllItems] = useState([]); // Store all items before filtering
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const sortBy = 'all'; // 'all', 'date', 'year', 'az'
  const selectedYear = '';
  const selectedLetter = '';
  const observerRef = useRef();
  const lastElementRef = useRef();
  const shouldRestoreRef = useRef(false);

  // Filter function to remove watched items if setting is enabled
  const filterWatchedItems = (items, mediaType = null) => {
    const hideWatched = getSetting('hideWatchedFromHome', false);
    if (!hideWatched || !currentUser) return items;
    
    const watchedItems = getWatched();
    const watchedMap = new Map();
    
    watchedItems.forEach(item => {
      const key = `${item.id}-${item.media_type}`;
      watchedMap.set(key, true);
    });
    
    return items.filter(item => {
      const itemType = item.media_type || mediaType;
      const key = `${item.id}-${itemType}`;
      return !watchedMap.has(key);
    });
  };

  // Get title and fetch function based on type
  const getPageConfig = () => {
    switch (type) {
      case 'theatre':
        return {
          title: 'Popular in Theatres',
          fetchFunction: getNowPlayingMovies,
          mediaType: 'movie'
        };
      case 'streaming':
        return {
          title: 'Popular on Streaming',
          fetchFunction: (page) => getStreamingContent('movie', page),
          mediaType: 'movie'
        };
      case 'movies':
        return {
          title: 'Movies',
          fetchFunction: (page, sort, year, letter) => getPopularMovies(page, sort, year, letter),
          mediaType: 'movie',
          supportsSort: true
        };
      case 'tv':
        return {
          title: 'Series',
          fetchFunction: (page, sort, year, letter) => getPopularTVShows(page, sort, year, letter),
          mediaType: 'tv',
          supportsSort: true
        };
      case 'anime':
        return {
          title: 'Anime',
          fetchFunction: (page, sort, year, letter) => getTVShowsByGenre(16, page, sort, year, letter),
          mediaType: 'tv',
          supportsSort: true
        };
      default:
        return null;
    }
  };

  const config = getPageConfig();

  // Restore state BEFORE first paint - runs on mount and when navigating back
  useLayoutEffect(() => {
    if (config) {
      
      const savedState = sessionStorage.getItem(`viewall_state_${type}`);
      
      if (savedState) {
        try {
          const { items: savedItems, page: savedPage, hasMore: savedHasMore, scrollPos } = JSON.parse(savedState);
          
          // If we have saved items, restore them immediately
          if (savedItems && savedItems.length > 0) {
            shouldRestoreRef.current = true;
            setItems(savedItems);
            setPage(savedPage);
            setHasMore(savedHasMore);
            setLoading(false);
            
            // Restore scroll position
            if (scrollPos) {
              // Use requestAnimationFrame to ensure DOM is ready
              requestAnimationFrame(() => {
                window.scrollTo(0, scrollPos);
              });
            }
            
            // Mark restoration complete after a delay
            setTimeout(() => {
              shouldRestoreRef.current = false;
            }, 2500);
            
            return; // IMPORTANT: Exit early to prevent loadData() from running
          } else {
            // No items saved, load fresh
            sessionStorage.removeItem(`viewall_state_${type}`);
          }
        } catch (error) {
          console.error('Error restoring state:', error);
          sessionStorage.removeItem(`viewall_state_${type}`);
        }
      } else {
      }
      
      // Only load data if we didn't restore from saved state
      if (!shouldRestoreRef.current) {
        loadData();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]); // Only depend on type, not location.key

  // Additional scroll restoration after images load
  useEffect(() => {
    if (shouldRestoreRef.current) {
      const savedState = sessionStorage.getItem(`viewall_state_${type}`);
      if (savedState) {
        const { scrollPos } = JSON.parse(savedState);
        
        const restoreScroll = () => {
          if (scrollPos && window.scrollY !== scrollPos) {
            window.scrollTo(0, scrollPos);
          }
        };

        // Fine-tune scroll position as images load
        setTimeout(restoreScroll, 100);
        setTimeout(restoreScroll, 300);
        setTimeout(restoreScroll, 600);
        setTimeout(restoreScroll, 1000);
        setTimeout(restoreScroll, 1500);
        
        // Final cleanup - DON'T remove state, just mark restoration complete
        setTimeout(() => {
          restoreScroll();
          shouldRestoreRef.current = false;
        }, 2000);
      }
    }
    // Scroll restoration uses the route type associated with the saved state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  // Save state continuously as user scrolls
  useEffect(() => {
    const saveState = () => {
      if (items.length > 0 && !shouldRestoreRef.current) {
        const currentScroll = window.scrollY;
        const stateToSave = {
          items,
          page,
          hasMore,
          scrollPos: currentScroll
        };
        
        sessionStorage.setItem(`viewall_state_${type}`, JSON.stringify(stateToSave));
      }
    };

    // Save on scroll
    const handleScroll = () => {
      saveState();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Also save periodically
    const intervalId = setInterval(saveState, 1000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(intervalId);
      saveState(); // Final save
    };
  }, [items, page, hasMore, type]);

  // Infinite scroll observer
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '200px',
      threshold: 0.1
    };

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
        loadMore();
      }
    }, options);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };

    // The observer callback intentionally uses the current loader closure.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, loadingMore, loading]);

  // Observe last element
  useEffect(() => {
    const observer = observerRef.current;
    const currentElement = lastElementRef.current;

    if (currentElement && observer) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement && observer) {
        observer.unobserve(currentElement);
      }
    };
  }, [items]);

  const loadData = async () => {
    setLoading(true);
    setPage(1);
    try {
      // Load 50 pages (1000 items) all at once initially
      const sortParam = config.supportsSort ? sortBy : null;
      const pagesToLoad = 50;
      const promises = [];
      
      // Create promises for all pages
      for (let i = 1; i <= pagesToLoad; i++) {
        promises.push(config.fetchFunction(i, sortParam, selectedYear, selectedLetter));
      }
      
      // Load all pages simultaneously
      const results = await Promise.all(promises);
      
      // Combine all results
      let allResults = [];
      let maxPages = 0;
      results.forEach(data => {
        if (data && data.results) {
          allResults = [...allResults, ...data.results];
          if (data.total_pages > maxPages) {
            maxPages = data.total_pages;
          }
        }
      });
      
      const filteredItems = filterWatchedItems(allResults, config.mediaType);
      setAllItems(filteredItems);
      setItems(filteredItems);
      setPage(pagesToLoad);
      // Enable loading more if there are more pages available
      setHasMore(pagesToLoad < maxPages);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle sort/filter change - reload data with new sorting/filtering
  useEffect(() => {
    // Don't reload if we're currently restoring state
    if (config && config.supportsSort && !shouldRestoreRef.current) {
      loadData();
    }
    // Reload when sorting or filtering changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, selectedYear, selectedLetter]);

  const loadMore = async () => {
    if (!hasMore || loadingMore) return;

    setLoadingMore(true);
    const nextPage = page + 1;

    try {
      // Load next 10 pages at once when scrolling
      const sortParam = config.supportsSort ? sortBy : null;
      const batchSize = 10;
      const promises = [];
      
      for (let i = nextPage; i < nextPage + batchSize; i++) {
        promises.push(config.fetchFunction(i, sortParam, selectedYear, selectedLetter));
      }
      
      const results = await Promise.all(promises);
      
      // Combine results
      let newResults = [];
      let hasMorePages = false;
      results.forEach(data => {
        if (data && data.results) {
          newResults = [...newResults, ...data.results];
          hasMorePages = data.page < data.total_pages;
        }
      });
      
      const newFilteredItems = filterWatchedItems(newResults, config.mediaType);
      const updatedAllItems = [...allItems, ...newFilteredItems];
      setAllItems(updatedAllItems);
      setItems(updatedAllItems);
      setPage(nextPage + batchSize - 1);
      setHasMore(hasMorePages);
    } catch (error) {
      console.error('Error loading more data:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  if (!config) {
    return (
      <div className="min-h-screen bg-black px-4">
        <div className="container mx-auto text-center pt-6">
          <h1 className="text-2xl text-white mb-4">Invalid page type</h1>
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-red text-white px-6 py-3 rounded-xl font-bold"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner fullScreen={true} message="Loading..." />;
  }

  return (
    <div className="min-h-screen bg-black pb-20">
      <div className="container mx-auto px-4 pt-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/')}
            className="text-white hover:text-red-600 transition-colors"
            aria-label="Back to home"
            title="Back to home"
          >
            <FiArrowLeft className="text-3xl" />
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            {config.title}
          </h1>
        </div>

        {/* Content Grid */}
        <div className="media-grid">
          {items.map((item, index) => {
            // Add ref to the last item for infinite scroll
            if (items.length === index + 1) {
              return (
                <div key={`${item.id}-${item.media_type || config.mediaType}`} ref={lastElementRef}>
                  <MovieCard item={{ ...item, media_type: item.media_type || config.mediaType }} saveScrollOnClick={true} />
                </div>
              );
            }
            return (
              <MovieCard key={`${item.id}-${item.media_type || config.mediaType}`} item={{ ...item, media_type: item.media_type || config.mediaType }} saveScrollOnClick={true} />
            );
          })}
        </div>

        {/* Loading Indicator */}
        {loadingMore && (
          <div className="text-center mt-8 text-white">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            <p className="mt-2">Loading more...</p>
          </div>
        )}

        {/* Empty State */}
        {items.length === 0 && !loading && (
          <div className="text-center py-16 text-white">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-lg">No content available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewAll;
