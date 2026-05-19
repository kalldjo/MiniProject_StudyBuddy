'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/utils/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      login(response.data.user);
      router.push('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#F5F5F7] via-[#FFFFFF] to-[#E8ECEF] p-4 font-sans">
      <div className="w-full max-w-md bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_12px_40px_0_rgba(0,0,0,0.08)] rounded-3xl p-8 transition-all">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-[#1D1D1F] mb-2">Welcome back</h1>
          <p className="text-[#86868B]">Enter your details to access your account.</p>
        </div>

        {error && <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-sm font-medium text-center">{error}</div>}

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <Input 
            label="Email" 
            type="email" 
            placeholder="john@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input 
            label="Password" 
            type="password" 
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" className="w-full mt-2" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-[#86868B]">
          Don't have an account? <Link href="/register" className="font-medium text-[#0071E3] hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
