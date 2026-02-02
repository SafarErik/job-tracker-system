import { Component, input, output, ChangeDetectionStrategy, inject, viewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobApplication } from '../../models/job-application.model';
import { JobApplicationStatus } from '../../models/application-status.enum';
import { JobCardComponent } from '../job-card/application-card.component';
import { Router } from '@angular/router';
import autoAnimate from '@formkit/auto-animate';

@Component({
    selector: 'app-application-grid',
    standalone: true,
    imports: [CommonModule, JobCardComponent],
    templateUrl: './application-grid.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApplicationGridComponent implements AfterViewInit {
    apps = input.required<JobApplication[]>();
    statusChange = output<{ applicationId: string; status: JobApplicationStatus }>();
    private readonly router = inject(Router);

    gridContainer = viewChild<ElementRef>('gridContainer');

    ngAfterViewInit(): void {
        const el = this.gridContainer()?.nativeElement;
        if (el) autoAnimate(el);
    }

    viewApplicationDetail(id: string): void {
        this.router.navigate(['/applications', id]);
    }
}
