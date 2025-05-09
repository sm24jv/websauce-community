import { User as FirebaseUser } from "firebase/auth";
import { FieldValue, Timestamp } from "firebase/firestore";

export type UserRole = "admin" | "user";
export type UserStatus = "active" | "paused" | "deleted";

// Corresponds to the 'users' collection in Firestore
export interface User {
  id: string;         // Firestore document ID (same as Firebase Auth UID)
  email: string;
  firstName?: string; // Added for first name
  lastName?: string;  // Added for last name
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

// --- Message Board Types --- //

// Corresponds to the 'messageCategories' collection in Firestore
export interface MessageCategory {
  id: string;         // Firestore document ID
  name: string;
  description?: string;
  order?: number;     // Optional field for sorting categories
  createdAt?: any;    // Firestore Server Timestamp
  updatedAt?: any;    // Firestore Server Timestamp
}

// Corresponds to the 'messagePosts' collection in Firestore
export interface MessagePost {
  id?: string;
  title: string;
  content: string; // This will store the rich text (e.g., HTML from React-Quill)
  categoryId: string;
  authorId: string;
  authorName?: string; // Denormalized for easier display
  authorPhotoURL?: string | null; // Denormalized
  createdAt: Timestamp; // Will be a Firestore Timestamp when fetched
  updatedAt?: Timestamp; // Optional - will be set when a post is edited
  commentCount?: number; // Add this for denormalized comment count
  // Add other fields like upvotes, likeCount later if needed
}

// Corresponds to the 'messageComments' subcollection or collection
export interface MessageComment {
  id: string;                      // Firestore document ID
  postId: string;                  // Reference to the MessagePost document ID
  authorId: string;                // UID of the comment author (was userId)
  authorName?: string;             // Denormalized author's full name or display name
  authorPhotoURL?: string | null;  // Denormalized author's photo URL
  content: string;                 // Rich text HTML content
  createdAt: Timestamp;            // Firestore Timestamp (enforced on fetch)
  updatedAt?: Timestamp;           // Firestore Timestamp (optional)
}
