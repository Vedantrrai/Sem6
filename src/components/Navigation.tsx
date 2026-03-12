"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, X, User, LogOut } from 'lucide-react';
import { getAuthState, logout } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [authState, setAuthState] = useState(getAuthState());
  const router = useRouter();

  useEffect(() => {
    const handleStorageChange = () => {
      setAuthState(getAuthState());
    };
    
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(handleStorageChange, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setAuthState({ isAuthenticated: false, user: null });
    router.push('/');
  };

  const getDashboardLink = () => {
    if (!authState.user) return '/';
    switch (authState.user.role) {
      case 'admin':
        return '/dashboard/admin';
      case 'worker':
        return '/dashboard/worker';
      default:
        return '/dashboard/user';
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-lg gradient-orange-blue flex items-center justify-center text-white font-bold text-xl">
              K
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-[var(--orange)] to-[var(--blue)] bg-clip-text text-transparent">
              KaamOn
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/services" className="hover:text-primary transition-colors">
              Services
            </Link>
            <Link href="/about" className="hover:text-primary transition-colors">
              About
            </Link>
            
            {authState.isAuthenticated && authState.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-muted">
                      {authState.user.avatar ? (
                        <img src={authState.user.avatar} alt={authState.user.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <span>{authState.user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => router.push(getDashboardLink())}>
                    <User className="w-4 h-4 mr-2" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/signup">
                  <Button className="gradient-orange-blue text-white">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4">
            <Link href="/" className="block hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>
              Home
            </Link>
            <Link href="/services" className="block hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>
              Services
            </Link>
            <Link href="/about" className="block hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>
              About
            </Link>
            
            {authState.isAuthenticated && authState.user ? (
              <>
                <Link href={getDashboardLink()} className="block hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>
                  Dashboard
                </Link>
                <button onClick={() => { handleLogout(); setIsOpen(false); }} className="block w-full text-left hover:text-primary transition-colors">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full">Login</Button>
                </Link>
                <Link href="/signup" onClick={() => setIsOpen(false)}>
                  <Button className="w-full gradient-orange-blue text-white">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}