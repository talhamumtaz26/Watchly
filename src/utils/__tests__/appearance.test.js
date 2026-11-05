import {
  APPEARANCE_STORAGE_KEY,
  applyAppearanceClass,
  readAppearancePreference,
  writeAppearancePreference,
} from '../../hooks/useAppearancePreference';

describe('appearance preference', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove('no-glass');
  });

  test('defaults to false when no preference is stored', () => {
    expect(readAppearancePreference()).toBe(false);
  });

  test('persists and reads a boolean preference', () => {
    writeAppearancePreference(true);

    expect(window.localStorage.getItem(APPEARANCE_STORAGE_KEY)).toBe('true');
    expect(readAppearancePreference()).toBe(true);
  });

  test('falls back to false for invalid values', () => {
    window.localStorage.setItem(APPEARANCE_STORAGE_KEY, JSON.stringify('true'));

    expect(readAppearancePreference()).toBe(false);
  });

  test('applies and removes the no-glass class', () => {
    applyAppearanceClass(true);
    expect(document.documentElement.classList.contains('no-glass')).toBe(true);

    applyAppearanceClass(false);
    expect(document.documentElement.classList.contains('no-glass')).toBe(false);
  });
});
