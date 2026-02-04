import { DocumentViewModel as CoreDocumentViewModel } from '../../../core/models/document.model';

export interface DocumentViewModel extends CoreDocumentViewModel {
  fileUrl: string;
}
