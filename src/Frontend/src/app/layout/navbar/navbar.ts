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

// Spartan UI Components
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmSeparatorImports } from '@spartan-ng/helm/separator';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';

@Component({
  selector: 'app-navbar',
  imports: [
    RouterLink,
    RouterLinkActive,

    ...HlmButtonImports,
    ...HlmSeparatorImports,
    ...HlmDropdownMenuImports,
  ],
  template: `
    <!-- Glass Navigation Header -->
    <header
      class="sticky top-0 z-50 w-full border-b border-border/20 bg-background/80 shadow-sm backdrop-blur-md dark:border-white/5 dark:shadow-none"
    >
      <nav class="container mx-auto px-4">
        <div class="flex h-16 items-center justify-between">
          <!-- Logo -->
          <a
            routerLink="/"
            class="flex items-center gap-2.5 font-semibold text-foreground transition-all duration-200 ease-out hover:opacity-80"
          >
            <!-- Indigo Square Icon -->
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <svg class="h-4 w-4 text-primary-foreground" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span class="text-lg font-semibold tracking-tight">JobTracker</span>
          </a>

          <!-- Center Navigation Links -->
          @if (isAuthenticated()) {
            <div class="hidden items-center gap-1 md:flex">
              <a
                routerLink="/"
                routerLinkActive="!bg-primary/10 !text-primary"
                [routerLinkActiveOptions]="{ exact: true }"
                class="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-all duration-200 ease-out hover:bg-muted hover:text-foreground"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                Applications
              </a>

              <a
                routerLink="/companies"
                routerLinkActive="!bg-primary/10 !text-primary"
                class="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-all duration-200 ease-out hover:bg-muted hover:text-foreground"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                Companies
              </a>

              <a
                routerLink="/documents"
                routerLinkActive="!bg-primary/10 !text-primary"
                class="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-all duration-200 ease-out hover:bg-muted hover:text-foreground"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Documents
              </a>
            </div>
          }

          <!-- Right Actions -->
          <div class="flex items-center gap-2">
            <!-- Notification Bell (Authenticated) -->
            @if (isAuthenticated()) {
              <button
                hlmBtn
                variant="ghost"
                size="icon"
                class="relative transition-all duration-200 ease-out"
                aria-label="Notifications"
              >
                <svg class="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <!-- Notification Badge (when there are notifications) -->
                <!-- <span class="absolute -right-0.5 -top-0.5 flex h-2 w-2 rounded-full bg-accent"></span> -->
              </button>
            }

            <!-- Theme Toggle Button -->
            <button
              (click)="themeService.toggle()"
              hlmBtn
              variant="ghost"
              size="icon"
              class="transition-all duration-200 ease-out"
              aria-label="Toggle theme"
            >
              <!-- Sun Icon (Show when Dark) -->
              @if (themeService.darkMode()) {
                <svg class="h-5 w-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              } @else {
                <!-- Moon Icon (Show when Light) -->
                <svg class="h-5 w-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              }
            </button>

            <!-- User Menu (Authenticated) -->
            @if (isAuthenticated()) {
              <div hlmSeparator orientation="vertical" class="mx-1 h-6"></div>

              <button
                hlmBtn
                variant="ghost"
                size="sm"
                class="gap-2 transition-all duration-200 ease-out"
                [hlmDropdownMenuTrigger]="userMenu"
              >
                @if (currentUser()?.profilePictureUrl) {
                  <img
                    [src]="currentUser()?.profilePictureUrl"
                    [alt]="userFullName()"
                    class="h-7 w-7 rounded-full object-cover ring-2 ring-primary/20"
                  />
                } @else {
                  <div
                    class="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground"
                  >
                    {{ userInitials() }}
                  </div>
                }
                <span class="hidden text-sm font-medium md:inline">{{ userFullName() }}</span>
                <svg class="h-4 w-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              <ng-template #userMenu>
                <div hlmDropdownMenu class="w-56">
                  <div hlmDropdownMenuLabel>
                    <span class="text-xs text-muted-foreground">{{ currentUser()?.email }}</span>
                  </div>
                  <div hlmDropdownMenuSeparator></div>
                  <div hlmDropdownMenuGroup>
                    <a
                      routerLink="/profile"
                      hlmDropdownMenuItem
                      class="flex w-full cursor-pointer items-center gap-2"
                    >
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      My Profile
                    </a>
                  </div>
                  <div hlmDropdownMenuSeparator></div>
                  <button
                    hlmDropdownMenuItem
                    (click)="logout()"
                    class="flex w-full items-center gap-2"
                  >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Sign Out
                  </button>
                </div>
              </ng-template>
            } @else {
              <!-- Login Button (Not Authenticated) -->
              <a routerLink="/login" hlmBtn variant="default" size="sm" class="gap-2">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
                Sign In
              </a>
            }
          </div>
        </div>
      </nav>
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
