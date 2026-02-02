import { Component, input, output, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobApplication } from '../../models/job-application.model';
import { JobCardComponent } from '../job-card/application-card.component';
import { Router } from '@angular/router';

@Component({
    selector: 'app-application-grid',
    standalone: true,
    imports: [CommonModule, JobCardComponent],
    template: `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      @for (app of apps(); track app.id; let i = $index) {
        <app-job-card 
          [application]="app" 
          (openWorkstation)="viewApplicationDetail($event)"
          class="animate-in fade-in slide-in-from-bottom-8 duration-500 fill-mode-both"
          [style.animation-delay]="i * 50 + 'ms'">
        </app-job-card>
      }
    </div>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApplicationGridComponent {
    apps = input.required<JobApplication[]>();
    private readonly router = inject(Router);

    viewApplicationDetail(id: string): void {
        this.router.navigate(['/applications', id]);
    }
}
