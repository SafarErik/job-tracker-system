import { CompanyContact } from './company-contact.model';

export interface CompanyDto {
    id: string;
    name: string;
    industry?: string;
    website?: string;
    address?: string;
    logoUrl?: string;
    hqLocation?: string;
    description?: string;
    compatibilityScore: number;
    priority: number; // Enum value
    techStack: string[];
    totalApplications: number;
    recentApplications: JobApplicationHistoryDto[];
}

export interface JobApplicationHistoryDto {
    id: string;
    position: string;
    status: string;
    appliedAt: string;
    salaryOffer?: number;
}

export interface CompanyDetailDto extends CompanyDto {
    contacts: CompanyContact[];
    applicationHistory: JobApplicationHistoryDto[];
}

export interface CreateCompanyDto {
    name: string;
    industry?: string;
    website?: string;
    address?: string;
    priority?: number;
    logoUrl?: string;
    hqLocation?: string;
    description?: string;
}

export interface UpdateCompanyDto {
    name?: string;
    industry?: string;
    website?: string;
    address?: string;
    priority?: number;
    logoUrl?: string;
    hqLocation?: string;
    description?: string;
}
