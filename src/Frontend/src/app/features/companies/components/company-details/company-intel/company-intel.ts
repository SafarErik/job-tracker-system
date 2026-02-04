import { Component, input, output, ChangeDetectionStrategy, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyNews, JobApplicationHistory as ApplicationHistory } from '../../../models/company.model';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideExternalLink, lucideLoader2, lucideTrendingUp, lucideShieldCheck, lucideAlertCircle, lucideClock, lucideNewspaper, lucideX, lucideLink, lucideZap } from '@ng-icons/lucide';

@Component({
  selector: 'app-company-intel',
  standalone: true,
  imports: [CommonModule, NgIcon],
  providers: [provideIcons({ lucideExternalLink, lucideLoader2, lucideTrendingUp, lucideShieldCheck, lucideAlertCircle, lucideClock, lucideNewspaper, lucideX, lucideLink, lucideZap })],
  templateUrl: './company-intel.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompanyIntelComponent {
  news = input.required<CompanyNews[]>();
  loading = input(false);

  selectedItem = signal<CompanyNews | null>(null);
  displayedSummary = signal('');
  private typeInterval: any;

  openReport(item: CompanyNews) {
    this.selectedItem.set(item);
    this.startTypewriter(item.summary || 'Deep strategic analysis in progress. correlating market signals with internal data...');
  }

  closeReport() {
    this.selectedItem.set(null);
    clearInterval(this.typeInterval);
    this.displayedSummary.set('');
  }

  private startTypewriter(text: string) {
    this.displayedSummary.set('');
    let i = 0;
    clearInterval(this.typeInterval);

    this.typeInterval = setInterval(() => {
      if (i < text.length) {
        this.displayedSummary.update(current => current + text.charAt(i));
        i++;
      } else {
        clearInterval(this.typeInterval);
      }
    }, 20); // Fast typing speed
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  getReliabilityLabel(item: CompanyNews): string {
    const s = item.source.toLowerCase();
    if (s.includes('official') || s.includes('pr') || s.includes('wire')) return 'Confirmed';
    return 'Speculation';
  }

  getReliabilityIcon(item: CompanyNews): string {
    return this.getReliabilityLabel(item) === 'Confirmed' ? 'lucideShieldCheck' : 'lucideAlertCircle';
  }

  getReliabilityClass(item: CompanyNews): string {
    return this.getReliabilityLabel(item) === 'Confirmed' ? 'text-success bg-success/5 border-success/20' : 'text-warning bg-warning/5 border-warning/20';
  }

}
