'use client';

import React, { useState, useEffect } from 'react';
import { createInstitutionAction, getInstitutionTypesAction } from '@/actions/institution-actions';

interface InstitutionFormProps {
  onSuccess: () => void;
}

export default function InstitutionForm({ onSuccess }: InstitutionFormProps) {
  const [types, setTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');

  useEffect(() => {
    async function loadTypes() {
      const res = await getInstitutionTypesAction();
      if (res.success && res.data) {
        setTypes(res.data);
        if (res.data.length > 0) {
          setType(res.data[0].code);
        }
      } else {
        setMessage({ type: 'error', text: res.error || 'Failed to load institution types.' });
      }
    }
    loadTypes();
  }, []);

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    const autoSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    setSlug(autoSlug);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (!name || !slug || !code || !type) {
      setMessage({ type: 'error', text: 'Please fill in all required fields (Name, Slug, Code, Type).' });
      setLoading(false);
      return;
    }

    const res = await createInstitutionAction({
      name,
      slug,
      institution_code: code,
      institution_type: type,
      email: email || undefined,
      phone: phone || undefined,
      address: address || undefined,
      website: website || undefined
    });

    if (res.success) {
      const auditText = res.auditVerified 
        ? 'Audit Log Verified successfully!' 
        : 'Warning: Could not verify audit log record creation.';
        
      setMessage({ 
        type: 'success', 
        text: `Institution "${res.data?.name}" created successfully. ${auditText}` 
      });
      
      // Clear form
      setName('');
      setSlug('');
      setCode('');
      setEmail('');
      setPhone('');
      setAddress('');
      setWebsite('');
      
      onSuccess();
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to create institution.' });
    }
    setLoading(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-2xl mx-auto shadow-2xl">
      <h2 className="text-xl font-bold mb-6 text-white border-b border-slate-800 pb-3">Create Institution</h2>
      
      {message && (
        <div className={`p-4 mb-6 rounded-xl font-semibold text-xs border ${
          message.type === 'success' 
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Institution Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder="e.g. Hynox Tech Institute"
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-rose-500 focus:outline-none text-sm text-slate-200"
              required
            />
          </div>

          {/* Slug */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Slug (URL Subdomain) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. hynox-tech"
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-rose-500 focus:outline-none text-sm text-slate-200 font-mono"
              required
            />
          </div>

          {/* Institution Code */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Institution Code <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. HTI-2026"
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-rose-500 focus:outline-none text-sm text-slate-200 font-mono"
              required
            />
          </div>

          {/* Institution Type */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Institution Type <span className="text-rose-500">*</span>
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-rose-500 focus:outline-none text-sm text-slate-400"
              required
            >
              {types.map((t) => (
                <option key={t.code} value={t.code} className="bg-slate-950 text-slate-200">
                  {t.description || t.code}
                </option>
              ))}
            </select>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contact@institution.edu"
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-rose-500 focus:outline-none text-sm text-slate-200"
            />
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 019-2834"
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-rose-500 focus:outline-none text-sm text-slate-200"
            />
          </div>

          {/* Website */}
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Website URL</label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://www.institution.edu"
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-rose-500 focus:outline-none text-sm text-slate-200"
            />
          </div>

          {/* Address */}
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Physical Address</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Campus Dr, City, State, Country"
              rows={2}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-rose-500 focus:outline-none text-sm text-slate-200"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-rose-500 hover:bg-rose-600 text-slate-950 font-black py-4 rounded-xl transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 text-sm uppercase tracking-wider"
        >
          {loading ? 'CREATING...' : 'SUBMIT CREATE'}
        </button>
      </form>
    </div>
  );
}
