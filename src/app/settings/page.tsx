
"use client";

import { useContext, useState, useEffect, useRef } from 'react';
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
import { User, Mail, Phone, KeyRound, Camera } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from '@/lib/firebase';

const storage = getStorage(app);

export default function SettingsPage() {
    const auth = useContext(AuthContext);
    const router = useRouter();
    const { toast } = useToast();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [avatar, setAvatar] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);


    useEffect(() => {
        if (!auth?.loading && !auth?.user) {
            router.push('/login');
        } else if (auth?.user) {
            setName(auth.user.name);
            setEmail(auth.user.email);
            setAvatar(auth.user.avatar || `https://placehold.co/100x100.png?text=${auth.user.name.charAt(0)}`);
        }
    }, [auth?.loading, auth?.user, router]);
    
    
    if (!auth?.user && !auth?.loading) {
        return null;
    }
    
    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (auth?.user) {
            await auth.updateUser({ name, email });
            toast({ title: "Profile Updated", description: "Your profile information has been saved." });
        }
    }

    const handlePasswordChange = (e: React.FormEvent) => {
        e.preventDefault();
        toast({ variant: 'destructive', title: "Feature not available", description: "Password changes are not enabled in this demo." });
    }
    
    const handleAvatarChangeClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && auth?.user) {
            const storageRef = ref(storage, `avatars/${auth.user.id}/${file.name}`);
            try {
                const snapshot = await uploadBytes(storageRef, file);
                const downloadURL = await getDownloadURL(snapshot.ref);
                setAvatar(downloadURL);
                await auth.updateUser({ avatar: downloadURL });
                toast({ title: "Avatar Updated", description: "Your new profile picture has been saved."});
            } catch (error) {
                console.error("Avatar upload error:", error);
                toast({ variant: 'destructive', title: "Upload Failed", description: "Could not upload your new avatar." });
            }
        }
    };


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
                            <CardDescription>Update your personal information and profile picture.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <form onSubmit={handleProfileUpdate} className="space-y-6">
                                <div className="flex items-center gap-6">
                                    <div className="relative">
                                        <Avatar className="h-24 w-24">
                                            <AvatarImage src={avatar} alt={name} />
                                            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <Button type="button" size="icon" className="absolute bottom-0 right-0 rounded-full" onClick={handleAvatarChangeClick}>
                                            <Camera className="h-4 w-4" />
                                            <span className="sr-only">Change Photo</span>
                                        </Button>
                                        <input 
                                            type="file" 
                                            ref={fileInputRef} 
                                            onChange={handleFileChange}
                                            className="hidden"
                                            accept="image/*"
                                        />
                                    </div>
                                    <div className="flex-grow space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input id="email" type="email" value={email} readOnly disabled />
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input id="phone" type="tel" placeholder="e.g. 024 123 4567" value={phone} onChange={(e) => setPhone(e.target.value)} disabled />
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
                                    <Input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} disabled />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="new-password">New Password</Label>
                                        <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} disabled />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                                        <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled />
                                    </div>
                                </div>
                                <Button type="submit" disabled>Update Password</Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </main>
            <Footer />
        </div>
    );
}
