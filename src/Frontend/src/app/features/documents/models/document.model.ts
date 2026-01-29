export interface Document {
  id: string;
  originalFileName: string;
  fileSize: number;
  contentType: string;
  uploadedAt: string;
  isMaster?: boolean;
}
