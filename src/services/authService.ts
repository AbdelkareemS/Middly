import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc, getDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "../config/firebase";
import type { UserProfile, UserRole } from "../types/types";

// Sign up new user
export const signUp = async (
  email: string,
  password: string,
  role: UserRole,
  displayName: string,
  paymentDetails?: string
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update the auth display name
    await updateProfile(user, { displayName });

    // Store additional user profile data in Firestore
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email || email,
      role: role,
      displayName: displayName,
      paymentDetails: role === 'freelancer' ? (paymentDetails || '') : '',
      createdAt: Timestamp.now(),
    };

    await setDoc(doc(db, "users", user.uid), userProfile);
    return userProfile;
  } catch (error) {
    console.error("Error signing up:", error);
    throw error;
  }
};

// Log in existing user
export const logIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};

// Log out user
export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error logging out:", error);
    throw error;
  }
};

// Reset password
export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error("Error resetting password:", error);
    throw error;
  }
};

export const signInWithGooglePopup = async (): Promise<UserProfile> => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;

    const existingProfile = await getUserProfile(user.uid);
    if (existingProfile) return existingProfile;

    const newProfile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      role: 'freelancer',
      displayName: user.displayName || user.email?.split('@')[0] || 'User',
      paymentDetails: '',
      createdAt: Timestamp.now(),
    };
    await setDoc(doc(db, 'users', user.uid), newProfile);
    return newProfile;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

// Get user profile from Firestore
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
};
