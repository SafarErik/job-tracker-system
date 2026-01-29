import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-auth-layout',
    imports: [RouterOutlet],
    template: `
    <!-- Simplified Layout relying on global App Shell background -->
    <div class="w-full flex items-center justify-center">
      <!-- Content Container -->
      <div class="w-full max-w-[480px]">
        <router-outlet></router-outlet>
      </div>
    </div>
  `
})
export class AuthLayoutComponent { }
