import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentService } from '../../services/document';
import { Document } from '../../models/document.model';

@Component({
  selector: 'app-documents-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './documents-list.html',
  styleUrl: './documents-list.css',
})
export class DocumentsListComponent implements OnInit {
  private documentService = inject(DocumentService);

  documents = signal<Document[]>([]);
  filteredDocuments = signal<Document[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  searchTerm = signal('');
  uploadProgress = signal<number | null>(null);

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

    // Validate file type
    if (file.type !== 'application/pdf') {
      alert('Only PDF files are allowed');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must not exceed 10MB');
      return;
    }

    this.uploadProgress.set(0);

    this.documentService.uploadDocument(file).subscribe({
      next: (doc) => {
        this.uploadProgress.set(null);
        this.loadDocuments(); // Reload list
        input.value = ''; // Reset input
        alert('Document uploaded successfully!');
      },
      error: (err) => {
        this.uploadProgress.set(null);
        alert('Failed to upload document');
        console.error(err);
        input.value = '';
      },
    });
  }

  downloadDocument(doc: Document): void {
    this.documentService.downloadDocument(doc.id, doc.originalFileName);
  }

  deleteDocument(doc: Document): void {
    if (!confirm(`Are you sure you want to delete "${doc.originalFileName}"?`)) {
      return;
    }

    this.documentService.deleteDocument(doc.id).subscribe({
      next: () => {
        this.loadDocuments();
        alert('Document deleted successfully');
      },
      error: (err) => {
        alert('Failed to delete document');
        console.error(err);
      },
    });
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
