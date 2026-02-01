import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { provideIcons } from '@ng-icons/core';
import {
  lucideLayoutDashboard,
  lucideBriefcase,
  lucideBuilding2,
  lucideFileText,
  lucideUser,
  lucideSettings,
  lucideLogOut,
  lucideChevronUp,
  lucideSun,
  lucideMoon,
} from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmDropdownMenuImports, HlmDropdownMenuTrigger } from '@spartan-ng/helm/dropdown-menu';
import { HlmSwitchImports } from '@spartan-ng/helm/switch';
import { ThemeService } from '../../../core/services';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HlmSidebarImports,
    HlmIconImports,
    HlmButton,
    HlmAvatarImports,
    HlmDropdownMenuImports,
    HlmDropdownMenuTrigger,
    HlmSwitchImports,
  ],
  providers: [
    provideIcons({
      lucideLayoutDashboard,
      lucideBriefcase,
      lucideBuilding2,
      lucideFileText,
      lucideUser,
      lucideSettings,
      lucideLogOut,
      lucideChevronUp,
      lucideSun,
      lucideMoon,
    }),
  ],
  templateUrl: './sidebar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  private themeService = inject(ThemeService);
  private authService = inject(AuthService);

  onLogout() {
    this.authService.logout();
  }

  navItems = [
    { label: 'Dashboard', icon: 'lucideLayoutDashboard', link: '/dashboard', exact: true },
    { label: 'Applications', icon: 'lucideBriefcase', link: '/applications', exact: false },
    { label: 'Companies', icon: 'lucideBuilding2', link: '/companies', exact: false },
    { label: 'Documents', icon: 'lucideFileText', link: '/documents', exact: false },
  ];

  get isDarkMode() {
    return this.themeService.isDark();
  }

  toggleTheme() {
    this.themeService.toggle();
  }
}
