import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronRight, lucideSearch } from '@ng-icons/lucide';

@Component({
  selector: 'app-intelligence-lab',
  imports: [CommonModule, NgIcon],
  providers: [provideIcons({ lucideChevronRight, lucideSearch })],
  templateUrl: './intelligence-lab.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntelligenceLabComponent {
  dossierSnippet = input<string | null>(null);
  openDossier = output<void>();
}
