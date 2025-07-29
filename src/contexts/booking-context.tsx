"use client";

import React, { createContext, useState, ReactNode, useContext } from 'react';

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
};

interface BookingContextType {
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, 'id' | 'amount' | 'status'>) => void;
  updateBooking: (booking: Booking) => void;
  cancelBooking: (bookingId: string) => void;
}

export const BookingContext = createContext<BookingContextType | null>(null);

const initialBookings: Booking[] = [];

export const BookingProvider = ({ children }: { children: ReactNode }) => {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);

  const calculateAmount = (time: string, duration: number) => {
    const baseRate = 100;
    let afterHoursFee = 0;
    const hour = parseInt(time.split(':')[0], 10);
    if (hour >= 18) {
      afterHoursFee = 50;
    }
    return (baseRate * duration) + (afterHoursFee * duration);
  };

  const addBooking = (newBooking: Omit<Booking, 'id' | 'amount' | 'status'>) => {
    const bookingToAdd: Booking = {
      ...newBooking,
      id: `booking-${Date.now()}`,
      amount: calculateAmount(newBooking.time, newBooking.duration),
      status: 'Pending', // All new bookings are initially pending
    };
    setBookings(prevBookings => [...prevBookings, bookingToAdd]);
  };

  const updateBooking = (updatedBooking: Booking) => {
    setBookings(prevBookings =>
      prevBookings.map(b => (b.id === updatedBooking.id ? updatedBooking : b))
    );
  };
  
  const cancelBooking = (bookingId: string) => {
     setBookings(prevBookings =>
      prevBookings.map(b => (b.id === bookingId ? { ...b, status: 'Cancelled' } : b))
    );
  }

  const value = { bookings, addBooking, updateBooking, cancelBooking };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};
