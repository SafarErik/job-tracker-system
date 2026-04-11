import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
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
import { LanguageService } from '../../../../core/services';
import { LogoComponent } from '../../../../shared/components/logo/logo';

@Component({
    selector: 'app-landing-page',
    imports: [RouterLink, LucideAngularModule, TranslocoPipe, LogoComponent],
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
    readonly languageService = inject(LanguageService);

    readonly isAuthenticated = this.authService.isAuthenticated;

    readonly proofPoints = [
        'landing.proof.guidance',
        'landing.proof.documents',
        'landing.proof.practice',
    ];

    readonly pillars = [
        {
            icon: Search,
            titleKey: 'landing.pillars.clarity.title',
            bodyKey: 'landing.pillars.clarity.body',
        },
        {
            icon: Layout,
            titleKey: 'landing.pillars.strategy.title',
            bodyKey: 'landing.pillars.strategy.body',
        },
        {
            icon: TrendingUp,
            titleKey: 'landing.pillars.momentum.title',
            bodyKey: 'landing.pillars.momentum.body',
        },
    ];

    readonly workflow = [
        {
            icon: Radar,
            titleKey: 'landing.workflow.research.title',
            bodyKey: 'landing.workflow.research.body',
        },
        {
            icon: FileText,
            titleKey: 'landing.workflow.documents.title',
            bodyKey: 'landing.workflow.documents.body',
        },
        {
            icon: MessageSquare,
            titleKey: 'landing.workflow.applications.title',
            bodyKey: 'landing.workflow.applications.body',
        },
        {
            icon: Mic,
            titleKey: 'landing.workflow.practice.title',
            bodyKey: 'landing.workflow.practice.body',
        },
    ];

    readonly outcomes = [
        'landing.workspace.outcomes.nextMove',
        'landing.workspace.outcomes.fit',
        'landing.workspace.outcomes.followUp',
    ];

    readonly planBenefits = [
        'landing.pricing.benefits.tracker',
        'landing.pricing.benefits.documents',
        'landing.pricing.benefits.interview',
        'landing.pricing.benefits.guide',
    ];

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
