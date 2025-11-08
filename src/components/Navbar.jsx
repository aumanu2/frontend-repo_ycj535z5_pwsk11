import React from 'react';
import { LogOut, User } from 'lucide-react';

export default function Navbar({ user, onLogout, month, setMonth }) {
  return (
    <header className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/70 bg-neutral-950 border-b border-neutral-900">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-orange-500 to-orange-700" />
          <div>
            <div className="text-orange-400 font-semibold leading-none">Warrior Second</div>
            <div className="text-xs text-neutral-400">Monthly Summary</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select value={month} onChange={(e)=>setMonth(e.target.value)} className="bg-neutral-900 border border-neutral-800 text-neutral-200 rounded px-2 py-1">
            {Array.from({ length: 12 }).map((_, i) => {
              const m = String(i+1).padStart(2,'0');
              const y = new Date().getFullYear();
              const v = `${y}-${m}`;
              const label = new Date(`${v}-01`).toLocaleDateString('id-ID',{ month:'long', year:'numeric' });
              return <option key={v} value={v}>{label}</option>;
            })}
          </select>
          <div className="flex items-center gap-2 text-neutral-300">
            <User size={16} />
            <span className="text-sm">{user?.username}</span>
          </div>
          <button onClick={onLogout} className="inline-flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 px-3 py-2 rounded">
            <LogOut size={16}/>Logout
          </button>
        </div>
      </div>
    </header>
  );
}
