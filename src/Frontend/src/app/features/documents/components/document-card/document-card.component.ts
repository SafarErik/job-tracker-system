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
    <div class="group relative bg-card rounded-2xl border border-border/40 p-4 transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:-translate-y-1 flex flex-col gap-4 h-full">
      
      <!-- TOP: File Type & Status -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="h-10 w-10 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center font-bold text-xs">
            PDF
          </div>
          @if (doc().isMaster) {
            <span class="px-2 py-0.5 rounded-md bg-warning/10 text-warning text-[10px] font-black uppercase tracking-widest border border-warning/20 flex items-center gap-1">
              <ng-icon name="lucideAward" size="12"></ng-icon>
              Master
            </span>
          }
        </div>
        
        <!-- Actions Dropdown (Spartan) -->
        <button [hlmDropdownMenuTrigger]="docMenu" class="h-8 w-8 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors">
          <ng-icon name="lucideMoreVertical" class="text-base"></ng-icon>
        </button>
        
        <ng-template #docMenu>
          <div hlmDropdownMenu class="w-48">
            <button hlmDropdownMenuItem (click)="preview.emit(doc())">
              <ng-icon name="lucideEye" class="mr-2 h-4 w-4"></ng-icon>
              <span>Preview</span>
            </button>
            <button hlmDropdownMenuItem (click)="download.emit(doc())">
              <ng-icon name="lucideDownload" class="mr-2 h-4 w-4"></ng-icon>
              <span>Download</span>
            </button>
            <div hlmDropdownMenuSeparator></div>
            <button hlmDropdownMenuItem (click)="setMaster.emit(doc())">
              <ng-icon name="lucideAward" class="mr-2 h-4 w-4"></ng-icon>
              <span>Set as Master</span>
            </button>
            <div hlmDropdownMenuSeparator></div>
            <button hlmDropdownMenuItem class="text-destructive focus:text-destructive" (click)="delete.emit(doc())">
              <ng-icon name="lucideTrash2" class="mr-2 h-4 w-4"></ng-icon>
              <span>Delete</span>
            </button>
          </div>
        </ng-template>
      </div>

      <!-- MIDDLE: Filename -->
      <div class="space-y-1">
        <h3 class="font-bold text-foreground truncate group-hover:text-primary transition-colors cursor-pointer" 
            [title]="doc().originalFileName"
            (click)="preview.emit(doc())">
          {{ doc().originalFileName }}
        </h3>
        <p class="text-xs text-muted-foreground flex items-center gap-2">
          <span>{{ formattedSize() }}</span>
          <span>•</span>
          <span>Uploaded {{ doc().uploadedAt | date:'MMM d' }}</span>
        </p>
      </div>

      <!-- BOTTOM: Links & Context -->
      <div class="mt-auto pt-3 border-t border-border/40 flex items-center justify-between">
        <div class="flex -space-x-2">
          <!-- Placeholder for future "Used In" feature -->
          <!-- <div class="h-6 w-6 rounded-full border-2 border-card bg-muted flex items-center justify-center text-[10px] font-bold">M</div> -->
        </div>
        
        <button hlmBtn variant="ghost" size="sm" class="h-8 px-2 text-xs gap-1.5 hover:text-primary" (click)="preview.emit(doc())">
          <ng-icon name="lucideEye" class="text-xs"></ng-icon>
          Preview
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

  formattedSize = computed(() => {
    return this.documentService.formatFileSize(this.doc().fileSize);
  });
}
