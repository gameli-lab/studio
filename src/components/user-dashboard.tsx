
"use client";

import { useContext, useMemo } from 'react';
import { AuthContext } from '@/contexts/auth-context';
import { Button } from './ui/button';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { CalendarClock, Sparkles } from 'lucide-react';
import { BookingSection } from './booking-section';
import { BookingContext } from '@/contexts/booking-context';

const timeSlots = Array.from({ length: 15 }, (_, i) => {
  const hour = i + 8;
  return `${hour.toString().padStart(2, '0')}:00`;
});

export function UserDashboard() {
  const auth = useContext(AuthContext);
  const bookingContext = useContext(BookingContext);

  const nextAvailableSlot = useMemo(() => {
    if (!bookingContext) return "Loading...";

    const now = new Date();
    let currentDate = new Date(now);
    currentDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < 30; i++) { // Check for the next 30 days
        const dateString = currentDate.toISOString().split('T')[0];
        const bookingsForDay = bookingContext.bookings.filter(b => b.date === dateString && b.status !== 'Cancelled');
        
        for (const slot of timeSlots) {
            const [hour, minute] = slot.split(':').map(Number);
            const slotTime = new Date(currentDate);
            slotTime.setHours(hour, minute, 0, 0);

            if (slotTime < now) continue;

            const isBooked = bookingsForDay.some(b => b.time === slot);
            if (!isBooked) {
                const day = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : `on ${slotTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`;
                return `${day}: ${slot}`;
            }
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return "No slots available soon.";
  }, [bookingContext]);


  if (!auth?.user) {
    return null;
  }
  
  return (
    <>
      <div className="bg-primary/5 border-b">
          <div className="container mx-auto px-4 py-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div>
                      <h1 className="text-3xl font-bold font-headline">Welcome, {auth.user.name}!</h1>
                      <p className="text-muted-foreground mt-1">Ready to play? Let's get you on the pitch.</p>
                  </div>
                  <div className="flex items-center gap-4">
                      <Card className="bg-background/70 hidden sm:block">
                          <CardContent className="p-4 flex items-center gap-4">
                              <CalendarClock className="h-6 w-6 text-primary" />
                              <div>
                                  <p className="text-sm font-semibold">Next Available Slot</p>
                                  <p className="text-sm text-muted-foreground">{nextAvailableSlot}</p>
                              </div>
                          </CardContent>
                      </Card>
                      <Button asChild size="lg">
                          <Link href="#booking">
                              <Sparkles className="mr-2 h-5 w-5" />
                              Quick Book
                          </Link>
                      </Button>
                  </div>
              </div>
          </div>
      </div>
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
      <section id="my-bookings" className="py-16 md:py-24 bg-card">
          <div className="container mx-auto px-4">
               <Card className="max-w-4xl mx-auto">
                    <CardHeader>
                        <CardTitle className="text-3xl font-headline">My Recent Bookings</CardTitle>
                        <CardDescription>View your upcoming and past turf reservations.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <p className="text-muted-foreground">You have no recent bookings.</p>
                       <Button asChild className="mt-4">
                           <Link href="/my-bookings">View All Bookings</Link>
                       </Button>
                    </CardContent>
                </Card>
          </div>
      </section>
    </>
  );
}
