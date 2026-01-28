import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

// Services
import { ApplicationService } from '../../services/application.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { CompanyService } from '../../../companies/services/company.service';

// Models
import { JobApplicationStatus } from '../../models/application-status.enum';

// Spartan UI Imports
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmAutocompleteImports } from '@spartan-ng/helm/autocomplete';
import { BrnAutocompleteInput, BrnAutocompleteAnchor } from '@spartan-ng/brain/autocomplete';
import { BrnPopoverContent } from '@spartan-ng/brain/popover';

// Icons
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucideClipboard } from '@ng-icons/lucide';

@Component({
    selector: 'app-add-job-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule,
        NgIcon,
        ...HlmInputImports,
        ...HlmLabelImports,
        ...HlmButtonImports,
        ...HlmAutocompleteImports,
        BrnAutocompleteInput,
        BrnAutocompleteAnchor,
        BrnPopoverContent,
    ],
    providers: [
        provideIcons({ lucideArrowLeft, lucideClipboard })
    ],
    templateUrl: './add-job-form.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddJobFormComponent {
    form: FormGroup;
    isSubmitting = signal(false);
    isLoadingData = signal(false);

    // Data Sources
    companies = signal<any[]>([]);
    recentPositions = signal<string[]>([]);

    // Filtered Signals for Autocomplete
    filteredCompanies = signal<any[]>([]);
    filteredPositions = signal<string[]>([]);

    constructor(
        private fb: FormBuilder,
        private applicationService: ApplicationService,
        private companyService: CompanyService,
        private notificationService: NotificationService,
        private router: Router
    ) {
        this.form = this.fb.group({
            companyName: ['', [Validators.required]],
            companyId: [null],
            position: ['', [Validators.required]],
            jobUrl: ['', []],
            status: [JobApplicationStatus.Applied, [Validators.required]],
            location: ['', []],
            // Removed salaryMin/Max as requested
        });

        this.loadAutocompleteData();
    }

    private loadAutocompleteData() {
        this.isLoadingData.set(true);

        // Load Companies
        this.companyService.getCompanies().subscribe(comps => {
            this.companies.set(comps);
            this.filteredCompanies.set(comps.slice(0, 5));
        });

        // Load Applications to derive recent positions
        this.applicationService.getApplications().subscribe(apps => {
            // Extract unique positions, effectively "recent" by default list order or we could sort by date
            const uniquePositions = [...new Set(apps.map(a => a.position))].filter(Boolean);
            this.recentPositions.set(uniquePositions);
            this.filteredPositions.set(uniquePositions.slice(0, 5));
            this.isLoadingData.set(false);
        });
    }

    // --- Company Autocomplete Logic ---

    // Helper for Spartan to display object as string in input
    companyToString(company: any): string {
        return company?.name ?? company ?? '';
    }

    onCompanyInput(event: Event) {
        const value = (event.target as HTMLInputElement).value;
        this.form.patchValue({ companyId: null }, { emitEvent: false }); // Reset ID on type
        this.filterCompanies(value);
    }

    private filterCompanies(value: string) {
        if (!value) {
            this.filteredCompanies.set(this.companies().slice(0, 5));
            return;
        }
        const lower = value.toLowerCase();
        const matches = this.companies().filter(c => c.name.toLowerCase().includes(lower));
        this.filteredCompanies.set(matches.slice(0, 5));
    }

    onCompanySelected(event: any) {
        // Event is the selected value (Company Object or Check String)
        const selected = event;

        // Check if it's our special "Create" string/object or real company
        if (selected && selected.id) {
            this.form.patchValue({
                companyName: selected.name,
                companyId: selected.id
            });
        } else if (typeof selected === 'string') {
            // Case where user selected the "Create X" item which we might pass as string?
            // Or simply user typed name.
            // If we handle "Create" item as a value, we can catch it here.
            // We will pass the current name string as value for the Create item.
            this.form.patchValue({ companyName: selected, companyId: null });
        }
    }

    // --- Position Autocomplete Logic ---

    onPositionInput(event: Event) {
        const value = (event.target as HTMLInputElement).value;
        this.filterPositions(value);
    }

    private filterPositions(value: string) {
        if (!value) {
            this.filteredPositions.set(this.recentPositions().slice(0, 5));
            return;
        }
        const lower = value.toLowerCase();
        const matches = this.recentPositions().filter(p => p.toLowerCase().includes(lower));
        this.filteredPositions.set(matches.slice(0, 5));
    }

    onPositionSelected(value: string) {
        this.form.patchValue({ position: value });
    }

    // --- Focus Handling ---
    // Spartan handles focus/blur visibility logic internally
    onCompanyFocus() {
        this.filterCompanies(this.form.get('companyName')?.value || '');
    }

    onPositionFocus() {
        this.filterPositions(this.form.get('position')?.value || '');
    }

    async onPasteUrl() {
        try {
            const text = await navigator.clipboard.readText();
            if (text && (text.startsWith('http') || text.startsWith('www'))) {
                this.form.patchValue({ jobUrl: text });
                this.notificationService.success('URL pasted!', 'Success');
            } else {
                this.notificationService.info('Clipboard does not contain a broad URL.', 'Info');
            }
        } catch (err) {
            console.error('Failed to read clipboard', err);
            // Fallback or specific error handling
        }
    }

    onSubmit() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.isSubmitting.set(true);
        const formValue = this.form.value;

        // Use selected ID or resolve by name
        if (formValue.companyId) {
            this.saveApplication(formValue);
        } else {
            this.resolveCompanyAndSave(formValue.companyName, formValue);
        }
    }

    private resolveCompanyAndSave(name: string, formData: any) {
        // Check for exact match in existing list (case-insensitive) just in case
        const match = this.companies().find(c => c.name.toLowerCase() === name.toLowerCase());

        if (match) {
            // Use existing match
            this.saveApplication({ ...formData, companyId: match.id });
        } else {
            // Create new
            this.companyService.createCompany({ name }).subscribe({
                next: (newComp) => {
                    this.saveApplication({ ...formData, companyId: newComp.id });
                },
                error: () => {
                    this.isSubmitting.set(false);
                    this.notificationService.error('Could not create company.', 'Error');
                }
            });
        }
    }

    private saveApplication(payload: any) {
        // Ensure payload matches backend expectations
        // Remove temporary form controls if any
        const apiPayload = {
            ...payload,
            // If backend needs status as number
            status: Number(payload.status)
        };

        this.applicationService.createApplication(apiPayload).subscribe({
            next: () => {
                this.notificationService.success('Application saved!', 'Success');
                this.router.navigate(['/']);
            },
            error: () => {
                this.isSubmitting.set(false);
                this.notificationService.error('Failed to save.', 'Error');
            }
        });
    }
}
