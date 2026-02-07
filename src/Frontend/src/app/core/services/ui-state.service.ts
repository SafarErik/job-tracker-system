import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class UiStateService {
    readonly isAddAppSheetOpen = signal(false);
    readonly isJobSettingsOpen = signal(false);
    readonly isProfileSettingsOpen = signal(false);

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

    openProfileSettings() {
        this.isProfileSettingsOpen.set(true);
    }

    closeProfileSettings() {
        this.isProfileSettingsOpen.set(false);
    }
}
