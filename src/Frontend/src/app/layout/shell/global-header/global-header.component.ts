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
} from '@ng-icons/lucide';
import { BrnCommandImports } from '@spartan-ng/brain/command';
import { HlmCommandImports } from '@spartan-ng/helm/command';
import { BrnDialogImports } from '@spartan-ng/brain/dialog';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmDropdownMenuImports, HlmDropdownMenuTrigger } from '@spartan-ng/helm/dropdown-menu';
import { UiStateService, BreadcrumbService } from '../../../core/services';
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
  private readonly router = inject(Router);

  readonly currentSection = computed(() => {
    const breadcrumbs = this.breadcrumbService.breadcrumbs();
    return breadcrumbs.length ? breadcrumbs[breadcrumbs.length - 1].label : 'Dashboard';
  });

  readonly pageTitle = computed(() => {
    const section = this.currentSection();
    return section === 'Dashboard' ? 'Command Center' : section;
  });

  readonly pageDescription = computed(() => {
    const section = this.currentSection();

    switch (section) {
      case 'Applications':
        return 'Track active applications and react quickly.';
      case 'Companies':
        return 'Manage target companies and outreach context.';
      case 'Insights':
        return 'Review trends, charts, and performance signals.';
      case 'Signals':
        return 'Watch incoming opportunities and alerts.';
      case 'Documents':
        return 'Keep resumes and job-search assets ready.';
      case 'Dashboard':
      default:
        return 'See what matters now and where you need to react.';
    }
  });

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

  logout() {
    this.authService.logout();
  }
}
