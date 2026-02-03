import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyNews, JobApplicationHistory as ApplicationHistory } from '../../../models/company.model';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideExternalLink, lucideLoader2 } from '@ng-icons/lucide';

@Component({
  selector: 'app-company-intel',
  standalone: true,
  imports: [CommonModule, NgIcon],
  providers: [provideIcons({ lucideExternalLink, lucideLoader2 })],
  template: `
    <div class="bg-zinc-900/40 rounded-[2.5rem] border border-zinc-800 p-8 h-full flex flex-col">
      <div class="flex items-center justify-between mb-8">
        <h3 class="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500">Intel Feeds</h3>
        @if (loading()) {
        <ng-icon name="lucideLoader2" class="animate-spin text-violet-400"></ng-icon>
        }
      </div>

      <div class="space-y-3 flex-1">
        @if (news().length === 0 && !loading()) {
        <div class="flex flex-col items-center justify-center h-40 border border-dashed border-zinc-800 rounded-2xl opacity-40">
           <p class="text-[10px] font-black uppercase tracking-widest">Scanning signals...</p>
        </div>
        } @else {
        @for (item of news(); track item.id) {
        <div class="p-4 rounded-xl bg-zinc-950/50 border-l-2 border-l-blue-500 group hover:bg-zinc-900/80 transition-all cursor-pointer">
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2">
              <span class="bg-blue-500/10 text-blue-400 text-[9px] font-black uppercase px-2 py-0.5 rounded border border-blue-500/20">
                {{ item.source }}
              </span>
              <span class="text-[9px] font-bold text-zinc-600 ml-auto">{{ formatDate(item.date) }}</span>
            </div>
            <h5 class="text-xs font-bold leading-normal text-zinc-300 group-hover:text-zinc-100 transition-colors line-clamp-2">
              {{ item.title }}
            </h5>
          </div>
        </div>
        }
        }
      </div>

      @if (history().length > 0) {
      <div class="mt-8 pt-8 border-t border-zinc-800">
        <h3 class="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-6">Historical Log</h3>
        <div class="space-y-2">
          @for (app of history().slice(0, 3); track app.id) {
          <button (click)="viewApplication.emit(app.id)"
            class="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-950/30 border border-zinc-900 hover:border-zinc-700 transition-all text-left group">
            <div class="flex-1 min-w-0">
              <p class="text-xs font-bold text-zinc-400 group-hover:text-zinc-100 truncate pr-2">{{ app.position }}</p>
              <p class="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{{ formatDate(app.appliedAt) }}</p>
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

  getStatusDotClass(status: string): string {
    const s = status.toLowerCase();
    if (s.includes('applied')) return 'bg-info shadow-[0_0_8px_hsl(var(--info)/0.3)]';
    if (s.includes('phone')) return 'bg-info shadow-[0_0_8px_hsl(var(--info)/0.3)]';
    if (s.includes('technical')) return 'bg-warning shadow-[0_0_8px_hsl(var(--warning)/0.3)]';
    if (s.includes('interview')) return 'bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.5)]';
    if (s.includes('offer')) return 'bg-warning shadow-[0_0_8px_hsl(var(--warning)/0.3)]';
    if (s.includes('accepted')) return 'bg-success shadow-[0_0_8px_hsl(var(--success)/0.3)]';
    if (s.includes('rejected')) return 'bg-destructive shadow-[0_0_8px_hsl(var(--destructive)/0.3)]';
    if (s.includes('ghosted')) return 'bg-muted shadow-[0_0_8px_hsl(var(--muted)/0.3)]';
    return 'bg-secondary';
  }
}
