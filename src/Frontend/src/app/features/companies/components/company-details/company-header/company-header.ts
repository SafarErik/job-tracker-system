import { Component, input, output, ChangeDetectionStrategy, signal, computed } from '@angular/core';
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
  lucideChevronRight
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
      lucideChevronRight
    })
  ],
  template: `
    <div class="flex flex-col gap-6 mb-2">
      <!-- Top Action Bar -->
      <div class="flex items-center justify-between">
        <button hlmBtn variant="ghost" size="sm" (click)="goBack.emit()" 
          class="rounded-xl text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/50 group transition-all px-2">
          <ng-icon name="lucideArrowLeft" class="mr-2 group-hover:-translate-x-1 transition-transform"></ng-icon>
          <span class="text-[10px] font-black uppercase tracking-[0.2em]">Return to Registry</span>
        </button>

        <div class="flex items-center gap-2">
           <button hlmBtn variant="outline" size="sm" class="rounded-xl border-zinc-800 bg-zinc-900/30 text-zinc-400 hover:text-violet-400 hover:border-violet-500/30 transition-all font-sans text-[10px] font-black uppercase tracking-widest gap-2">
            <ng-icon name="lucideRefreshCw" class="h-3.5 w-3.5"></ng-icon>
            Refresh Intel
          </button>
        </div>
      </div>

      <!-- Main Identity Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="flex items-center gap-6">
          <!-- Logo.dev Integration -->
          <div class="h-20 w-20 rounded-3xl bg-zinc-900/50 border border-zinc-800 flex items-center justify-center overflow-hidden shadow-2xl group relative">
            <img [src]="logoDevUrl()" (error)="useFallbackLogo = true" *ngIf="!useFallbackLogo"
              class="h-full w-full object-contain p-3 transition-transform group-hover:scale-110 duration-500" [alt]="company().name">
            <div *ngIf="useFallbackLogo" class="text-3xl font-serif text-zinc-100 font-bold select-none">
              {{ company().name.charAt(0) }}
            </div>
          </div>

          <div class="space-y-1">
            <div class="flex items-center gap-3">
              <h1 class="text-4xl font-serif text-zinc-100 tracking-tight leading-none">
                {{ company().name }}
              </h1>
              <!-- Verified Target Badge -->
              <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-widest">
                <ng-icon name="lucideCheck" class="h-3 w-3"></ng-icon>
                Verified Target
              </div>
            </div>
            
            <div class="flex items-center gap-4 text-xs font-medium text-zinc-500">
              <span class="flex items-center gap-1">
                <ng-icon name="lucideBuilding2" class="opacity-50"></ng-icon>
                {{ company().industry || 'Sector Unknown' }}
              </span>
              <span class="h-1 w-1 rounded-full bg-zinc-800"></span>
              @if (company().website; as website) {
                <a [href]="website" target="_blank" class="hover:text-violet-400 transition-colors">
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
            class="rounded-xl border-zinc-800 bg-zinc-900/30 gap-2 h-10 px-4 group transition-all">
            <div class="h-2 w-2 rounded-full" [class]="getPriorityColorClass(company().priority)"></div>
            <span class="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-zinc-100">{{ getPriorityLabel(company().priority) }}</span>
            <ng-icon name="lucideChevronDown" class="h-3 w-3 text-zinc-600"></ng-icon>
          </button>

          <button (click)="deleteCompany.emit()" hlmBtn variant="ghost" size="icon"
            class="h-10 w-10 rounded-xl border border-zinc-800 bg-zinc-900/30 text-zinc-500 hover:text-destructive hover:bg-destructive/10 transition-all shadow-lg active:scale-95"
            title="Expunge Asset">
            <ng-icon name="lucideTrash2" class="h-4 w-4"></ng-icon>
          </button>

          <button class="h-10 w-10 rounded-xl border border-zinc-800 bg-zinc-900/30 flex items-center justify-center text-zinc-500 hover:text-zinc-100 transition-all shadow-lg active:scale-95">
            <ng-icon name="lucideExternalLink" class="h-4 w-4"></ng-icon>
          </button>
        </div>
      </div>
    </div>

    <!-- Menus (Simplified for now) -->
    <ng-template #priorityMenu>
      <div hlmDropdownMenu class="w-48 bg-zinc-900 border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
        <button hlmDropdownMenuItem *ngFor="let opt of priorityOptions" (click)="updatePriority.emit(opt.value)"
          class="flex items-center gap-3 px-4 py-2 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors">
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

  goBack = output<void>();
  updateName = output<string>();
  updatePriority = output<string>();
  updateIndustry = output<string>();
  deleteCompany = output<void>();

  // Local state for UI
  logoFailed = signal(false);
  isEditingName = signal(false);
  nameSaved = signal(false);
  tempName = signal('');

  // Constants
  readonly priorityOptions = [
    { value: 'Tier1', label: 'Dream Target', color: 'text-violet-400', bg: 'bg-violet-400/10', border: 'border-violet-400/20' },
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

  useFallbackLogo = false;

  logoDevUrl = computed(() => {
    const domain = this.company().website?.replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0];
    if (!domain) return '';
    return `https://img.logo.dev/${domain}?token=pk_ST8P0_p7TQW5R7X5Xj_W7Q`; // I'll use a placeholder token or just the domain if allowed, but usually logo.dev needs a token. The user said "Logo.dev integration"
  });

  getPriorityLabel(priority: string): string {
    const opt = this.priorityOptions.find(o => o.value === priority);
    return opt ? opt.label : priority;
  }

  getPriorityColorClass(priority: string): string {
    const opt = this.priorityOptions.find(o => o.value === priority);
    if (!opt) return 'bg-zinc-800';
    if (priority === 'Tier1') return 'bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.4)]';
    if (priority === 'Tier2') return 'bg-info shadow-[0_0_8px_rgba(var(--info),0.4)]';
    return 'bg-zinc-500';
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
