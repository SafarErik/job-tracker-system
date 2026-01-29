import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Document } from '../../../core/models/document.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/Documents`;

  // Get all documents
  getAllDocuments(): Observable<Document[]> {
    return this.http.get<Document[]>(this.apiUrl);
  }

  // Get document by ID
  getDocumentById(id: string): Observable<Document> {
    return this.http.get<Document>(`${this.apiUrl}/${id}`);
  }

  // Upload document
  uploadDocument(file: File): Observable<Document> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post<Document>(`${this.apiUrl}/upload`, formData);
  }

  // Upload with progress tracking
  uploadDocumentWithProgress(file: File): Observable<number | Document> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http
      .post<Document>(`${this.apiUrl}/upload`, formData, {
        reportProgress: true,
        observe: 'events',
      })
      .pipe(
        map((event) => {
          if (event.type === HttpEventType.UploadProgress) {
            // Calculate progress percentage
            const progress = event.total ? Math.round((100 * event.loaded) / event.total) : 0;
            return progress;
          } else if (event.type === HttpEventType.Response) {
            // Upload complete, return document
            return event.body!;
          }
          return 0;
        }),
      );
  }

  // Download document
  downloadDocument(id: string, originalFileName: string): void {
    this.http
      .get(`${this.apiUrl}/${id}/download`, {
        responseType: 'blob',
      })
      .subscribe((blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = originalFileName;
        link.click();
        window.URL.revokeObjectURL(url);
      });
  }

  // Delete document
  deleteDocument(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  setMasterDocument(id: string): Observable<Document> {
    return this.http.post<Document>(`${this.apiUrl}/${id}/master`, {});
  }

  // Format file size for display
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}
