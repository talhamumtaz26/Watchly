import { getActiveTab } from '../navItems';

describe('getActiveTab', () => {
  test.each([
    ['/', 'home'],
    ['/upcoming', 'upcoming'],
    ['/watch-later', 'watch-later'],
    ['/watched', 'watched'],
    ['/settings', 'settings'],
    ['/dashboard', 'settings'],
    ['/app-settings', 'settings'],
    ['/search', 'home'],
    ['/view-all/popular', 'home'],
    ['/genre/28/Action', 'home'],
    ['/details/movie/123', 'home'],
    ['/actor/456', 'home'],
  ])('maps %s to %s', (pathname, expected) => {
    expect(getActiveTab(pathname)).toBe(expected);
  });

  test('does not highlight a tab for unknown routes', () => {
    expect(getActiveTab('/login')).toBeNull();
    expect(getActiveTab('/not-a-route')).toBeNull();
  });
});
