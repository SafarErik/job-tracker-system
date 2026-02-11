import { CompanyContact } from './company-contact.model';

export interface CompanyDto {
    id: string;
    name: string;
    industry?: string;
    website?: string;
    address?: string; // Corrected from 'location' to 'address' if backend uses 'Address' or kept 'location' if requested? User requested 'hqLocation'.
    // User requested: logoUrl, hqLocation, description, compatibilityScore
    logoUrl?: string;
    hqLocation?: string;
    description?: string;
    compatibilityScore: number;
    priority: number; // Enum value
}

export interface CompanyDetailDto extends CompanyDto {
    contacts: CompanyContact[];
    jobApplications: any[]; // Avoid circular dependency or use simplified DTO
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
