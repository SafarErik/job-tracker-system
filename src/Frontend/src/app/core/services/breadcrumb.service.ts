import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class BreadcrumbService {
    private lastWorkstationTab = signal<string>('overview');
    private lastApplicationId = signal<string | null>(null);

    setLastWorkstationState(applicationId: string, tab: string) {
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
