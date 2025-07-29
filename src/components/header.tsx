import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

const Logo = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-8 w-8 text-primary"
    aria-label="AstroBook Logo"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="2" x2="12" y2="22" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M7.48 20.48S5.2 16.8 5.2 12s2.28-8.48 2.28-8.48" />
    <path d="M16.52 3.52S18.8 7.2 18.8 12s-2.28 8.48-2.28 8.48" />
    <path d="M3.52 7.48S7.2 5.2 12 5.2s8.48 2.28 8.48 2.28" />
    <path d="M20.48 16.52S16.8 18.8 12 18.8s-8.48-2.28-8.48-2.28" />
  </svg>
);


export function Header() {
  const navLinks = [
    { href: "#about", label: "About" },
    { href: "#gallery", label: "Gallery" },
    { href: "#booking", label: "Book Now" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Logo />
          <span className="font-headline">AstroBook</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-2">
          <Button variant="ghost">Sign In</Button>
          <Button>Sign Up</Button>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <div className="grid gap-6 p-6">
              <Link href="/" className="flex items-center gap-2 font-bold text-lg">
                 <Logo />
                 <span className="font-headline">AstroBook</span>
              </Link>
              <nav className="grid gap-4">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="text-base font-medium text-muted-foreground transition-colors hover:text-primary">
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="flex flex-col gap-2">
                <Button variant="ghost" className="w-full">Sign In</Button>
                <Button className="w-full">Sign Up</Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
