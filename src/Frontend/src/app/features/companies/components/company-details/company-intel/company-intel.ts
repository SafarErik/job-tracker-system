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
  template: `
    <div class="h-full flex flex-col space-y-4 relative">
      @if (loading()) {
        <div class="flex items-center justify-center p-8 text-emerald-400">
           <ng-icon name="lucideLoader2" class="animate-spin h-6 w-6"></ng-icon>
        </div>
      } @else if (news().length === 0) {
        <div class="flex flex-col items-center justify-center h-40 border border-dashed border-zinc-800 rounded-2xl opacity-40">
           <p class="text-[10px] font-black uppercase tracking-widest text-zinc-500">No Intelligence Data Found</p>
        </div>
      } @else {
        <!-- Bento Grid Layout -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-fr">
        @for (item of news(); track item.id; let i = $index) {
          <div 
            (click)="openReport(item)"
            [class]="'p-5 rounded-3xl bg-zinc-900/30 border border-zinc-800 hover:border-emerald-500/30 transition-all duration-300 group/item cursor-pointer flex flex-col justify-between ' + (i === 0 ? 'md:col-span-2 bg-gradient-to-br from-zinc-900/30 to-emerald-950/20' : '')">
            
            <div class="space-y-3">
              <!-- Top Row: Source & Time -->
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                   <!-- Source Badge -->
                   <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-950/50 border border-zinc-800/80 backdrop-blur-sm">
                      <!-- Fallback Icon for Source -->
                      <ng-icon name="lucideNewspaper" class="w-3 h-3 text-zinc-400"></ng-icon>
                      <span class="text-[9px] font-black uppercase tracking-widest text-zinc-300">
                        {{ item.source }}
                      </span>
                   </div>
                </div>
                <!-- Time -->
                <div class="flex items-center gap-1 text-zinc-500">
                  <ng-icon name="lucideClock" class="w-3 h-3"></ng-icon>
                  <span class="text-[10px] font-bold">{{ formatDate(item.date) }}</span>
                </div>
              </div>
              
              <!-- Content -->
              <div>
                <h5 [class]="'font-bold leading-tight text-zinc-200 group-hover/item:text-emerald-400 transition-colors mb-2 ' + (i === 0 ? 'text-lg md:text-xl font-serif' : 'text-sm')">
                  {{ item.title }}
                </h5>
                <p class="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                  {{ item.summary || 'Deep analysis pending. Signal verification in progress...' }}
                </p>
              </div>
            </div>

            <!-- Bottom: Source Dock (Mock) -->
            <div class="flex items-center gap-2 mt-4 pt-4 border-t border-zinc-800/50">
               <p class="text-[9px] font-black uppercase tracking-widest text-zinc-600">Reported By</p>
               <div class="flex -space-x-1">
                 <!-- Mock Favicons -->
                 <div class="w-4 h-4 rounded-full bg-indigo-500/20 border border-indigo-500/30 grayscale group-hover/item:grayscale-0 transition-all duration-300"></div>
                 <div class="w-4 h-4 rounded-full bg-orange-500/20 border border-orange-500/30 grayscale group-hover/item:grayscale-0 transition-all duration-300"></div>
                 <div class="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/30 grayscale group-hover/item:grayscale-0 transition-all duration-300"></div>
               </div>
            </div>

          </div>
        }
        </div>
      }

      <!-- Intelligence Report Overlay -->
      @if (selectedItem(); as item) {
        <div class="absolute inset-0 z-50 flex items-center justify-center p-4">
           <!-- Backdrop -->
           <div class="absolute inset-0 bg-zinc-950/60 backdrop-blur-xl animate-in fade-in duration-300" (click)="closeReport()"></div>
           
           <!-- Report Content -->
           <div class="relative w-full max-w-2xl max-h-full overflow-y-auto bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl shadow-emerald-900/10 animate-in zoom-in-95 duration-300 flex flex-col">
              
              <!-- Close Button -->
              <button (click)="closeReport()" class="absolute top-4 right-4 z-10 p-2 text-zinc-400 hover:text-white bg-zinc-950/50 hover:bg-zinc-800 rounded-full transition-colors border border-zinc-800">
                <ng-icon name="lucideX" class="w-4 h-4"></ng-icon>
              </button>

              <!-- Header Image/Gradient -->
              <div class="h-32 bg-gradient-to-r from-emerald-900/20 via-zinc-900 to-zinc-950 shrink-0 border-b border-zinc-800"></div>

              <div class="p-8 -mt-12 relative z-10">
                <!-- Badge -->
                <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500 text-emerald-950 text-[10px] font-black uppercase tracking-widest mb-4 shadow-lg shadow-emerald-500/20">
                  <ng-icon name="lucideZap" class="w-3 h-3 fill-current"></ng-icon>
                  Synthetic Summary
                </div>

                <h2 class="text-2xl md:text-3xl font-serif font-bold text-white leading-tight mb-6">
                  {{ item.title }}
                </h2>

                <div class="space-y-8">
                  <!-- Synthesis Body -->
                  <div class="prose prose-sm prose-invert text-zinc-300 leading-loose">
                    <p>
                      Based on reports from <span class="text-zinc-100 font-bold">{{ item.source }}</span> and other outlets, 
                      this development suggests a strategic shift.
                    </p>
                    <div class="min-h-[60px] p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50 font-mono text-zinc-400 text-xs leading-relaxed">
                       <span class="text-emerald-400 font-bold mr-2">AWS ANALYSIS ></span>
                       {{ displayedSummary() }}<span class="animate-pulse text-emerald-500">_</span>
                    </div>
                  </div>

                  <!-- Strategic Impact Box -->
                  <div class="bg-violet-500/5 border-l-4 border-violet-500 p-5 rounded-r-xl">
                     <h4 class="text-xs font-black uppercase tracking-widest text-violet-400 mb-2 flex items-center gap-2">
                       <ng-icon name="lucideTrendingUp" class="w-3 h-3"></ng-icon>
                       Strategic Impact
                     </h4>
                     <p class="text-sm font-medium text-zinc-200">
                       How this affects your upcoming interview: <span class="text-violet-200">This is a prime topic for the "Do you have any questions for us?" segment. Ask about how this news impacts their Q4 roadmap.</span>
                     </p>
                  </div>

                  <!-- References -->
                  <div class="space-y-3 pt-6 border-t border-zinc-800">
                    <h4 class="text-[10px] font-black uppercase tracking-widest text-zinc-500">References</h4>
                    <a href="#" class="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors group">
                       <div class="flex items-center gap-3">
                         <div class="w-6 h-6 rounded bg-zinc-800 flex items-center justify-center text-zinc-400 font-serif font-bold text-xs">1</div>
                         <div class="flex flex-col">
                           <span class="text-xs font-bold text-zinc-300 group-hover:text-emerald-400 transition-colors">Original Source Report</span>
                           <span class="text-[10px] text-zinc-500">{{ item.source }} • {{ formatDate(item.date) }}</span>
                         </div>
                       </div>
                       <ng-icon name="lucideExternalLink" class="w-3 h-3 text-zinc-600 group-hover:text-zinc-400"></ng-icon>
                    </a>
                  </div>
                </div>

              </div>
           </div>
        </div>
      }
    </div>
  `,
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
    return this.getReliabilityLabel(item) === 'Confirmed' ? 'text-emerald-400 bg-emerald-500/5 border-emerald-500/20' : 'text-amber-400 bg-amber-500/5 border-amber-500/20';
  }

}
