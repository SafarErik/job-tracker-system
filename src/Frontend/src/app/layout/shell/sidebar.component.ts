import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, LayoutDashboard, Briefcase, Building2, FileText, User, Settings, LogOut, Search, Menu, X } from 'lucide-angular';

@Component({
    selector: 'app-sidebar',
    imports: [CommonModule, RouterModule, LucideAngularModule],
    template: `
    <!-- Mobile Toggle -->
    <button
      (click)="toggleSidebar()"
      class="fixed top-4 left-4 z-50 p-2 rounded-lg bg-slate-900/50 border border-white/10 text-slate-400 md:hidden backdrop-blur-xl"
    >
      <lucide-icon [name]="isCollapsed() ? 'menu' : 'x'" class="w-6 h-6"></lucide-icon>
    </button>

    <!-- Sidebar Container -->
    <aside
      [class]="
        'fixed inset-y-0 left-0 z-40 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 border-r border-white/5 bg-slate-900/50 backdrop-blur-xl ' +
        (isCollapsed() ? '-translate-x-full w-64' : 'translate-x-0 w-64')
      "
    >
      <!-- Logo Section -->
      <div class="p-6 flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <lucide-icon name="briefcase" class="w-5 h-5 text-white"></lucide-icon>
        </div>
        <span class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
          JobTracker
        </span>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-4 space-y-2 mt-4">
        @for (item of navItems; track item.label) {
          <a
            [routerLink]="item.link"
            routerLinkActive="border-l-2 border-indigo-500 bg-white/5 text-white"
            [routerLinkActiveOptions]="{ exact: item.exact }"
            class="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200 border-l-2 border-transparent"
          >
            <lucide-icon [name]="item.icon" class="w-5 h-5 group-hover:scale-110 transition-transform"></lucide-icon>
            <span class="font-medium">{{ item.label }}</span>
          </a>
        }
      </nav>

      <!-- User Profile -->
      <div class="p-4 mt-auto border-t border-white/5">
        <div class="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/5">
          <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
            JD
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-white truncate">John Doe</p>
            <p class="text-xs text-slate-500 truncate">Senior Developer</p>
          </div>
          <button class="p-2 text-slate-400 hover:text-white transition-colors">
            <lucide-icon name="log-out" class="w-4 h-4"></lucide-icon>
          </button>
        </div>
      </div>
    </aside>

    <!-- Overlay for mobile -->
    @if (!isCollapsed()) {
      <div
        (click)="toggleSidebar()"
        class="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-30 md:hidden"
      ></div>
    }
  `,
    styles: `
    :host {
      display: block;
    }
  `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
    isCollapsed = signal(true);

    navItems = [
        { label: 'Dashboard', icon: 'layout-dashboard', link: '/dashboard', exact: true },
        { label: 'Applications', icon: 'briefcase', link: '/applications', exact: false },
        { label: 'Companies', icon: 'building2', link: '/companies', exact: false },
        { label: 'Documents', icon: 'file-text', link: '/documents', exact: false },
        { label: 'Profile', icon: 'user', link: '/profile', exact: false },
        { label: 'Settings', icon: 'settings', link: '/settings', exact: false },
    ];

    toggleSidebar() {
        this.isCollapsed.update((v) => !v);
    }
}
