
"use client";

import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { useRouter } from 'next/navigation';
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
  login: (user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const userContext = useContext(UserContext);

  useEffect(() => {
    // Try to load user from localStorage on initial load
    try {
      const storedUser = localStorage.getItem('astrobook-user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('astrobook-user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (userData: User) => {
    const userWithAvatar = {
        ...userData,
        avatar: userData.avatar || `https://placehold.co/100x100.png?text=${userData.name.charAt(0)}`
    }
    localStorage.setItem('astrobook-user', JSON.stringify(userWithAvatar));
    setUser(userWithAvatar);
    if (userContext) {
      userContext.addUser(userWithAvatar);
    }
    router.push('/');
  };

  const logout = () => {
    localStorage.removeItem('astrobook-user');
    setUser(null);
    router.push('/');
  };

  const updateUser = (userData: User) => {
    localStorage.setItem('astrobook-user', JSON.stringify(userData));
    setUser(userData);
     if (userContext) {
      userContext.updateUser(userData);
    }
  };

  const value = { user, login, logout, updateUser, loading };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
