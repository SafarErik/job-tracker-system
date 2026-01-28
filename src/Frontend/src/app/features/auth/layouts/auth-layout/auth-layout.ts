import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-auth-layout',
    imports: [RouterOutlet],
    template: `
    <!-- A subtle, premium backdrop -->
    <div class="min-h-screen w-full flex items-center justify-center bg-[#FBFBFD] relative overflow-hidden">
      
      <!-- Decorative background blobs -->
      <div class="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl"></div>
      <div class="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-3xl"></div>

      <!-- Content Container -->
      <div class="relative z-10 w-full max-w-[440px] px-4 py-12">
        <router-outlet></router-outlet>
      </div>
    </div>
  `
})
export class AuthLayoutComponent { }
