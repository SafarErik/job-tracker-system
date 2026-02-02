import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'salaryFormatter',
})
export class SalaryFormatterPipe implements PipeTransform {
    transform(
        value: number | undefined,
        max?: number,
        currency: string = 'USD',
        period: string = 'yearly',
        isOffer: boolean = false
    ): string {
        if (isOffer && value) {
            return `${this.getCurrencySymbol(currency)}${this.formatNumber(value)}${this.getPeriodSuffix(period)} Offer`;
        }

        if (value && max) {
            return `Est. ${this.getCurrencySymbol(currency)}${this.formatNumber(value)} - ${this.formatNumber(max)}${this.getPeriodSuffix(period)}`;
        }

        if (value) {
            return `Est. ${this.getCurrencySymbol(currency)}${this.formatNumber(value)}${this.getPeriodSuffix(period)}`;
        }

        return '';
    }

    private formatNumber(num: number): string {
        if (num >= 1000) {
            return (num / 1000).toFixed(0) + 'k';
        }
        return num.toString();
    }

    private getCurrencySymbol(currency: string): string {
        switch (currency.toUpperCase()) {
            case 'EUR': return '€';
            case 'GBP': return '£';
            case 'HUF': return 'Ft ';
            case 'USD': return '$';
            default: return currency + ' ';
        }
    }

    private getPeriodSuffix(period: string): string {
        switch (period.toLowerCase()) {
            case 'monthly': return '/mo';
            case 'hourly': return '/hr';
            default: return '';
        }
    }
}
