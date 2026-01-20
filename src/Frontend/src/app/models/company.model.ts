export interface Company {
  id: number;
  name: string;
  website?: string;
  address?: string;
  hrContactName?: string;
  hrContactEmail?: string;
  hrContactLinkedIn?: string;
  totalApplications: number;
}

export interface CreateCompany {
  name: string;
  website?: string;
  address?: string;
  hrContactName?: string;
  hrContactEmail?: string;
  hrContactLinkedIn?: string;
}

export interface UpdateCompany {
  name?: string;
  website?: string;
  address?: string;
  hrContactName?: string;
  hrContactEmail?: string;
  hrContactLinkedIn?: string;
}

export interface CompanyDetail {
  id: number;
  name: string;
  website?: string;
  address?: string;
  hrContactName?: string;
  hrContactEmail?: string;
  hrContactLinkedIn?: string;
  totalApplications: number;
  applicationHistory: JobApplicationHistory[];
}

export interface JobApplicationHistory {
  id: number;
  position: string;
  appliedAt: string;
  status: string;
  salaryOffer?: number;
}
