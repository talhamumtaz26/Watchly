import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const location = useLocation();
  const prevPathnameRef = useRef(location.pathname);

  // Save scroll position before navigation
  useEffect(() => {
    const handleScroll = () => {
      sessionStorage.setItem(`scroll_${location.pathname}`, window.scrollY.toString());
    };

    // Save scroll position periodically as user scrolls
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      // Final save when unmounting
      sessionStorage.setItem(`scroll_${location.pathname}`, window.scrollY.toString());
    };
  }, [location.pathname]);

  // Restore scroll position - useLayoutEffect runs before browser paint
  useLayoutEffect(() => {
    const currentPathname = location.pathname;
    const prevPathname = prevPathnameRef.current;

    // Only restore if pathname actually changed
    if (prevPathname !== currentPathname) {
      // Skip scroll restoration for ViewAll pages - they handle their own scroll
      if (currentPathname.startsWith('/view-all/')) {
        prevPathnameRef.current = currentPathname;
        return;
      }

      const savedPosition = sessionStorage.getItem(`scroll_${currentPathname}`);
      
      if (savedPosition !== null) {
        // Restore scroll position
        const position = parseInt(savedPosition, 10);
        
        // Multiple attempts to ensure content is loaded
        const restoreScroll = () => {
          window.scrollTo({
            top: position,
            left: 0,
            behavior: 'auto'
          });
        };

        // Immediate restore
        restoreScroll();
        
        // Retry multiple times to handle lazy loading and dynamic content
        requestAnimationFrame(restoreScroll);
        setTimeout(restoreScroll, 0);
        setTimeout(restoreScroll, 50);
        setTimeout(restoreScroll, 100);
        setTimeout(restoreScroll, 200);
        setTimeout(restoreScroll, 300);
      } else {
        // New page - scroll to top
        window.scrollTo(0, 0);
      }
    }

    prevPathnameRef.current = currentPathname;
  }, [location.pathname]);

  return null;
};

export default ScrollToTop;
