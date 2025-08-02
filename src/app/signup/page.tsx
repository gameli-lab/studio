
"use client";

import { useContext, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthContext } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import astroTurfImage from '../login/astro-turf.jpg';


const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20c0-1.341-0.138-2.65-0.389-3.917z"/>
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.618-3.223-11.303-7.563l-6.571,4.819C9.656,39.663,16.318,44,24,44z"/>
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.99,34.562,44,28.718,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
  </svg>
);


export default function SignupPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const auth = useContext(AuthContext);
    const { toast } = useToast();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !password) {
             toast({
                variant: 'destructive',
                title: 'Missing information',
                description: 'Please fill out all fields.',
            });
            return;
        }
        
        try {
            await auth?.signupWithEmail(name, email, password);
             // onAuthStateChanged will redirect
        } catch (error: any) {
             toast({
                variant: 'destructive',
                title: 'Signup Failed',
                description: error.message || 'Could not create account.',
            });
        }
    };

    return (
        <div className="relative flex flex-col min-h-screen bg-background">
             <Image
                src={astroTurfImage}
                alt="Astro turf background"
                fill
                quality={100}
                className="absolute inset-0 z-0 object-cover"
                data-ai-hint="astro turf"
            />
            <div className="absolute inset-0 bg-black/50 z-0" />
            <div className="relative z-10 flex flex-col flex-grow">
                <Header />
                <main className="flex-grow flex items-center justify-center py-12 px-4">
                    <Card className="mx-auto max-w-sm w-full bg-background/80 backdrop-blur-sm border-white/20">
                        <CardHeader>
                            <CardTitle className="text-xl">Sign Up</CardTitle>
                            <CardDescription>
                                Enter your information to create an account
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSignup}>
                                <div className="grid gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="full-name">Full name</Label>
                                        <Input 
                                            id="full-name" 
                                            placeholder="John Doe" 
                                            required 
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="m@example.com"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="password">Password</Label>
                                        <Input 
                                            id="password" 
                                            type="password" 
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                    <Button type="submit" className="w-full">
                                        Create an account
                                    </Button>
                                </div>
                            </form>
                            <Separator className="my-4" />
                            <Button variant="outline" className="w-full" onClick={() => auth?.loginWithGoogle()}>
                                <GoogleIcon className="mr-2" />
                                Sign up with Google
                            </Button>
                            <div className="mt-4 text-center text-sm">
                                Already have an account?{' '}
                                <Link href="/login" className="underline">
                                    Sign in
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </main>
                <Footer />
            </div>
        </div>
    );
}
