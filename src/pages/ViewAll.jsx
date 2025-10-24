import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getNowPlayingMovies, getStreamingContent, getPopularMovies, getPopularTVShows, getTVShowsByGenre } from '../utils/api';
import { getSetting, getWatched } from '../utils/storage';
import MovieCard from '../components/MovieCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { FiArrowLeft } from 'react-icons/fi';

const ViewAll = () => {
  const { type } = useParams(); // theatre, streaming, movies, tv, anime
  const navigate = useNavigate();
  const location = useLocation();
  const [items, setItems] = useState([]);
  const [allItems, setAllItems] = useState([]); // Store all items before filtering
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sortBy, setSortBy] = useState('all'); // 'all', 'date', 'year', 'az'
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedLetter, setSelectedLetter] = useState('');
  const observerRef = useRef();
  const lastElementRef = useRef();
  const shouldRestoreRef = useRef(false);

  // Generate years from current year down to 1900
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1899 }, (_, i) => currentYear - i);
  
  // Generate alphabet array
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  // Handle sort button click
  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      // If clicking the same sort, reset it
      setSortBy('all');
      setSelectedYear('');
      setSelectedLetter('');
    } else {
      setSortBy(newSortBy);
      setSelectedYear('');
      setSelectedLetter('');
    }
  };

  // Filter function to remove watched items if setting is enabled
  const filterWatchedItems = (items, mediaType = null) => {
    const hideWatched = getSetting('hideWatchedFromHome', false);
    if (!hideWatched) return items;
    
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
      console.log('=== ViewAll Layout Effect ===');
      console.log('Type:', type);
      console.log('Location key:', location.key);
      console.log('Current items count:', items.length);
      console.log('shouldRestoreRef:', shouldRestoreRef.current);
      
      const savedState = sessionStorage.getItem(`viewall_state_${type}`);
      console.log('Saved state exists:', !!savedState);
      
      if (savedState) {
        try {
          const { items: savedItems, page: savedPage, hasMore: savedHasMore, scrollPos } = JSON.parse(savedState);
          console.log('Saved state details:', {
            itemCount: savedItems.length,
            page: savedPage,
            hasMore: savedHasMore,
            scrollPos: scrollPos
          });
          
          // If we have saved items, restore them immediately
          if (savedItems && savedItems.length > 0) {
            console.log('RESTORING ITEMS AND SCROLL');
            shouldRestoreRef.current = true;
            setItems(savedItems);
            setPage(savedPage);
            setHasMore(savedHasMore);
            setLoading(false);
            
            // Restore scroll position
            if (scrollPos) {
              console.log('Scrolling to position:', scrollPos);
              // Use requestAnimationFrame to ensure DOM is ready
              requestAnimationFrame(() => {
                window.scrollTo(0, scrollPos);
                console.log('Scroll applied, current position:', window.scrollY);
              });
            }
            
            // Mark restoration complete after a delay
            setTimeout(() => {
              shouldRestoreRef.current = false;
              console.log('Restoration complete');
            }, 2500);
            
            return; // IMPORTANT: Exit early to prevent loadData() from running
          } else {
            // No items saved, load fresh
            console.log('No items in saved state, loading fresh');
            sessionStorage.removeItem(`viewall_state_${type}`);
          }
        } catch (error) {
          console.error('Error restoring state:', error);
          sessionStorage.removeItem(`viewall_state_${type}`);
        }
      } else {
        console.log('No saved state found, loading fresh data');
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
            console.log('Fine-tuning scroll to:', scrollPos, 'Current:', window.scrollY);
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
          console.log('Scroll restoration complete. Final position:', window.scrollY);
        }, 2000);
      }
    }
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
        
        console.log('Saving state with key:', `viewall_state_${type}`, 'itemCount:', items.length, 'scrollPos:', currentScroll);
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
      console.log('Component unmounting, saved state');
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
      console.log(`Loading ${pagesToLoad} pages...`);
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
      console.log(`Loaded ${filteredItems.length} items total. Max pages available: ${maxPages}`);
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
      console.log('Sort/filter changed, reloading data');
      loadData();
    }
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
      
      console.log(`Loading ${batchSize} more pages (${nextPage} to ${nextPage + batchSize - 1})...`);
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
      console.log(`Loaded ${newFilteredItems.length} more items. Total: ${updatedAllItems.length}`);
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
          >
            <FiArrowLeft className="text-3xl" />
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            {config.title}
          </h1>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
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
