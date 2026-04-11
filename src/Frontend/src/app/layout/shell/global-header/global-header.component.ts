import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { provideIcons } from '@ng-icons/core';
import {
  lucideSearch,
  lucideCommand,
  lucideCalculator,
  lucideCalendar,
  lucideUser,
  lucideSettings,
  lucideMail,
  lucideBrain,
  lucideZap,
  lucideChevronDown,
  lucideSun,
  lucideMoon,
  lucideLaptop,
  lucideLogOut,
  lucideSparkles,
} from '@ng-icons/lucide';
import { BrnCommandImports } from '@spartan-ng/brain/command';
import { HlmCommandImports } from '@spartan-ng/helm/command';
import { BrnDialogImports } from '@spartan-ng/brain/dialog';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmDropdownMenuImports, HlmDropdownMenuTrigger } from '@spartan-ng/helm/dropdown-menu';
import { TranslocoPipe } from '@jsverse/transloco';
import { UiStateService, BreadcrumbService, LanguageService } from '../../../core/services';
import { NotificationCenterComponent } from '../../../features/notifications/notification-center.component';
import { AuthService } from '../../../core/auth/auth.service';
import { Theme, ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-global-header',
  imports: [
    CommonModule,
    RouterModule,
    HlmIconImports,
    HlmButton,
    BrnCommandImports,
    HlmCommandImports,
    BrnDialogImports,
    HlmDialogImports,
    HlmDropdownMenuImports,
    HlmDropdownMenuTrigger,
    NotificationCenterComponent,
    TranslocoPipe,
  ],
  providers: [
    provideIcons({
      lucideSearch,
      lucideCommand,
      lucideCalculator,
      lucideCalendar,
      lucideUser,
      lucideSettings,
      lucideMail,
      lucideBrain,
      lucideZap,
      lucideChevronDown,
      lucideSun,
      lucideMoon,
      lucideLaptop,
      lucideLogOut,
      lucideSparkles,
    }),
  ],
  templateUrl: './global-header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:keydown)': 'onKeyDown($event)',
  },
})
export class GlobalHeaderComponent {
  public readonly isOpen = signal(false);
  public readonly uiService = inject(UiStateService);
  public readonly breadcrumbService = inject(BreadcrumbService);
  public readonly authService = inject(AuthService);
  public readonly themeService = inject(ThemeService);
  public readonly languageService = inject(LanguageService);
  private readonly router = inject(Router);

  readonly currentSection = computed(() => {
    const breadcrumbs = this.breadcrumbService.breadcrumbs();
    return breadcrumbs.length ? breadcrumbs[breadcrumbs.length - 1].label : 'Dashboard';
  });

  readonly pageTitleKey = computed(() => {
    const section = this.currentSection();
    return this.sectionTitleKey(section);
  });

  readonly pageDescriptionKey = computed(() => {
    const section = this.currentSection();
    return this.sectionDescriptionKey(section);
  });

  private sectionTitleKey(section: string): string {
    switch (section) {
      case 'Applications':
        return 'shell.nav.applications';
      case 'Companies':
        return 'shell.nav.companies';
      case 'Insights':
      case 'Intelligence':
        return 'shell.nav.insights';
      case 'Signals':
      case 'Global Signals':
        return 'shell.nav.signals';
      case 'Documents':
        return 'shell.nav.documents';
      case 'Profile':
        return 'shell.header.profile';
      case 'Dashboard':
      default:
        return 'app.dashboard';
    }
  }

  private sectionDescriptionKey(section: string): string {
    switch (section) {
      case 'Applications':
        return 'shell.header.descriptions.applications';
      case 'Companies':
        return 'shell.header.descriptions.companies';
      case 'Insights':
      case 'Intelligence':
        return 'shell.header.descriptions.insights';
      case 'Signals':
      case 'Global Signals':
        return 'shell.header.descriptions.signals';
      case 'Documents':
        return 'shell.header.descriptions.documents';
      case 'Profile':
        return 'shell.header.descriptions.profile';
      case 'Dashboard':
      default:
        return 'shell.header.descriptions.dashboard';
    }
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      this.isOpen.update((prev) => !prev);
    }
  }

  navigateTo(path: string) {
    this.isOpen.set(false);
    this.router.navigateByUrl(path);
  }

  openSettings() {
    this.isOpen.set(false);
    this.uiService.openProfileSettings();
  }

  openAiDrawer() {
    this.isOpen.set(false);
    this.uiService.openAiDrawer();
  }

  setTheme(theme: Theme) {
    this.themeService.setTheme(theme);
  }

  setLanguage(locale: 'en' | 'hu') {
    this.languageService.setLocale(locale);
  }

  logout() {
    this.authService.logout();
  }
}
