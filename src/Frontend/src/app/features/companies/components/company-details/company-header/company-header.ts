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
  template: `
    <div class="flex flex-col gap-6 mb-2">
      <!-- Top Action Bar -->
      <div class="flex items-center justify-between">
        <button hlmBtn variant="ghost" size="sm" (click)="goBack.emit()" 
          class="rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 group transition-all px-2">
          <ng-icon name="lucideArrowLeft" class="mr-2 group-hover:-translate-x-1 transition-transform"></ng-icon>
          <span class="text-[10px] font-black uppercase tracking-[0.2em]">Return to Registry</span>
        </button>

        <div class="flex items-center gap-2">
           <button hlmBtn variant="outline" size="sm" class="rounded-xl border-border bg-card/30 text-muted-foreground hover:text-primary hover:border-primary/30 transition-all font-sans text-[10px] font-black uppercase tracking-widest gap-2">
            <ng-icon name="lucideRefreshCw" class="h-3.5 w-3.5"></ng-icon>
            Refresh Intel
          </button>
        </div>
      </div>

      <!-- Main Identity Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="flex items-center gap-6">
          <!-- Logo Display -->
          <div class="h-20 w-20 rounded-3xl bg-card/50 border border-border flex items-center justify-center overflow-hidden shadow-2xl group relative">
            <img [src]="resolvedLogo()" (error)="useFallbackLogo.set(true)" *ngIf="!useFallbackLogo()"
              class="h-full w-full object-contain p-3 transition-transform group-hover:scale-110 duration-500" [alt]="company().name">
            <div *ngIf="useFallbackLogo()" class="text-3xl font-serif text-foreground font-bold select-none">
              {{ company().name.charAt(0) }}
            </div>
          </div>

          <div class="space-y-1">
            <div class="flex items-center gap-3">
              <h1 class="text-4xl font-serif text-foreground tracking-tight leading-none">
                {{ company().name }}
              </h1>
              <!-- Verified Target Badge -->
              <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 border border-success/20 text-success text-[9px] font-black uppercase tracking-widest">
                <ng-icon name="lucideCheck" class="h-3 w-3"></ng-icon>
                Verified Target
              </div>
            </div>
            
            <div class="flex items-center gap-4 text-xs font-medium text-muted-foreground">
              <span class="flex items-center gap-1">
                <ng-icon name="lucideBuilding2" class="opacity-50"></ng-icon>
                {{ company().industry || 'Sector Unknown' }}
              </span>
              <span class="h-1 w-1 rounded-full bg-border"></span>
              @if (company().website; as website) {
                <a [href]="website" target="_blank" class="hover:text-primary transition-colors">
                  {{ website.replace('https://', '').replace('http://', '').split('/')[0] }}
                </a>
              }
            </div>
          </div>
        </div>

        <!-- Meta Info / Tags -->
        <div class="flex flex-wrap items-center gap-3">
          <!-- Priority Dropdown -->
          <button [hlmDropdownMenuTrigger]="priorityMenu" hlmBtn variant="outline" size="sm" 
            class="rounded-xl border-border bg-card/30 gap-2 h-10 px-4 group transition-all">
            <div class="h-2 w-2 rounded-full" [class]="getPriorityColorClass(company().priority)"></div>
            <span class="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground">{{ getPriorityLabel(company().priority) }}</span>
            <ng-icon name="lucideChevronDown" class="h-3 w-3 text-muted-foreground/50"></ng-icon>
          </button>

          <button (click)="deleteCompany.emit()" hlmBtn variant="ghost" size="icon"
            class="h-10 w-10 rounded-xl border border-border bg-card/30 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all shadow-lg active:scale-95"
            title="Expunge Asset">
            <ng-icon name="lucideTrash2" class="h-4 w-4"></ng-icon>
          </button>

          <button (click)="openSettings.emit()" hlmBtn variant="ghost" size="icon"
            class="h-10 w-10 rounded-xl border border-border bg-card/30 text-muted-foreground hover:text-foreground transition-all shadow-lg active:scale-95"
            title="Asset Settings">
            <ng-icon name="lucideSettings" class="h-4 w-4"></ng-icon>
          </button>
        </div>
      </div>
    </div>

    <!-- Menus (Simplified for now) -->
    <ng-template #priorityMenu>
      <div hlmDropdownMenu class="w-48 bg-popover border-border rounded-xl overflow-hidden shadow-2xl">
        <button hlmDropdownMenuItem *ngFor="let opt of priorityOptions" (click)="updatePriority.emit(opt.value)"
          class="flex items-center gap-3 px-4 py-2 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
           <div class="h-2 w-2 rounded-full" [class]="getPriorityColorClass(opt.value)"></div>
           <span class="text-xs font-semibold">{{ opt.label }}</span>
        </button>
      </div>
    </ng-template>
  `,
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
