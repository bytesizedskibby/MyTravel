import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, MapPin, User, Globe } from "lucide-react";
import { useState } from "react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: "Destinations", href: "/destinations" },
    { label: "Planner", href: "/planner" },
    { label: "Blog", href: "/blog" },
    { label: "Bookings", href: "/booking" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <Globe className="h-6 w-6 text-primary transition-transform group-hover:rotate-12" />
            <span className="font-serif text-xl font-bold tracking-tight text-primary">
              MyTravel
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location === item.href
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                Log in
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm" className="rounded-full px-6">Sign Up</Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-muted-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border bg-background p-4 space-y-4 animate-in slide-in-from-top-5">
            {navItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                className="block text-base font-medium text-foreground py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-border flex flex-col space-y-2">
              <Link href="/login">
                <Button variant="outline" className="w-full justify-start">
                  Log in
                </Button>
              </Link>
              <Link href="/login">
                <Button className="w-full justify-start">Sign Up</Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-sidebar border-t border-sidebar-border pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Globe className="h-6 w-6 text-primary" />
                <span className="font-serif text-xl font-bold text-primary">
                  MyTravel
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Explore the world with ease. We help you discover hidden gems, plan detailed itineraries, and book your dream vacation all in one place.
              </p>
            </div>
            
            <div>
              <h4 className="font-serif font-semibold mb-4">Explore</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Destinations</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Flights</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Hotels</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Tours</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-serif font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Press</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-serif font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-sidebar-border pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
            <p>&copy; 2025 MyTravel Inc. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-primary">Instagram</a>
              <a href="#" className="hover:text-primary">Twitter</a>
              <a href="#" className="hover:text-primary">Facebook</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
