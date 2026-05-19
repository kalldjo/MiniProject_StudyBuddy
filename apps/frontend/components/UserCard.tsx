import React from 'react';

export default function UserCard({ user, matchReason }: { user: any, matchReason?: string }) {
  // Apple-like glassmorphism setup
  return (
    <div className="flex flex-col p-6 bg-white/60 backdrop-blur-xl border border-white/40 shadow-sm shadow-black/5 rounded-3xl transition-all hover:shadow-md hover:-translate-y-1">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-zinc-200" />
        <div>
          <h3 className="text-lg font-semibold text-black tracking-tight">{user?.name || 'Unknown User'}</h3>
          <p className="text-sm text-zinc-500">{user?.bio || 'No bio available'}</p>
        </div>
      </div>
      {matchReason && (
        <div className="mt-2 text-xs font-medium text-zinc-600 bg-black/5 rounded-lg px-3 py-2">
          {matchReason}
        </div>
      )}
      <button className="mt-4 w-full py-2 bg-black text-white rounded-xl font-medium tracking-tight hover:bg-zinc-800 transition-colors">
        Connect
      </button>
    </div>
  );
}
