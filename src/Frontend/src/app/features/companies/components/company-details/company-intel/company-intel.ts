import { Component, input, output, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyNews, JobApplicationHistory as ApplicationHistory } from '../../../models/company.model';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideExternalLink, lucideLoader2, lucideTrendingUp, lucideShieldCheck, lucideAlertCircle } from '@ng-icons/lucide';

@Component({
  selector: 'app-company-intel',
  standalone: true,
  imports: [CommonModule, NgIcon],
  providers: [provideIcons({ lucideExternalLink, lucideLoader2, lucideTrendingUp, lucideShieldCheck, lucideAlertCircle })],
  template: `
    <div class="h-full flex flex-col space-y-4">
      @if (loading()) {
        <div class="flex items-center justify-center p-8 text-emerald-400">
           <ng-icon name="lucideLoader2" class="animate-spin h-6 w-6"></ng-icon>
        </div>
      } @else if (news().length === 0) {
        <div class="flex flex-col items-center justify-center h-40 border border-dashed border-zinc-800 rounded-2xl opacity-40">
           <p class="text-[10px] font-black uppercase tracking-widest text-zinc-500">No Intelligence Data Found</p>
        </div>
      } @else {
        <div class="space-y-3">
        @for (item of news(); track item.id) {
          <div class="p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800 hover:border-emerald-500/30 transition-all group/item">
            <div class="flex flex-col gap-2">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="text-[9px] font-black uppercase tracking-widest text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    {{ item.source }}
                  </span>
                  
                  <!-- Reliability Badge -->
                  <div class="flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-950 border border-zinc-900" 
                    [ngClass]="getReliabilityClass(item)">
                    <ng-icon [name]="getReliabilityIcon(item)" class="h-2.5 w-2.5"></ng-icon>
                    <span class="text-[8px] font-black uppercase tracking-tighter">{{ getReliabilityLabel(item) }}</span>
                  </div>
                </div>
                <span class="text-[9px] font-bold text-zinc-600">{{ formatDate(item.date) }}</span>
              </div>
              
              <h5 class="text-sm font-bold leading-snug text-zinc-300 group-hover/item:text-zinc-100 transition-colors">
                {{ item.title }}
              </h5>
              <p class="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                  {{ item.summary || 'Deep analysis pending. Signal verification in progress...' }}
              </p>
            </div>
          </div>
        }
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompanyIntelComponent {
  news = input.required<CompanyNews[]>();

  loading = input(false);


  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  getReliabilityLabel(item: CompanyNews): string {
    // Determine based on content or source for demo purposes
    const s = item.source.toLowerCase();
    if (s.includes('official') || s.includes('pr') || s.includes('wire')) return 'Confirmed';
    return 'Speculation';
  }

  getReliabilityIcon(item: CompanyNews): string {
    return this.getReliabilityLabel(item) === 'Confirmed' ? 'lucideShieldCheck' : 'lucideAlertCircle';
  }

  getReliabilityClass(item: CompanyNews): string {
    return this.getReliabilityLabel(item) === 'Confirmed' ? 'text-emerald-400 bg-emerald-500/5 border-emerald-500/20' : 'text-amber-400 bg-amber-500/5 border-amber-500/20';
  }

}
