import { ChangeDetectionStrategy, Component } from '@angular/core';
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
  lucidePieChart,
  lucideRadio,
  lucidePanelLeftClose,
} from '@ng-icons/lucide';
import { LogoComponent } from '../../../shared/components/logo/logo';

interface NavItem {
  label: string;
  icon: string;
  link: string;
  exact: boolean;
}

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule, HlmSidebarImports, HlmIconImports, LogoComponent],
  providers: [
    provideIcons({
      lucideLayoutDashboard,
      lucideBriefcase,
      lucideBuilding2,
      lucideFileText,
      lucidePieChart,
      lucideRadio,
      lucidePanelLeftClose,
    }),
  ],
  templateUrl: './sidebar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block h-full relative z-20',
  },
})
export class SidebarComponent {
  navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'lucideLayoutDashboard', link: '/dashboard', exact: true },
    { label: 'Applications', icon: 'lucideBriefcase', link: '/applications', exact: false },
    { label: 'Companies', icon: 'lucideBuilding2', link: '/companies', exact: false },
    { label: 'Insights', icon: 'lucidePieChart', link: '/statistics', exact: false },
    { label: 'Signals', icon: 'lucideRadio', link: '/signals', exact: false },
    { label: 'Documents', icon: 'lucideFileText', link: '/documents', exact: false },
  ];
}
