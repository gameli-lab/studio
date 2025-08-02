
"use client";

import { useContext, useMemo } from 'react';
import Image from "next/image";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookingSection } from "@/components/booking-section";
import { Testimonials } from "@/components/testimonials";
import { Users, Moon, Sun, ParkingCircle, Calendar, Clock } from 'lucide-react';
import { UserDashboard } from "@/components/user-dashboard";
import { AuthContext } from '@/contexts/auth-context';
import { GalleryContext } from '@/contexts/gallery-context';
import { BookingContext } from '@/contexts/booking-context';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";


const amenities = [
  { icon: <Users className="h-8 w-8 text-primary" />, text: "Spacious Spectator Area" },
  { icon: <ParkingCircle className="h-8 w-8 text-primary" />, text: "Ample Parking" },
  { icon: <Sun className="h-8 w-8 text-primary" />, text: "Day & Night Games" },
  { icon: <Moon className="h-8 w-8 text-primary" />, text: "Bright Floodlights" },
];

function LandingPage() {
  const galleryContext = useContext(GalleryContext);
  const bookingContext = useContext(BookingContext);

  const todayBookings = useMemo(() => {
    if (!bookingContext?.bookings) return [];
    const today = new Date().toISOString().split('T')[0];
    return bookingContext.bookings
      .filter(b => b.date === today && (b.status === 'Paid' || b.status === 'Confirmed'))
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [bookingContext?.bookings]);

  const galleryImages = useMemo(() => {
    if (!galleryContext?.images) return [
      { id: '1', src: "https://storage.googleapis.com/stedi-assets/astro-turf-1.jpg", alt: "Astro turf view from the side", hint: "astro turf" },
      { id: '2', src: "https://placehold.co/600x400.png", alt: "Astro turf view from the goal post", hint: "football field" },
      { id: '3', src: "https://placehold.co/600x400.png", alt: "Players on the astro turf", hint: "soccer players" },
      { id: '4', src: "https://placehold.co/600x400.png", alt: "Astro turf under floodlights at night", hint: "stadium lights" },
    ];
    // Add the user provided image as the first image if it's not already there
    const userImage = { id: 'user-provided', src: "https://storage.googleapis.com/stedi-assets/astro-turf-1.jpg", alt: "Astro turf with palm trees", hint: "astro turf" };
    const allImages = [userImage, ...galleryContext.images.filter(img => img.src !== userImage.src)];
    return allImages;
  }, [galleryContext?.images]);


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

      <section id="events" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-headline font-bold text-center mb-12">Today's Events</h2>
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-6">
              {todayBookings.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Event/Booking</TableHead>
                       <TableHead>Duration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {todayBookings.map(booking => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium flex items-center gap-2"><Clock className="h-4 w-4" /> {booking.time}</TableCell>
                        <TableCell>{booking.name}</TableCell>
                        <TableCell>{booking.duration} hour(s)</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center text-muted-foreground py-12">
                  <Calendar className="mx-auto h-12 w-12 mb-4" />
                  <h3 className="text-xl font-semibold">No Scheduled Events Today</h3>
                  <p>The pitch is free! Why not book a slot for a game?</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="gallery" className="bg-card py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-headline font-bold text-center mb-12">Gallery</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {galleryImages.map((image, index) => (
              <div key={image.id || index} className="overflow-hidden rounded-lg shadow-lg group">
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
