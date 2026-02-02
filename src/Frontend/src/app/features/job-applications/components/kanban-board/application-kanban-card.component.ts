import {
    Component,
    input,
    computed,
    output,
    ChangeDetectionStrategy,
    signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HlmDropdownMenuImports, HlmDropdownMenuTrigger } from '@spartan-ng/helm/dropdown-menu';
import { JobApplication } from '../../models/job-application.model';
import { JobApplicationStatus } from '../../models/application-status.enum';
import { JobPriority } from '../../models/job-priority.enum';
import { LogoPlaceholderComponent } from '../../../../shared/components/logo-placeholder/logo-placeholder.component';
import { getStatusBadgeClasses, getStatusStyle } from '../../models/status-styles.util';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideMoreHorizontal, lucideCheck } from '@ng-icons/lucide';

@Component({
    selector: 'app-kanban-card',
    standalone: true,
    imports: [
        CommonModule,
        LogoPlaceholderComponent,
        NgIcon,
        ...HlmDropdownMenuImports,
        HlmDropdownMenuTrigger,
    ],
    providers: [
        provideIcons({
            lucideMoreHorizontal,
            lucideCheck
        }),
    ],
    templateUrl: './application-kanban-card.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationKanbanCardComponent {
    application = input.required<JobApplication>();

    // Outputs
    openWorkstation = output<string>();
    statusChange = output<{ applicationId: string; status: JobApplicationStatus }>();

    // Logo state
    logoFailed = signal(false);

    // Status Enum
    Status = JobApplicationStatus;

    // Computed: Logo URL
    logoUrl = computed(() => {
        const companyName = this.application().companyName;
        if (!companyName) return null;
        const sanitized = companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
        return `https://logo.clearbit.com/${sanitized}.com`;
    });

    // Computed: Days Since Update (e.g. "2d")
    timeSinceUpdate = computed(() => {
        const app = this.application();
        const date = new Date(app.updatedAt || app.appliedAt);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return '1d';
        return `${diffDays}d`;
    });

    // Computed: Priority Color for Left Strip
    priorityClass = computed(() => {
        switch (this.application().priority) {
            case JobPriority.High: return 'bg-amber-500'; // Golden Yellow
            case JobPriority.Medium: return 'bg-blue-500'; // Blueish
            default: return 'bg-transparent'; // Low
        }
    });

    // Computed: Status Badge Classes
    statusBadgeClass = computed(() => {
        return getStatusBadgeClasses(this.application().status);
    });

    // Computed: Status Label
    statusLabel = computed(() => {
        return this.getStatusLabel(this.application().status);
    });

    getStatusLabel(status: JobApplicationStatus): string {
        return getStatusStyle(status).label;
    }

    // Column Context for Restricting Status Options
    columnId = input.required<string>();
    allowedStatuses = input.required<JobApplicationStatus[]>();

    // Computed: Filtered Status Options for Dropdown
    statusOptions = computed(() => {
        if (this.columnId() === 'inbox') return [];
        return this.allowedStatuses();
    });

    isDropdownDisabled = computed(() => this.columnId() === 'inbox');

    onLogoError() {
        this.logoFailed.set(true);
    }

    onCardClick() {
        this.openWorkstation.emit(this.application().id);
    }

    onStatusSelect(status: JobApplicationStatus, event: Event) {
        event.stopPropagation();
        if (this.application().status !== status) {
            this.statusChange.emit({
                applicationId: this.application().id,
                status
            });
        }
    }
}
