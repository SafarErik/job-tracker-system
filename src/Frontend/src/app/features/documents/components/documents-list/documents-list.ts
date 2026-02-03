import { Component, OnInit, signal, inject, ViewChild, ElementRef, HostListener, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentStore } from '../../services/document.store';
import { Document } from '../../../../core/models/document.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { toast } from 'ngx-sonner';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { DocumentCardComponent } from '../document-card/document-card.component';
import { DocumentService } from '../../services/document.service';

// Spartan UI
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmButtonImports } from '@spartan-ng/helm/button';

import { provideIcons, NgIcon } from '@ng-icons/core';
import { lucideFileUp, lucideFileWarning, lucideLibrary, lucideLoader2 } from '@ng-icons/lucide';

@Component({
  selector: 'app-documents-list',
  standalone: true,
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
  providers: [provideIcons({ lucideFileUp, lucideFileWarning, lucideLibrary, lucideLoader2 })],
  templateUrl: './documents-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentsListComponent implements OnInit {
  public readonly store = inject(DocumentStore);
  private readonly notificationService = inject(NotificationService);
  private readonly documentService = inject(DocumentService);

  // Computed State for Layout
  masterDocument = computed(() =>
    this.store.filteredDocuments().find(d => d.isMaster)
  );

  deployedDocuments = computed(() =>
    this.store.filteredDocuments().filter(d => !d.isMaster)
  );

  tailoredResumes = computed(() =>
    this.deployedDocuments().filter(d => this.inferDocType(d) === 'Resume')
  );

  coverLetters = computed(() =>
    this.deployedDocuments().filter(d => this.inferDocType(d) === 'Cover Letter')
  );

  // Helper to infer type if not present (simple logic for now)
  private inferDocType(doc: Document): 'Resume' | 'Cover Letter' {
    if (doc.docType) return doc.docType;
    const name = doc.originalFileName.toLowerCase();
    if (name.includes('cover') || name.includes('letter')) return 'Cover Letter';
    return 'Resume';
  }

  // Local-only UI State
  uploadProgress = signal<number | null>(null);
  isDragging = signal(false);
  isSearchFocused = signal(false);

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  ngOnInit(): void {
    this.store.loadAll();
  }

  // ============================================
  // Keyboard Shortcuts
  // ============================================

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      this.focusSearch();
    }
  }

  focusSearch(): void {
    if (this.searchInput) {
      this.searchInput.nativeElement.focus();
    }
  }

  setSearchFocus(focused: boolean): void {
    this.isSearchFocused.set(focused);
  }

  filterByType(type: string | null): void {
    this.store.setTypeFilter(type);
  }

  onSearchChange(value: string): void {
    this.store.setSearchTerm(value);
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
      toast.error('Invalid File Type', {
        description: 'Please select a PDF file. Other file types are not supported.',
      });
      callback?.();
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File Too Large', {
        description: 'The file size exceeds the 10MB limit. Please choose a smaller file.',
      });
      callback?.();
      return;
    }

    this.uploadProgress.set(0);

    // Using service directly for progress (not typically in store for transient per-file progress)
    this.documentService.uploadDocumentWithProgress(file).subscribe({
      next: (result) => {
        if (typeof result === 'number') {
          this.uploadProgress.set(result);
        } else {
          this.uploadProgress.set(null);
          this.store.loadAll(); // Sync store
          callback?.();
          toast.success('Upload Complete', {
            description: `${file.name} has been uploaded successfully!`,
          });
        }
      },
      error: (err) => {
        this.uploadProgress.set(null);
        toast.error('Upload Failed', {
          description: 'An error occurred while uploading. Please try again.',
        });
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

    // We can't easily check .drop-zone here since we use HostListener-like pattern on div.
    // However, the previous logic was fine if we just target the container.
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    const files = event.dataTransfer?.files;
    if (!files || files.length === 0) return;

    this.processFile(files[0]);
  }

  downloadDocument(doc: Document): void {
    this.documentService.downloadDocument(doc.id, doc.originalFileName);
  }

  async deleteDocument(doc: Document): Promise<void> {
    const confirmed = await this.notificationService.confirm(
      `Are you sure you want to delete "${doc.originalFileName}"?`,
      'Delete Document',
    );

    if (confirmed) {
      this.store.deleteDocument(doc);
    }
  }

  setMasterDocument(doc: Document): void {
    this.store.setMasterDocument(doc);
  }

  previewDocument(doc: Document): void {
    this.documentService.downloadDocument(doc.id, doc.originalFileName);
  }

  formatFileSize(bytes: number): string {
    return this.documentService.formatFileSize(bytes);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  viewApplication(doc: Document): void {
    if (doc.jobId) {
      // TODO: Navigate to job application details
      // this.router.navigate(['/applications', doc.jobId]);
      this.notificationService.show('info', 'Navigating to Linked Application...');
    }
  }
}
