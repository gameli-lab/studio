
"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, X, CheckCircle, RefreshCw } from 'lucide-react';
import { useContext, useEffect, useMemo } from "react";
import { AuthContext } from "@/contexts/auth-context";
import { BookingContext, Booking } from "@/contexts/booking-context";
import { useRouter } from "next/navigation";
import Link from "next/link";


const getStatusVariant = (status: Booking['status']) => {
    switch (status) {
        case 'Confirmed':
        case 'Paid':
            return 'default';
        case 'Completed':
            return 'secondary';
        case 'Cancelled':
            return 'destructive';
        case 'Pending':
        case 'Unpaid':
            return 'outline';
        default:
            return 'secondary';
    }
}


export default function MyBookingsPage() {
    const auth = useContext(AuthContext);
    const bookingContext = useContext(BookingContext);
    const router = useRouter();

    useEffect(() => {
        if (!auth?.loading && !auth?.user) {
            router.push('/login');
        }
    }, [auth?.loading, auth?.user, router]);
    
    const userBookings = useMemo(() => {
        if (!auth?.user || !bookingContext?.bookings) return [];
        return bookingContext.bookings.filter(b => b.userId === auth.user?.id);
    }, [auth?.user, bookingContext?.bookings]);

    const upcomingBookings = userBookings.filter(b => (b.status === 'Confirmed' || b.status === 'Pending' || b.status === 'Paid') && new Date(b.date) >= new Date());
    const pastBookings = userBookings.filter(b => b.status === 'Completed' || b.status === 'Cancelled' || new Date(b.date) < new Date());
    
    if (auth?.loading || !auth?.user || !bookingContext) {
        return null; // Or a loading spinner
    }
    
    const handleCancel = async (bookingId: string) => {
        if (bookingContext) {
            await bookingContext.cancelBooking(bookingId);
        }
    }

    const BookingCard = ({ booking }: { booking: Booking }) => (
        <Card>
            <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex-grow">
                    <div className="flex items-center gap-4 mb-2">
                        <Badge variant={getStatusVariant(booking.status)}>{booking.status}</Badge>
                        <p className="text-sm text-muted-foreground">ID: #{booking.id.substring(0, 6)}</p>
                    </div>
                    <div className="flex items-center gap-2 font-semibold">
                         <Calendar className="h-4 w-4" />
                         <span>{new Date(booking.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{booking.time} for {booking.duration} hour(s)</span>
                    </div>
                </div>
                <div className="flex gap-2 self-end sm:self-center">
                    {(booking.status === 'Confirmed' || booking.status === 'Pending' || booking.status === 'Paid') && (
                        <>
                            <Button variant="outline" size="sm" disabled>
                                <RefreshCw className="mr-2 h-4 w-4"/>
                                Reschedule
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleCancel(booking.id)}>
                                <X className="mr-2 h-4 w-4"/>
                                Cancel
                            </Button>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
                <Card className="max-w-4xl mx-auto">
                    <CardHeader>
                        <CardTitle className="text-3xl font-headline">My Bookings</CardTitle>
                        <CardDescription>View your upcoming and past turf reservations.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="upcoming">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                                <TabsTrigger value="past">History</TabsTrigger>
                            </TabsList>
                            <TabsContent value="upcoming">
                                <div className="space-y-4 pt-4">
                                    {upcomingBookings.length > 0 ? (
                                        upcomingBookings.map(b => <BookingCard key={b.id} booking={b} />)
                                    ) : (
                                        <div className="text-center text-muted-foreground py-12">
                                            <CheckCircle className="mx-auto h-12 w-12 mb-4" />
                                            <h3 className="text-xl font-semibold">No upcoming bookings</h3>
                                            <p>Ready for a match? Book your next game now!</p>
                                            <Button asChild className="mt-4">
                                                <Link href="/#booking">Book a Slot</Link>
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>
                            <TabsContent value="past">
                                <div className="space-y-4 pt-4">
                                    {pastBookings.length > 0 ? (
                                        pastBookings.map(b => <BookingCard key={b.id} booking={b} />)
                                    ) : (
                                        <p className="text-center text-muted-foreground py-12">No past bookings yet.</p>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </main>
            <Footer />
        </div>
    );
}
