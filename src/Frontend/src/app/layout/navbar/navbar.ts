/**
 * ============================================================================
 * NAVBAR COMPONENT - Glass Navigation
 * ============================================================================
 *
 * Premium glassmorphism navigation bar with:
 * - Sticky positioning with backdrop blur
 * - Pill-shaped active navigation states
 * - User avatar and notification actions
 */

import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';

// Core services
import { AuthService } from '../../core/auth';
import { ThemeService } from '../../core/services/theme.service';
import { LogoComponent } from '../../shared/components/logo/logo';

// Spartan UI Components
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmSeparatorImports } from '@spartan-ng/helm/separator';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';

@Component({
  selector: 'app-navbar',
  imports: [
    RouterLink,
    RouterLinkActive,
    LogoComponent,

    ...HlmButtonImports,
    ...HlmSeparatorImports,
    ...HlmDropdownMenuImports,
  ],
  template: `
    <!-- Refined Glass Navigation Header -->
    <header
      class="fixed top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-md transition-all duration-300"
    >
      <div class="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6 lg:px-8">
        
        <!-- LEFT: Logo -->
        <a
          routerLink="/"
          class="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <app-logo size="md"></app-logo>
        </a>

        <!-- CENTER: Navigation Links (Authenticated Only) -->
        @if (isAuthenticated()) {
          <div class="hidden items-center gap-1 md:flex">
            <a
              routerLink="/"
              routerLinkActive="!bg-primary/10 !text-primary"
              [routerLinkActiveOptions]="{ exact: true }"
              class="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-all duration-200 ease-out hover:bg-muted/50 hover:text-foreground"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Applications
            </a>

            <a
              routerLink="/companies"
              routerLinkActive="!bg-primary/10 !text-primary"
              class="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-all duration-200 ease-out hover:bg-muted/50 hover:text-foreground"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Companies
            </a>

            <a
              routerLink="/documents"
              routerLinkActive="!bg-primary/10 !text-primary"
              class="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-all duration-200 ease-out hover:bg-muted/50 hover:text-foreground"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Documents
            </a>
          </div>
        }

        <!-- RIGHT: Actions -->
        <div class="flex items-center gap-4">
          
          <!-- Theme Toggle -->
          <button
            (click)="themeService.toggle()"
            class="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200"
            aria-label="Toggle theme"
          >
            @if (themeService.darkMode()) {
              <svg class="h-5 w-5 text-amber-400 fill-amber-400/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            } @else {
              <svg class="h-5 w-5 text-indigo-500 fill-indigo-500/10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            }
          </button>

          <div class="h-4 w-px bg-border/60"></div>

          @if (isAuthenticated()) {
            <!-- User Menu -->
            <button
              hlmBtn
              variant="ghost"
              size="sm"
              class="gap-2 px-2 hover:bg-muted/50 rounded-xl transition-all duration-200"
              [hlmDropdownMenuTrigger]="userMenu"
            >
              @if (currentUser()?.profilePictureUrl) {
                <img
                  [src]="currentUser()?.profilePictureUrl"
                  [alt]="userFullName()"
                  class="h-7 w-7 rounded-full object-cover ring-2 ring-primary/10"
                />
              } @else {
                <div class="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary uppercase">
                  {{ userInitials() }}
                </div>
              }
              <span class="hidden text-sm font-semibold md:inline">{{ userFullName() }}</span>
              <svg class="h-3.5 w-3.5 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <ng-template #userMenu>
              <div hlmDropdownMenu class="w-56 mt-2 p-1 rounded-2xl border-border/40 shadow-2xl backdrop-blur-xl">
                <div hlmDropdownMenuLabel class="px-3 py-2">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{{ currentUser()?.email }}</span>
                </div>
                <div hlmDropdownMenuSeparator></div>
                <div hlmDropdownMenuGroup>
                  <a routerLink="/profile" hlmDropdownMenuItem class="flex w-full items-center gap-3 px-3 py-2 rounded-xl">
                    <svg class="h-4 w-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    My Profile
                  </a>
                </div>
                <div hlmDropdownMenuSeparator></div>
                <button (click)="logout()" hlmDropdownMenuItem class="flex w-full items-center gap-3 px-3 py-2 rounded-xl text-destructive hover:bg-destructive/5 hover:text-destructive transition-colors">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              </div>
            </ng-template>
          } @else {
            <a
              routerLink="/login"
              class="group flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-all duration-200"
            >
              <span>Sign In</span>
              <svg class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          }
        </div>
      </div>
    </header>
  `,
  host: {
    class: 'block',
  },
})
export class NavbarComponent {
  private readonly authService = inject(AuthService);
  readonly themeService = inject(ThemeService);

  // Auth state
  readonly isAuthenticated = computed(() => this.authService.isAuthenticated());
  readonly currentUser = computed(() => this.authService.currentUser());
  readonly userFullName = computed(() => this.authService.userFullName());
  readonly userInitials = computed(() => this.authService.userInitials());

  /**
   * Logout the current user
   */
  logout(): void {
    this.authService.logout();
  }
}
