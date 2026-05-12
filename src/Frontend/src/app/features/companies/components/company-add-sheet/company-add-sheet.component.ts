import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HlmSheetImports } from '@spartan-ng/helm/sheet';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmSwitchImports } from '@spartan-ng/helm/switch';
import { BrnSheetImports } from '@spartan-ng/brain/sheet';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBuilding2, lucideMapPin, lucideGlobe, lucideZap, lucideSearch, lucideX, lucideCheck, lucideLoader2, lucidePlus, lucideMail, lucideLinkedin, lucideUsers, lucideSparkles } from '@ng-icons/lucide';
import { CompanyService, ScoutedCompanyDto } from '../../services/company.service';
import { CompanyStore } from '../../services/company.store';
import { CompanyIntelligenceService } from '../../services/company-intelligence.service';
import { SkillSelectorComponent } from '../../../../shared/components/skill-selector/skill-selector';
import { CreateCompany } from '../../models/company.model';
import { CompanyPriority } from '../../models/company-priority.enum';
import { CompanyContact } from '../../../../core/models/company-contact.model';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
    selector: 'app-company-add-sheet',

    imports: [
        CommonModule,
        ReactiveFormsModule,
        ...HlmSheetImports,
        ...BrnSheetImports,
        ...HlmButtonImports,
        ...HlmInputImports,
        ...HlmLabelImports,
        ...HlmBadgeImports,
        ...HlmSwitchImports,
        NgIcon,
        SkillSelectorComponent
    ],
    providers: [
        provideIcons({
            lucideBuilding2, lucideMapPin, lucideGlobe, lucideZap,
            lucideSearch, lucideX, lucideCheck, lucideLoader2,
            lucidePlus, lucideMail, lucideLinkedin, lucideUsers, lucideSparkles
        })
    ],
    templateUrl: './company-add-sheet.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompanyAddSheetComponent {
    private readonly fb = inject(FormBuilder);
    private readonly companyService = inject(CompanyService);
    private readonly companyStore = inject(CompanyStore);
    private readonly intelligenceService = inject(CompanyIntelligenceService);
    private readonly notificationService = inject(NotificationService);

    // Form
    form = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(2)]],
        website: ['', []],
        address: ['', []],
        industry: ['', []],
        hrContactName: ['', []],
        hrContactEmail: ['', [Validators.email]],
        hrContactLinkedIn: ['', []],
    });

    // State
    isOpen = signal(false);
    isLoading = signal(false);
    isScanning = signal(false);

    open() {
        this.isOpen.set(true);
    }

    close() {
        this.isOpen.set(false);
    }
    priority = signal<CompanyPriority>(CompanyPriority.LowTier);
    isDreamTarget = signal(false);
    techStack = signal<string[]>([]);

    // Helpers
    scoutUrl = signal('');

    // Priority Options
    readonly priorities: { value: CompanyPriority; label: string; color: string }[] = [
        { value: CompanyPriority.TopTier, label: 'High', color: 'bg-primary text-primary-foreground border-primary' },
        { value: CompanyPriority.MidTier, label: 'Mid', color: 'bg-muted text-foreground border-border' },
        { value: CompanyPriority.LowTier, label: 'Low', color: 'bg-muted/50 text-muted-foreground border-border' }
    ];

    // Industry Options from service
    industryOptions = this.intelligenceService.getIndustryOptions();

    /**
     * Fetch intelligence via the Scraper and AI Engine
     */
    async scanDomain() {
        const url = this.scoutUrl();
        if (!url || this.isScanning()) return;

        this.isScanning.set(true);

        this.companyService.scoutCompany(url).subscribe({
            next: (data: ScoutedCompanyDto) => {
                this.form.patchValue({
                    name: data.companyName,
                    website: url,
                    industry: data.industry,
                    address: data.hqLocation
                });

                if (data.techStack?.length) {
                    this.techStack.update(current => {
                        const next = [...current, ...data.techStack];
                        return [...new Set(next)];
                    });
                }

                this.notificationService.success(`Data retrieved for ${data.companyName}`, 'Research updated');
                this.isScanning.set(false);
            },
            error: (err) => {
                const msg = err.error?.message || 'Company data could not be retrieved.';
                this.notificationService.error(msg, 'Research failed');
                this.isScanning.set(false);
            }
        });
    }

    setPriority(p: CompanyPriority) {
        this.priority.set(p);
    }

    toggleDreamTarget() {
        this.isDreamTarget.update(v => !v);
    }

    onSkillAdded(skill: string) {
        if (!this.techStack().includes(skill)) {
            this.techStack.update(s => [...s, skill]);
        }
    }

    onSkillRemoved(skill: string) {
        this.techStack.update(s => s.filter(x => x !== skill));
    }

    onSubmit() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.isLoading.set(true);

        const formVal = this.form.value;

        // Construct payload
        const payload: CreateCompany = {
            name: formVal.name!,
            website: formVal.website || undefined,
            address: formVal.address || undefined,
            industry: formVal.industry || undefined,
            priority: this.priority(),
            techStack: this.techStack(),
            contacts: []
        };

        // Add contact if provided
        if (formVal.hrContactName) {
            payload.contacts?.push({
                id: '0', // sentinel for new contact
                name: formVal.hrContactName,
                email: formVal.hrContactEmail || '',
                linkedIn: formVal.hrContactLinkedIn || '',
                role: 'Recruiter'
            } as CompanyContact);
        }

        this.companyService.createCompany(payload).subscribe({
            next: () => {
                this.isLoading.set(false);
                this.notificationService.success(`${payload.name} added to company research.`, 'Company saved');
                this.resetForm();
                // Refresh the store list
                this.companyStore.loadAll();
            },
            error: () => {
                this.isLoading.set(false);
                this.notificationService.error('Could not create company.', 'Save failed');
            }
        });
    }

    resetForm() {
        this.form.reset();
        this.priority.set(CompanyPriority.LowTier);
        this.isDreamTarget.set(false);
        this.techStack.set([]);
        this.scoutUrl.set('');
    }
}
