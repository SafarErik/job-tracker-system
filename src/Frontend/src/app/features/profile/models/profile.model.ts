export interface UserProfile {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string;
  profilePictureUrl: string | null;
  currentJobTitle: string | null;
  yearsOfExperience: number | null;
  bio: string | null;
  createdAt: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  currentJobTitle?: string;
  yearsOfExperience?: number;
  bio?: string;
  profilePictureUrl?: string;
}

export interface ProfileStats {
  totalApplications: number;
  activeApplications: number;
  interviewsScheduled: number;
  offersReceived: number;
  averageResponseTime: number;
  successRate: number;
  companiesAppliedTo: number;
  skillsCount: number;
}

export interface UserSkill {
  id: number;
  name: string;
  category: string;
}
