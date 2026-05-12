import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { TranslocoPipe } from '@jsverse/transloco';
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
  labelKey: string;
  icon: string;
  link: string;
  exact: boolean;
}

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule, HlmSidebarImports, HlmIconImports, LogoComponent, TranslocoPipe],
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
    { labelKey: 'shell.nav.dashboard', icon: 'lucideLayoutDashboard', link: '/dashboard', exact: true },
    { labelKey: 'shell.nav.applications', icon: 'lucideBriefcase', link: '/applications', exact: false },
    { labelKey: 'shell.nav.companies', icon: 'lucideBuilding2', link: '/companies', exact: false },
    { labelKey: 'shell.nav.insights', icon: 'lucidePieChart', link: '/statistics', exact: false },
    { labelKey: 'shell.nav.signals', icon: 'lucideRadio', link: '/signals', exact: false },
    { labelKey: 'shell.nav.documents', icon: 'lucideFileText', link: '/documents', exact: false },
  ];
}
