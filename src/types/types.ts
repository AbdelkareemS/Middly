import { Timestamp } from "firebase/firestore";

// User roles
export type UserRole = 'freelancer' | 'client';

// Firestore 'users' collection document
export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  displayName: string;
  paymentDetails: string; // freelancer-only, empty string for clients
  createdAt: Timestamp | Date; // Allow Date for local usage before upload
}

// Project status lifecycle
export type ProjectStatus = 'pending_preview' | 'receipt_uploaded' | 'approved' | 'completed';

// Supported file types
export type FileType = 'image' | 'video' | 'pdf' | 'excel' | 'word';

// Firestore 'projects' collection document
export interface Project {
  projectId: string;
  freelancerId: string;
  clientId: string;        // empty string until shared
  title: string;
  price: number;
  status: ProjectStatus;
  fileType: FileType;
  fileS3Key: string;
  receiptImageUrl: string; // empty until client uploads
  accessToken: string;
  clientEmail: string;
  paymentInstructions: string;
  createdAt: Timestamp | Date;
}
