export interface Document {
  id: string;
  originalFileName: string;
  fileSize: number;
  fileUrl: string;
  contentType: string;
  uploadedAt: string;
  isMaster?: boolean;
}
