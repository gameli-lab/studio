
"use client";

import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';

export type Booking = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  date: string;
  time: string;
  duration: number;
  status: 'Paid' | 'Unpaid' | 'Pending' | 'Cancelled' | 'Confirmed' | 'Completed';
  amount: number;
  userId: string;
  createdAt: any;
};

type NewBooking = Omit<Booking, 'id' | 'amount' | 'status' | 'createdAt'>;

interface BookingContextType {
  bookings: Booking[];
  addBooking: (booking: NewBooking) => Promise<void>;
  updateBooking: (bookingId: string, updates: Partial<Booking>) => Promise<void>;
  cancelBooking: (bookingId: string) => Promise<void>;
}

export const BookingContext = createContext<BookingContextType | null>(null);

const bookingsCollection = collection(db, 'bookings');

export const BookingProvider = ({ children }: { children: ReactNode }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const q = query(bookingsCollection, orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bookingsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Booking));
      setBookings(bookingsData);
    });
    return () => unsubscribe();
  }, []);

  const calculateAmount = (time: string, duration: number) => {
    const baseRate = 100;
    let afterHoursFee = 0;
    const hour = parseInt(time.split(':')[0], 10);
    if (hour >= 18) {
      afterHoursFee = 50;
    }
    return (baseRate * duration) + (afterHoursFee * duration);
  };

  const addBooking = async (newBooking: NewBooking) => {
    const bookingToAdd = {
      ...newBooking,
      amount: calculateAmount(newBooking.time, newBooking.duration),
      status: 'Pending' as const, // All new bookings are initially pending
      createdAt: serverTimestamp(),
    };
    await addDoc(bookingsCollection, bookingToAdd);
  };

  const updateBooking = async (bookingId: string, updates: Partial<Booking>) => {
    const bookingRef = doc(db, 'bookings', bookingId);
    await updateDoc(bookingRef, updates);
  };
  
  const cancelBooking = async (bookingId: string) => {
    await updateBooking(bookingId, { status: 'Cancelled' });
  }

  const value = { bookings, addBooking, updateBooking, cancelBooking };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};
