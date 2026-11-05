import {
  BookmarksSimple,
  CalendarBlank,
  House,
  SealCheck,
  UserCircle,
} from '@phosphor-icons/react';

export const navItems = [
  {
    key: 'home',
    label: 'Home',
    path: '/',
    Icon: House,
    matchPrefixes: ['/search', '/view-all', '/genre', '/details', '/actor'],
  },
  {
    key: 'upcoming',
    label: 'Upcoming',
    path: '/upcoming',
    Icon: CalendarBlank,
    matchPrefixes: [],
  },
  {
    key: 'watch-later',
    label: 'Watch Later',
    path: '/watch-later',
    Icon: BookmarksSimple,
    matchPrefixes: [],
  },
  {
    key: 'watched',
    label: 'Watched',
    path: '/watched',
    Icon: SealCheck,
    matchPrefixes: [],
  },
  {
    key: 'settings',
    label: 'Settings',
    path: '/settings',
    Icon: UserCircle,
    matchPrefixes: ['/dashboard', '/app-settings'],
  },
];

export const getActiveTab = (pathname) => {
  if (pathname === '/') return 'home';

  const activeItem = navItems.find((item) => (
    pathname === item.path || item.matchPrefixes.some((prefix) => pathname.startsWith(prefix))
  ));

  return activeItem ? activeItem.key : null;
};
