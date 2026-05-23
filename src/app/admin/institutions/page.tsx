'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, School, Plus, ShieldCheck } from 'lucide-react';
import InstitutionForm from '@/components/institution/InstitutionForm';
import InstitutionList, { InstitutionListRef } from '@/components/institution/InstitutionList';

export default function AdminInstitutionsPage() {
  const listRef = useRef<InstitutionListRef>(null);

  const handleRefreshList = () => {
    if (listRef.current) {
      listRef.current.refreshList();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-rose-500/30">
      {/* Navigation Header */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/20">
              <ShieldCheck className="text-slate-950 w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white uppercase">Hynox Admin</h1>
              <p className="text-[10px] font-bold text-rose-500 tracking-[0.2em] uppercase">Institution Control Center</p>
            </div>
          </div>
          <Link 
            href="/admin" 
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </nav>

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        <div className="flex items-center gap-3">
          <School className="text-rose-500 w-8 h-8" />
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Institution Management</h2>
            <p className="text-xs text-slate-500 mt-1">Configure schools, colleges, and training partner tenants.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Creation Form Panel */}
          <div className="lg:col-span-5">
            <div className="sticky top-28">
              <InstitutionForm onSuccess={handleRefreshList} />
            </div>
          </div>

          {/* List/Grid Panel */}
          <div className="lg:col-span-7">
            <InstitutionList ref={listRef} />
          </div>
        </div>
      </main>
    </div>
  );
}
