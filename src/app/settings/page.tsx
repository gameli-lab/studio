"use client";

import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Phone, KeyRound } from 'lucide-react';

export default function SettingsPage() {
    const auth = useContext(AuthContext);
    const router = useRouter();
    const { toast } = useToast();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState(''); // Assuming phone is not in user object yet
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        if (!auth?.loading && !auth?.user) {
            router.push('/login');
        } else if (auth?.user) {
            setName(auth.user.name);
            setEmail(auth.user.email);
        }
    }, [auth?.loading, auth?.user, router]);
    
    
    if (!auth?.user && !auth?.loading) {
        return null;
    }
    
    const handleProfileUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        toast({ title: "Profile Updated", description: "Your profile information has been saved." });
    }

    const handlePasswordChange = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast({ variant: 'destructive', title: "Passwords don't match", description: "Please ensure the new passwords match." });
            return;
        }
        if (!newPassword || newPassword.length < 6) {
             toast({ variant: 'destructive', title: "Invalid Password", description: "Password must be at least 6 characters." });
            return;
        }
        toast({ title: "Password Changed", description: "Your password has been successfully updated." });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    }

    if (auth?.loading || !auth?.user) {
        return null; // Or a loading spinner
    }

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
                <div className="max-w-4xl mx-auto space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl font-headline flex items-center gap-2">
                                <User />
                                Edit Profile
                            </CardTitle>
                            <CardDescription>Update your personal information.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <form onSubmit={handleProfileUpdate} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input id="phone" type="tel" placeholder="e.g. 024 123 4567" value={phone} onChange={(e) => setPhone(e.target.value)} />
                                </div>
                                <Button type="submit">Save Changes</Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                           <CardTitle className="text-2xl font-headline flex items-center gap-2">
                                <KeyRound />
                                Change Password
                            </CardTitle>
                            <CardDescription>For your security, we recommend using a strong password.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <form onSubmit={handlePasswordChange} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="current-password">Current Password</Label>
                                    <Input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="new-password">New Password</Label>
                                        <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                                        <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                                    </div>
                                </div>
                                <Button type="submit">Update Password</Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </main>
            <Footer />
        </div>
    );
}
