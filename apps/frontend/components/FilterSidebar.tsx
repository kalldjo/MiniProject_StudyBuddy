import React from 'react';

export default function FilterSidebar() {
  return (
    <aside className="w-64 p-6 bg-white/60 backdrop-blur-xl border border-white/40 shadow-sm shadow-black/5 rounded-3xl h-fit">
      <h2 className="text-xl font-semibold text-black tracking-tight mb-6">Filters</h2>
      
      <div className="flex flex-col gap-6">
        <div>
          <h3 className="text-sm font-semibold text-zinc-500 mb-3 uppercase tracking-wider">Fakultas</h3>
          <select className="w-full p-2.5 bg-white/50 border border-black/10 rounded-xl outline-none focus:ring-2 focus:ring-black/20 text-sm">
            <option>Semua Fakultas</option>
            <option>Fasilkom</option>
            <option>Teknik</option>
          </select>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-zinc-500 mb-3 uppercase tracking-wider">Jurusan</h3>
          <select className="w-full p-2.5 bg-white/50 border border-black/10 rounded-xl outline-none focus:ring-2 focus:ring-black/20 text-sm">
            <option>Semua Jurusan</option>
            <option>Ilmu Komputer</option>
            <option>Sistem Informasi</option>
          </select>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-zinc-500 mb-3 uppercase tracking-wider">Angkatan</h3>
          <select className="w-full p-2.5 bg-white/50 border border-black/10 rounded-xl outline-none focus:ring-2 focus:ring-black/20 text-sm">
            <option>Semua Angkatan</option>
            <option>2023</option>
            <option>2024</option>
          </select>
        </div>
      </div>
    </aside>
  );
}
