import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-auth-layout',
    imports: [RouterOutlet],
    template: `
    <!-- Dynamic, premium backdrop with dark mode support -->
    <div class="min-h-screen w-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 transition-colors duration-500 relative overflow-hidden">
      
      <!-- Decorative background blobs -->
      <div class="absolute top-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-primary/5 dark:bg-primary/10 blur-[120px]"></div>
      <div class="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-blue-500/5 dark:bg-indigo-500/10 blur-[120px]"></div>

      <!-- Content Container -->
      <div class="relative z-10 w-full max-w-[480px] px-6 py-12">
        <router-outlet></router-outlet>
      </div>
    </div>
  `
})
export class AuthLayoutComponent { }
