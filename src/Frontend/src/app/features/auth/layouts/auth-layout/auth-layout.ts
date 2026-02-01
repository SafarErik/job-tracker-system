import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeToggleComponent } from '../../../../shared/components/theme-toggle/theme-toggle';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="h-screen w-full overflow-hidden">
      <router-outlet />
    </div>
  `
})
export class AuthLayoutComponent { }
