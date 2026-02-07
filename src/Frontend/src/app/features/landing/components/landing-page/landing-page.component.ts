import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth';
import {
    LucideAngularModule,
    LUCIDE_ICONS,
    LucideIconProvider,
    FileText,
    MessageSquare,
    PenTool,
    Radar,
    Mic,
    Layout,
    CheckCircle,
    AlertCircle,
    ArrowRight,
    Sparkles,
    Search,
    Zap,
    ShieldCheck,
    TrendingUp,
    Cpu,
    Github,
    Shield,
    Activity,
    Users,
    Twitter,
    Linkedin,
    Lock,
    Sun,
    Moon,
} from 'lucide-angular';
import { ThemeService } from '../../../../core/services/theme.service';

@Component({
    selector: 'app-landing-page',
    standalone: true,
    imports: [RouterLink, LucideAngularModule],
    providers: [
        {
            provide: LUCIDE_ICONS,
            multi: true,
            useValue: new LucideIconProvider({
                FileText,
                MessageSquare,
                PenTool,
                Radar,
                Mic,
                Layout,
                CheckCircle,
                AlertCircle,
                ArrowRight,
                Sparkles,
                Search,
                Zap,
                ShieldCheck,
                TrendingUp,
                Cpu,
                Github,
                Shield,
                Activity,
                Users,
                Twitter,
                Linkedin,
                Lock,
                Sun,
                Moon,
            }),
        },
    ],
    templateUrl: './landing-page.component.html',
    styleUrls: ['./landing-page.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'block w-full min-h-screen bg-background text-foreground selection:bg-primary/30',
    },
})
export class LandingPageComponent {
    private readonly authService = inject(AuthService);
    readonly themeService = inject(ThemeService);

    readonly isAuthenticated = this.authService.isAuthenticated;

    // Icons for use in template (if needed by name)
    readonly icons = {
        FileText,
        MessageSquare,
        PenTool,
        Radar,
        Mic,
        Layout,
        CheckCircle,
        AlertCircle,
        ArrowRight,
        Sparkles,
        Search,
        Zap,
        ShieldCheck,
        TrendingUp,
        Cpu,
        Github,
        Shield,
        Activity,
        Users,
        Twitter,
        Linkedin,
        Lock,
        Sun,
        Moon,
    };
}
