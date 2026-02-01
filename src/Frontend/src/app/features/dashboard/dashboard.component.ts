import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Search, TrendingUp, Calendar, ArrowUpRight, CheckCircle, AlertCircle, Sparkles, Command } from 'lucide-angular';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    template: `
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <!-- Global Command Bar -->
      <div class="relative group max-w-2xl mx-auto">
        <div class="absolute inset-0 bg-indigo-500/10 blur-xl rounded-2xl group-hover:bg-indigo-500/20 transition-all"></div>
        <div class="relative flex items-center gap-3 px-4 py-3 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
          <lucide-icon name="command" class="w-5 h-5 text-indigo-400"></lucide-icon>
          <input
            type="text"
            placeholder="Ask AI or search applications... (Cmd+K)"
            class="flex-1 bg-transparent border-none outline-none text-white placeholder-slate-500 text-sm"
          />
          <div class="flex items-center gap-1 px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] text-slate-500 font-mono">
            <span>⌘</span>
            <span>K</span>
          </div>
        </div>
      </div>

      <!-- Bento Grid -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        <!-- Daily Briefing (Col-span-8) -->
        <div class="md:col-span-8 group relative overflow-hidden rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-white/5 p-8 transition-all hover:border-indigo-500/30">
          <div class="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
          
          <div class="relative z-10 flex flex-col h-full">
            <div class="flex items-center gap-2 text-indigo-400 mb-4">
              <lucide-icon name="calendar" class="w-5 h-5"></lucide-icon>
              <span class="text-sm font-medium uppercase tracking-wider">Schedule</span>
            </div>
            
            <h1 class="text-3xl font-bold text-white mb-2">Good morning, John.</h1>
            <p class="text-slate-400 mb-8 max-w-md">
              You have <span class="text-white font-semibold">2 interviews</span> scheduled for this week. 
              Ready to crush them?
            </p>

            <div class="mt-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                <p class="text-xs text-slate-500 mb-1">Today @ 2:00 PM</p>
                <div class="flex items-center justify-between">
                  <p class="text-sm font-semibold text-white">Google - Tech Interview</p>
                  <lucide-icon name="arrow-up-right" class="w-4 h-4 text-indigo-400"></lucide-icon>
                </div>
              </div>
              <div class="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                <p class="text-xs text-slate-500 mb-1">Tomorrow @ 4:30 PM</p>
                <div class="flex items-center justify-between">
                  <p class="text-sm font-semibold text-white">Stripe - Culture Fit</p>
                  <lucide-icon name="arrow-up-right" class="w-4 h-4 text-indigo-400"></lucide-icon>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Market Pulse (Col-span-4) -->
        <div class="md:col-span-4 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-white/5 p-8 flex flex-col justify-between group hover:border-emerald-500/30 transition-all">
          <div>
            <div class="flex items-center gap-2 text-emerald-400 mb-6">
              <lucide-icon name="trending-up" class="w-5 h-5"></lucide-icon>
              <span class="text-sm font-medium uppercase tracking-wider">Market Pulse</span>
            </div>
            <p class="text-sm text-slate-400 mb-2">Tech Market Update</p>
            <h2 class="text-4xl font-bold text-white">UP 12%</h2>
            <p class="text-xs text-emerald-400/80 mt-1 font-medium italic">High hiring activity in AI/ML sectors.</p>
          </div>
          
          <div class="pt-6 border-t border-white/5 mt-6">
            <div class="flex items-center justify-between text-xs text-slate-500">
              <span>Last 30 days</span>
              <span class="text-emerald-400">+4.2% today</span>
            </div>
          </div>
        </div>

        <!-- Active Pursuits (Col-span-6) -->
        <div class="md:col-span-6 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-white/5 overflow-hidden flex flex-col">
          <div class="p-6 border-b border-white/5 flex items-center justify-between">
            <h3 class="font-semibold text-white flex items-center gap-2">
              <lucide-icon name="briefcase" class="w-4 h-4 text-indigo-400"></lucide-icon>
              Active Pursuits
            </h3>
            <span class="text-xs text-slate-500">3 Growing</span>
          </div>
          <div class="divide-y divide-white/5">
            @for (app of activeApplications(); track app.id) {
              <div class="p-4 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer group">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-lg">
                    {{ app.logo }}
                  </div>
                  <div>
                    <h4 class="text-sm font-medium text-white group-hover:text-indigo-400 transition-colors">{{ app.company }}</h4>
                    <p class="text-xs text-slate-500">{{ app.role }}</p>
                  </div>
                </div>
                <span class="px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase" 
                      [class]="app.statusColor">
                  {{ app.status }}
                </span>
              </div>
            }
          </div>
          <button class="p-4 text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:bg-white/5 transition-all text-center">
            View All Applications
          </button>
        </div>

        <!-- AI Suggestions (Col-span-6) -->
        <div class="md:col-span-6 rounded-3xl bg-indigo-900/20 backdrop-blur-xl border border-indigo-500/20 p-8 flex flex-col relative overflow-hidden">
          <div class="absolute top-0 right-0 p-4 opacity-20 rotate-12 scale-150">
             <lucide-icon name="sparkles" class="w-32 h-32 text-indigo-400"></lucide-icon>
          </div>
          
          <div class="relative z-10 h-full flex flex-col">
            <div class="flex items-center gap-2 text-indigo-400 mb-6 font-semibold text-sm">
              <lucide-icon name="sparkles" class="w-5 h-5"></lucide-icon>
              AI AGENT ANALYSIS
            </div>
            
            <div class="space-y-6">
              <div class="flex gap-4">
                <div class="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center shrink-0">
                  <lucide-icon name="alert-circle" class="w-5 h-5 text-indigo-400"></lucide-icon>
                </div>
                <div>
                  <p class="text-sm font-medium text-white">Your CV score for Google is low.</p>
                  <p class="text-xs text-slate-400 mt-1">Optimization suggested for "Distributed Systems" keywords.</p>
                </div>
              </div>
              
              <div class="flex gap-4">
                <div class="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                  <lucide-icon name="check-circle" class="w-5 h-5 text-emerald-400"></lucide-icon>
                </div>
                <div>
                  <p class="text-sm font-medium text-white">Matching Skills Found: Stripe</p>
                  <p class="text-xs text-slate-400 mt-1">Your background aligns 94% with their Staff Engineer opening.</p>
                </div>
              </div>
            </div>

            <button class="mt-auto w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2">
              Optimize All Documents
              <lucide-icon name="sparkles" class="w-4 h-4"></lucide-icon>
            </button>
          </div>
        </div>

      </div>
    </div>
  `,
    styles: `
    :host {
      display: block;
    }
  `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
    activeApplications = signal([
        {
            id: 1,
            company: 'Google',
            role: 'Senior Frontend Engineer',
            logo: 'G',
            status: 'Interview',
            statusColor: 'bg-indigo-500/20 text-indigo-400'
        },
        {
            id: 2,
            company: 'Stripe',
            role: 'Product Engineer',
            logo: 'S',
            status: 'In Review',
            statusColor: 'bg-emerald-500/20 text-emerald-400'
        },
        {
            id: 3,
            company: 'Vercel',
            role: 'Staff DX Engineer',
            logo: 'V',
            status: 'Applied',
            statusColor: 'bg-slate-500/20 text-slate-400'
        }
    ]);
}
