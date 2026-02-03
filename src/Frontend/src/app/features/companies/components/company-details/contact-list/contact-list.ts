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
    <div class="bg-zinc-900/40 rounded-3xl border border-zinc-800 p-5 h-full flex flex-col">
      <div class="flex items-center justify-between mb-4 leading-none shrink-0">
        <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Personnel Hierarchy</h3>
        <button hlmBtn variant="ghost" size="icon-xs" class="h-6 w-6 rounded-md border border-zinc-800 text-zinc-600 hover:text-violet-400 hover:border-violet-500/30 transition-all font-serif"
          (click)="startAddContact()" *ngIf="editingContactId() === null && !maxDisplay()">
          <ng-icon name="lucidePlus"></ng-icon>
        </button>
      </div>

      <div class="space-y-2 flex-1 overflow-y-auto custom-scrollbar">
        <!-- Contact List -->
        @for (contact of displayedContacts(); track contact.id) {
        <div class="bg-zinc-950/30 border border-zinc-900 rounded-xl overflow-hidden group hover:border-zinc-700 transition-all font-sans"
          [class.bg-zinc-900]="editingContactId() === contact.id"
          [class.border-violet-500/30]="editingContactId() === contact.id">

          @if (editingContactId() !== contact.id) {
          <div class="p-3 flex items-center justify-between gap-3">
             <div class="flex items-center gap-3 min-w-0">
                <div
                  class="h-8 w-8 rounded-lg bg-zinc-900 border flex items-center justify-center text-zinc-100 font-serif text-sm shrink-0 transition-colors"
                  [class]="getSeniorityBorder(contact.role)">
                  {{ contact.name.charAt(0) }}
                </div>
                <div class="min-w-0">
                   <p class="text-xs font-serif text-zinc-100 truncate">{{ contact.name }}</p>
                   <p class="text-[9px] font-black text-zinc-600 uppercase tracking-widest truncate">{{ contact.role }}</p>
                </div>
             </div>

            <div class="flex items-center gap-2 shrink-0">
               <!-- LinkedIn (Always Visible) -->
               <button (click)="openLinkedIn(contact.linkedIn)"
                 class="h-8 w-8 rounded-lg border flex items-center justify-center transition-all shadow-sm"
                 [class]="contact.linkedIn ? 'bg-violet-500/10 border-violet-500/20 text-violet-400 hover:bg-violet-500/20' : 'bg-zinc-900 border-zinc-800 text-zinc-600 hover:text-zinc-400'">
                 <ng-icon name="lucideLinkedin" size="14"></ng-icon>
               </button>

               @if (contact.email) {
               <a [href]="'mailto:' + contact.email"
                 class="h-8 w-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-100 transition-all">
                 <ng-icon name="lucideExternalLink" size="14"></ng-icon>
               </a>
               }
               
               <div class="w-px h-4 bg-zinc-800 mx-1 hidden sm:block"></div>
               
               <!-- Edit/Delete Group -->
               <div class="flex items-center gap-1">
                  <button (click)="startEditContact(contact)"
                    class="h-8 w-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-100 transition-all">
                    <ng-icon name="lucidePencil" size="14"></ng-icon>
                  </button>
                  <button (click)="deleteContact.emit(contact.id)"
                    class="h-8 w-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-destructive transition-all">
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
                <label class="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1">Member
                  Name</label>
                <input hlmInput size="sm" class="h-9 w-full rounded-xl bg-zinc-950 border-zinc-800" [ngModel]="editForm.name()"
                  (ngModelChange)="editForm.name.set($event)" placeholder="e.g. Sarah Connor" autofocus />
              </div>
              <div class="space-y-1.5">
                <label class="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1">Rank /
                  Role</label>
                <input hlmInput size="sm" class="h-9 w-full rounded-xl bg-zinc-950 border-zinc-800" [ngModel]="editForm.role()"
                  (ngModelChange)="editForm.role.set($event)" placeholder="e.g. Lead Technical Recruiter" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3 font-sans">
              <div class="space-y-1.5">
                <label class="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1">Signal
                  (LinkedIn)</label>
                <input hlmInput size="sm" class="h-9 w-full rounded-xl bg-zinc-950 border-zinc-800" [ngModel]="editForm.linkedIn()"
                  (ngModelChange)="editForm.linkedIn.set($event)" placeholder="LinkedIn URL" />
              </div>
              <div class="space-y-1.5">
                <label class="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1">Comms
                  (Email)</label>
                <input hlmInput size="sm" class="h-9 w-full rounded-xl bg-zinc-950 border-zinc-800" [ngModel]="editForm.email()"
                  (ngModelChange)="editForm.email.set($event)" placeholder="Email Address" />
              </div>
            </div>

            <div class="flex items-center justify-end gap-2 pt-2">
              <button hlmBtn variant="ghost" size="sm" class="rounded-xl text-xs font-bold font-sans"
                (click)="cancelEdit()">
                Abort
              </button>
              <button hlmBtn variant="default" size="sm" class="rounded-xl text-xs font-bold px-6 bg-zinc-100 text-zinc-950 hover:bg-zinc-200 font-sans"
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
          class="bg-zinc-900 border-2 border-dashed border-violet-500/30 rounded-[1.5rem] p-6 space-y-4 animate-in fade-in zoom-in-95 duration-300">
          <div class="grid grid-cols-2 gap-3 font-sans">
            <div class="space-y-1.5">
              <label class="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1">New Member
                Name</label>
              <input hlmInput size="sm" class="h-9 w-full rounded-xl bg-zinc-950 border-zinc-800" [ngModel]="editForm.name()"
                (ngModelChange)="editForm.name.set($event)" placeholder="Name" autofocus />
            </div>
            <div class="space-y-1.5">
              <label class="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1">Rank /
                Role</label>
              <input hlmInput size="sm" class="h-9 w-full rounded-xl bg-zinc-950 border-zinc-800" [ngModel]="editForm.role()"
                (ngModelChange)="editForm.role.set($event)" placeholder="Role" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3 font-sans">
              <div class="space-y-1.5">
                <label class="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1">Signal
                  (LinkedIn)</label>
                <input hlmInput size="sm" class="h-9 w-full rounded-xl bg-zinc-950 border-zinc-800" [ngModel]="editForm.linkedIn()"
                  (ngModelChange)="editForm.linkedIn.set($event)" placeholder="LinkedIn URL" />
              </div>
              <div class="space-y-1.5">
                <label class="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1">Comms
                  (Email)</label>
                <input hlmInput size="sm" class="h-9 w-full rounded-xl bg-zinc-950 border-zinc-800" [ngModel]="editForm.email()"
                  (ngModelChange)="editForm.email.set($event)" placeholder="Email Address" />
              </div>
            </div>
          <div class="flex items-center justify-end gap-2 pt-2">
            <button hlmBtn variant="ghost" size="sm" class="rounded-xl text-xs font-bold font-sans"
              (click)="cancelEdit()">
              Abort
            </button>
            <button hlmBtn variant="default" size="sm" class="rounded-xl text-xs font-bold px-6 bg-violet-600 text-white hover:bg-violet-700 font-sans"
              (click)="saveContact()">
              Enlist Personnel
            </button>
          </div>
        </div>
        }

        @if (!contacts().length && !editingContactId()) {
        <div class="py-12 text-center border-2 border-dashed border-zinc-800 rounded-[2rem] bg-zinc-900/10">
          <ng-icon name="lucideBuilding2" class="text-zinc-800 text-4xl mb-3"></ng-icon>
          <p class="text-[10px] font-black text-zinc-700 uppercase tracking-widest">No Intelligence
            Contacts Identified</p>
          <button hlmBtn variant="link" size="sm" class="mt-2 text-violet-400 hover:text-violet-300 font-bold font-sans"
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
      return 'border-violet-500/50 shadow-[0_0_10px_rgba(139,92,246,0.2)] bg-violet-500/5';
    }
    if (r.includes('recruit') || r.includes('talent') || r.includes('hr') || r.includes('people')) {
      return 'border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.2)] bg-blue-500/5';
    }
    return 'border-zinc-800';
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
