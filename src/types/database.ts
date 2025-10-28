export type UserRole = 'talent' | 'company' | 'admin';
export type ApplicationStatus = 'pending' | 'in_review' | 'accepted' | 'rejected';
export type SwipeDirection = 'left' | 'right';
export type JobType = 'remote' | 'onsite' | 'hybrid';
export type NotificationType = 'application_received' | 'application_status_changed' | 'new_job_match' | 'system';

export interface Profile {
  id: string;
  full_name: string;
  bio?: string;
  skills: string[];
  experience_years: number;
  education?: string;
  location?: string;
  cv_url?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  company_name: string;
  description?: string;
  website?: string;
  location?: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string;
  company_id: string;
  title: string;
  description: string;
  skills_required: string[];
  experience_required: number;
  location?: string;
  job_type: JobType;
  salary_range?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  companies?: Company;
}

export interface Swipe {
  id: string;
  talent_id: string;
  job_id: string;
  direction: SwipeDirection;
  application_status: ApplicationStatus;
  created_at: string;
  updated_at: string;
  jobs?: Job;
  profiles?: Profile;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  related_job_id?: string;
  related_talent_id?: string;
  read: boolean;
  created_at: string;
}

export interface UserRoleRecord {
  id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
}
