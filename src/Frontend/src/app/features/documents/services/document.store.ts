import { Injectable, computed, inject, signal } from '@angular/core';
import { DocumentViewModel as Document } from '../../../core/models/document.model';
import { DocumentService } from './document.service';
import { NotificationService } from '../../../core/services/notification.service';
import { finalize, tap } from 'rxjs/operators';
import { catchError, of } from 'rxjs';

/**
 * Document Store
 * Manages the state of documents, filtering, and storage metrics.
 */
@Injectable({
    providedIn: 'root',
})
export class DocumentStore {
    private readonly documentService = inject(DocumentService);
    private readonly notificationService = inject(NotificationService);

    // --- State Signals ---
    private readonly _documents = signal<Document[]>([]);
    private readonly _isLoading = signal<boolean>(false);
    private readonly _error = signal<string | null>(null);

    // --- Filter Signals ---
    private readonly _searchTerm = signal<string>('');
    private readonly _typeFilter = signal<string | null>(null);

    // --- Public Read-only Signals ---
    readonly documents = this._documents.asReadonly();
    readonly isLoading = this._isLoading.asReadonly();
    readonly error = this._error.asReadonly();
    readonly searchTerm = this._searchTerm.asReadonly();
    readonly typeFilter = this._typeFilter.asReadonly();

    // --- Computed Signals ---

    /**
     * Filtered list of documents based on name search and type filter
     */
    readonly filteredDocuments = computed(() => {
        const docs = this._documents();
        const term = this._searchTerm().toLowerCase().trim();
        const type = this._typeFilter();

        return docs.filter((doc) => {
            // Search by filename
            if (term && !doc.originalFileName.toLowerCase().includes(term)) {
                return false;
            }

            // Filter by type (MASTER or file extension)
            if (type) {
                if (type === 'MASTER') {
                    if (!doc.isMaster) return false;
                } else {
                    if (!doc.originalFileName.toUpperCase().endsWith(`.${type.toUpperCase()}`)) {
                        return false;
                    }
                }
            }

            return true;
        });
    });

    /**
     * The master resume document
     */
    readonly masterResume = computed(() => this._documents().find((d) => d.isMaster));

    /**
     * Storage Metrics
     */
    readonly totalStorage = 10 * 1024 * 1024; // 10MB limit
    readonly usedStorage = computed(() => this._documents().reduce((acc, doc) => acc + doc.fileSize, 0));
    readonly storagePercentage = computed(() => (this.usedStorage() / this.totalStorage) * 100);

    // --- Actions ---

    /**
     * Load all documents from the backend
     */
    loadAll(): void {
        this._isLoading.set(true);
        this._error.set(null);

        this.documentService.getAllDocuments().pipe(
            tap((docs) => this._documents.set(docs)),
            catchError((err) => {
                console.error('Failed to load documents', err);
                const errorMessage = 'Failed to load documents';
                this._error.set(errorMessage);
                this.notificationService.error(errorMessage, 'Error');
                return of([]);
            }),
            finalize(() => this._isLoading.set(false))
        ).subscribe();
    }

    /**
     * Upload a new document
     */
    uploadDocument(file: File, onSuccess?: () => void): void {
        this._isLoading.set(true);

        this.documentService.uploadDocument(file).subscribe({
            next: (newDoc) => {
                this._documents.update((docs) => [newDoc, ...docs]);
                this.notificationService.success(`${file.name} uploaded successfully`, 'Upload Complete');
                this._isLoading.set(false);
                onSuccess?.();
            },
            error: (err) => {
                console.error('Upload failed', err);
                this.notificationService.error('Failed to upload document', 'Upload Failed');
                this._isLoading.set(false);
            }
        });
    }

    /**
     * Delete a document (with optimistic update)
     */
    deleteDocument(doc: Document): void {
        const originalDocs = this._documents();

        // Optimistic delete
        this._documents.update((docs) => docs.filter((d) => d.id !== doc.id));

        this.documentService.deleteDocument(doc.id).subscribe({
            next: () => {
                this.notificationService.success(`${doc.originalFileName} deleted`, 'Document Deleted');
            },
            error: (err) => {
                console.error('Delete failed', err);
                this.notificationService.error('Failed to delete document', 'Delete Failed');
                // Revert optimistic change
                this._documents.set(originalDocs);
            }
        });
    }

    /**
     * Set a document as the master resume
     */
    setMasterDocument(doc: Document): void {
        if (doc.isMaster) return;

        // Optimistic update
        const originalDocs = this._documents();
        this._documents.update((docs) =>
            docs.map((d) => ({
                ...d,
                isMaster: d.id === doc.id,
            }))
        );

        this.documentService.setMasterDocument(doc.id).subscribe({
            next: () => {
                this.notificationService.success(`${doc.originalFileName} is now your Master Resume`, 'Strategic Update');
            },
            error: (err) => {
                console.error('Failed to set master', err);
                this.notificationService.error('Failed to update master resume', 'Update Failed');
                // Revert optimistic change
                this._documents.set(originalDocs);
            }
        });
    }

    // --- Filter Actions ---

    setSearchTerm(term: string): void {
        this._searchTerm.set(term);
    }

    setTypeFilter(type: string | null): void {
        this._typeFilter.set(type);
    }

    resetFilters(): void {
        this._searchTerm.set('');
        this._typeFilter.set(null);
    }
}
