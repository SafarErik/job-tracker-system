import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class UiStateService {
    readonly isAddAppSheetOpen = signal(false);
    readonly isJobSettingsOpen = signal(false);

    openAddAppSheet() {
        this.isAddAppSheetOpen.set(true);
    }

    closeAddAppSheet() {
        this.isAddAppSheetOpen.set(false);
    }

    openJobSettings() {
        this.isJobSettingsOpen.set(true);
    }

    closeJobSettings() {
        this.isJobSettingsOpen.set(false);
    }
}
