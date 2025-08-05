
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
    const defaultImage = { id: 'default-1', src: "https://storage.googleapis.com/stedi-assets/astro-turf-1.jpg", alt: "Astro turf view from the side", hint: "astro turf" };
    if (!galleryContext?.images || galleryContext.images.length === 0) {
        return [
            defaultImage,
            { id: '2', src: "https://placehold.co/600x400.png", alt: "Astro turf view from the goal post", hint: "football field" },
            { id: '3', src: "https://placehold.co/600x400.png", alt: "Players on the astro turf", hint: "soccer players" },
            { id: '4', src: "https://placehold.co/600x400.png", alt: "Astro turf under floodlights at night", hint: "stadium lights" },
        ];
    }
    // If there are user uploaded images, use them. Prepend the default image if it's not there.
    const hasDefaultImage = galleryContext.images.some(img => img.src === defaultImage.src);
    const allImages = hasDefaultImage ? [...galleryContext.images] : [defaultImage, ...galleryContext.images];
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
            <CardContent className="p-0">
              {todayBookings.length > 0 ? (
                <div className='divide-y'>
                  {todayBookings.map(booking => (
                      <div key={booking.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 items-center">
                          <div className='md:col-span-1'>
                             {booking.flyerUrl ? (
                                <Image 
                                    src={booking.flyerUrl} 
                                    alt={`${booking.name} flyer`} 
                                    width={200}
                                    height={200}
                                    className="rounded-lg object-cover w-full aspect-square"
                                    data-ai-hint="event flyer"
                                />
                             ) : (
                                <div className='aspect-square bg-muted rounded-lg flex items-center justify-center'>
                                  <Calendar className="h-16 w-16 text-muted-foreground" />
                                </div>
                             )}
                          </div>
                          <div className='md:col-span-2'>
                              <div className="font-medium flex items-center gap-2 mb-2">
                                  <Clock className="h-4 w-4" /> 
                                  <span>{booking.time} for {booking.duration} hour(s)</span>
                              </div>
                              <h3 className="font-bold text-xl mb-1">{booking.name}</h3>
                              <p className="text-muted-foreground">{booking.description || 'A private event is scheduled at this time.'}</p>
                          </div>
                      </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-16">
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
            {galleryImages.slice(0, 4).map((image, index) => (
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
