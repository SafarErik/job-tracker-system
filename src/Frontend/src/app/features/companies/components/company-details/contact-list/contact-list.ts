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
  template: `
    <div class="bg-card/50 rounded-3xl border border-border p-5 h-full flex flex-col">
      <div class="flex items-center justify-between mb-4 leading-none shrink-0">
        <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Personnel Hierarchy</h3>
        <button hlmBtn variant="ghost" size="icon-xs" class="h-6 w-6 rounded-md border border-border text-muted-foreground hover:text-primary hover:border-primary/30 transition-all font-serif"
          (click)="startAddContact()" *ngIf="editingContactId() === null && !maxDisplay()">
          <ng-icon name="lucidePlus"></ng-icon>
        </button>
      </div>

      <div class="space-y-2 flex-1 overflow-y-auto custom-scrollbar">
        <!-- Contact List -->
        @for (contact of displayedContacts(); track contact.id) {
        <div class="bg-muted/30 border border-border rounded-xl overflow-hidden group hover:border-primary/30 transition-all font-sans"
          [class.bg-card]="editingContactId() === contact.id"
          [class.border-primary/30]="editingContactId() === contact.id">

          @if (editingContactId() !== contact.id) {
          <div class="p-3 flex items-center justify-between gap-3">
             <div class="flex items-center gap-3 min-w-0">
                <div
                  class="h-8 w-8 rounded-lg bg-muted border flex items-center justify-center text-foreground font-serif text-sm shrink-0 transition-colors"
                  [class]="getSeniorityBorder(contact.role)">
                  {{ contact.name.charAt(0) }}
                </div>
                <div class="min-w-0">
                   <p class="text-xs font-serif text-foreground truncate">{{ contact.name }}</p>
                   <p class="text-[9px] font-black text-muted-foreground uppercase tracking-widest truncate">{{ contact.role }}</p>
                </div>
             </div>

            <div class="flex items-center gap-2 shrink-0">
               <!-- LinkedIn (Always Visible) -->
               <button (click)="openLinkedIn(contact.linkedIn)"
                 class="h-8 w-8 rounded-lg border flex items-center justify-center transition-all shadow-sm"
                 [class]="contact.linkedIn ? 'bg-primary/10 border-primary/20 text-primary hover:bg-primary/20' : 'bg-muted border-border text-muted-foreground hover:text-foreground'">
                 <ng-icon name="lucideLinkedin" size="14"></ng-icon>
               </button>

               @if (contact.email) {
               <a [href]="'mailto:' + contact.email"
                 class="h-8 w-8 rounded-lg bg-muted border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-all">
                 <ng-icon name="lucideExternalLink" size="14"></ng-icon>
               </a>
               }
               
               <div class="w-px h-4 bg-border mx-1 hidden sm:block"></div>
               
               <!-- Edit/Delete Group -->
               <div class="flex items-center gap-1">
                  <button (click)="startEditContact(contact)"
                    class="h-8 w-8 rounded-lg bg-muted border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-all">
                    <ng-icon name="lucidePencil" size="14"></ng-icon>
                  </button>
                  <button (click)="deleteContact.emit(contact.id)"
                    class="h-8 w-8 rounded-lg bg-muted border border-border flex items-center justify-center text-muted-foreground hover:text-destructive transition-all">
                    <ng-icon name="lucideTrash2" size="14"></ng-icon>
                  </button>
               </div>
            </div>
          </div>
          } @else {
          <!-- Inline Edit Form -->
          <div class="p-6 space-y-4 duration-300">
            <div class="grid grid-cols-2 gap-3 font-sans">
              <div class="space-y-1.5">
                <label class="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Member
                  Name</label>
                <input hlmInput size="sm" class="h-9 w-full rounded-xl bg-muted border-border" [ngModel]="editForm.name()"
                  (ngModelChange)="editForm.name.set($event)" placeholder="e.g. Sarah Connor" autofocus />
              </div>
              <div class="space-y-1.5">
                <label class="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Rank /
                  Role</label>
                <input hlmInput size="sm" class="h-9 w-full rounded-xl bg-muted border-border" [ngModel]="editForm.role()"
                  (ngModelChange)="editForm.role.set($event)" placeholder="e.g. Lead Technical Recruiter" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3 font-sans">
              <div class="space-y-1.5">
                <label class="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Signal
                  (LinkedIn)</label>
                <input hlmInput size="sm" class="h-9 w-full rounded-xl bg-muted border-border" [ngModel]="editForm.linkedIn()"
                  (ngModelChange)="editForm.linkedIn.set($event)" placeholder="LinkedIn URL" />
              </div>
              <div class="space-y-1.5">
                <label class="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Comms
                  (Email)</label>
                <input hlmInput size="sm" class="h-9 w-full rounded-xl bg-muted border-border" [ngModel]="editForm.email()"
                  (ngModelChange)="editForm.email.set($event)" placeholder="Email Address" />
              </div>
            </div>

            <div class="flex items-center justify-end gap-2 pt-2">
              <button hlmBtn variant="ghost" size="sm" class="rounded-xl text-xs font-bold font-sans"
                (click)="cancelEdit()">
                Abort
              </button>
              <button hlmBtn variant="default" size="sm" class="rounded-xl text-xs font-bold px-6 bg-primary text-primary-foreground hover:bg-primary/90 font-sans"
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
          <div class="grid grid-cols-2 gap-3 font-sans">
            <div class="space-y-1.5">
              <label class="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">New Member
                Name</label>
              <input hlmInput size="sm" class="h-9 w-full rounded-xl bg-muted border-border" [ngModel]="editForm.name()"
                (ngModelChange)="editForm.name.set($event)" placeholder="Name" autofocus />
            </div>
            <div class="space-y-1.5">
              <label class="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Rank /
                Role</label>
              <input hlmInput size="sm" class="h-9 w-full rounded-xl bg-muted border-border" [ngModel]="editForm.role()"
                (ngModelChange)="editForm.role.set($event)" placeholder="Role" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3 font-sans">
              <div class="space-y-1.5">
                <label class="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Signal
                  (LinkedIn)</label>
                <input hlmInput size="sm" class="h-9 w-full rounded-xl bg-muted border-border" [ngModel]="editForm.linkedIn()"
                  (ngModelChange)="editForm.linkedIn.set($event)" placeholder="LinkedIn URL" />
              </div>
              <div class="space-y-1.5">
                <label class="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Comms
                  (Email)</label>
                <input hlmInput size="sm" class="h-9 w-full rounded-xl bg-muted border-border" [ngModel]="editForm.email()"
                  (ngModelChange)="editForm.email.set($event)" placeholder="Email Address" />
              </div>
            </div>
          <div class="flex items-center justify-end gap-2 pt-2">
            <button hlmBtn variant="ghost" size="sm" class="rounded-xl text-xs font-bold font-sans"
              (click)="cancelEdit()">
              Abort
            </button>
            <button hlmBtn variant="default" size="sm" class="rounded-xl text-xs font-bold px-6 bg-primary text-primary-foreground hover:bg-primary/90 font-sans"
              (click)="saveContact()">
              Enlist Personnel
            </button>
          </div>
        </div>
        }

        @if (!contacts().length && !editingContactId()) {
        <div class="py-12 text-center border-2 border-dashed border-border rounded-[2rem] bg-muted/10">
          <ng-icon name="lucideBuilding2" class="text-muted-foreground/40 text-4xl mb-3"></ng-icon>
          <p class="text-[10px] font-black text-muted-foreground uppercase tracking-widest">No Intelligence
            Contacts Identified</p>
          <button hlmBtn variant="link" size="sm" class="mt-2 text-primary hover:text-primary/80 font-bold font-sans"
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
