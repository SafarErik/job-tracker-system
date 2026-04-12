import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { UiStateService } from '../../../../core/services';

@Component({
  selector: 'app-new-application-redirect',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewApplicationRedirectComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly uiState = inject(UiStateService);

  ngOnInit(): void {
    this.router.navigate(['/applications'], { replaceUrl: true }).then(() => {
      queueMicrotask(() => this.uiState.openAddAppSheet());
    });
  }
}
