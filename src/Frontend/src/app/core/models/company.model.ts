import { CompanyContact } from './company-contact.model';

export interface CompanyDto {
    id: string;
    name: string;
    industry?: string;
    website?: string;
    location?: string;
    logoUrl?: string;
}

export interface CompanyDetailDto extends CompanyDto {
    contacts: CompanyContact[];
    jobApplications: any[]; // Avoid circular dependency or use simplified DTO
}

export interface CreateCompanyDto {
    name: string;
    industry?: string;
    website?: string;
    location?: string;
    logoUrl?: string;
}
