"use client";

import { useState } from "react";
import { Plane, Menu, Bell, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: "Flights", href: "#" },
    { label: "Hotels", href: "#" },
    { label: "Car Rentals", href: "#" },
    { label: "Activities", href: "#" },
    { label: "Deals", href: "#" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container-custom flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <div className="flex flex-col gap-6 pt-6">
                <div className="flex items-center justify-center gap-2">
                  <Plane className="h-6 w-6 text-primary" />
                  <span className="text-xl font-bold">SkySearch</span>
                </div>
                <nav className="flex flex-col justify-center items-center gap-4">
                  {navItems.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      className="text-sm font-medium hover:text-primary transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                    </a>
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Plane className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-bold bg-linear-to-r from-primary to-flight-secondary bg-clip-text text-transparent">
              SkySearch
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* User Actions */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -right-1 -top-1 h-4 w-4 p-0 text-xs">
              3
            </Badge>
          </Button>

          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>

          <Button variant="outline" className="gap-2 hidden sm:flex">
            <User className="h-4 w-4" />
            Sign In
          </Button>

          <Button className="gap-2 hidden sm:flex">
            <Plane className="h-4 w-4" />
            Book Now
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
