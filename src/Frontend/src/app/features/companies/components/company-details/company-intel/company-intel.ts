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
    <div class="bg-card rounded-[2.5rem] border border-border/40 p-6 md:p-8 h-full">
      <div class="flex items-center justify-between mb-8">
        <h3 class="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">Market Signal</h3>
        @if (loading()) {
        <ng-icon name="lucideLoader2" class="animate-spin text-primary"></ng-icon>
        }
      </div>

      <div class="space-y-4">
        @if (news().length === 0 && !loading()) {
        <p class="text-xs font-medium text-muted-foreground/40 text-center py-10">No recent market signals detected.
        </p>
        } @else {
        @for (item of news(); track item.id) {
        <div class="news-item p-4 rounded-2xl bg-muted/30 border border-border/10">
          <div class="flex items-start justify-between gap-2 mb-2">
            <h5 class="text-sm font-bold leading-snug line-clamp-2">{{ item.title }}</h5>
            <ng-icon name="lucideExternalLink" class="text-muted-foreground/40 shrink-0 mt-1" size="14"></ng-icon>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-black uppercase text-primary">{{ item.source }}</span>
            <span class="text-[10px] font-bold text-muted-foreground/60">{{ formatDate(item.date) }}</span>
          </div>
        </div>
        }
        }
      </div>

      @if (history().length > 0) {
      <div class="mt-8 pt-8 border-t border-border/20">
        <h3 class="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground mb-6">Recent Log</h3>
        <div class="space-y-3">
          @for (app of history().slice(0, 3); track app.id) {
          <button (click)="viewApplication.emit(app.id)"
            class="w-full flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-transparent hover:border-border/40 hover:bg-muted/40 transition-all text-left">
            <div>
              <p class="text-xs font-black tracking-tight truncate max-w-[120px]">{{ app.position }}</p>
              <p class="text-[9px] font-bold text-muted-foreground">{{ formatDate(app.appliedAt) }}</p>
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

  viewApplication = output<number>();

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
