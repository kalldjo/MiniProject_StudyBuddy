'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/utils/api';

export default function ProfilePage() {
  const { user, login } = useAuth();
  
  const [profile, setProfile] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    profilePicture: user?.profilePicture || ''
  });
  
  const [academic, setAcademic] = useState({ fakultas: '', jurusan: '', angkatan: '' });
  const [interestsInput, setInterestsInput] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [saving, setSaving] = useState(false);
  
  const handleSave = async () => {
    setSaving(true);
    try {
      await apiFetch('/users/profile', {
        method: 'PUT',
        body: JSON.stringify({ ...profile, ...academic })
      });
      
      const interests = interestsInput.split(',').map(s => s.trim()).filter(Boolean);
      const skills = skillsInput.split(',').map(s => s.trim()).filter(Boolean);
      
      if (interests.length) await apiFetch('/users/interests', { method: 'PUT', body: JSON.stringify({ interests }) });
      if (skills.length) await apiFetch('/users/skills', { method: 'PUT', body: JSON.stringify({ skills }) });
      
      const response = await apiFetch('/auth/me');
      login(response.data.user);
      
      alert('Profile updated successfully!');
    } catch (e) {
      console.error(e);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-[#1D1D1F] mb-8">Profile Settings</h1>
      
      <div className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_0_rgba(0,0,0,0.04)] rounded-3xl p-8 mb-8">
        <h2 className="text-xl font-medium text-[#1D1D1F] mb-6 tracking-tight">Personal Details</h2>
        <div className="flex flex-col gap-5">
          <Input label="Full Name" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} />
          <Input label="Bio" value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} />
          <Input label="Profile Picture URL" value={profile.profilePicture} onChange={e => setProfile({...profile, profilePicture: e.target.value})} />
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_0_rgba(0,0,0,0.04)] rounded-3xl p-8 mb-8">
        <h2 className="text-xl font-medium text-[#1D1D1F] mb-6 tracking-tight">Academic Background</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Input label="Fakultas" placeholder="Fasilkom" value={academic.fakultas} onChange={e => setAcademic({...academic, fakultas: e.target.value})} />
          <Input label="Jurusan" placeholder="Ilmu Komputer" value={academic.jurusan} onChange={e => setAcademic({...academic, jurusan: e.target.value})} />
          <Input label="Angkatan" placeholder="2024" value={academic.angkatan} onChange={e => setAcademic({...academic, angkatan: e.target.value})} />
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_0_rgba(0,0,0,0.04)] rounded-3xl p-8 mb-8">
        <h2 className="text-xl font-medium text-[#1D1D1F] mb-6 tracking-tight">Skills & Interests</h2>
        <div className="flex flex-col gap-5">
          <Input label="Skills (comma separated)" placeholder="React, Node.js, Python" value={skillsInput} onChange={e => setSkillsInput(e.target.value)} />
          <Input label="Interests (comma separated)" placeholder="AI, Web Development" value={interestsInput} onChange={e => setInterestsInput(e.target.value)} />
        </div>
      </div>

      <div className="flex justify-end mb-10">
        <Button onClick={handleSave} className="px-8" disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </main>
  );
}
