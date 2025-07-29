"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { Menu, Moon, Sun } from 'lucide-react';
import React, { useContext } from 'react';
import { AuthContext } from '@/contexts/auth-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from 'next-themes';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';


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
    <path d="M16.52 3.52S18.8 7.2 18.8 12s-2.28 8.48-2.28-8.48" />
    <path d="M3.52 7.48S7.2 5.2 12 5.2s8.48 2.28 8.48 2.28" />
    <path d="M20.48 16.52S16.8 18.8 12 18.8s-8.48-2.28-8.48-2.28" />
  </svg>
);


export function Header() {
  const auth = useContext(AuthContext);
  const { setTheme, theme } = useTheme();

  const loggedOutNavLinks = [
    { href: "/#about", label: "About" },
    { href: "/#gallery", label: "Gallery" },
    { href: "/#booking", label: "Book Now" },
  ];
  
  const loggedInNavLinks = [
    { href: "/my-bookings", label: "My Bookings" },
    { href: "/settings", label: "Settings" },
  ];

  const navLinks = auth?.user ? loggedInNavLinks : loggedOutNavLinks;

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
        <div className="flex items-center gap-2">
           <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="hidden md:inline-flex"
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          <div className="hidden md:flex items-center gap-2">
            {auth?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                     <Avatar>
                        <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                        <AvatarFallback>{auth.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{auth.user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{auth.user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {auth.user.role === 'admin' && <DropdownMenuItem asChild><Link href="/admin/dashboard">Dashboard</Link></DropdownMenuItem>}
                  <DropdownMenuItem asChild><Link href="/my-bookings">My Bookings</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/settings">Settings</Link></DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={auth.logout}>Sign Out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
             <div className="flex items-center justify-between p-4 border-b">
                <Link href="/" className="flex items-center gap-2 font-bold">
                    <Logo />
                    <span className="font-headline text-lg">AstroBook</span>
                </Link>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                    >
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
              </div>
            <div className="grid gap-6 p-6">
              <nav className="grid gap-4">
                {navLinks.map((link) => (
                  <SheetClose key={link.href} asChild>
                    <Link href={link.href} className="text-base font-medium text-muted-foreground transition-colors hover:text-primary">
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
              <div className="flex flex-col gap-2 border-t pt-6">
                 {auth?.user ? (
                   <>
                    {auth.user.role === 'admin' && (
                      <SheetClose asChild>
                        <Button variant="outline" className="w-full justify-start" asChild>
                            <Link href="/admin/dashboard">Dashboard</Link>
                        </Button>
                      </SheetClose>
                    )}
                    <SheetClose asChild>
                        <Button variant="outline" className="w-full justify-start" asChild>
                            <Link href="/my-bookings">My Bookings</Link>
                        </Button>
                    </SheetClose>
                    <SheetClose asChild>
                        <Button variant="outline" className="w-full justify-start" asChild>
                            <Link href="/settings">Settings</Link>
                        </Button>
                    </SheetClose>
                    <Button onClick={auth.logout} className="w-full">Sign Out</Button>
                   </>
                 ) : (
                  <>
                    <SheetClose asChild>
                      <Button variant="ghost" className="w-full justify-start" asChild>
                        <Link href="/login">Sign In</Link>
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button className="w-full" asChild>
                        <Link href="/signup">Sign Up</Link>
                      </Button>
                    </SheetClose>
                  </>
                 )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
