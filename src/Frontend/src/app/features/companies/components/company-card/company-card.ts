import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Company } from '../../models/company.model';

@Component({
    selector: 'app-company-card',
    imports: [CommonModule],
    templateUrl: './company-card.html',
    styleUrl: './company-card.css',
})
export class CompanyCardComponent {
    company = input.required<Company>();
    viewDossier = output<number>();

    logoFailed = false;

    /**
     * Get Clearbit logo URL for the company
     */
    getLogoUrl(): string | null {
        if (this.logoFailed) return null;
        const name = this.company().name.toLowerCase().replace(/[^a-z0-9]/g, '');
        return `https://logo.clearbit.com/${name}.com`;
    }

    /**
     * Handle logo load error - fallback to building icon
     */
    onLogoError(): void {
        this.logoFailed = true;
    }

    /**
     * Get limited tech stack (max 3 items)
     */
    getVisibleTechStack(): string[] {
        return this.company().techStack?.slice(0, 3) || [];
    }

    /**
     * Count of remaining tech items
     */
    getRemainingTechCount(): number {
        const total = this.company().techStack?.length || 0;
        return Math.max(0, total - 3);
    }

    /**
     * Navigate to company detail
     */
    onViewDossier(): void {
        this.viewDossier.emit(this.company().id);
    }
}
