import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '../config/firebase';
import { getUserProfile, signUp, logIn, logOut, resetPassword, signInWithGooglePopup } from '../services/authService';
import type { UserProfile } from '../types/types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signup: typeof signUp;
  login: typeof logIn;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  loginWithGoogle: () => Promise<UserProfile>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userProfile: null,
  loading: true,
  signup: async () => { throw new Error("AuthContext not initialized"); },
  login: async () => { throw new Error("AuthContext not initialized"); },
  logout: async () => {},
  resetPassword: async () => {},
  loginWithGoogle: async () => { throw new Error("AuthContext not initialized"); },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
        } catch (error) {
          console.error("Error fetching user profile", error);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleSignup = async (...args: Parameters<typeof signUp>) => {
    const profile = await signUp(...args);
    setUserProfile(profile);
    return profile;
  };

  const handleLogin = async (email: string, password: string) => {
    const user = await logIn(email, password);
    const profile = await getUserProfile(user.uid);
    setUserProfile(profile);
    setCurrentUser(user);
    return user;
  };

  const handleGoogleLogin = async () => {
    const profile = await signInWithGooglePopup();
    setUserProfile(profile);
    return profile;
  };

  const handleLogout = async () => {
    await logOut();
    setUserProfile(null);
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    userProfile,
    loading,
    signup: handleSignup,
    login: handleLogin,
    logout: handleLogout,
    resetPassword,
    loginWithGoogle: handleGoogleLogin,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
