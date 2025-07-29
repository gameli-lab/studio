
"use client";

import React, { createContext, useState, ReactNode, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
}

interface UserContextType {
  users: User[];
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  deleteUser: (userId: string) => void;
}

export const UserContext = createContext<UserContextType | null>(null);


const initialUsers: User[] = [
    { id: 'admin01', name: 'Admin User', email: 'admin@astrobook.com', role: 'admin', avatar: 'https://placehold.co/100x100.png?text=A' },
    { id: 'user01', name: 'Normal User', email: 'user@astrobook.com', role: 'user', avatar: 'https://placehold.co/100x100.png?text=N' },
];

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem('astrobook-users');
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      } else {
        // If no users in storage, initialize with default
        setUsers(initialUsers);
        localStorage.setItem('astrobook-users', JSON.stringify(initialUsers));
      }
    } catch (error) {
      console.error("Failed to parse users from localStorage", error);
      // Fallback to initial users if storage is corrupt
      setUsers(initialUsers);
      localStorage.setItem('astrobook-users', JSON.stringify(initialUsers));
    }
  }, []);

  const persistUsers = (updatedUsers: User[]) => {
    localStorage.setItem('astrobook-users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
  };

  const addUser = (newUser: User) => {
    setUsers(prevUsers => {
      // Avoid adding duplicate users on login
      if (prevUsers.some(u => u.id === newUser.id)) {
        return prevUsers;
      }
      const updatedUsers = [...prevUsers, newUser];
      persistUsers(updatedUsers);
      return updatedUsers;
    });
  };

  const updateUser = (updatedUser: User) => {
    const updatedUsers = users.map(u => (u.id === updatedUser.id ? updatedUser : u));
    persistUsers(updatedUsers);
  };

  const deleteUser = (userId: string) => {
    const updatedUsers = users.filter(u => u.id !== userId);
    persistUsers(updatedUsers);
  };

  const value = { users, addUser, updateUser, deleteUser };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
