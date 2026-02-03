import { Component, input, output, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Document } from '../../../../core/models/document.model';
import { DocumentService } from '../../services/document.service';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideMoreVertical,
  lucideEye,
  lucideDownload,
  lucideTrash2,
  lucideAward,
  lucideFileText
} from '@ng-icons/lucide';

@Component({
  selector: 'app-document-card',
  standalone: true,
  imports: [
    CommonModule,
    HlmButtonImports,
    HlmBadgeImports,
    HlmDropdownMenuImports,
    NgIcon
  ],
  providers: [provideIcons({
    lucideMoreVertical,
    lucideEye,
    lucideDownload,
    lucideTrash2,
    lucideAward,
    lucideFileText
  })],
  template: `
    <div class="group relative bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-white/5 p-5 transition-all duration-300 hover:border-violet-500/30 hover:shadow-[0_4px_20px_rgba(139,92,246,0.15)] hover:-translate-y-1 flex flex-col gap-4 h-full overflow-hidden">
      
      <!-- Glow Effect -->
      <div class="absolute inset-0 bg-linear-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

      <!-- TOP: File Type & Status -->
      <div class="relative flex items-start justify-between z-10">
        <div class="flex items-center gap-3">
          <!-- Icon / Company Logo Placeholder -->
          <div class="h-12 w-12 rounded-xl bg-zinc-950 border border-white/10 flex items-center justify-center font-bold text-xs text-neutral-400 group-hover:text-violet-400 group-hover:border-violet-500/30 transition-colors shadow-inner">
             @if (doc().companyLogo) {
                <!-- Mock Image for Company -->
                <span class="text-[10px] uppercase">{{ doc().companyName?.substring(0, 2) }}</span>
             } @else {
                <ng-icon name="lucideFileText" class="text-xl"></ng-icon>
             }
          </div>
          
          <div class="flex flex-col">
             @if (doc().companyName) {
                <span class="text-[10px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1">
                   Tailored for
                </span>
                <span class="text-sm font-bold text-white">{{ doc().companyName }}</span>
             } @else {
                <span class="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                   {{ doc().docType || 'General Asset' }}
                </span>
             }
          </div>
        </div>
        
        <!-- Actions Dropdown (Spartan) -->
        <button [hlmDropdownMenuTrigger]="docMenu" class="h-8 w-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-neutral-500 hover:text-white transition-colors">
          <ng-icon name="lucideMoreVertical" class="text-base"></ng-icon>
        </button>
        
        <ng-template #docMenu>
          <div hlmDropdownMenu class="w-56 bg-zinc-950 border-zinc-800 text-neutral-300">
            <button hlmDropdownMenuItem (click)="preview.emit(doc())" class="hover:bg-zinc-900 focus:bg-zinc-900">
              <ng-icon name="lucideEye" class="mr-2 h-4 w-4 text-violet-400"></ng-icon>
              <span>Quick Preview</span>
            </button>
            <button hlmDropdownMenuItem (click)="download.emit(doc())" class="hover:bg-zinc-900 focus:bg-zinc-900">
              <ng-icon name="lucideDownload" class="mr-2 h-4 w-4"></ng-icon>
              <span>Download Asset</span>
            </button>
            
            @if (doc().jobId) {
              <div hlmDropdownMenuSeparator class="bg-zinc-800"></div>
              <button hlmDropdownMenuItem (click)="viewApplication.emit(doc())" class="hover:bg-zinc-900 focus:bg-zinc-900">
                <ng-icon name="lucideFileText" class="mr-2 h-4 w-4 text-violet-400"></ng-icon>
                <span>View Linked Application</span>
              </button>
            }

            <div hlmDropdownMenuSeparator class="bg-zinc-800"></div>
            @if (!doc().isMaster) {
               <button hlmDropdownMenuItem (click)="setMaster.emit(doc())" class="hover:bg-zinc-900 focus:bg-zinc-900">
               <ng-icon name="lucideAward" class="mr-2 h-4 w-4 text-amber-400"></ng-icon>
               <span>Promote to Master</span>
               </button>
            }
            <div hlmDropdownMenuSeparator class="bg-zinc-800"></div>
            <button hlmDropdownMenuItem class="text-rose-500 focus:text-rose-500 hover:bg-rose-950/20 focus:bg-rose-950/20" (click)="delete.emit(doc())">
              <ng-icon name="lucideTrash2" class="mr-2 h-4 w-4"></ng-icon>
              <span>Delete Asset</span>
            </button>
          </div>
        </ng-template>
      </div>

      <!-- MIDDLE: Filename & Compatibility -->
      <div class="space-y-2 z-10 mt-1">
        <h3 class="font-bold text-neutral-200 truncate group-hover:text-violet-200 transition-colors cursor-pointer text-sm" 
            [title]="doc().originalFileName"
            (click)="preview.emit(doc())">
          {{ doc().originalFileName }}
        </h3>
        
        @if (doc().compatibilityScore) {
           <div class="flex items-center gap-2">
              <div class="h-1.5 flex-1 bg-zinc-800 rounded-full overflow-hidden">
                 <div class="h-full bg-emerald-500 rounded-full" [style.width.%]="doc().compatibilityScore"></div>
              </div>
              <span class="text-[10px] font-bold text-emerald-400">{{ doc().compatibilityScore }}% Match</span>
           </div>
        } @else {
           <p class="text-[11px] text-neutral-500 flex items-center gap-2">
             <span>{{ formattedSize() }}</span>
             <span class="w-1 h-1 rounded-full bg-zinc-800"></span>
             <span>{{ doc().uploadedAt | date:'MMM d' }}</span>
           </p>
        }
      </div>

      <!-- BOTTOM: Actions & Status -->
      <div class="mt-auto pt-4 border-t border-white/5 flex items-center justify-between z-10">
         @if (doc().isMaster) {
            <span class="px-2 py-1 rounded-md bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-widest border border-amber-500/20 flex items-center gap-1.5">
               <ng-icon name="lucideAward" size="10"></ng-icon>
               Master
             </span>
         } @else {
            <div class="flex -space-x-2">
               <!-- Placeholder avatars if shared/used -->
            </div>
         }
        
        <button hlmBtn variant="ghost" size="sm" class="h-7 px-2 text-[10px] font-bold uppercase tracking-wider text-neutral-400 hover:text-white hover:bg-white/5 gap-1.5" (click)="preview.emit(doc())">
          Open
          <ng-icon name="lucideEye" class="text-xs"></ng-icon>
        </button>
      </div>
    </div>
  `
})
export class DocumentCardComponent {
  private documentService = inject(DocumentService);

  doc = input.required<Document>();

  preview = output<Document>();
  download = output<Document>();
  delete = output<Document>();
  setMaster = output<Document>();
  viewApplication = output<Document>();

  formattedSize = computed(() => {
    return this.documentService.formatFileSize(this.doc().fileSize);
  });
}
