import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { getActiveTab, navItems } from '../config/navItems';

const BottomNav = () => {
  const location = useLocation();
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    let showTimer;
    const hideForKeyboard = () => {
      window.clearTimeout(showTimer);
      setKeyboardOpen(true);
    };
    const showAfterKeyboard = () => {
      window.clearTimeout(showTimer);
      showTimer = window.setTimeout(() => {
        const activeElement = document.activeElement;
        if (!activeElement?.matches('input, textarea, select')) {
          setKeyboardOpen(false);
        }
      }, 200);
    };
    const handleFocusIn = (event) => {
      if (event.target.matches('input, textarea, select')) hideForKeyboard();
    };
    const handleViewportResize = () => {
      const viewport = window.visualViewport;
      if (!viewport) return;
      setKeyboardOpen(window.innerHeight - viewport.height > 150);
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', showAfterKeyboard);
    window.visualViewport?.addEventListener('resize', handleViewportResize);

    return () => {
      window.clearTimeout(showTimer);
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', showAfterKeyboard);
      window.visualViewport?.removeEventListener('resize', handleViewportResize);
    };
  }, []);

  const activeTab = getActiveTab(location.pathname);

  return (
    <>
      <div className="bottom-nav-fade fixed inset-x-0 bottom-0 z-40 h-[140px] md:hidden" aria-hidden="true" />
      <nav
        aria-label="Primary"
        aria-hidden={keyboardOpen}
        className={`glass glass-nav fixed left-5 right-5 bottom-3 mx-auto h-[60px] max-w-[400px] rounded-[28px] z-50 md:hidden transition-[transform,opacity] duration-150 ${
          keyboardOpen ? 'translate-y-6 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
        } motion-reduce:transition-none`}
      >
        <div className="flex items-center justify-around h-full">
          {navItems.map((item) => {
            const Icon = item.Icon;
            const active = activeTab === item.key;

            return (
              <NavLink
                key={item.key}
                to={item.path}
                aria-current={active ? 'page' : undefined}
                className={`relative flex items-center justify-center min-w-12 min-h-12 flex-1 rounded-md focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 transition-colors duration-[150ms] ${
                  active ? 'text-brand' : 'text-fg-secondary'
                } motion-reduce:transition-none`}
              >
                <span className="sr-only">{item.label}</span>
                {active && <span aria-hidden="true" className="absolute top-0 h-[3px] w-4 rounded-full bg-brand" />}
                <Icon size={24} weight={active ? 'fill' : 'regular'} aria-hidden="true" />
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default BottomNav;
