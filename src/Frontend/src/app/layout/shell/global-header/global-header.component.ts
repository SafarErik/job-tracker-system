import { ChangeDetectionStrategy, Component, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HlmBreadCrumbImports } from '@spartan-ng/helm/breadcrumb';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { provideIcons } from '@ng-icons/core';
import {
    lucideSearch,
    lucideCommand,
    lucideCalculator,
    lucideCalendar,
    lucideSmile,
    lucideUser,
    lucideSettings,
    lucideMail,
    lucidePlus,
} from '@ng-icons/lucide';
import { BrnCommandImports } from '@spartan-ng/brain/command';
import { HlmCommandImports } from '@spartan-ng/helm/command';
import { BrnDialogImports } from '@spartan-ng/brain/dialog';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { UiStateService } from '../../../core/services';
import { inject } from '@angular/core';

@Component({
    selector: 'app-global-header',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        HlmBreadCrumbImports,
        HlmIconImports,
        HlmButton,
        BrnCommandImports,
        HlmCommandImports,
        BrnDialogImports,
        HlmDialogImports,
    ],
    providers: [
        provideIcons({
            lucideSearch,
            lucideCommand,
            lucideCalculator,
            lucideCalendar,
            lucideSmile,
            lucideUser,
            lucideSettings,
            lucideMail,
            lucidePlus,
        }),
    ],
    templateUrl: './global-header.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GlobalHeaderComponent {
    public readonly isOpen = signal(false);
    public readonly uiService = inject(UiStateService);

    @HostListener('window:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent) {
        if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();
            this.isOpen.update((prev) => !prev);
        }
    }
}
