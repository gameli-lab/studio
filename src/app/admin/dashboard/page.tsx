
"use client";

import { useContext, useEffect, useMemo } from 'react';
import { AuthContext } from '@/contexts/auth-context';
import { BookingContext } from '@/contexts/booking-context';
import { UserContext } from '@/contexts/user-context';
import { useRouter } from 'next/navigation';
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, ListChecks, Users, BarChart } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Booking } from '@/contexts/booking-context';


export default function AdminDashboardPage() {
    const auth = useContext(AuthContext);
    const bookingContext = useContext(BookingContext);
    const userContext = useContext(UserContext);
    const router = useRouter();

    useEffect(() => {
        if (!auth.loading && auth.user?.role !== 'admin') {
            router.push('/');
        }
    }, [auth.loading, auth.user, router]);

    const todayBookings = useMemo(() => {
        if (!bookingContext?.bookings) return [];
        const today = new Date().toISOString().split('T')[0];
        return bookingContext.bookings.filter(b => b.date === today && b.status !== 'Cancelled');
    }, [bookingContext?.bookings]);
    
    const stats = useMemo(() => {
        if (!bookingContext?.bookings || !userContext?.users) return {
            totalRevenue: 0,
            totalBookings: 0,
            occupancyRate: 0,
            registeredUsers: 0
        };

        const paidBookings = bookingContext.bookings.filter(b => b.status === 'Paid');
        const totalRevenue = paidBookings.reduce((acc, b) => acc + b.amount, 0);
        const registeredUsers = userContext.users.filter(u => u.role === 'user').length;

        return {
            totalRevenue,
            totalBookings: bookingContext.bookings.length,
            // A simple mock for occupancy
            occupancyRate: Math.round((bookingContext.bookings.filter(b => b.status !== 'Cancelled').length / (15 * 30)) * 100),
            registeredUsers
        }
    }, [bookingContext?.bookings, userContext?.users]);


    if (auth.loading || auth.user?.role !== 'admin' || !bookingContext || !userContext) {
        return null; // Or a loading spinner
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <Header />
            <main className="flex-grow p-4 sm:px-6 sm:py-6">
                 <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4 mb-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">GHS {stats.totalRevenue.toFixed(2)}</div>
                            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                            <ListChecks className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">+{stats.totalBookings}</div>
                            <p className="text-xs text-muted-foreground">+180.1% from last month</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Registered Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">+{stats.registeredUsers}</div>
                            <p className="text-xs text-muted-foreground">+19% from last month</p>
                        </CardContent>
                    </Card>
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
                            <BarChart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.occupancyRate}%</div>
                            <p className="text-xs text-muted-foreground">+2% from yesterday</p>
                        </CardContent>
                    </Card>
                </div>
                 <Card>
                    <CardHeader>
                        <CardTitle>Today's Bookings</CardTitle>
                        <CardDescription>A summary of all bookings scheduled for today.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Time</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {todayBookings.length > 0 ? (
                                    todayBookings.map(booking => (
                                    <TableRow key={booking.id}>
                                        <TableCell className="font-medium">{booking.name}</TableCell>
                                        <TableCell>{booking.time} - {(parseInt(booking.time.split(':')[0]) + booking.duration).toString().padStart(2, '0')}:00</TableCell>
                                        <TableCell>
                                            <Badge variant={booking.status === 'Paid' ? 'default' : 'secondary'}>{booking.status}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">GHS {booking.amount.toFixed(2)}</TableCell>
                                    </TableRow>
                                ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            No bookings for today.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
