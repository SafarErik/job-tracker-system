import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  LUCIDE_ICONS,
  LucideIconProvider,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Command,
  Briefcase,
} from 'lucide-angular';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({
        Command,
        Calendar,
        ArrowUpRight,
        TrendingUp,
        Briefcase,
        Sparkles,
        AlertCircle,
        CheckCircle,
      }),
    },
  ],
  template: `
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <!-- Global Command Bar -->
      <div class="relative group max-w-2xl mx-auto">
        <div
          class="absolute inset-0 bg-primary/10 blur-xl rounded-2xl group-hover:bg-primary/20 transition-all"
        ></div>
        <div
          class="relative flex items-center gap-3 px-4 py-3 bg-card/50 backdrop-blur-xl border border-border rounded-2xl shadow-2xl"
        >
          <lucide-icon name="command" class="w-5 h-5 text-primary"></lucide-icon>
          <input
            type="text"
            placeholder="Ask AI or search applications... (Cmd+K)"
            class="flex-1 bg-transparent border-none outline-none text-foreground placeholder-muted-foreground text-sm"
          />
          <div
            class="flex items-center gap-1 px-2 py-1 rounded bg-muted border border-border text-[10px] text-muted-foreground font-mono"
          >
            <span>⌘</span>
            <span>K</span>
          </div>
        </div>
      </div>

      <!-- Bento Grid -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
        <!-- Daily Briefing (Col-span-8) -->
        <div
          class="md:col-span-8 group relative overflow-hidden rounded-3xl bg-card/50 backdrop-blur-xl border border-border p-8 transition-all hover:border-primary/30"
        >
          <div
            class="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2"
          ></div>

          <div class="relative z-10 flex flex-col h-full">
            <div class="flex items-center gap-2 text-primary mb-4">
              <lucide-icon name="calendar" class="w-5 h-5"></lucide-icon>
              <span class="text-sm font-medium uppercase tracking-wider">Schedule</span>
            </div>

            <h1 class="text-3xl font-bold text-foreground mb-2">Good morning, John.</h1>
            <p class="text-muted-foreground mb-8 max-w-md">
              You have <span class="text-foreground font-semibold">2 interviews</span> scheduled for this
              week. Ready to crush them?
            </p>

            <div class="mt-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                class="p-4 rounded-2xl bg-muted border border-border hover:bg-muted/80 transition-colors"
              >
                <p class="text-xs text-muted-foreground mb-1">Today @ 2:00 PM</p>
                <div class="flex items-center justify-between">
                  <p class="text-sm font-semibold text-foreground">Google - Tech Interview</p>
                  <lucide-icon name="arrow-up-right" class="w-4 h-4 text-primary"></lucide-icon>
                </div>
              </div>
              <div
                class="p-4 rounded-2xl bg-muted border border-border hover:bg-muted/80 transition-colors"
              >
                <p class="text-xs text-muted-foreground mb-1">Tomorrow @ 4:30 PM</p>
                <div class="flex items-center justify-between">
                  <p class="text-sm font-semibold text-foreground">Stripe - Culture Fit</p>
                  <lucide-icon name="arrow-up-right" class="w-4 h-4 text-primary"></lucide-icon>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Market Pulse (Col-span-4) -->
        <div
          class="md:col-span-4 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-white/5 p-8 flex flex-col justify-between group hover:border-emerald-500/30 transition-all"
        >
          <div>
            <div class="flex items-center gap-2 text-emerald-400 mb-6">
              <lucide-icon name="trending-up" class="w-5 h-5"></lucide-icon>
              <span class="text-sm font-medium uppercase tracking-wider">Market Pulse</span>
            </div>
            <p class="text-sm text-slate-400 mb-2">Tech Market Update</p>
            <h2 class="text-4xl font-bold text-white">UP 12%</h2>
            <p class="text-xs text-emerald-400/80 mt-1 font-medium italic">
              High hiring activity in AI/ML sectors.
            </p>
          </div>

          <div class="pt-6 border-t border-white/5 mt-6">
            <div class="flex items-center justify-between text-xs text-slate-500">
              <span>Last 30 days</span>
              <span class="text-emerald-400">+4.2% today</span>
            </div>
          </div>
        </div>

        <!-- Active Pursuits (Col-span-6) -->
        <div
          class="md:col-span-6 rounded-3xl bg-card/50 backdrop-blur-xl border border-border overflow-hidden flex flex-col"
        >
          <div class="p-6 border-b border-border flex items-center justify-between">
            <h3 class="font-semibold text-foreground flex items-center gap-2">
              <lucide-icon name="briefcase" class="w-4 h-4 text-primary"></lucide-icon>
              Active Pursuits
            </h3>
            <span class="text-xs text-muted-foreground">3 Growing</span>
          </div>
          <div class="divide-y divide-border">
            @for (app of activeApplications(); track app.id) {
              <div
                class="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors cursor-pointer group"
              >
                <div class="flex items-center gap-4">
                  <div
                    class="w-10 h-10 rounded-lg bg-muted border border-border flex items-center justify-center text-lg shadow-inner"
                  >
                    {{ app.logo }}
                  </div>
                  <div>
                    <h4
                      class="text-sm font-medium text-foreground group-hover:text-primary transition-colors"
                    >
                      {{ app.company }}
                    </h4>
                    <p class="text-xs text-muted-foreground">{{ app.role }}</p>
                  </div>
                </div>
                <span
                  class="px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase border border-border"
                  [class]="app.statusColor"
                >
                  {{ app.status }}
                </span>
              </div>
            }
          </div>
          <button
            class="p-4 text-xs font-semibold text-primary hover:text-primary/80 hover:bg-muted/50 transition-all text-center"
          >
            View All Applications
          </button>
        </div>

        <!-- AI Suggestions (Col-span-6) -->
        <div
          class="md:col-span-6 rounded-3xl bg-primary/5 backdrop-blur-xl border border-primary/20 p-8 flex flex-col relative overflow-hidden"
        >
          <div class="absolute top-0 right-0 p-4 opacity-20 rotate-12 scale-150">
            <lucide-icon name="sparkles" class="w-32 h-32 text-primary"></lucide-icon>
          </div>

          <div class="relative z-10 h-full flex flex-col">
            <div class="flex items-center gap-2 text-primary mb-6 font-semibold text-sm">
              <lucide-icon name="sparkles" class="w-5 h-5"></lucide-icon>
              AI AGENT ANALYSIS
            </div>

            <div class="space-y-6">
              <div class="flex gap-4">
                <div
                  class="w-10 h-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0"
                >
                  <lucide-icon name="alert-circle" class="w-5 h-5 text-primary"></lucide-icon>
                </div>
                <div>
                  <p class="text-sm font-medium text-foreground">Your CV score for Google is low.</p>
                  <p class="text-xs text-muted-foreground mt-1">
                    Optimization suggested for "Distributed Systems" keywords.
                  </p>
                </div>
              </div>

              <div class="flex gap-4">
                <div
                  class="w-10 h-10 rounded-full bg-success/20 border border-success/40 flex items-center justify-center shrink-0"
                >
                  <lucide-icon name="check-circle" class="w-5 h-5 text-success"></lucide-icon>
                </div>
                <div>
                  <p class="text-sm font-medium text-foreground">Matching Skills Found: Stripe</p>
                  <p class="text-xs text-muted-foreground mt-1">
                    Your background aligns 94% with their Staff Engineer opening.
                  </p>
                </div>
              </div>
            </div>

            <button
              class="mt-auto w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-bold transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            >
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
      statusColor: 'bg-primary/20 text-primary',
    },
    {
      id: 2,
      company: 'Stripe',
      role: 'Product Engineer',
      logo: 'S',
      status: 'In Review',
      statusColor: 'bg-success/20 text-success',
    },
    {
      id: 3,
      company: 'Vercel',
      role: 'Staff DX Engineer',
      logo: 'V',
      status: 'Applied',
      statusColor: 'bg-muted text-muted-foreground',
    },
  ]);
}
