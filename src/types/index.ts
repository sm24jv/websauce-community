export type UserRole = "admin" | "user";
export type UserStatus = "active" | "paused" | "deleted";

// Corresponds to the 'users' collection in Firestore
export interface User {
  id: string;         // Firestore document ID (same as Firebase Auth UID)
  email: string;
  role: UserRole;
  status: UserStatus;
  start_date?: string; // ISO date string - Optional for admins
  end_date?: string;   // ISO date string - Optional for admins
  createdAt?: any;    // Firestore Server Timestamp (optional on client)
  updatedAt?: any;    // Firestore Server Timestamp (optional on client)
}

// Corresponds to the 'courses' collection in Firestore
export interface Course {
  id: string;         // Firestore document ID
  title: string;
  thumbnail: string;  // URL to thumbnail image
  description: string;
  createdAt?: any;    // Firestore Server Timestamp
  updatedAt?: any;    // Firestore Server Timestamp
}

// Corresponds to the 'weeks' collection in Firestore
export interface Week {
  id: string;         // Firestore document ID
  course_id: string;  // Reference to the parent course document ID
  week_number: number;
  title: string;
  description: string;
  thumbnail: string;  // URL to thumbnail image
  createdAt?: any;    // Firestore Server Timestamp
  updatedAt?: any;    // Firestore Server Timestamp
}

// Corresponds to the 'chapters' collection in Firestore
export interface Chapter {
  id: string;         // Firestore document ID
  week_id: string;    // Reference to the parent week document ID
  title: string;
  video_url: string;  // URL to the video content
  pdf_url?: string;   // Optional URL to a PDF document
  content: string;    // Text content/description for the chapter
  createdAt?: any;    // Firestore Server Timestamp
  updatedAt?: any;    // Firestore Server Timestamp
}

// This might not be needed if using Firebase Auth password reset
// export interface PasswordReset {
//   id: string;
//   user_id: string;
//   token: string;
//   expires_at: string; // ISO date string
// }

// Corresponds to a document (e.g., 'platform') in the 'settings' collection
export interface PlatformSettings {
  // General Tab
  platform_name: string;
  admin_email: string;
  timezone: string;
  date_format: string;
  // Email Tab
  email_from: string;
  email_sender_name: string;
  welcome_subject: string;
  welcome_template: string;
  // Appearance Tab
  primary_color: string;
  secondary_color: string;
  logo_url: string;
  favicon_url: string;
  // Timestamps (Optional)
  createdAt?: any;
  updatedAt?: any;
}
