"use client";

import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  
} from "react";
import {
  User,
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  updateProfile,
  UserCredential,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

interface AuthContextProps {
  currentUser: User | null;
  updateUserProfile: (profile: {
    displayName: string;
    photoURL: string;
    bio: string;
  }) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<UserCredential>;
  showAuthModal: boolean;
  setShowAuthModal: (value: boolean) => void;
  logout: () => Promise<void>;
  user: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        const enrichedUser = userSnap.exists()
          ? {
              ...user,
              displayName: userSnap.data().displayName || user.displayName,
              photoURL: userSnap.data().photoURL || user.photoURL,
            }
          : user;

        setCurrentUser(enrichedUser);
        localStorage.setItem("currentUser", JSON.stringify(enrichedUser));
      } else {
        setCurrentUser(null);
        localStorage.removeItem("currentUser");
      }
    });

    return () => unsubscribe();
  }, []);

  const updateUserProfile = async (profile: {
    displayName: string;
    photoURL: string;
    bio: string;
  }) => {
    if (currentUser) {
      await updateProfile(currentUser, {
        displayName: profile.displayName,
        photoURL: profile.photoURL,
      });
    }
  };

  const login = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    setCurrentUser(user);
    localStorage.setItem("currentUser", JSON.stringify(user));
  };

  const register = async (
    email: string,
    password: string,
    displayName: string
  ): Promise<UserCredential> => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    await updateProfile(userCredential.user, { displayName });
    return userCredential;
  };

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
  };

  const user = (user: User | null) => {
    setCurrentUser(user);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        updateUserProfile,
        login,
        register,
        logout,
        showAuthModal,
        setShowAuthModal,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
