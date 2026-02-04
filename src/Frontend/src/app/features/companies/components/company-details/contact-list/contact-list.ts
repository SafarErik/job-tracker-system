import { Component, input, output, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toast } from 'ngx-sonner';
import { FormsModule } from '@angular/forms';
import { CompanyContact } from '../../../models/company.model';
import { HlmButtonImports } from '../../../../../../../libs/ui/button';
import { HlmInputImports } from '../../../../../../../libs/ui/input';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucidePlus,
  lucideLinkedin,
  lucideExternalLink,
  lucidePencil,
  lucideTrash2,
  lucideBuilding2
} from '@ng-icons/lucide';

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ...HlmButtonImports,
    ...HlmInputImports,
    NgIcon
  ],
  providers: [
    provideIcons({
      lucidePlus,
      lucideLinkedin,
      lucideExternalLink,
      lucidePencil,
      lucideTrash2,
      lucideBuilding2
    })
  ],
  templateUrl: './contact-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactListComponent {
  contacts = input.required<CompanyContact[]>();
  maxDisplay = input<number | null>(null);

  displayedContacts = computed(() => {
    const all = this.contacts();
    const max = this.maxDisplay();
    return max ? all.slice(0, max) : all;
  });

  save = output<CompanyContact>();
  deleteContact = output<string>();

  // Local state
  editingContactId = signal<string | null>(null); // '0' for new

  editForm = {
    name: signal(''),
    role: signal(''),
    email: signal(''),
    linkedIn: signal('')
  };

  startAddContact(): void {
    this.editForm.name.set('');
    this.editForm.role.set('');
    this.editForm.email.set('');
    this.editForm.linkedIn.set('');
    this.editingContactId.set('0');
  }

  startEditContact(contact: CompanyContact): void {
    this.editForm.name.set(contact.name);
    this.editForm.role.set(contact.role || '');
    this.editForm.email.set(contact.email || '');
    this.editForm.linkedIn.set(contact.linkedIn || '');
    this.editingContactId.set(contact.id || null);
  }

  cancelEdit(): void {
    this.editingContactId.set(null);
  }

  saveContact(): void {
    const editId = this.editingContactId();
    if (editId === null) return;

    const contact: CompanyContact = {
      id: editId,
      name: this.editForm.name(),
      role: this.editForm.role(),
      email: this.editForm.email() || undefined,
      linkedIn: this.editForm.linkedIn() || undefined
    };

    if (!contact.name || !contact.role) {
      // Basic validation, UI could show error but for now we just return
      // Ideally inject NotificationService or emit an error event? 
      // Dumb components shouldn't inject Services if possible.
      // Let's assume parent handles validation or we just don't emit.
      // Or we can add a local error signal.
      return;
    }

    this.save.emit(contact);
    this.editingContactId.set(null);
  }

  getSeniorityBorder(role: string | undefined | null): string {
    const r = (role || '').toLowerCase();
    if (r.includes('director') || r.includes('head') || r.includes('lead') || r.includes('v-p') || r.includes('vp') || r.includes('cto') || r.includes('ceo')) {
      return 'border-primary/50 shadow-[0_0_10px_rgba(var(--primary),0.2)] bg-primary/5';
    }
    if (r.includes('recruit') || r.includes('talent') || r.includes('hr') || r.includes('people')) {
      return 'border-info/50 shadow-[0_0_10px_rgba(var(--info),0.2)] bg-info/5';
    }
    return 'border-border';
  }

  openLinkedIn(url: string | undefined | null): void {
    if (url) {
      window.open(url, '_blank');
    } else {
      toast.error('No Signal Detected', {
        description: 'This personnel does not have a linked intelligence profile.',
        duration: 3000
      });
    }
  }
}
