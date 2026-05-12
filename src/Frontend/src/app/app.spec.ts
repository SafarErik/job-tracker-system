import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslocoLoader, provideTransloco, translocoConfig } from '@jsverse/transloco';
import { of } from 'rxjs';
import { App } from './app';
import { LanguageService } from './core/services';
import { ProfileStore } from './features/profile/services/profile.store';

class TestingTranslocoLoader implements TranslocoLoader {
  getTranslation() {
    return of({});
  }
}

describe('App', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        addListener: () => undefined,
        removeListener: () => undefined,
        dispatchEvent: () => false,
      }),
    });
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App, RouterTestingModule],
      providers: [
        {
          provide: LanguageService,
          useValue: {
            initialize: () => undefined,
            locale: () => 'en',
          },
        },
        {
          provide: ProfileStore,
          useValue: {
            loadProfile: () => undefined,
          },
        },
        provideTransloco({
          config: translocoConfig({
            availableLangs: ['en', 'hu'],
            defaultLang: 'en',
            fallbackLang: 'en',
            reRenderOnLangChange: true,
            prodMode: true,
          }),
          loader: TestingTranslocoLoader,
        }),
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the application shell', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });
});
