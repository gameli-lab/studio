
"use client";

import { useState, useMemo, useContext, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { CalendarDays, Clock, Tag, Wallet, Lock, Hourglass, FileImage, Type } from "lucide-react";
import { AuthContext } from '@/contexts/auth-context';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { BookingContext } from '@/contexts/booking-context';
import { Textarea } from './ui/textarea';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { app } from '@/lib/firebase';
import Image from 'next/image';
import { initializeTransaction } from '@/ai/flows/payment-flow';

const storage = getStorage(app);

// Assuming slots from 8 AM to 10 PM (22:00)
const timeSlots = Array.from({ length: 15 }, (_, i) => {
  const hour = i + 8;
  return `${hour.toString().padStart(2, '0')}:00`;
});


export function BookingSection() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [duration, setDuration] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [flyerFile, setFlyerFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const auth = useContext(AuthContext);
  const bookingContext = useContext(BookingContext);

  useEffect(() => {
    if (auth?.user) {
      setName(auth.user.name);
      setEmail(auth.user.email);
    }
  }, [auth?.user]);


  const priceDetails = useMemo(() => {
    if (!selectedTime) return null;

    const baseRate = 100;
    let afterHoursFee = 0;
    const hour = parseInt(selectedTime.split(':')[0], 10);
    const endTime = hour + duration;

    // After 6 PM (18:00) or if the booking duration extends into the night
    if (hour >= 18 || endTime > 18 || hour < 6) {
      afterHoursFee = 50;
    }

    const total = (baseRate * duration) + afterHoursFee;

    return { baseRate, afterHoursFee, total, duration };
  }, [selectedTime, duration]);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFlyerFile(file);
    }
  };
  
  const resetForm = () => {
      setSelectedTime(null);
      setPhone('');
      setDuration(1);
      setDescription('');
      setFlyerFile(null);
      if(fileInputRef.current) fileInputRef.current.value = "";
  }

  const handlePaystackSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!date || !selectedTime || !name || !email || !auth?.user || !priceDetails) {
        toast({
          variant: "destructive",
          title: "Missing Information",
          description: "Please fill out all required fields and select a date, time and duration.",
        });
        return;
      }

      setIsSubmitting(true);

      try {
        const transactionResult = await initializeTransaction({
            email,
            amount: priceDetails.total,
        });

        if (!transactionResult.status || !transactionResult.data) {
             throw new Error(transactionResult.message || "Failed to initialize payment.");
        }

        const onPaymentSuccess = async () => {
            let flyerUrl: string | undefined = undefined;
            let flyerStoragePath: string | undefined = undefined;
        
            if (flyerFile) {
                const storageRef = ref(storage, `flyers/${Date.now()}_${flyerFile.name}`);
                const uploadTask = uploadBytesResumable(storageRef, flyerFile);
                
                 await new Promise<void>((resolve, reject) => {
                    uploadTask.on('state_changed',
                        () => {},
                        (error) => {
                            console.error("Flyer upload error:", error);
                            reject(new Error("Could not upload flyer. Booking saved without it."));
                        },
                        async () => {
                            flyerUrl = await getDownloadURL(uploadTask.snapshot.ref);
                            flyerStoragePath = uploadTask.snapshot.ref.fullPath;
                            resolve();
                        }
                    );
                });
            }

            await bookingContext?.addBooking({
                userId: auth.user!.id,
                name,
                email,
                phone,
                date: date.toISOString().split('T')[0],
                time: selectedTime,
                duration,
                description,
                flyerUrl,
                flyerStoragePath
            });

             toast({
                title: "Booking Confirmed!",
                description: `Your payment was successful and your booking is confirmed.`,
            });
            resetForm();
        };

        const onPaymentClose = () => {
            toast({
                variant: "default",
                title: "Payment window closed",
                description: "You can resume your booking anytime.",
            });
        };

        const paystackPopup = new (window as any).PaystackPop();
        paystackPopup.newTransaction({
            key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
            email: email,
            amount: priceDetails.total * 100, // Amount in kobo
            access_code: transactionResult.data.access_code,
            onSuccess: () => onPaymentSuccess(),
            onCancel: onPaymentClose,
        });

      } catch (error: any) {
          toast({
              variant: "destructive",
              title: "Payment Error",
              description: error.message || "Could not initiate payment. Please try again.",
          });
      } finally {
          setIsSubmitting(false);
      }
  }


  const isSlotBooked = (slot: string) => {
    if (!date || !bookingContext?.bookings) return false;
    
    const selectedDateString = date.toISOString().split('T')[0];

    return bookingContext.bookings.some(booking => 
        booking.date === selectedDateString &&
        booking.time === slot &&
        booking.status !== 'Cancelled'
    );
  };

  const isSlotInPast = (slot: string) => {
    if (!date) return false;
    const now = new Date();
    const [hour, minute] = slot.split(':').map(Number);
    const slotTime = new Date(date);
    slotTime.setHours(hour, minute, 0, 0);
    return slotTime < now;
  };

  if (!auth?.user) {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-muted/30">
            <Lock className="h-12 w-12 mb-4 text-primary" />
            <h3 className="text-2xl font-bold mb-2">Sign In to Book</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">You need to be logged in to your account to book a time slot. It's quick and easy!</p>
            <div className="flex gap-4">
                <Button asChild>
                    <Link href="/login">Sign In</Link>
                </Button>
                <Button variant="outline" asChild>
                    <Link href="/signup">Sign Up</Link>
                </Button>
            </div>
        </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2">
      <div className="p-6 md:p-8">
        <h3 className="text-2xl font-semibold mb-4 font-headline">1. Select Date & Time</h3>
        <div className="flex flex-col md:flex-row gap-8">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => {
                setDate(d);
                setSelectedTime(null); // Reset time when date changes
            }}
            disabled={(day) => day < new Date(new Date().setDate(new Date().getDate() - 1))}
            className="rounded-md border self-start"
          />
          <div className="flex-1">
            <h4 className="font-semibold mb-4 text-center md:text-left">{date ? date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : 'Select a date'}</h4>
            <div className="grid grid-cols-3 gap-2 max-h-96 overflow-y-auto pr-2">
              {timeSlots.map(slot => (
                <Button
                  key={slot}
                  variant={selectedTime === slot ? "default" : "outline"}
                  onClick={() => setSelectedTime(slot)}
                  disabled={isSlotBooked(slot) || isSlotInPast(slot)}
                  className="w-full"
                >
                  {slot}
                </Button>
              ))}
            </div>
          </div>
        </div>
         <Separator className="my-6" />
         <div>
            <h3 className="text-xl font-semibold mb-4 font-headline flex items-center gap-2"><Hourglass className="h-5 w-5"/> 2. Select Duration</h3>
            <RadioGroup defaultValue="1" onValueChange={(value) => setDuration(parseInt(value))} value={duration.toString()} className="flex gap-4">
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="1hr" />
                    <Label htmlFor="1hr" className="text-base">1 Hour</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="2" id="2hr" />
                    <Label htmlFor="2hr" className="text-base">2 Hours</Label>
                </div>
            </RadioGroup>
        </div>
      </div>
      <div className="p-6 md:p-8 bg-muted/30 border-l">
        <h3 className="text-2xl font-semibold mb-4 font-headline">3. Confirm & Pay</h3>
        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Booking Summary</CardTitle>
            <CardDescription>Review your booking details below.</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedTime && date ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <CalendarDays className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">{date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-4">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">{selectedTime} - {(parseInt(selectedTime.split(':')[0], 10) + duration).toString().padStart(2, '0')}:00 ({duration}hr)</span>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Base Rate ({duration} hour)</span>
                    <span className="font-medium">GHS {(priceDetails!.baseRate * duration).toFixed(2)}</span>
                  </div>
                  {priceDetails?.afterHoursFee && priceDetails.afterHoursFee > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Floodlight Fee</span>
                      <span className="font-medium">GHS {priceDetails.afterHoursFee.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>GHS {priceDetails?.total.toFixed(2)}</span>
                  </div>
                </div>
                <Separator />
                <form onSubmit={handlePaystackSubmit} className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number (Optional)</Label>
                    <Input id="phone" type="tel" placeholder="024 123 4567" value={phone} onChange={e => setPhone(e.target.value)} />
                  </div>
                   <Separator />
                   <h3 className="text-lg font-semibold font-headline pt-2">Event Details (Optional)</h3>
                    <div className="space-y-2">
                      <Label htmlFor="description" className='flex items-center gap-2'><Type className='h-4 w-4'/>Event Description</Label>
                      <Textarea id="description" placeholder="e.g., Charity match for a good cause!" value={description} onChange={e => setDescription(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                      <Label htmlFor="flyer" className='flex items-center gap-2'><FileImage className='h-4 w-4'/>Upload Flyer</Label>
                      <Input id="flyer" type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} />
                    </div>
                    {flyerFile && (
                      <div className="flex justify-center rounded-md border p-2">
                          <Image src={URL.createObjectURL(flyerFile)} alt="Flyer Preview" width={200} height={200} className="object-contain"/>
                      </div>
                    )}
                  <Button type="submit" className="w-full text-lg py-6" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? 'Processing...' : (
                      <>
                        <Wallet className="mr-2 h-5 w-5"/>
                        Pay with Paystack
                      </>
                    )}
                  </Button>
                </form>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-64">
                <Tag className="h-12 w-12 mb-4" />
                <p>Select a date, time, and duration to see your booking summary.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
