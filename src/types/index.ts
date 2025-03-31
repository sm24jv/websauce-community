
export type UserRole = "admin" | "user";
export type UserStatus = "active" | "paused" | "deleted";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  start_date: string; // ISO date string
  end_date: string; // ISO date string
}

export interface Course {
  id: string;
  title: string;
  thumbnail_url: string;
  description: string;
}

export interface Week {
  id: string;
  course_id: string;
  index: number;
  title: string;
  thumbnail_url: string;
  short_description: string;
}

export interface Chapter {
  id: string;
  week_id: string;
  title: string;
  thumbnail_url: string;
  video_url: string;
  description: string;
  pdf_url?: string;
}

export interface PasswordReset {
  id: string;
  user_id: string;
  token: string;
  expires_at: string; // ISO date string
}
