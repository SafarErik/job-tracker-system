export interface Company {
  id: number;
  name: string;
  websiteUrl?: string;
  contactPerson?: string;
}

export interface CreateCompany {
  name: string;
  websiteUrl?: string;
  contactPerson?: string;
}