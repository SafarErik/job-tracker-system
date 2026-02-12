import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideUsers } from '@ng-icons/lucide';
import { CompanyContact } from '../../../models/company.model';
import { ContactListComponent } from '../contact-list/contact-list';

@Component({
  selector: 'app-engagement-log',
  imports: [CommonModule, NgIcon, ContactListComponent],
  providers: [provideIcons({ lucideUsers })],
  templateUrl: './engagement-log.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EngagementLogComponent {
  contacts = input.required<CompanyContact[]>();
  saveContact = output<CompanyContact>();
  deleteContact = output<string>();
}
