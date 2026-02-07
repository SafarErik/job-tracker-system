import { Component, input, output, ChangeDetectionStrategy, signal, computed, linkedSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompanyDetail } from '../../../models/company.model';
import { HlmBadgeImports } from '../../../../../../../libs/ui/badge';
import { HlmButtonImports } from '../../../../../../../libs/ui/button';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmInputImports } from '../../../../../../../libs/ui/input';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucideBuilding2,
  lucidePencil,
  lucideCheck,
  lucideChevronDown,
  lucideGlobe,
  lucideTrash2,
  lucideRefreshCw,
  lucideChevronRight,
  lucideSettings
} from '@ng-icons/lucide';

@Component({
  selector: 'app-company-header',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ...HlmButtonImports,
    ...HlmBadgeImports,
    ...HlmDropdownMenuImports,
    ...HlmInputImports,
    NgIcon
  ],
  providers: [
    provideIcons({
      lucideArrowLeft,
      lucideBuilding2,
      lucidePencil,
      lucideCheck,
      lucideChevronDown,
      lucideGlobe,
      lucideTrash2,
      lucideRefreshCw,
      lucideChevronRight,
      lucideSettings
    })
  ],
  templateUrl: './company-header.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompanyHeaderComponent {
  company = input.required<CompanyDetail>();
  logoUrl = input<string | null>(null);

  // Logo Fallback Logic
  useFallbackLogo = linkedSignal({
    source: () => ({ company: this.company(), logoUrl: this.logoUrl() }),
    computation: () => false
  });

  goBack = output<void>();
  updateName = output<string>();
  updatePriority = output<string>();
  updateIndustry = output<string>();
  deleteCompany = output<void>();
  openSettings = output<void>();

  // Local state for UI
  logoFailed = signal(false);
  isEditingName = signal(false);
  nameSaved = signal(false);
  tempName = signal('');

  // Constants
  readonly priorityOptions = [
    { value: 'Tier1', label: 'Dream Target', color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
    { value: 'Tier2', label: 'High Interest', color: 'text-info', bg: 'bg-info/10', border: 'border-info/20' },
    { value: 'Tier3', label: 'Opportunistic', color: 'text-muted-foreground', bg: 'bg-muted/10', border: 'border-border/20' }
  ];

  readonly industryOptions = [
    'SaaS', 'Fintech', 'HealthTech', 'AdTech', 'EdTech',
    'E-commerce', 'Cybersecurity', 'Gaming', 'Cloud Infrastructure',
    'AI / ML', 'Blockchain', 'Big Data', 'IoT', 'Robotics'
  ];

  getDisplayWebsite(url: string): string {
    return url.replace('https://', '').replace('http://', '');
  }

  resolvedLogo = computed(() => {
    // Priority 1: User-uploaded logoUrl
    if (this.logoUrl()) return this.logoUrl()!;

    // Priority 2: Logo.dev domain-based URL
    const domain = this.company().website?.replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0];
    if (domain) {
      // Token should follow security best practices (inject via config or proxy)
      return `https://img.logo.dev/${domain}`;
    }

    return '';
  });

  getPriorityLabel(priority: string): string {
    const opt = this.priorityOptions.find(o => o.value === priority);
    return opt ? opt.label : priority;
  }

  getPriorityColorClass(priority: string): string {
    const opt = this.priorityOptions.find(o => o.value === priority);
    if (!opt) return 'bg-muted';
    if (priority === 'Tier1') return 'bg-primary shadow-[0_0_8px_rgba(var(--primary),0.4)]';
    if (priority === 'Tier2') return 'bg-info shadow-[0_0_8px_rgba(var(--info),0.4)]';
    return 'bg-muted-foreground';
  }

  currentPriorityStyle(): string {
    const p = this.company().priority;
    const opt = this.priorityOptions.find(o => o.value === p);
    return opt ? `${opt.bg} ${opt.color} ${opt.border}` : '';
  }

  startEditingName(): void {
    this.tempName.set(this.company().name);
    this.isEditingName.set(true);
  }

  saveName(): void {
    const newName = this.tempName().trim();
    if (newName && newName !== this.company().name) {
      this.updateName.emit(newName);
      this.nameSaved.set(true);
      setTimeout(() => this.nameSaved.set(false), 2000);
    }
    this.isEditingName.set(false);
  }
}
