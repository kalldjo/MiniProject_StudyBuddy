'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/utils/api';
import { Button } from '@/components/ui/Button';
import UserCard from '@/components/UserCard';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function NetworkPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleAccept = async (id: string) => {
    try {
      await apiFetch('/friends/accept', {
        method: 'POST',
        body: JSON.stringify({ targetId: id })
      });
      setRequests(prev => prev.filter(r => r.id !== id));
    } catch (e) { console.error(e); }
  };

  const handleReject = async (id: string) => {
    try {
      await apiFetch('/friends/reject', {
        method: 'POST',
        body: JSON.stringify({ targetId: id })
      });
      setRequests(prev => prev.filter(r => r.id !== id));
    } catch (e) { console.error(e); }
  };

  if (isLoading || !isAuthenticated) return <div className="p-10 text-center">Loading...</div>;

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-[#1D1D1F] mb-8">My Network</h1>
      
      <section className="mb-12">
        <h2 className="text-xl font-medium text-[#1D1D1F] mb-4">Incoming Requests</h2>
        {requests.length === 0 ? (
          <div className="p-8 bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 text-[#86868B] text-sm shadow-sm">
            No pending friend requests.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((req) => (
               <div key={req.id} className="p-5 bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_0_rgba(0,0,0,0.04)] rounded-2xl flex flex-col hover:-translate-y-1 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="w-10 h-10 rounded-full bg-zinc-200"></div>
                     <div>
                       <h3 className="font-semibold text-[#1D1D1F] tracking-tight">{req.name}</h3>
                     </div>
                  </div>
                  <div className="flex gap-2 mt-auto">
                    <Button className="flex-1 !py-1.5 text-sm" onClick={() => handleAccept(req.id)}>Accept</Button>
                    <Button variant="secondary" className="flex-1 !py-1.5 text-sm" onClick={() => handleReject(req.id)}>Decline</Button>
                  </div>
               </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-medium text-[#1D1D1F] mb-4">My Friends</h2>
        {friends.length === 0 ? (
          <div className="p-8 bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 text-[#86868B] text-sm shadow-sm">
            You haven't added any friends yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {friends.map((friend) => (
              <UserCard key={friend.id} user={friend} connectionStatus="friends" />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
