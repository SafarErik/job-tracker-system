import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { provideIcons } from '@ng-icons/core';
import {
    lucideTrendingUp,
    lucideTarget,
    lucideZap,
    lucideActivity,
    lucideSparkles,
    lucideArrowUpRight,
    lucideShieldCheck,
    lucideCpu,
    lucideBarChart3
} from '@ng-icons/lucide';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmIconImports } from '@spartan-ng/helm/icon';

@Component({
    selector: 'app-tactical-analytics',
    standalone: true,
    imports: [
        CommonModule,
        HlmIconImports,
        ...HlmCardImports,
        ...HlmButtonImports
    ],
    providers: [
        provideIcons({
            lucideTrendingUp,
            lucideTarget,
            lucideZap,
            lucideActivity,
            lucideSparkles,
            lucideArrowUpRight,
            lucideShieldCheck,
            lucideCpu,
            lucideBarChart3
        })
    ],
    templateUrl: './tactical-analytics.component.html',
    styleUrls: ['./tactical-analytics.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TacticalAnalyticsComponent {
    // Funnel Data (Applied -> Screened -> Interviewed -> Offer)
    readonly funnelData = signal({
        applied: 120,
        screened: 45,
        interviewed: 18,
        offer: 4
    });

    // Salary Trends (Market Value Velocity)
    readonly salaryTrends = signal([
        { month: 'Jan', value: 95000 },
        { month: 'Feb', value: 98000 },
        { month: 'Mar', value: 102000 },
        { month: 'Apr', value: 108000 },
        { month: 'May', value: 115000 },
        { month: 'Jun', value: 125000 }
    ]);

    // Skill Comparison (My Arsenal vs Target Profile)
    readonly skillRadarData = signal([
        { skill: 'TypeScript', user: 90, target: 85 },
        { skill: 'Angular', user: 95, target: 90 },
        { skill: 'Node.js', user: 70, target: 80 },
        { skill: 'Cloud Native', user: 60, target: 85 },
        { skill: 'Architecture', user: 75, target: 90 },
        { skill: 'Soft Skills', user: 85, target: 80 }
    ]);

    // Derived funnel width percentages
    readonly funnelWidths = computed(() => {
        const data = this.funnelData();
        const max = data.applied;
        return {
            applied: 100,
            screened: (data.screened / max) * 100,
            interviewed: (data.interviewed / max) * 100,
            offer: (data.offer / max) * 100
        };
    });

    // Heatmap generation
    readonly heatmapData = signal(this.generateHeatmapData());

    private generateHeatmapData() {
        // Generate mock data for the last 365 days
        const data = [];
        const today = new Date();
        for (let i = 0; i < 365; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            data.push({
                date: date.toISOString().split('T')[0],
                intensity: Math.floor(Math.random() * 5) // 0 to 4
            });
        }
        return data.reverse();
    }

    startDeepAudit(): void {
        console.log('Initiating strategic career audit...');
        // Future implementation: trigger AI analysis session
    }
}
