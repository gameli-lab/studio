
"use client";

import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, query, orderBy } from 'firebase/firestore';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
  createdAt?: any;
}

interface UserContextType {
  users: User[];
  addUser: (user: User) => Promise<void>;
  updateUser: (userId: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
}

export const UserContext = createContext<UserContextType | null>(null);

const usersCollection = collection(db, 'users');

const initialAdmin: User = { 
    id: 'admin01', 
    name: 'Admin User', 
    email: 'admin@astrobook.com', 
    role: 'admin', 
    avatar: 'https://placehold.co/100x100.png?text=A' 
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const q = query(usersCollection, orderBy('name'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as User));
      
      // Ensure the initial admin user exists in Firestore
      const adminExists = usersData.some(u => u.email === initialAdmin.email);
      if (!adminExists) {
        // In a real app, this would be a secure setup script.
        // For this demo, we ensure the admin user is always there.
        // This is not a secure way to manage admins.
        const adminRef = doc(db, 'users', initialAdmin.id);
        setDoc(adminRef, initialAdmin, { merge: true });
      }

      setUsers(usersData);
    });
    return () => unsubscribe();
  }, []);

  const addUser = async (newUser: User) => {
    const userRef = doc(db, 'users', newUser.id);
    await setDoc(userRef, newUser, { merge: true });
  };

  const updateUser = async (userId: string, updates: Partial<User>) => {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, updates, { merge: true });
  };

  const deleteUser = async (userId: string) => {
    const userRef = doc(db, 'users', userId);
    await deleteDoc(userRef);
  };

  const value = { users, addUser, updateUser, deleteUser };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
