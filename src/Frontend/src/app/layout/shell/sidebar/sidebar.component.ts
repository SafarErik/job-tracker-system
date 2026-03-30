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
  lucidePieChart,
  lucideRadio,
} from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmDropdownMenuImports, HlmDropdownMenuTrigger } from '@spartan-ng/helm/dropdown-menu';
import { HlmSwitchImports } from '@spartan-ng/helm/switch';
import { UiStateService } from '../../../core/services';
import { AuthService } from '../../../core/auth/auth.service';
import { LogoComponent } from '../../../shared/components/logo/logo';

interface NavItem {
  label: string;
  icon: string;
  link: string;
  exact: boolean;
  description: string;
}

@Component({
  selector: 'app-sidebar',
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
    LogoComponent,
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
      lucidePieChart,
      lucideRadio,
    }),
  ],
  templateUrl: './sidebar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block h-full relative z-20',
  },
})
export class SidebarComponent {
  readonly authService = inject(AuthService);
  readonly uiService = inject(UiStateService);

  onLogout() {
    this.authService.logout();
  }

  navItems: NavItem[] = [
    {
      label: 'Dashboard',
      icon: 'lucideLayoutDashboard',
      link: '/dashboard',
      exact: true,
      description: 'Mission control',
    },
    {
      label: 'Applications',
      icon: 'lucideBriefcase',
      link: '/applications',
      exact: false,
      description: 'Pipeline and actions',
    },
    {
      label: 'Companies',
      icon: 'lucideBuilding2',
      link: '/companies',
      exact: false,
      description: 'Targets and research',
    },
    {
      label: 'Insights',
      icon: 'lucidePieChart',
      link: '/statistics',
      exact: false,
      description: 'Performance trends',
    },
    {
      label: 'Signals',
      icon: 'lucideRadio',
      link: '/signals',
      exact: false,
      description: 'Live opportunities',
    },
    {
      label: 'Documents',
      icon: 'lucideFileText',
      link: '/documents',
      exact: false,
      description: 'CVs and assets',
    },
  ];
}
