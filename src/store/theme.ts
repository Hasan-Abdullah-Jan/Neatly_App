import { create } from 'zustand';

export type ThemePref = 'system' | 'light' | 'dark';
const KEY = 'neatly-theme';

function read(): ThemePref {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' ? v : 'system';
  } catch {
    return 'system';
  }
}

export function applyTheme(pref: ThemePref) {
  const dark = pref === 'dark' || (pref === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', dark);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#11141D' : '#F6F7FB');
}

export const useTheme = create<{ pref: ThemePref; setPref: (p: ThemePref) => void }>()((set) => ({
  pref: read(),
  setPref: (pref) => {
    try {
      localStorage.setItem(KEY, pref);
    } catch {
      /* storage disabled */
    }
    applyTheme(pref);
    set({ pref });
  },
}));

if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => applyTheme(useTheme.getState().pref));
}
