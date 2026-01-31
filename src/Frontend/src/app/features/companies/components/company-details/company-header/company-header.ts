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
    lucideTrash2
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
            lucideTrash2
        })
    ],
    template: `
    <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-4">
      <div class="space-y-6 w-full">
        <!-- Back Button -->
        <button (click)="goBack.emit()" hlmBtn variant="ghost" size="sm"
          class="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-all group px-0">
          <ng-icon name="lucideArrowLeft" class="text-sm group-hover:-translate-x-1 transition-transform"></ng-icon>
          Return
        </button>

        <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <!-- Logo -->
          <div
            class="h-20 w-20 md:h-24 md:w-24 rounded-3xl bg-card border-2 border-border/40 p-4 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
            @if (logoUrl() && !logoFailed()) {
            <img [src]="logoUrl()" [alt]="company().name" class="h-full w-full object-contain"
              (error)="logoFailed.set(true)" />
            } @else {
            <ng-icon name="lucideBuilding2" class="text-3xl md:text-4xl text-muted-foreground/40"></ng-icon>
            }
          </div>

          <div class="space-y-3 text-center sm:text-left flex-1">
            <div class="flex flex-col sm:flex-row sm:items-center gap-3">
              <div class="flex items-center gap-3 min-h-[50px]">
                @if (!isEditingName()) {
                <h1 (click)="startEditingName()" (keydown.enter)="startEditingName()"
                  (keydown.space)="startEditingName()" tabindex="0" role="button" aria-label="Edit company name"
                  class="text-3xl md:text-5xl font-black tracking-tight text-foreground leading-none hover:bg-muted/50 -ml-2 px-2 rounded-lg cursor-pointer transition-colors group relative flex items-center gap-3 outline-none focus-visible:ring-2 focus-visible:ring-primary/20">
                  {{ company().name }}
                  <ng-icon name="lucidePencil"
                    class="opacity-0 group-hover:opacity-100 h-5 w-5 text-muted-foreground/50"></ng-icon>
                  @if (nameSaved()) {
                  <ng-icon name="lucideCheck" class="h-6 w-6 text-success"></ng-icon>
                  }
                </h1>
                } @else {
                <div class="flex gap-2 items-center">
                  <input hlmInput [ngModel]="tempName()" (ngModelChange)="tempName.set($event)"
                    class="text-3xl md:text-4xl font-black h-14 w-full md:w-[400px] bg-background border-primary/50"
                    placeholder="Company Name" (blur)="saveName()" (keydown.enter)="saveName()" autofocus>
                </div>
                }
              </div>
              <div class="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <span hlmBadge variant="outline"
                  class="rounded-lg px-3 py-1 text-[10px] font-black uppercase border-primary/20 bg-primary/5 text-primary">
                  {{ company().totalApplications > 0 ? 'Active Priority' : 'Target Asset' }}
                </span>

                <!-- Priority Dropdown -->
                <div class="relative">
                  <button [hlmDropdownMenuTrigger]="priorityMenu" hlmBtn variant="ghost" size="sm"
                    class="rounded-full px-4 py-1.5 h-auto text-[10px] font-black uppercase tracking-wider transition-all duration-300 group/priority border ring-1 ring-border/50 hover:ring-border/80"
                    [class]="currentPriorityStyle()">
                    <span class="mr-1.5 flex items-center">
                       @if(company().priority === 'Tier1') { <ng-icon name="lucideCheck" size="14"></ng-icon> } 
                       @else { <ng-icon name="lucideChevronDown" size="14"></ng-icon> }
                    </span>
                    {{ getPriorityLabel(company().priority) }}
                    <ng-icon name="lucideChevronDown"
                      class="ml-1.5 opacity-50 group-hover/priority:opacity-100 transition-opacity" size="12"></ng-icon>
                  </button>

                  <ng-template #priorityMenu>
                    <div hlmDropdownMenu
                      class="w-60 p-2 rounded-2xl backdrop-blur-xl bg-popover/95 border-border shadow-2xl">
                      <div class="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
                        Set Strategic Priority
                      </div>
                      <div class="h-px bg-border/40 my-1"></div>

                      @for (opt of priorityOptions; track opt.value) {
                      <button hlmDropdownMenuItem (click)="updatePriority.emit(opt.value)"
                        [class.bg-card]="company().priority === opt.value"
                        class="rounded-xl px-3 py-2.5 mb-1 text-xs font-bold flex items-center justify-between group transition-all">
                        <div class="flex items-center gap-3">
                          <div class="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                            [class]="company().priority === opt.value ? (opt.bg + ' ' + opt.color) : 'bg-muted text-muted-foreground group-hover:bg-muted/80'">
                             <div class="h-2 w-2 rounded-full bg-current"></div>
                          </div>
                          <span [class.text-foreground]="company().priority !== opt.value"
                            [class.text-primary]="company().priority === opt.value">
                            {{ opt.label }}
                          </span>
                        </div>

                        @if (company().priority === opt.value) {
                        <div class="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.5)]">
                        </div>
                        }
                      </button>
                      }
                    </div>
                  </ng-template>
                </div>
              </div>

              <div class="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1">
                @if (company().website; as website) {
                <a [href]="website" target="_blank" rel="noopener noreferrer"
                  class="flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
                  <ng-icon name="lucideGlobe" size="16"></ng-icon>
                  {{ getDisplayWebsite(website) }}
                </a>
                }
                <div class="h-4 w-px bg-border/60"></div>

                <!-- Industry Dropdown -->
                <div class="relative">
                  <button [hlmDropdownMenuTrigger]="industryMenu"
                    class="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors group/ind cursor-pointer">
                    {{ company().industry || 'Specify Industry' }}
                    <ng-icon name="lucideChevronDown"
                      class="text-[10px] opacity-50 group-hover/ind:opacity-100 transition-opacity"></ng-icon>
                  </button>

                  <ng-template #industryMenu>
                    <div hlmDropdownMenu class="w-48 max-h-64 overflow-y-auto custom-scrollbar p-1">
                      <div
                        class="px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 sticky top-0 bg-popover z-10">
                        Market Sector
                      </div>
                      @for (ind of industryOptions; track ind) {
                      <button hlmDropdownMenuItem (click)="updateIndustry.emit(ind)"
                        [class]="{ 'bg-primary/10': company().industry === ind }"
                        class="rounded-lg text-xs font-bold w-full justify-between">
                        {{ ind }}
                        @if (company().industry === ind) {
                        <ng-icon name="lucideCheck" size="12" class="text-primary"></ng-icon>
                        }
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

      <!-- Actions -->
      <div class="flex items-center justify-end gap-3 shrink-0">
        <button hlmBtn
          class="rounded-2xl h-12 w-12 p-0 bg-destructive text-destructive-foreground shadow-lg shadow-destructive/30 hover:bg-destructive/90 hover:scale-110 active:scale-95 transition-all flex items-center justify-center border-none"
          (click)="deleteCompany.emit()">
          <ng-icon name="lucideTrash2" size="20"></ng-icon>
        </button>
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
