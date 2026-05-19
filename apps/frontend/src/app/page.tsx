'use client';

import React, { useState, useEffect } from 'react';
import UserCard from '@/components/UserCard';
import FilterSidebar from '@/components/FilterSidebar';
import { apiFetch } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('filters');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  const [filters, setFilters] = useState({
    fakultas: '',
    jurusan: '',
    angkatan: ''
  });

  useEffect(() => {
    if (!isAuthenticated) return;
    
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        let endpoint = '';
        if (activeTab === 'filters') {
          const params = new URLSearchParams();
          if (filters.fakultas) params.append('fakultas', filters.fakultas);
          if (filters.jurusan) params.append('jurusan', filters.jurusan);
          if (filters.angkatan) params.append('angkatan', filters.angkatan);
          endpoint = `/recommend/search?${params.toString()}`;
        } else if (activeTab === 'interests') {
          endpoint = '/recommend/interests';
        } else if (activeTab === 'skills') {
          endpoint = '/recommend/skills';
        } else if (activeTab === 'social') {
          endpoint = '/recommend/social';
        }

        const response = await apiFetch(endpoint);
        setUsers(response.data || []);
      } catch (error) {
        console.error(error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [activeTab, filters, isAuthenticated]);

  const handleConnect = async (targetId: string) => {
    try {
      await apiFetch('/friends/add', {
        method: 'POST',
        body: JSON.stringify({ targetId })
      });
      alert('Request sent!');
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading || !isAuthenticated) return <div className="p-10 text-center">Loading...</div>;

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-12 text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-[#1D1D1F] bg-clip-text">
          Discover your next study partner.
        </h1>
        <p className="mt-4 text-lg text-[#86868B] max-w-2xl">
          Find collaborators, join study groups, and connect with students sharing your academic goals.
        </p>
      </div>

      <div className="flex justify-center md:justify-start mb-8 overflow-x-auto pb-4">
        <div className="flex bg-white/60 backdrop-blur-md p-1 rounded-full border border-black/5 shadow-sm">
          {['filters', 'interests', 'skills', 'social'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${activeTab === tab ? 'bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] text-[#1D1D1F]' : 'text-[#86868B] hover:text-[#1D1D1F]'}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          {activeTab === 'filters' ? (
             <FilterSidebar filters={filters} setFilters={setFilters} />
          ) : (
            <div className="p-6 bg-white/60 backdrop-blur-xl border border-white/40 shadow-sm rounded-3xl text-sm text-[#86868B]">
              <p>These recommendations are generated automatically based on your {activeTab}. Update your profile to get better matches.</p>
            </div>
          )}
        </div>
        
        <div className="md:col-span-3">
          {loading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-64 rounded-3xl bg-white/40 animate-pulse border border-white/40"></div>
                ))}
             </div>
          ) : users.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((item, idx) => (
                <UserCard 
                  key={item.user?.id || idx} 
                  user={item.user || item} 
                  matchReason={item.mutualInterests ? `${item.mutualInterests} mutual interests` : item.mutualSkillsCount ? `${item.mutualSkillsCount} mutual skills` : item.weight ? `Social Score: ${item.weight}` : undefined}
                  onConnect={() => handleConnect((item.user || item).id)} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-[#86868B] bg-white/40 backdrop-blur-sm rounded-3xl border border-white/40">
              No recommendations found. Try adjusting your filters or updating your profile.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
