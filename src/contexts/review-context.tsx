
"use client";

import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, serverTimestamp, query, orderBy, where, limit, getDocs } from 'firebase/firestore';

export type Review = {
  id?: string;
  userId: string;
  bookingId: string;
  name: string;
  avatar?: string;
  rating: number;
  quote: string;
  createdAt: any;
};

type NewReview = Omit<Review, 'id' | 'createdAt'>;

interface ReviewContextType {
  reviews: Review[];
  addReview: (review: NewReview) => Promise<void>;
  getReviewsForLanding: () => Promise<Review[]>;
  hasUserReviewedBooking: (userId: string, bookingId: string) => boolean;
}

export const ReviewContext = createContext<ReviewContextType | null>(null);

const reviewsCollection = collection(db, 'reviews');

export const ReviewProvider = ({ children }: { children: ReactNode }) => {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const q = query(reviewsCollection, orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reviewsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Review));
      setReviews(reviewsData);
    });
    return () => unsubscribe();
  }, []);

  const addReview = async (newReview: NewReview) => {
    const reviewToAdd = {
      ...newReview,
      createdAt: serverTimestamp(),
    };
    await addDoc(reviewsCollection, reviewToAdd);
  };
  
  const hasUserReviewedBooking = (userId: string, bookingId: string) => {
      return reviews.some(review => review.userId === userId && review.bookingId === bookingId);
  }

  const getReviewsForLanding = async () => {
    // Fetch all reviews and filter/sort in code to avoid composite index requirement.
    // This is acceptable for a reasonable number of reviews.
    const q = query(reviewsCollection, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const allReviews = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Review));
    
    const filteredAndSortedReviews = allReviews
      .filter(r => r.rating >= 4)
      .sort((a, b) => b.rating - a.rating) // Sort by rating descending first
      .slice(0, 2); // Then take the top 2

    return filteredAndSortedReviews;
  }

  const value = { reviews, addReview, getReviewsForLanding, hasUserReviewedBooking };

  return (
    <ReviewContext.Provider value={value}>
      {children}
    </ReviewContext.Provider>
  );
};
