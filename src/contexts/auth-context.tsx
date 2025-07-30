
"use client";

import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { 
    onAuthStateChanged, 
    signOut,
    User as FirebaseUser,
    GoogleAuthProvider,
    signInWithPopup,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { UserContext } from './user-context';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email:string, password:string) => Promise<any>;
  signupWithEmail: (name: string, email:string, password:string) => Promise<any>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

const googleProvider = new GoogleAuthProvider();

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const userContext = useContext(UserContext);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
            setFirebaseUser(firebaseUser);
            const userRef = doc(db, 'users', firebaseUser.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const userData = userSnap.data() as User;
                setUser(userData);
                 if (userData.role === 'admin' && (router.pathname === '/login' || router.pathname === '/signup' || router.pathname === '/')) {
                    router.push('/admin/dashboard');
                }
            } else {
                // This case handles new sign-ups (e.g. via Google), creating a user doc.
                const newUser: User = {
                    id: firebaseUser.uid,
                    name: firebaseUser.displayName || 'New User',
                    email: firebaseUser.email || '',
                    role: firebaseUser.email === 'admin@astrobook.com' ? 'admin' : 'user', // Check for admin email
                    avatar: firebaseUser.photoURL || `https://placehold.co/100x100.png?text=${(firebaseUser.displayName || 'U').charAt(0)}`
                };
                await setDoc(userRef, { ...newUser, createdAt: serverTimestamp() });
                setUser(newUser);
                 if (newUser.role === 'admin') {
                    router.push('/admin/dashboard');
                }
            }
        } else {
            setFirebaseUser(null);
            setUser(null);
        }
        setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const loginWithGoogle = async () => {
      try {
        await signInWithPopup(auth, googleProvider);
        // onAuthStateChanged will handle the rest
      } catch (error) {
        console.error("Google sign-in error", error);
      }
  };
  
  const loginWithEmail = async (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  }
  
  const signupWithEmail = async (name: string, email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    const newUser: User = {
        id: firebaseUser.uid,
        name: name,
        email: email,
        role: email === 'admin@astrobook.com' ? 'admin' : 'user',
        avatar: `https://placehold.co/100x100.png?text=${name.charAt(0)}`
    };
    await setDoc(doc(db, 'users', firebaseUser.uid), { ...newUser, createdAt: serverTimestamp() });
    setUser(newUser);
    return userCredential;
  }

  const logout = async () => {
    await signOut(auth);
    router.push('/');
  };

  const updateUser = async (userData: Partial<User>) => {
    if (user) {
        const userRef = doc(db, 'users', user.id);
        await setDoc(userRef, userData, { merge: true });
        setUser(prevUser => prevUser ? { ...prevUser, ...userData } : null);
    }
  };

  const value = { user, firebaseUser, loginWithGoogle, loginWithEmail, signupWithEmail, logout, updateUser, loading };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
