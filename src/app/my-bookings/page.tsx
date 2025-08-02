
"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, X, CheckCircle, RefreshCw, MessageSquare, Star } from 'lucide-react';
import { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "@/contexts/auth-context";
import { BookingContext, Booking } from "@/contexts/booking-context";
import { ReviewContext } from "@/contexts/review-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

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
    const reviewContext = useContext(ReviewContext);
    const router = useRouter();
    const { toast } = useToast();

    const [isReviewDialogOpen, setReviewDialogOpen] = useState(false);
    const [selectedBookingForReview, setSelectedBookingForReview] = useState<Booking | null>(null);
    const [rating, setRating] = useState(0);
    const [quote, setQuote] = useState("");

    useEffect(() => {
        if (!auth?.loading && !auth?.user) {
            router.push('/login');
        }
    }, [auth?.loading, auth?.user, router]);
    
    const userBookings = useMemo(() => {
        if (!auth?.user || !bookingContext?.bookings) return [];
        return bookingContext.bookings.filter(b => b.userId === auth.user?.id)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [auth?.user, bookingContext?.bookings]);

    const upcomingBookings = userBookings.filter(b => (b.status === 'Confirmed' || b.status === 'Pending' || b.status === 'Paid') && new Date(b.date) >= new Date());
    const pastBookings = userBookings.filter(b => b.status === 'Completed' || b.status === 'Cancelled' || new Date(b.date) < new Date());
    
    if (auth?.loading || !auth?.user || !bookingContext || !reviewContext) {
        return null; // Or a loading spinner
    }
    
    const handleCancel = async (bookingId: string) => {
        await bookingContext.cancelBooking(bookingId);
        toast({ title: "Booking Cancelled", description: "Your booking has been successfully cancelled."});
    }
    
    const handleReviewClick = (booking: Booking) => {
        setSelectedBookingForReview(booking);
        setRating(0);
        setQuote("");
        setReviewDialogOpen(true);
    }
    
    const handleReviewSubmit = async () => {
        if (!selectedBookingForReview || !auth.user || rating === 0 || !quote) {
            toast({ variant: 'destructive', title: 'Missing Information', description: 'Please provide a rating and a comment.' });
            return;
        }

        await reviewContext.addReview({
            userId: auth.user.id,
            bookingId: selectedBookingForReview.id,
            name: auth.user.name,
            avatar: auth.user.avatar,
            rating,
            quote,
        });
        
        // Optionally mark booking as reviewed in a future implementation
        await bookingContext.updateBooking(selectedBookingForReview.id, { status: 'Completed' });

        toast({ title: "Review Submitted!", description: "Thank you for your feedback." });
        setReviewDialogOpen(false);
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
                    {booking.status === 'Completed' && !reviewContext.hasUserReviewedBooking(auth!.user!.id, booking.id) && (
                         <Button variant="outline" size="sm" onClick={() => handleReviewClick(booking)}>
                            <MessageSquare className="mr-2 h-4 w-4"/>
                            Leave Review
                        </Button>
                    )}
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

            <Dialog open={isReviewDialogOpen} onOpenChange={setReviewDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Leave a Review</DialogTitle>
                        <DialogDescription>
                            Share your experience for your booking on {selectedBookingForReview && new Date(selectedBookingForReview.date).toLocaleDateString()}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="flex items-center gap-2">
                            <Label>Rating:</Label>
                            <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button key={star} onClick={() => setRating(star)} className="focus:outline-none">
                                        <Star className={`h-6 w-6 transition-colors ${rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 hover:text-yellow-300'}`} />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="review-text">Your Review:</Label>
                            <Textarea 
                                id="review-text"
                                value={quote}
                                onChange={(e) => setQuote(e.target.value)}
                                placeholder="How was the pitch? The service? Tell us everything!"
                                rows={4}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleReviewSubmit}>Submit Review</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
