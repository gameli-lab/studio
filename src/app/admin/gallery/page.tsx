
"use client";

import { useState, useContext, useEffect, useRef } from 'react';
import Image from 'next/image';
import { AuthContext } from '@/contexts/auth-context';
import { GalleryContext, GalleryImage } from '@/contexts/gallery-context';
import { useRouter } from 'next/navigation';
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Upload, Trash2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { app } from '@/lib/firebase';
import { Progress } from '@/components/ui/progress';

const storage = getStorage(app);

export default function AdminGalleryPage() {
    const auth = useContext(AuthContext);
    const galleryContext = useContext(GalleryContext);
    const router = useRouter();
    const { toast } = useToast();

    const [isUploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
    const [fileToUpload, setFileToUpload] = useState<File | null>(null);
    const [altText, setAltText] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!auth.loading && auth.user?.role !== 'admin') {
            router.push('/');
        }
    }, [auth.loading, auth.user, router]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setFileToUpload(file);
        }
    };
    
    const resetUploadDialog = () => {
        setUploadDialogOpen(false);
        setFileToUpload(null);
        setAltText('');
        setIsUploading(false);
        setUploadProgress(0);
    }

    const handleUpload = async () => {
        if (!fileToUpload || !auth?.user) {
            toast({ variant: 'destructive', title: "No file selected", description: "Please select an image to upload." });
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);
        const storageRef = ref(storage, `gallery/${Date.now()}_${fileToUpload.name}`);
        const uploadTask = uploadBytesResumable(storageRef, fileToUpload);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(progress);
            },
            (error) => {
                console.error("Image upload error:", error);
                toast({ variant: 'destructive', title: "Upload Failed", description: "Could not upload the image." });
                resetUploadDialog();
            },
            async () => {
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    await galleryContext?.addImage({
                        src: downloadURL,
                        alt: altText || "Gallery image",
                        hint: "user uploaded",
                        storagePath: uploadTask.snapshot.ref.fullPath,
                    });

                    toast({ title: "Image Uploaded", description: "The new image has been added to the gallery." });
                    
                    // Keep dialog open for a moment to show "Uploaded"
                    setTimeout(() => {
                       resetUploadDialog();
                    }, 1500);

                } catch(error) {
                    console.error("Error getting download URL or adding image:", error);
                    toast({ variant: 'destructive', title: "Upload Failed", description: "Could not save the uploaded image." });
                    resetUploadDialog();
                }
            }
        );
    };
    
    const handleDeleteClick = (image: GalleryImage) => {
        setSelectedImage(image);
        setDeleteDialogOpen(true);
    };

    const confirmDeletion = async () => {
        if (selectedImage && selectedImage.id) {
            try {
                // Delete from storage
                if (selectedImage.storagePath) {
                    const imageRef = ref(storage, selectedImage.storagePath);
                    await deleteObject(imageRef);
                }
                // Delete from firestore
                await galleryContext?.deleteImage(selectedImage.id);
                toast({ title: "Image Deleted", description: `The image has been removed from the gallery.` });
            } catch (error) {
                 console.error("Image deletion error:", error);
                 toast({ variant: 'destructive', title: "Deletion Failed", description: "Could not delete the image." });
            }
        }
        setDeleteDialogOpen(false);
        setSelectedImage(null);
    };

    if (auth.loading || auth.user?.role !== 'admin' || !galleryContext) {
        return null;
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <Header />
            <main className="flex-grow p-4 sm:px-6 sm:py-6 md:gap-8">
                <Card>
                    <CardHeader className="flex flex-row items-center">
                        <div className="grid gap-2">
                            <CardTitle>Gallery Management</CardTitle>
                            <CardDescription>Upload, view, and delete gallery images.</CardDescription>
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                            <Button onClick={() => setUploadDialogOpen(true)}>
                                <Upload className="mr-2 h-4 w-4" />
                                Upload Image
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {galleryContext.images.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {galleryContext.images.map(image => (
                                    <Card key={image.id} className="group relative overflow-hidden">
                                        <Image
                                            src={image.src}
                                            alt={image.alt}
                                            width={400}
                                            height={300}
                                            className="object-cover w-full h-48"
                                        />
                                        <div className="absolute top-2 right-2">
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => handleDeleteClick(image)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="p-2 text-xs text-muted-foreground truncate" title={image.alt}>
                                            {image.alt}
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                <p>No images have been uploaded to the gallery yet.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>

            {/* Upload Dialog */}
            <Dialog open={isUploadDialogOpen} onOpenChange={(isOpen) => { if (!isUploading) setUploadDialogOpen(isOpen) }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Upload a New Image</DialogTitle>
                        <DialogDescription>Select an image file and provide alternative text for accessibility.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="image-file" className="text-right">Image</Label>
                            <Input id="image-file" type="file" accept="image/*" onChange={handleFileChange} className="col-span-3" ref={fileInputRef} disabled={isUploading}/>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="alt-text" className="text-right">Alt Text</Label>
                            <Input id="alt-text" value={altText} onChange={(e) => setAltText(e.target.value)} placeholder="e.g., Players enjoying a match" className="col-span-3" disabled={isUploading}/>
                        </div>
                        {fileToUpload && (
                            <div className="col-span-4 flex justify-center">
                                <Image src={URL.createObjectURL(fileToUpload)} alt="Preview" width={200} height={150} className="rounded-md object-cover"/>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={resetUploadDialog} disabled={isUploading}>Cancel</Button>
                        <div className="w-56">
                            {!isUploading ? (
                                <Button onClick={handleUpload} disabled={!fileToUpload}>
                                    Upload
                                </Button>
                            ) : uploadProgress < 100 ? (
                                <div className="w-full flex items-center gap-2">
                                     <Progress value={uploadProgress} className="w-full" />
                                     <span className="text-sm">{Math.round(uploadProgress)}%</span>
                                </div>
                            ) : (
                                <Button className="w-full bg-green-600 hover:bg-green-700" disabled>Uploaded</Button>
                            )}
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Are you sure?</DialogTitle>
                        <DialogDescription>
                            This will permanently delete the image from the gallery and from storage. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                     <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmDeletion}>Confirm Deletion</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );

    
}
