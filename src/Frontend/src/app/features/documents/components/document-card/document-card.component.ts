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
  templateUrl: './document-card.component.html'
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
