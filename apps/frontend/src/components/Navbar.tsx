'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();

  // Hide navbar on auth pages
  if (pathname === '/login' || pathname === '/register') return null;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav className="sticky top-4 z-50 mx-auto max-w-6xl w-[95%]">
      <div className="flex items-center justify-between rounded-full bg-white/60 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_0_rgba(0,0,0,0.04)] px-6 py-3 transition-all hover:bg-white/70">
        <Link href="/" className="text-xl font-semibold tracking-tight text-[#1D1D1F]">
          Study Buddy
        </Link>
        
        {isAuthenticated && (
          <div className="hidden md:flex items-center gap-6">
            <NavLink href="/" active={pathname === '/'}>Discover</NavLink>
            <NavLink href="/network" active={pathname === '/network'}>My Network</NavLink>
            <NavLink href="/profile" active={pathname === '/profile'}>My Profile</NavLink>
          </div>
        )}

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
             <div className="flex items-center gap-4">
               <span className="text-sm font-medium text-zinc-600 hidden sm:inline">{user?.name}</span>
               <Button variant="secondary" onClick={handleLogout} className="!py-1.5 !px-4 text-sm">Logout</Button>
             </div>
          ) : (
             <div className="flex items-center gap-2">
               <Link href="/login"><Button variant="secondary" className="!py-1.5 !px-4 text-sm">Login</Button></Link>
               <Link href="/register"><Button variant="primary" className="!py-1.5 !px-4 text-sm">Sign Up</Button></Link>
             </div>
          )}
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, active, children }: { href: string, active: boolean, children: React.ReactNode }) {
  return (
    <Link 
      href={href} 
      className={`text-sm font-medium transition-colors ${active ? 'text-[#0071E3]' : 'text-zinc-500 hover:text-[#1D1D1F]'}`}
    >
      {children}
    </Link>
  );
}
