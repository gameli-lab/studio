
"use client";

import { useContext } from 'react';
import Image from "next/image";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookingSection } from "@/components/booking-section";
import { Testimonials } from "@/components/testimonials";
import { Users, Moon, Sun, ParkingCircle } from 'lucide-react';
import { UserDashboard } from "@/components/user-dashboard";
import { AuthContext } from '@/contexts/auth-context';

const amenities = [
  { icon: <Users className="h-8 w-8 text-primary" />, text: "Spacious Spectator Area" },
  { icon: <ParkingCircle className="h-8 w-8 text-primary" />, text: "Ample Parking" },
  { icon: <Sun className="h-8 w-8 text-primary" />, text: "Day & Night Games" },
  { icon: <Moon className="h-8 w-8 text-primary" />, text: "Bright Floodlights" },
];

const galleryImages = [
  { src: "https://placehold.co/600x400.png", alt: "Astro turf view from the side", hint: "astro turf" },
  { src: "https://placehold.co/600x400.png", alt: "Astro turf view from the goal post", hint: "football field" },
  { src: "https://placehold.co/600x400.png", alt: "Players on the astro turf", hint: "soccer players" },
  { src: "https://placehold.co/600x400.png", alt: "Astro turf under floodlights at night", hint: "stadium lights" },
];

function LandingPage() {
  return (
    <>
      <section id="home" className="container mx-auto px-4 pt-16 md:pt-24 text-center">
        <Badge variant="outline" className="mb-4 text-primary border-primary">Welcome to Adeiso</Badge>
        <h1 className="text-5xl md:text-6xl font-headline font-bold mb-4">Adeiso Astro Turf</h1>
        <p className="text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground mb-8">
          Experience football like never before on our state-of-the-art turf. Perfect for competitive matches, friendly kickabouts, and community events.
        </p>
      </section>

      <section id="about" className="container mx-auto px-4 pb-16 md:pb-24">
        <h2 className="text-4xl font-headline font-bold text-center mb-12">Our World-Class Amenities</h2>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {amenities.map((item, index) => (
            <div key={index} className="flex flex-col items-center gap-4 p-4 rounded-lg transition-transform transform hover:scale-105">
              {item.icon}
              <p className="font-semibold">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="gallery" className="bg-card py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-headline font-bold text-center mb-12">Gallery</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {galleryImages.map((image, index) => (
              <div key={index} className="overflow-hidden rounded-lg shadow-lg group">
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={600}
                  height={400}
                  className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-110"
                  data-ai-hint={image.hint}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <Testimonials />

      <section id="booking" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-headline font-bold text-center mb-12">Book Your Slot</h2>
          <Card className="max-w-6xl mx-auto shadow-2xl overflow-hidden">
            <CardContent className="p-0">
              <BookingSection />
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  )
}

export default function Home() {
  const auth = useContext(AuthContext);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow">
        { auth?.user && auth.user.role !== 'admin' ? <UserDashboard /> : <LandingPage /> }
      </main>
      <Footer />
    </div>
  );
}
