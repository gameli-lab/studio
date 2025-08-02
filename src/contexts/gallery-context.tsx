
"use client";

import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';

export type GalleryImage = {
  id?: string;
  src: string;
  alt: string;
  hint: string;
  storagePath?: string; // Path to the file in Firebase Storage
  createdAt?: any;
};

interface GalleryContextType {
  images: GalleryImage[];
  addImage: (image: Omit<GalleryImage, 'id' | 'createdAt'>) => Promise<void>;
  deleteImage: (imageId: string) => Promise<void>;
}

export const GalleryContext = createContext<GalleryContextType | null>(null);

const galleryCollection = collection(db, 'gallery');

export const GalleryProvider = ({ children }: { children: ReactNode }) => {
  const [images, setImages] = useState<GalleryImage[]>([]);

  useEffect(() => {
    const q = query(galleryCollection, orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const imagesData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as GalleryImage));
      setImages(imagesData);
    });
    return () => unsubscribe();
  }, []);

  const addImage = async (newImage: Omit<GalleryImage, 'id' | 'createdAt'>) => {
    const imageToAdd = {
      ...newImage,
      createdAt: serverTimestamp(),
    };
    await addDoc(galleryCollection, imageToAdd);
  };

  const deleteImage = async (imageId: string) => {
    const imageRef = doc(db, 'gallery', imageId);
    await deleteDoc(imageRef);
  };

  const value = { images, addImage, deleteImage };

  return (
    <GalleryContext.Provider value={value}>
      {children}
    </GalleryContext.Provider>
  );
};
