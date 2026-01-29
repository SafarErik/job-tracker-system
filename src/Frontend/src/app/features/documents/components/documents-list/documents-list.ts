import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentService } from '../../services/document.service';
import { Document } from '../../models/document.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { DocumentCardComponent } from '../document-card/document-card.component';

// Spartan UI
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmButtonImports } from '@spartan-ng/helm/button';

import { provideIcons, NgIcon } from '@ng-icons/core';
import { lucideFileUp, lucideFileWarning, lucideLibrary } from '@ng-icons/lucide';

@Component({
  selector: 'app-documents-list',
  imports: [
    CommonModule,
    FormsModule,
    ...HlmInputImports,
    ...HlmLabelImports,
    ...HlmButtonImports,
    NgIcon,
    ErrorStateComponent,
    DocumentCardComponent
  ],
  providers: [provideIcons({ lucideFileUp, lucideFileWarning, lucideLibrary })],
  templateUrl: './documents-list.html',
})
export class DocumentsListComponent implements OnInit {
  private documentService = inject(DocumentService);
  private notificationService = inject(NotificationService);

  documents = signal<Document[]>([]);
  filteredDocuments = signal<Document[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  searchTerm = signal('');
  uploadProgress = signal<number | null>(null);
  isDragging = signal(false);

  // Storage logic
  totalStorage = 10 * 1024 * 1024; // 10MB
  usedStorage = computed(() => this.documents().reduce((acc, doc) => acc + doc.fileSize, 0));
  storagePercentage = computed(() => (this.usedStorage() / this.totalStorage) * 100);

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.documentService.getAllDocuments().subscribe({
      next: (docs) => {
        this.documents.set(docs);
        this.filteredDocuments.set(docs);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load documents');
        this.isLoading.set(false);
        console.error(err);
      },
    });
  }

  onSearch(): void {
    const term = this.searchTerm().toLowerCase();
    if (!term) {
      this.filteredDocuments.set(this.documents());
      return;
    }

    const filtered = this.documents().filter((doc) =>
      doc.originalFileName.toLowerCase().includes(term),
    );
    this.filteredDocuments.set(filtered);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.processFile(file, () => {
      input.value = ''; // Reset input
    });
  }

  processFile(file: File, callback?: () => void): void {
    // Validate file type
    if (file.type !== 'application/pdf') {
      this.notificationService.error(
        'Please select a PDF file. Other file types are not supported.',
        'Invalid File Type',
      );
      callback?.();
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      this.notificationService.error(
        'The file size exceeds the 10MB limit. Please choose a smaller file.',
        'File Too Large',
      );
      callback?.();
      return;
    }

    this.uploadProgress.set(0);

    this.documentService.uploadDocumentWithProgress(file).subscribe({
      next: (result) => {
        if (typeof result === 'number') {
          // Progress update
          this.uploadProgress.set(result);
        } else {
          // Upload complete, result is Document
          this.uploadProgress.set(null);
          this.loadDocuments(); // Reload list
          callback?.();
          this.notificationService.success(
            `${file.name} has been uploaded successfully!`,
            'Upload Complete',
          );
        }
      },
      error: (err) => {
        this.uploadProgress.set(null);
        this.notificationService.error(
          'An error occurred while uploading the document. Please try again.',
          'Upload Failed',
        );
        console.error(err);
        callback?.();
      },
    });
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    // Only set isDragging to false if the drag actually left the component root.
    // This prevents flicker when the pointer moves over child elements.
    const target = event.relatedTarget as Element | null;

    // Check if the new target is outside this component's root element
    if (!target || !this.getComponentRoot()?.contains(target)) {
      this.isDragging.set(false);
    }
  }

  private getComponentRoot(): Element | null {
    // Return the component's root element (the host element)
    // You may need to inject ElementRef if this approach doesn't work
    return document.activeElement?.closest('.drop-zone') || null;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    const files = event.dataTransfer?.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    this.processFile(file);
  }

  downloadDocument(doc: Document): void {
    this.documentService.downloadDocument(doc.id, doc.originalFileName);
  }

  async deleteDocument(doc: Document): Promise<void> {
    const confirmed = await this.notificationService.confirm(
      `Are you sure you want to delete "${doc.originalFileName}"? This action cannot be undone.`,
      'Delete Document',
    );

    if (!confirmed) {
      return;
    }

    this.documentService.deleteDocument(doc.id).subscribe({
      next: () => {
        this.loadDocuments();
        this.notificationService.success(
          `${doc.originalFileName} has been deleted successfully.`,
          'Document Deleted',
        );
      },
      error: (err) => {
        this.notificationService.error(
          'An error occurred while deleting the document. Please try again.',
          'Delete Failed',
        );
        console.error(err);
      },
    });
  }

  setMasterDocument(doc: Document): void {
    if (doc.isMaster) return;

    this.documentService.setMasterDocument(doc.id).subscribe({
      next: () => {
        this.loadDocuments();
        this.notificationService.success(
          `${doc.originalFileName} is now your Master Resume.`,
          'Strategic Update',
        );
      },
      error: (err) => {
        this.notificationService.error(
          'Failed to set master document.',
          'Update Failed'
        );
        console.error(err);
      }
    });
  }

  previewDocument(doc: Document): void {
    // For now just download/open in new tab since we don't have a dedicated previewer yet
    // Or we can implement a modal later.
    this.documentService.downloadDocument(doc.id, doc.originalFileName);
  }

  formatFileSize(bytes: number): string {
    return this.documentService.formatFileSize(bytes);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('hu-HU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}
