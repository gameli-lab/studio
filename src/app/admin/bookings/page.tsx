"use client";

import { useState, useMemo, useEffect, useContext } from 'react';
import { AuthContext } from '@/contexts/auth-context';
import { BookingContext, Booking } from '@/contexts/booking-context';
import { useRouter } from 'next/navigation';
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { PlusCircle, MoreHorizontal, Search, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';

export default function AdminBookingsPage() {
    const auth = useContext(AuthContext);
    const bookingContext = useContext(BookingContext);
    const router = useRouter();
    const { toast } = useToast();

    const [date, setDate] = useState<Date | undefined>(undefined);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setEditDialogOpen] = useState(false);
    const [isCancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    useEffect(() => {
        if (!auth.loading && auth.user?.role !== 'admin') {
            router.push('/');
        }
    }, [auth.loading, auth.user, router]);
    
    const filteredBookings = useMemo(() => {
        if (!bookingContext?.bookings) return [];
        return bookingContext.bookings.filter(booking => {
            const matchesSearch = booking.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || booking.status.toLowerCase() === statusFilter;
            const matchesDate = !date || new Date(booking.date).toDateString() === date.toDateString();
            return matchesSearch && matchesStatus && matchesDate;
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [bookingContext?.bookings, searchTerm, statusFilter, date]);

    const handleEditClick = (booking: Booking) => {
        setSelectedBooking(booking);
        setEditDialogOpen(true);
    };

    const handleCancelClick = (booking: Booking) => {
        setSelectedBooking(booking);
        setCancelDialogOpen(true);
    };

    const confirmCancellation = () => {
        if (selectedBooking) {
            bookingContext?.cancelBooking(selectedBooking.id);
            toast({ title: "Booking Cancelled", description: `Booking #${selectedBooking.id} has been cancelled.` });
        }
        setCancelDialogOpen(false);
        setSelectedBooking(null);
    };

     const handleSaveBooking = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedBooking) return;

        const formData = new FormData(e.currentTarget);
        const updatedBooking: Booking = {
            ...selectedBooking,
            name: formData.get('name') as string,
            date: formData.get('date') as string,
            time: formData.get('time') as string,
            status: formData.get('status') as Booking['status'],
        };
        
        bookingContext?.updateBooking(updatedBooking);
        toast({ title: "Booking Saved", description: `Booking details for ${updatedBooking.name} have been updated.`});
        setEditDialogOpen(false);
    };
    
    const handleCreateBooking = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newBookingData = {
            name: formData.get('name') as string,
            date: formData.get('date') as string,
            time: formData.get('time') as string,
            duration: parseInt(formData.get('duration') as string || '1'),
            status: formData.get('status') as Booking['status'],
        };

        bookingContext?.addBooking(newBookingData);
        toast({ title: "Booking Created", description: `A new booking for ${newBookingData.name} has been created.`});
        setCreateDialogOpen(false);
    };


    if (auth.loading || auth.user?.role !== 'admin' || !bookingContext) {
        return null;
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <Header />
            <main className="flex-grow p-4 sm:px-6 sm:py-6 md:gap-8">
                 <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader className="flex flex-row items-center">
                                <div className="grid gap-2">
                                    <CardTitle>Bookings</CardTitle>
                                    <CardDescription>Manage all turf reservations.</CardDescription>
                                </div>
                                <div className="ml-auto flex items-center gap-2">
                                    <Button size="sm" className="h-8 gap-1" onClick={() => setCreateDialogOpen(true)}>
                                        <PlusCircle className="h-3.5 w-3.5" />
                                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                            New Booking
                                        </span>
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
                                     <div className="relative w-full">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="search"
                                            placeholder="Search by user name..."
                                            className="w-full rounded-lg bg-background pl-8"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-full sm:w-[200px] mt-2 sm:mt-0">
                                            <div className="flex items-center">
                                                <Filter className="h-4 w-4 mr-2"/>
                                                <SelectValue placeholder="Filter by status" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Statuses</SelectItem>
                                            <SelectItem value="paid">Paid</SelectItem>
                                            <SelectItem value="unpaid">Unpaid</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>User</TableHead>
                                            <TableHead>Date & Time</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                            <TableHead><span className="sr-only">Actions</span></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredBookings.map(booking => (
                                            <TableRow key={booking.id}>
                                                <TableCell className="font-medium">{booking.name}</TableCell>
                                                <TableCell>{new Date(booking.date).toLocaleDateString()} - {booking.time}</TableCell>
                                                <TableCell>
                                                    <Badge 
                                                      variant={
                                                        booking.status === 'Paid' || booking.status === 'Confirmed' ? 'default' : 
                                                        booking.status === 'Cancelled' ? 'destructive' : 'secondary'
                                                      }
                                                    >
                                                      {booking.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">GHS {booking.amount.toFixed(2)}</TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <span className="sr-only">Open menu</span>
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => handleEditClick(booking)}>Edit</DropdownMenuItem>
                                                            <DropdownMenuItem className="text-destructive" onClick={() => handleCancelClick(booking)}>Cancel</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Calendar View</CardTitle>
                                <CardDescription>Select a date to filter bookings.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex justify-center">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={(d) => setDate(d)}
                                    className="rounded-md border"
                                    footer={date && <Button variant="outline" className="mt-2 w-full" onClick={() => setDate(undefined)}>Clear</Button>}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>

            {/* Create/Edit Dialog */}
            <Dialog open={isEditDialogOpen || isCreateDialogOpen} onOpenChange={isCreateDialogOpen ? setCreateDialogOpen : setEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{isCreateDialogOpen ? "Create New Booking" : "Edit Booking"}</DialogTitle>
                        <DialogDescription>
                            {isCreateDialogOpen ? "Manually add a new walk-in or phone booking." : `Editing booking #${selectedBooking?.id} for ${selectedBooking?.name}.`}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={isCreateDialogOpen ? handleCreateBooking : handleSaveBooking}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">Name</Label>
                                <Input id="name" name="name" defaultValue={selectedBooking?.name} className="col-span-3" />
                            </div>
                             <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="date" className="text-right">Date</Label>
                                <Input id="date" name="date" type="date" defaultValue={selectedBooking?.date} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="time" className="text-right">Time</Label>
                                <Input id="time" name="time" type="time" defaultValue={selectedBooking?.time} className="col-span-3" />
                            </div>
                             {isCreateDialogOpen && (
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="duration" className="text-right">Duration</Label>
                                    <Input id="duration" name="duration" type="number" defaultValue="1" className="col-span-3" />
                                </div>
                            )}
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="status" className="text-right">Status</Label>
                                 <Select name="status" defaultValue={selectedBooking?.status}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Paid">Paid</SelectItem>
                                        <SelectItem value="Unpaid">Unpaid</SelectItem>
                                        <SelectItem value="Pending">Pending</SelectItem>
                                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                                        <SelectItem value="Confirmed">Confirmed</SelectItem>
                                        <SelectItem value="Completed">Completed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => {
                                if (isCreateDialogOpen) setCreateDialogOpen(false);
                                if (isEditDialogOpen) setEditDialogOpen(false);
                            }}>Cancel</Button>
                            <Button type="submit">Save</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Cancel Confirmation Dialog */}
            <Dialog open={isCancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Are you sure?</DialogTitle>
                        <DialogDescription>
                            This will cancel booking #{selectedBooking?.id} for {selectedBooking?.name}. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>Back</Button>
                        <Button variant="destructive" onClick={confirmCancellation}>Confirm Cancellation</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
