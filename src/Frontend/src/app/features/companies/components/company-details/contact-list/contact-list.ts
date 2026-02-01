import { Component, input, output, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  template: `
    <div class="bg-card rounded-[2.5rem] border border-border/40 p-6 md:p-10">
      <div class="flex items-center justify-between mb-8">
        <h3 class="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">Personnel Hierarchy</h3>
        <button hlmBtn variant="ghost" size="icon-xs" class="h-8 w-8 rounded-full border border-border/40"
          (click)="startAddContact()" *ngIf="editingContactId() === null">
          <ng-icon name="lucidePlus"></ng-icon>
        </button>
      </div>

      <div class="space-y-4">
        <!-- Contact List -->
        @for (contact of contacts(); track contact.id) {
        <div class="bg-muted/30 border border-border/20 rounded-[1.5rem] overflow-hidden"
          [class.bg-card]="editingContactId() === contact.id"
          [class.border-primary/30]="editingContactId() === contact.id">

          @if (editingContactId() !== contact.id) {
          <div
            class="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:bg-muted/50 transition-all">
            <div class="flex items-center gap-4 w-full">
              <div
                class="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black shrink-0">
                {{ contact.name.charAt(0) }}
              </div>

              <div class="flex-1">
                <p class="text-sm font-black tracking-tight">{{ contact.name }}</p>
                <p class="text-[10px] font-bold text-muted-foreground uppercase">{{ contact.role }}</p>
              </div>
            </div>

            <div
              class="flex flex-wrap justify-end gap-2 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
              @if (contact.linkedIn) {
              <a [href]="contact.linkedIn" target="_blank" rel="noopener noreferrer"
                class="h-10 w-10 rounded-xl bg-card border border-border/40 flex items-center justify-center text-muted-foreground hover:text-primary transition-all">
                <ng-icon name="lucideLinkedin"></ng-icon>
              </a>
              }
              @if (contact.email) {
              <a [href]="'mailto:' + contact.email"
                class="h-10 w-10 rounded-xl bg-card border border-border/40 flex items-center justify-center text-muted-foreground hover:text-primary transition-all">
                <ng-icon name="lucideExternalLink" size="16"></ng-icon>
              </a>
              }
              <button (click)="startEditContact(contact)"
                class="h-10 w-10 rounded-xl bg-card border border-border/40 flex items-center justify-center text-muted-foreground hover:text-primary transition-all">
                <ng-icon name="lucidePencil" size="16"></ng-icon>
              </button>
              <button (click)="deleteContact.emit(contact.id)"
                class="h-10 w-10 rounded-xl bg-card border border-border/40 flex items-center justify-center text-muted-foreground hover:text-destructive transition-all">
                <ng-icon name="lucideTrash2" size="16"></ng-icon>
              </button>
            </div>
          </div>
          } @else {
          <!-- Inline Edit Form -->
          <div class="p-6 space-y-4 duration-300">
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1.5">
                <label class="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Member
                  Name</label>
                <input hlmInput size="sm" class="h-9 w-full rounded-xl" [ngModel]="editForm.name()"
                  (ngModelChange)="editForm.name.set($event)" placeholder="e.g. Sarah Connor" autofocus />
              </div>
              <div class="space-y-1.5">
                <label class="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Rank /
                  Role</label>
                <input hlmInput size="sm" class="h-9 w-full rounded-xl" [ngModel]="editForm.role()"
                  (ngModelChange)="editForm.role.set($event)" placeholder="e.g. Lead Technical Recruiter" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1.5">
                <label class="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Signal
                  (LinkedIn)</label>
                <input hlmInput size="sm" class="h-9 w-full rounded-xl" [ngModel]="editForm.linkedIn()"
                  (ngModelChange)="editForm.linkedIn.set($event)" placeholder="LinkedIn URL" />
              </div>
              <div class="space-y-1.5">
                <label class="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Comms
                  (Email)</label>
                <input hlmInput size="sm" class="h-9 w-full rounded-xl" [ngModel]="editForm.email()"
                  (ngModelChange)="editForm.email.set($event)" placeholder="Email Address" />
              </div>
            </div>

            <div class="flex items-center justify-end gap-2 pt-2">
              <button hlmBtn variant="ghost" size="sm" class="rounded-xl text-xs font-bold"
                (click)="cancelEdit()">
                Abort
              </button>
              <button hlmBtn variant="default" size="sm" class="rounded-xl text-xs font-bold px-6"
                (click)="saveContact()">
                Secure Entry
              </button>
            </div>
          </div>
          }
        </div>
        }

        <!-- Add New Contact Form -->
        @if (editingContactId() === '0') {
        <div
          class="bg-card border-2 border-dashed border-primary/30 rounded-[1.5rem] p-6 space-y-4 animate-in fade-in zoom-in-95 duration-300">
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <label class="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">New Member
                Name</label>
              <input hlmInput size="sm" class="h-9 w-full rounded-xl" [ngModel]="editForm.name()"
                (ngModelChange)="editForm.name.set($event)" placeholder="Name" autofocus />
            </div>
            <div class="space-y-1.5">
              <label class="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Rank /
                Role</label>
              <input hlmInput size="sm" class="h-9 w-full rounded-xl" [ngModel]="editForm.role()"
                (ngModelChange)="editForm.role.set($event)" placeholder="Role" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1.5">
                <label class="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Signal
                  (LinkedIn)</label>
                <input hlmInput size="sm" class="h-9 w-full rounded-xl" [ngModel]="editForm.linkedIn()"
                  (ngModelChange)="editForm.linkedIn.set($event)" placeholder="LinkedIn URL" />
              </div>
              <div class="space-y-1.5">
                <label class="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Comms
                  (Email)</label>
                <input hlmInput size="sm" class="h-9 w-full rounded-xl" [ngModel]="editForm.email()"
                  (ngModelChange)="editForm.email.set($event)" placeholder="Email Address" />
              </div>
            </div>
          <div class="flex items-center justify-end gap-2 pt-2">
            <button hlmBtn variant="ghost" size="sm" class="rounded-xl text-xs font-bold font-sans"
              (click)="cancelEdit()">
              Abort
            </button>
            <button hlmBtn variant="default" size="sm" class="rounded-xl text-xs font-bold px-6 bg-primary"
              (click)="saveContact()">
              Enlist Personnel
            </button>
          </div>
        </div>
        }

        @if (!contacts().length && !editingContactId()) {
        <div class="py-12 text-center border-2 border-dashed border-border/20 rounded-[2rem] bg-muted/5">
          <ng-icon name="lucideBuilding2" class="text-muted-foreground/20 text-4xl mb-3"></ng-icon>
          <p class="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">No Intelligence
            Contacts Identified</p>
          <button hlmBtn variant="link" size="sm" class="mt-2 text-primary hover:text-primary/80 font-bold"
            (click)="startAddContact()">
            Identify New Contact
          </button>
        </div>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactListComponent {
  contacts = input.required<CompanyContact[]>();

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
    this.editingContactId.set(contact.id);
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
}
