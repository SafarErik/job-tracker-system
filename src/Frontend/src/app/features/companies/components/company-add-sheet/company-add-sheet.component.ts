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
import { CompanyService } from '../../services/company.service';
import { CompanyIntelligenceService } from '../../services/company-intelligence.service';
import { SkillSelectorComponent } from '../../../../shared/components/skill-selector/skill-selector';
import { CreateCompany } from '../../models/company.model';
import { toast } from 'ngx-sonner';

@Component({
    selector: 'app-company-add-sheet',
    standalone: true,
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
    private fb = inject(FormBuilder);
    private companyService = inject(CompanyService);
    private intelligenceService = inject(CompanyIntelligenceService);

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
    priority = signal<'Tier1' | 'Tier2' | 'Tier3'>('Tier3');
    isDreamTarget = signal(false);
    techStack = signal<string[]>([]);

    // Helpers
    scoutUrl = signal('');

    // Priority Options
    readonly priorities: { value: 'Tier1' | 'Tier2' | 'Tier3'; label: string; color: string }[] = [
        { value: 'Tier1', label: 'High', color: 'bg-primary text-primary-foreground border-primary' },
        { value: 'Tier2', label: 'Mid', color: 'bg-muted text-foreground border-border' },
        { value: 'Tier3', label: 'Low', color: 'bg-muted/50 text-muted-foreground border-border' }
    ];

    // Industry Options from service
    industryOptions = this.intelligenceService.getIndustryOptions();

    /**
     * Mock "Fetch Data" functionality
     */
    async scanDomain() {
        if (!this.scoutUrl()) return;

        this.isScanning.set(true);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Mock Data based on domain
        const domain = this.scoutUrl().toLowerCase();
        let mockData: any = {
            name: '',
            industry: 'Technology',
            techStack: ['React', 'TypeScript']
        };

        if (domain.includes('google')) {
            mockData = { name: 'Google', industry: 'Big Tech', techStack: ['Angular', 'Go', 'Python', 'Kubernetes'] };
        } else if (domain.includes('netflix')) {
            mockData = { name: 'Netflix', industry: 'Streaming', techStack: ['Java', 'React', 'Node.js', 'AWS'] };
        } else {
            // Generic fallback derived from domain
            const name = domain.split('.')[0];
            mockData.name = name.charAt(0).toUpperCase() + name.slice(1);
        }

        // Auto-fill form
        this.form.patchValue({
            name: mockData.name,
            website: this.scoutUrl(),
            industry: mockData.industry
        });

        // Merge tech stack
        this.techStack.update(stack => [...new Set([...stack, ...mockData.techStack])]);

        this.isScanning.set(false);
        toast.success('Intelligence Gathered', { description: `Data retrieved for ${mockData.name}` });
    }

    setPriority(p: 'Tier1' | 'Tier2' | 'Tier3') {
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
                id: '0', // New contact
                name: formVal.hrContactName,
                email: formVal.hrContactEmail || '',
                linkedIn: formVal.hrContactLinkedIn || '',
                role: 'Recruiter'
            });
        }

        this.companyService.createCompany(payload).subscribe({
            next: () => {
                this.isLoading.set(false);
                toast.success('Asset Initialized', { description: `${payload.name} added to registry.` });
                this.resetForm();
            },
            error: (err) => {
                console.error(err);
                this.isLoading.set(false);
                toast.error('Initialization Failed', { description: 'Could not create company.' });
            }
        });
    }

    resetForm() {
        this.form.reset();
        this.priority.set('Tier3');
        this.isDreamTarget.set(false);
        this.techStack.set([]);
        this.scoutUrl.set('');
    }
}
