export interface Company {
  id: number;
  name: string;
  website?: string;
  address?: string;
  hrContactName?: string;
  hrContactEmail?: string;
  hrContactLinkedIn?: string;
  industry?: string;
  techStack?: string[];
  totalApplications: number;
  priority: string;
  // For rich display in list view
  recentApplications?: ApplicationPreview[];
}

export interface ApplicationPreview {
  id: number;
  position: string;
  status: string;
}

export interface CreateCompany {
  name: string;
  website?: string;
  address?: string;
  hrContactName?: string;
  hrContactEmail?: string;
  hrContactLinkedIn?: string;
  industry?: string;
  techStack?: string[];
  priority?: string;
  notes?: string;
}

export interface UpdateCompany {
  name?: string;
  website?: string;
  address?: string;
  hrContactName?: string;
  hrContactEmail?: string;
  hrContactLinkedIn?: string;
  industry?: string;
  techStack?: string[];
  priority?: string;
  notes?: string;
  contacts?: CompanyContact[];
}

export interface CompanyDetail {
  id: number;
  name: string;
  website?: string;
  address?: string;
  hrContactName?: string;
  hrContactEmail?: string;
  hrContactLinkedIn?: string;
  industry?: string;
  techStack?: string[];
  totalApplications: number;
  priority: string;
  applicationHistory: JobApplicationHistory[];
  // Intelligence fields (mock data for now)
  contacts?: CompanyContact[];
  notes?: string;
}

export interface CompanyContact {
  id: number;
  name: string;
  role: string;
  email?: string;
  linkedIn?: string;
}

export interface JobApplicationHistory {
  id: number;
  position: string;
  appliedAt: string;
  status: string;
  salaryOffer?: number;
}

// Mock news service types
export interface CompanyNews {
  id: string;
  title: string;
  date: string;
  source: string;
}

