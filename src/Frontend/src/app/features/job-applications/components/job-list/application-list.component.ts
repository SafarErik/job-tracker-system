import { Component, input, output, ChangeDetectionStrategy, inject, computed, viewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobApplication } from '../../models/job-application.model';
import { Router } from '@angular/router';
import { JobApplicationStatus } from '../../models/application-status.enum';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { ApplicationRowComponent } from './application-row.component';
import autoAnimate from '@formkit/auto-animate';

@Component({
    selector: 'app-application-list',
    standalone: true,
    imports: [
        CommonModule,
        ApplicationRowComponent
    ],
    templateUrl: './application-list.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApplicationListComponent implements AfterViewInit {
    apps = input.required<JobApplication[]>();
    private readonly router = inject(Router);

    listBody = viewChild<ElementRef>('listBody');

    ngAfterViewInit(): void {
        const el = this.listBody()?.nativeElement;
        if (el) autoAnimate(el);
    }

    viewApplicationDetail(id: string): void {
        this.router.navigate(['/workstation', id]);
    }

    onArchive(id: string): void {
        console.log('Archive', id);
    }
}
