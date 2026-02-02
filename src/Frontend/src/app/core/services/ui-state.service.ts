import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class UiStateService {
    readonly isAddAppSheetOpen = signal(false);

    openAddAppSheet() {
        this.isAddAppSheetOpen.set(true);
    }

    closeAddAppSheet() {
        this.isAddAppSheetOpen.set(false);
    }

    toggleAddAppSheet() {
        this.isAddAppSheetOpen.update(v => !v);
    }
}
