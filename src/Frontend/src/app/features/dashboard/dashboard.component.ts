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
  Zap,
  Clock,
  ExternalLink,
  ShieldCheck,
  FileWarning,
  Timer,
  Rocket,
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
        Zap,
        Clock,
        ExternalLink,
        ShieldCheck,
        FileWarning,
        Timer,
        Rocket,
      }),
    },
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  userName = signal('John');

  activeApplications = signal([
    {
      id: 1,
      company: 'Google',
      role: 'Senior Frontend Engineer',
      domain: 'google.com',
      logo: 'G',
      status: 'Interview',
      statusColor: 'bg-primary/10 text-primary border-primary/20',
      matchScore: 92,
      pipelineStep: 3, // Interview
    },
    {
      id: 2,
      company: 'Stripe',
      role: 'Product Engineer',
      domain: 'stripe.com',
      logo: 'S',
      status: 'In Review',
      statusColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      matchScore: 88,
      pipelineStep: 2, // Screen/Review
    },
    {
      id: 3,
      company: 'Vercel',
      role: 'Staff DX Engineer',
      domain: 'vercel.com',
      logo: 'V',
      status: 'Applied',
      statusColor: 'bg-muted text-muted-foreground border-border',
      matchScore: 75,
      pipelineStep: 1, // Applied
    },
  ]);

  pipelineSteps = [
    { label: 'Applied' },
    { label: 'Screen' },
    { label: 'Interview' },
    { label: 'Task' },
    { label: 'Offer' }
  ];
}
