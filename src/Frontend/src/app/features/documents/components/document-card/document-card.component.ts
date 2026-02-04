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
    <div class="group relative bg-card/60 backdrop-blur-md rounded-2xl border border-border p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-lg dark:hover:shadow-primary/5 hover:-translate-y-1 flex flex-col gap-4 h-full overflow-hidden">
      
      <!-- Glow Effect -->
      <div class="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

      <!-- TOP: File Type & Status -->
      <div class="relative flex items-start justify-between z-10">
        <div class="flex items-center gap-3">
          <!-- Icon / Company Logo Placeholder -->
          <div class="h-12 w-12 rounded-xl bg-muted border border-border flex items-center justify-center font-bold text-xs text-muted-foreground group-hover:text-primary group-hover:border-primary/30 transition-colors shadow-inner">
             @if (doc().companyLogo) {
                <!-- Mock Image for Company -->
                <span class="text-[10px] uppercase">{{ doc().companyName?.substring(0, 2) }}</span>
             } @else {
                <ng-icon name="lucideFileText" class="text-xl"></ng-icon>
             }
          </div>
          
          <div class="flex flex-col">
             @if (doc().companyName) {
                <span class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                   Tailored for
                </span>
                <span class="text-sm font-bold text-foreground">{{ doc().companyName }}</span>
             } @else {
                <span class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                   {{ doc().docType || 'General Asset' }}
                </span>
             }
          </div>
        </div>
        
        <!-- Actions Dropdown (Spartan) -->
        <button [hlmDropdownMenuTrigger]="docMenu" class="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <ng-icon name="lucideMoreVertical" class="text-base"></ng-icon>
        </button>
        
        <ng-template #docMenu>
          <div hlmDropdownMenu class="w-56 bg-popover border-border text-foreground">
            <button hlmDropdownMenuItem (click)="preview.emit(doc())" class="hover:bg-muted focus:bg-muted">
              <ng-icon name="lucideEye" class="mr-2 h-4 w-4 text-primary"></ng-icon>
              <span>Quick Preview</span>
            </button>
            <button hlmDropdownMenuItem (click)="download.emit(doc())" class="hover:bg-muted focus:bg-muted">
              <ng-icon name="lucideDownload" class="mr-2 h-4 w-4"></ng-icon>
              <span>Download Asset</span>
            </button>
            
            @if (doc().jobId) {
              <div hlmDropdownMenuSeparator class="bg-border"></div>
              <button hlmDropdownMenuItem (click)="viewApplication.emit(doc())" class="hover:bg-muted focus:bg-muted">
                <ng-icon name="lucideFileText" class="mr-2 h-4 w-4 text-primary"></ng-icon>
                <span>View Linked Application</span>
              </button>
            }

            <div hlmDropdownMenuSeparator class="bg-border"></div>
            @if (!doc().isMaster) {
               <button hlmDropdownMenuItem (click)="setMaster.emit(doc())" class="hover:bg-muted focus:bg-muted">
               <ng-icon name="lucideAward" class="mr-2 h-4 w-4 text-warning"></ng-icon>
               <span>Promote to Master</span>
               </button>
            }
            <div hlmDropdownMenuSeparator class="bg-border"></div>
            <button hlmDropdownMenuItem class="text-destructive focus:text-destructive hover:bg-destructive/10 focus:bg-destructive/10" (click)="delete.emit(doc())">
              <ng-icon name="lucideTrash2" class="mr-2 h-4 w-4"></ng-icon>
              <span>Delete Asset</span>
            </button>
          </div>
        </ng-template>
      </div>

      <!-- MIDDLE: Filename & Compatibility -->
      <div class="space-y-2 z-10 mt-1">
        <h3 class="font-bold text-foreground truncate group-hover:text-primary transition-colors cursor-pointer text-sm" 
            [title]="doc().originalFileName"
            (click)="preview.emit(doc())">
          {{ doc().originalFileName }}
        </h3>
        
        @if (doc().compatibilityScore) {
           <div class="flex items-center gap-2">
              <div class="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
                 <div class="h-full bg-success rounded-full" [style.width.%]="doc().compatibilityScore"></div>
              </div>
              <span class="text-[10px] font-bold text-success">{{ doc().compatibilityScore }}% Match</span>
           </div>
        } @else {
           <p class="text-[11px] text-muted-foreground flex items-center gap-2">
             <span>{{ formattedSize() }}</span>
             <span class="w-1 h-1 rounded-full bg-border"></span>
             <span>{{ doc().uploadedAt | date:'MMM d' }}</span>
           </p>
        }
      </div>

      <!-- BOTTOM: Actions & Status -->
      <div class="mt-auto pt-4 border-t border-border flex items-center justify-between z-10">
         @if (doc().isMaster) {
            <span class="px-2 py-1 rounded-md bg-warning/10 text-warning text-[10px] font-black uppercase tracking-widest border border-warning/20 flex items-center gap-1.5">
               <ng-icon name="lucideAward" size="10"></ng-icon>
               Master
             </span>
         } @else {
            <div class="flex -space-x-2">
               <!-- Placeholder avatars if shared/used -->
            </div>
         }
        
        <button hlmBtn variant="ghost" size="sm" class="h-7 px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-muted gap-1.5" (click)="preview.emit(doc())">
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
