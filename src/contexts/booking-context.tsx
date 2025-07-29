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

const initialBookings: Booking[] = [
    { id: '1', name: 'Kwame Appiah', date: '2024-08-15', time: '18:00', duration: 1, status: 'Paid', amount: 150 },
    { id: '2', name: 'Adwoa Mensah', date: '2024-08-15', time: '19:00', duration: 2, status: 'Paid', amount: 300 },
    { id: '3', name: 'Yaw Boakye', date: '2024-08-16', time: '10:00', duration: 1, status: 'Pending', amount: 100 },
    { id: '4', name: 'Esi Williams', date: '2024-08-16', time: '17:00', duration: 1, status: 'Cancelled', amount: 100 },
    { id: '5', name: 'Femi Adebayo', date: '2024-08-17', time: '16:00', duration: 1, status: 'Unpaid', amount: 100 },
    { id: '6', name: 'Ngozi Eze', date: '2024-08-17', time: '20:00', duration: 1, status: 'Paid', amount: 150 },
];

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
