"use client";

import { useContext } from 'react';
import { AuthContext } from '@/contexts/auth-context';
import { Button } from './ui/button';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { CalendarClock, Sparkles } from 'lucide-react';

export function UserDashboard() {
  const auth = useContext(AuthContext);

  if (!auth?.user) {
    return null;
  }
  
  const nextAvailableSlot = "Today: 4:00 PM - 5:00 PM";

  return (
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
  );
}
