import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class BreadcrumbService {
    private lastWorkstationTab = signal<string>('overview');
    private lastApplicationId = signal<number | null>(null);

    setLastWorkstationState(applicationId: number, tab: string) {
        this.lastApplicationId.set(applicationId);
        this.lastWorkstationTab.set(tab);
    }

    getLastWorkstationLink() {
        const id = this.lastApplicationId();
        const tab = this.lastWorkstationTab();
        return id ? `/applications/${id}?tab=${tab}` : '/applications';
    }

    getLastWorkstationTab() {
        return this.lastWorkstationTab();
    }
}
