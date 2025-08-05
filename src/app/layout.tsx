
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/contexts/auth-context';
import { BookingProvider } from '@/contexts/booking-context';
import { UserProvider } from '@/contexts/user-context';
import { ThemeProvider } from '@/components/theme-provider';
import { GalleryProvider } from '@/contexts/gallery-context';
import { ReviewProvider } from '@/contexts/review-context';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'AstroBook',
  description: 'Book the Adeiso Astro Turf with ease.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <UserProvider>
              <BookingProvider>
                <GalleryProvider>
                  <ReviewProvider>
                    {children}
                  </ReviewProvider>
                </GalleryProvider>
              </BookingProvider>
              <Toaster />
            </UserProvider>
          </AuthProvider>
        </ThemeProvider>
        <Script src="https://js.paystack.co/v2/inline.js" />
      </body>
    </html>
  );
}
