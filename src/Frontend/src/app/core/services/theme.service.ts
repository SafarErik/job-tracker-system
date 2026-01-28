import { Injectable, signal, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private platformId = inject(PLATFORM_ID);

  // Signal to track theme state
  darkMode = signal<boolean>(true); // Default to TRUE for your dark-mode-first app

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      // 1. Check local storage or system preference on load
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        this.darkMode.set(savedTheme === 'dark');
      } else {
        // Optional: Default to system preference
        // const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        // this.darkMode.set(prefersDark);
      }

      // 2. React to signal changes and update DOM
      effect(() => {
        const isDark = this.darkMode();
        const html = document.documentElement;

        if (isDark) {
          html.classList.add('dark');
          localStorage.setItem('theme', 'dark');
        } else {
          html.classList.remove('dark');
          localStorage.setItem('theme', 'light');
        }
      });
    }
  }

  toggle() {
    this.darkMode.update(val => !val);
  }
}
