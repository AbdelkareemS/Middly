import { collection, query, where, getDocs } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "../config/firebase";
import type { FileType } from "../types/types";

// ─── Active Project Count (Frontend UX check) ────────────────────────

/** Count active (non-completed) projects for a freelancer. */
export const getActiveProjectCount = async (freelancerId: string): Promise<number> => {
  try {
    const projectsRef = collection(db, "projects");
    const q = query(
      projectsRef,
      where("freelancerId", "==", freelancerId),
      where("status", "!=", "completed")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error("Error getting active project count:", error);
    throw error;
  }
};

/** Frontend convenience check — true if freelancer can create a project. */
export const canCreateProject = async (freelancerId: string): Promise<boolean> => {
  const count = await getActiveProjectCount(freelancerId);
  return count < 10;
};

// ─── Cloud Function Callers ──────────────────────────────────────────

// --- createProject ---
export interface CreateProjectParams {
  title: string;
  price: number;
  fileType: FileType;
  fileS3Key: string;
  clientEmail: string;
  paymentInstructions: string;
}

export const createProject = async (
  params: CreateProjectParams
): Promise<{ projectId: string; accessToken: string }> => {
  const callable = httpsCallable<CreateProjectParams, { projectId: string; accessToken: string }>(
    functions,
    "createProject"
  );
  const result = await callable(params);
  return result.data;
};

// --- generateUploadUrl ---
export interface GenerateUploadUrlParams {
  fileName: string;
  contentType: string;
}

export interface GenerateUploadUrlResult {
  uploadUrl: string;
  fileS3Key: string;
  maxFileSizeBytes: number;
}

export const generateUploadUrl = async (
  params: GenerateUploadUrlParams
): Promise<GenerateUploadUrlResult> => {
  const callable = httpsCallable<GenerateUploadUrlParams, GenerateUploadUrlResult>(
    functions,
    "generateUploadUrl"
  );
  const result = await callable(params);
  return result.data;
};

// --- getPreviewLink (Auth-gated) ---
export interface GetPreviewLinkResult {
  previewUrl: string;
  fileType: string;
  title: string;
}

export const getPreviewLink = async (
  projectId: string
): Promise<GetPreviewLinkResult> => {
  const callable = httpsCallable<{ projectId: string }, GetPreviewLinkResult>(
    functions,
    "getPreviewLink"
  );
  const result = await callable({ projectId });
  return result.data;
};

// --- getDownloadLink (Auth-gated) ---
export interface GetDownloadLinkResult {
  downloadUrl: string;
}

export const getDownloadLink = async (
  projectId: string
): Promise<GetDownloadLinkResult> => {
  const callable = httpsCallable<{ projectId: string }, GetDownloadLinkResult>(
    functions,
    "getDownloadLink"
  );
  const result = await callable({ projectId });
  return result.data;
};

// --- deleteProject (calls deleteS3ProjectAsset Cloud Function) ---
export const deleteProject = async (
  projectId: string
): Promise<{ success: boolean }> => {
  const callable = httpsCallable<{ projectId: string }, { success: boolean }>(
    functions,
    "deleteS3ProjectAsset"
  );
  const result = await callable({ projectId });
  return result.data;
};

// ─── Guest Callers (Unauthenticated) ───────────────────────────────

export interface GuestPreviewResult {
  previewUrl: string;
  fileType: string;
  title: string;
  price: number;
  status: string;
  paymentInstructions: string;
  clientEmail: string;
}

export const getGuestPreview = async (
  projectId: string,
  token: string
): Promise<GuestPreviewResult> => {
  const callable = httpsCallable<{ projectId: string; token: string }, GuestPreviewResult>(
    functions,
    "getGuestPreview"
  );
  const result = await callable({ projectId, token });
  return result.data;
};

export const getGuestDownload = async (
  projectId: string,
  token: string
): Promise<{ downloadUrl: string }> => {
  const callable = httpsCallable<{ projectId: string; token: string }, { downloadUrl: string }>(
    functions,
    "getGuestDownload"
  );
  const result = await callable({ projectId, token });
  return result.data;
};

export const submitReceipt = async (
  projectId: string,
  token: string,
  base64Image: string
): Promise<{ success: boolean; receiptImageUrl: string }> => {
  const callable = httpsCallable<
    { projectId: string; token: string; base64Image: string },
    { success: boolean; receiptImageUrl: string }
  >(functions, "submitReceipt");
  const result = await callable({ projectId, token, base64Image });
  return result.data;
};

// ─── Freelancer Helpers (Direct Firestore) ─────────────────────────

import { doc, updateDoc } from "firebase/firestore";
import type { Project, ProjectStatus } from "../types/types";

export const getFreelancerProjects = async (freelancerId: string): Promise<Project[]> => {
  try {
    const projectsRef = collection(db, "projects");
    const q = query(
      projectsRef,
      where("freelancerId", "==", freelancerId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Project).sort((a, b) => {
      // Sort by creation date descending
      const dateA = a.createdAt && 'toMillis' in a.createdAt ? a.createdAt.toMillis() : Date.now();
      const dateB = b.createdAt && 'toMillis' in b.createdAt ? b.createdAt.toMillis() : Date.now();
      return dateB - dateA;
    });
  } catch (error) {
    console.error("Error getting freelancer projects:", error);
    throw error;
  }
};

export const updateProjectStatus = async (projectId: string, status: ProjectStatus): Promise<void> => {
  try {
    const projectRef = doc(db, "projects", projectId);
    await updateDoc(projectRef, { status });
  } catch (error) {
    console.error("Error updating project status:", error);
    throw error;
  }
};
