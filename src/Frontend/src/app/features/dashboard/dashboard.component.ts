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
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
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
