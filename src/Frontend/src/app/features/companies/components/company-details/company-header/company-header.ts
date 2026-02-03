import { Component, input, output, ChangeDetectionStrategy, signal } from '@angular/core';
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
    <div class="flex flex-col gap-8 pb-4">
      <div class="space-y-6 w-full">
        <!-- Breadcrumbs -->
        <nav class="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
          <button (click)="goBack.emit()" class="hover:text-violet-400 transition-colors">Target Directory</button>
          <ng-icon name="lucideChevronRight" class="text-zinc-800"></ng-icon>
          <span class="text-zinc-300">{{ company().name }}</span>
        </nav>

        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 leading-none">
          <div class="flex flex-col sm:flex-row items-center sm:items-start gap-8">
            <!-- Logo -->
            <div
              class="h-24 w-24 rounded-[2rem] bg-zinc-900 border border-zinc-800 p-5 shadow-2xl flex items-center justify-center overflow-hidden shrink-0 relative group">
              <div class="absolute inset-0 bg-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              @if (logoUrl() && !logoFailed()) {
              <img [src]="logoUrl()" [alt]="company().name" class="h-full w-full object-contain relative z-10"
                (error)="logoFailed.set(true)" />
              } @else {
              <span class="text-4xl font-serif text-zinc-700 relative z-10">{{ company().name.charAt(0) }}</span>
              }
            </div>

            <div class="space-y-4 text-center sm:text-left">
              <div class="flex flex-col gap-1">
                <div class="flex items-center justify-center sm:justify-start gap-4">
                  <h1 class="text-3xl md:text-5xl font-serif text-zinc-100 tracking-tight leading-none">
                    {{ company().name }}
                  </h1>
                  <button hlmBtn variant="ghost" size="icon-sm" class="rounded-xl bg-zinc-900/50 border border-zinc-800 text-zinc-500 hover:text-violet-400 hover:border-violet-500/30 transition-all">
                    <ng-icon name="lucideRefreshCw" class="text-sm"></ng-icon>
                  </button>
                </div>
                
                <div class="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2">
                  <span class="bg-violet-500/10 text-violet-400 border border-violet-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {{ company().totalApplications > 0 ? 'Active Engagement' : 'Strategic Target' }}
                  </span>
                  
                  <div class="h-4 w-px bg-zinc-800 mx-1"></div>

                  <!-- Priority Asset Tag -->
                  <button [hlmDropdownMenuTrigger]="priorityMenu"
                    class="bg-zinc-900 border border-zinc-800 hover:border-violet-500/30 text-zinc-400 hover:text-violet-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2">
                    <div class="h-1.5 w-1.5 rounded-full bg-current"></div>
                    {{ getPriorityLabel(company().priority) }}
                    <ng-icon name="lucideChevronDown" size="10"></ng-icon>
                  </button>

                  <ng-template #priorityMenu>
                    <div hlmDropdownMenu
                      class="w-60 p-2 rounded-2xl backdrop-blur-xl bg-zinc-900/95 border-zinc-800 shadow-2xl">
                      <div class="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                        Classification Level
                      </div>
                      <div class="h-px bg-zinc-800 my-1"></div>
                      @for (opt of priorityOptions; track opt.value) {
                      <button hlmDropdownMenuItem (click)="updatePriority.emit(opt.value)"
                        class="rounded-xl px-3 py-2.5 mb-1 text-xs font-bold flex items-center justify-between group transition-all text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800">
                        {{ opt.label }}
                        @if (company().priority === opt.value) {
                        <div class="w-1.5 h-1.5 rounded-full bg-violet-400"></div>
                        }
                      </button>
                      }
                    </div>
                  </ng-template>
                </div>
              </div>

              <div class="flex flex-wrap items-center justify-center sm:justify-start gap-6 text-zinc-500">
                @if (company().website; as website) {
                <a [href]="website" target="_blank" rel="noopener noreferrer"
                  class="flex items-center gap-2 text-xs font-bold hover:text-zinc-100 transition-colors tracking-wide">
                  <ng-icon name="lucideGlobe" size="14"></ng-icon>
                  {{ getDisplayWebsite(website) }}
                </a>
                }
                
                <div class="flex items-center gap-2 text-xs font-bold tracking-wide">
                  <div class="h-1 w-1 rounded-full bg-zinc-700"></div>
                  <button [hlmDropdownMenuTrigger]="industryMenu" class="hover:text-zinc-100 transition-colors uppercase tracking-widest text-[10px]">
                    {{ company().industry || 'Sector Unknown' }}
                  </button>
                </div>

                <ng-template #industryMenu>
                  <div hlmDropdownMenu class="w-48 max-h-64 overflow-y-auto custom-scrollbar p-1 bg-zinc-900 border-zinc-800">
                    @for (ind of industryOptions; track ind) {
                    <button hlmDropdownMenuItem (click)="updateIndustry.emit(ind)"
                      class="rounded-lg text-xs font-bold w-full text-zinc-400 hover:text-zinc-100">
                      {{ ind }}
                    </button>
                    }
                  </div>
                </ng-template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
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
    { value: 'Tier1', label: 'Dream Target', color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/20' },
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

  getPriorityLabel(priority: string): string {
    const opt = this.priorityOptions.find(o => o.value === priority);
    return opt ? opt.label : priority;
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
