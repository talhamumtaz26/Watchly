import { useState } from 'react';
import { useEffect } from 'react';

export const APPEARANCE_STORAGE_KEY = 'watchly:appearance';

export const readAppearancePreference = () => {
  try {
    const storedValue = window.localStorage.getItem(APPEARANCE_STORAGE_KEY);
    const parsedValue = JSON.parse(storedValue);
    return typeof parsedValue === 'boolean' ? parsedValue : false;
  } catch (error) {
    return false;
  }
};

export const applyAppearanceClass = (reduceGlassEffects) => {
  document.documentElement.classList.toggle('no-glass', reduceGlassEffects);
};

export const writeAppearancePreference = (reduceGlassEffects) => {
  try {
    window.localStorage.setItem(
      APPEARANCE_STORAGE_KEY,
      JSON.stringify(reduceGlassEffects)
    );
  } catch (error) {
    console.error('Could not save appearance preference:', error);
  }
};

export const useAppearancePreference = () => {
  const [reduceGlassEffects, setReduceGlassEffects] = useState(readAppearancePreference);

  useEffect(() => {
    applyAppearanceClass(reduceGlassEffects);
  }, [reduceGlassEffects]);

  const toggleReduceGlassEffects = () => {
    setReduceGlassEffects((currentValue) => {
      const nextValue = !currentValue;
      writeAppearancePreference(nextValue);
      applyAppearanceClass(nextValue);
      return nextValue;
    });
  };

  return { reduceGlassEffects, toggleReduceGlassEffects };
};
