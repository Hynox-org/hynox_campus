'use client';

import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { getInstitutionsAction } from '@/lib/actions/institution-actions';

export interface InstitutionListRef {
  refreshList: () => void;
}

const InstitutionList = forwardRef<InstitutionListRef, {}>((props, ref) => {
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchList = async () => {
    setLoading(true);
    setError(null);
    const res = await getInstitutionsAction();
    if (res.success && res.data) {
      setInstitutions(res.data);
    } else {
      setError(res.error || 'Failed to retrieve institutions.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchList();
  }, []);

  useImperativeHandle(ref, () => ({
    refreshList() {
      fetchList();
    }
  }));

  if (loading && institutions.length === 0) {
    return <div className="text-center py-8 text-slate-500 font-bold text-sm">Loading institutions...</div>;
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold text-xs text-center">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
      <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/60">
        <h2 className="text-lg font-bold text-white">Active Institutions ({institutions.length})</h2>
        <button
          onClick={fetchList}
          className="px-3 py-1.5 bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-bold active:scale-[0.98] transition-all"
        >
          Refresh
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-slate-950 text-[10px] font-black uppercase text-slate-500 tracking-widest border-b border-slate-850">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Code</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Created At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-850">
            {institutions.map((inst) => (
              <tr key={inst.id} className="hover:bg-slate-850/10 transition-colors">
                <td className="px-6 py-4 font-bold text-white">{inst.name}</td>
                <td className="px-6 py-4 text-slate-400 font-mono text-xs">{inst.institution_code}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded text-[10px] font-bold uppercase tracking-wider">
                    {inst.institution_type}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    inst.status === 'active' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-slate-500/10 text-slate-400 border border-slate-700/20'
                  }`}>
                    {inst.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500 text-xs">
                  {new Date(inst.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
            {institutions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic text-xs">
                  No institutions registered yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
});

InstitutionList.displayName = 'InstitutionList';

export default InstitutionList;
