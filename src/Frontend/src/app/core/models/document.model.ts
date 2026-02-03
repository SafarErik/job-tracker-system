export interface Document {
    id: string;
    originalFileName: string;
    fileSize: number;
    contentType: string;
    uploadedAt: string;
    isMaster?: boolean;
    // UI Metadata
    companyName?: string;
    companyLogo?: string;
    compatibilityScore?: number;
    docType?: 'Resume' | 'Cover Letter';
    // Linkage
    jobId?: string;
    jobTitle?: string;
}
