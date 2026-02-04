export interface Document {
    id: string;
    originalFileName: string;
    fileSize: number;
    contentType: string;
    uploadedAt: string;
    isMaster?: boolean;
}

export interface DocumentViewModel extends Document {
    companyName?: string;
    companyLogo?: string;
    compatibilityScore?: number;
    docType?: 'Resume' | 'Cover Letter';
    jobId?: string;
    jobTitle?: string;
}
