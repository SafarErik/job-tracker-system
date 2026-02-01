import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from './sidebar.component';

@Component({
    selector: 'app-shell',
    imports: [CommonModule, RouterModule, SidebarComponent],
    template: `
    <div class="min-h-screen bg-slate-950 text-slate-100 flex overflow-hidden">
      <!-- Background Glow Effects -->
      <div class="fixed top-0 left-0 w-full h-full pointer-events-none opacity-20 overflow-hidden">
        <div class="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] bg-indigo-500/30 blur-[120px] rounded-full"></div>
        <div class="absolute bottom-[0%] right-[0%] w-[50%] h-[50%] bg-purple-500/20 blur-[150px] rounded-full"></div>
      </div>

      <!-- Sidebar -->
      <app-sidebar></app-sidebar>

      <!-- Main content -->
      <main class="flex-1 flex flex-col min-w-0 md:ml-64 h-screen overflow-y-auto relative">
        <div class="flex-1 p-6 lg:p-10">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
    styles: `
    :host {
      display: block;
    }

    /* Custom scrollbar for the main content area */
    main::-webkit-scrollbar {
      width: 6px;
    }
    main::-webkit-scrollbar-track {
      background: transparent;
    }
    main::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 10px;
    }
    main::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShellComponent { }
