import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslocoService } from '@jsverse/transloco';

export type SupportedLocale = 'en' | 'hu';

const LANGUAGE_STORAGE_KEY = 'horizon_locale';
const SUPPORTED_LOCALES: readonly SupportedLocale[] = ['en', 'hu'];

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly transloco = inject(TranslocoService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly locale = this.transloco.activeLang;
  readonly availableLocales = SUPPORTED_LOCALES;

  initialize(): void {
    const locale = this.resolveInitialLocale();
    this.setLocale(locale);
  }

  setLocale(locale: SupportedLocale): void {
    this.transloco.setActiveLang(locale);

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, locale);
      document.documentElement.lang = locale;
    }
  }

  toggleLocale(): void {
    this.setLocale(this.locale() === 'hu' ? 'en' : 'hu');
  }

  private resolveInitialLocale(): SupportedLocale {
    if (!isPlatformBrowser(this.platformId)) {
      return 'en';
    }

    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (isSupportedLocale(stored)) {
      return stored;
    }

    const browserLanguage = navigator.language?.toLowerCase() ?? '';
    return browserLanguage.startsWith('hu') ? 'hu' : 'en';
  }
}

function isSupportedLocale(value: string | null): value is SupportedLocale {
  return SUPPORTED_LOCALES.includes(value as SupportedLocale);
}
