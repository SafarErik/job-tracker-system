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
    <div class="rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-white/5 p-8 flex flex-col h-full group hover:border-emerald-500/30 transition-all duration-500 shadow-2xl overflow-hidden relative">
      <!-- Background Ornament -->
      <div class="absolute -right-12 -top-12 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full group-hover:bg-emerald-500/10 transition-colors duration-1000"></div>

      <div class="flex items-center justify-between mb-8 relative z-10">
        <div class="flex items-center gap-3">
          <div class="p-2.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-emerald-400">
            <ng-icon name="lucideTrendingUp" class="h-4 w-4"></ng-icon>
          </div>
          <div>
            <h3 class="text-xs font-black uppercase tracking-[0.2em] text-white leading-none">Market Pulse</h3>
            <p class="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Real-time Intel Feed</p>
          </div>
        </div>
        
        @if (loading()) {
        <ng-icon name="lucideLoader2" class="animate-spin text-emerald-400 h-4 w-4"></ng-icon>
        }
      </div>

      <div class="space-y-4 flex-1 relative z-10">
        @if (news().length === 0 && !loading()) {
        <div class="flex flex-col items-center justify-center h-40 border border-dashed border-white/5 rounded-2xl opacity-40">
           <p class="text-[9px] font-black uppercase tracking-widest text-slate-500">Scanning Signal Lines...</p>
        </div>
        } @else {
        @for (item of news(); track item.id) {
        <div class="p-4 rounded-2xl bg-zinc-950/40 border border-white/5 hover:bg-zinc-900/60 transition-all cursor-pointer group/item">
          <div class="flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-[9px] font-black uppercase tracking-widest text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {{ item.source }}
                </span>
                
                <!-- Reliability Badge -->
                <div class="flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-900 border border-white/5" 
                  [ngClass]="getReliabilityClass(item)">
                  <ng-icon [name]="getReliabilityIcon(item)" class="h-2.5 w-2.5"></ng-icon>
                  <span class="text-[8px] font-black uppercase tracking-tighter">{{ getReliabilityLabel(item) }}</span>
                </div>
              </div>
              <span class="text-[9px] font-bold text-slate-600">{{ formatDate(item.date) }}</span>
            </div>
            
            <h5 class="text-xs font-bold leading-normal text-slate-300 group-hover/item:text-white transition-colors line-clamp-2">
              {{ item.title }}
            </h5>
          </div>
        </div>
        }
        }
      </div>

      @if (history().length > 0) {
      <div class="mt-8 pt-6 border-t border-white/5 relative z-10">
        <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">Tactical Engagement Log</h3>
        <div class="space-y-2">
          @for (app of history().slice(0, 2); track app.id) {
          <button (click)="viewApplication.emit(app.id)"
            class="w-full flex items-center justify-between p-3 rounded-2xl bg-zinc-950/30 border border-white/5 hover:border-emerald-500/20 transition-all text-left group/btn">
            <div class="flex-1 min-w-0">
              <p class="text-[11px] font-bold text-slate-400 group-hover/btn:text-white truncate">{{ app.position }}</p>
              <p class="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-0.5">{{ formatDate(app.appliedAt) }}</p>
            </div>
            <div class="h-1.5 w-1.5 rounded-full" [class]="getStatusDotClass(app.status)"></div>
          </button>
          }
        </div>
      </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompanyIntelComponent {
  news = input.required<CompanyNews[]>();
  history = input<ApplicationHistory[]>([]);
  loading = input(false);

  viewApplication = output<string>();

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

  getStatusDotClass(status: string): string {
    const s = status.toLowerCase();
    if (s.includes('applied')) return 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.3)]';
    if (s.includes('phone')) return 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.3)]';
    if (s.includes('technical')) return 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.3)]';
    if (s.includes('interview')) return 'bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.3)]';
    if (s.includes('offer')) return 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.3)]';
    if (s.includes('accepted')) return 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.3)]';
    if (s.includes('rejected')) return 'bg-zinc-600';
    if (s.includes('ghosted')) return 'bg-zinc-800';
    return 'bg-zinc-700';
  }
}
