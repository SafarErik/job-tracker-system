import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/auth';

@Component({
  selector: 'app-entry-redirect',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntryRedirectComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    void this.router.navigateByUrl(this.authService.isAuthenticated() ? '/dashboard' : '/welcome', {
      replaceUrl: true,
    });
  }
}
