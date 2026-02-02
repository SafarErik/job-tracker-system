import { Component, input, output, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobApplication } from '../../models/job-application.model';
import { JobCardComponent } from '../job-card/application-card.component';
import { Router } from '@angular/router';

@Component({
    selector: 'app-application-list',
    standalone: true,
    imports: [CommonModule, JobCardComponent],
    template: `
    <div class="space-y-4">
      @for (app of apps(); track app.id) {
        <app-job-card 
          [application]="app" 
          [compact]="true" 
          (openWorkstation)="viewApplicationDetail($event)">
        </app-job-card>
      }
    </div>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApplicationListComponent {
    apps = input.required<JobApplication[]>();
    private readonly router = inject(Router);

    viewApplicationDetail(id: string): void {
        this.router.navigate(['/applications', id]);
    }
}
