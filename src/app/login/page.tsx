"use client";

import { useContext, useState } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthContext } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20c0-1.341-0.138-2.65-0.389-3.917z"/>
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.618-3.223-11.303-7.563l-6.571,4.819C9.656,39.663,16.318,44,24,44z"/>
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.99,34.562,44,28.718,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
  </svg>
);


export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const auth = useContext(AuthContext);
    const { toast } = useToast();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await auth?.loginWithEmail(email, password);
            // onAuthStateChanged will redirect
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Login Failed',
                description: error.message || 'Please check your email and password.',
            });
        }
    };
    
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Header />
            <main className="flex-grow flex items-center justify-center py-12 px-4">
                <Card className="mx-auto max-w-sm w-full">
                    <CardHeader>
                        <CardTitle className="text-2xl">Login</CardTitle>
                        <CardDescription>
                            Enter your email below to login to your account.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin}>
                            <div className="grid gap-4">
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
                                    <div className="flex items-center">
                                        <Label htmlFor="password">Password</Label>
                                        <Link href="#" className="ml-auto inline-block text-sm underline">
                                            Forgot your password?
                                        </Link>
                                    </div>
                                    <Input 
                                        id="password" 
                                        type="password" 
                                        required 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                                <Button type="submit" className="w-full">
                                    Login
                                </Button>
                            </div>
                        </form>
                        <Separator className="my-4" />
                        <Button variant="outline" className="w-full" onClick={() => auth?.loginWithGoogle()}>
                            <GoogleIcon className="mr-2" />
                            Continue with Google
                        </Button>
                        <div className="mt-4 text-center text-sm">
                            Don&apos;t have an account?{' '}
                            <Link href="/signup" className="underline">
                                Sign up
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </main>
            <Footer />
        </div>
    );
}