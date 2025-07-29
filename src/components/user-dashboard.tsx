
"use client";

import { useContext } from 'react';
import { AuthContext } from '@/contexts/auth-context';
import { Button } from './ui/button';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { CalendarClock, Sparkles } from 'lucide-react';
import { BookingSection } from './booking-section';

export function UserDashboard() {
  const auth = useContext(AuthContext);

  if (!auth?.user) {
    return null;
  }
  
  const nextAvailableSlot = "Today: 4:00 PM - 5:00 PM";

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
