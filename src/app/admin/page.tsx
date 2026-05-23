'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  School, 
  UploadCloud, 
  Plus, 
  ShieldCheck, 
  LayoutDashboard, 
  Search,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Copy,
  ExternalLink,
  LogOut
} from 'lucide-react';
import { bulkOnboardUsers } from '@/actions/user-actions';
import { createInstitutionAction } from '@/actions/institution-actions';
import { supabase } from '@/lib/supabase/client';
import * as XLSX from 'xlsx';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'institutions' | 'users'>('overview');
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Institution Form State
  const [instName, setInstName] = useState('');
  const [instCode, setInstCode] = useState('');
  const [instType, setInstType] = useState<'school' | 'college'>('college');

  // Bulk Onboard States
  const [csvData, setCsvData] = useState('');
  const [uploadStatus, setUploadStatus] = useState<{success?: boolean, message?: string, users?: any[]} | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Excel Specific States
  const [onboardMode, setOnboardMode] = useState<'excel' | 'text'>('excel');
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [parsedUsers, setParsedUsers] = useState<any[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [excelError, setExcelError] = useState<string | null>(null);

  useEffect(() => {
    fetchInstitutions();
  }, []);

  async function fetchInstitutions() {
    const { data } = await supabase.schema('institution').from('institutions').select('*');
    if (data) setInstitutions(data);
  }

  const handleCreateInstitution = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const slug = instName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const res = await createInstitutionAction({
      name: instName,
      slug,
      institution_code: instCode,
      institution_type: instType,
      status: 'active'
    });
    if (res.success) {
      setInstName('');
      setInstCode('');
      setInstType('college');
      fetchInstitutions();
    } else {
      alert(res.error || 'Failed to create institution');
    }
    setIsLoading(false);
  };

  const handleBulkUpload = async () => {
    setIsLoading(true);
    setUploadStatus(null);
    try {
      const rows = csvData.split('\n').filter(row => row.trim() !== '');
      if (rows.length === 0) {
        throw new Error('No user data found. Please paste some comma-separated values.');
      }

      const users = rows.map((row, index) => {
        const parts = row.split(',').map(s => s.trim());
        if (parts.length < 3) {
          throw new Error(`Row ${index + 1} ("${row}") is malformed. Every row must have at least: email, name, role.`);
        }

        const email = parts[0];
        const full_name = parts[1];
        const role = parts[2] as any;
        const institutionRef = parts[3];

        if (!email || !full_name || !role) {
          throw new Error(`Row ${index + 1} is missing required fields (email, name, or role).`);
        }

        let instId = undefined;
        if (institutionRef) {
          if (institutionRef.includes('-') && institutionRef.length > 20) {
            instId = institutionRef;
          } else {
            const match = institutions.find(
              i => i.institution_code && i.institution_code.toLowerCase() === institutionRef.toLowerCase()
            );
            if (match) {
              instId = match.id;
            } else {
              throw new Error(`Institution code "${institutionRef}" in row ${index + 1} is not registered.`);
            }
          }
        }

        return { email, full_name, role, institution_id: instId };
      });

      const res = await bulkOnboardUsers(users);
      if (res.success) {
        setUploadStatus({ 
          success: true, 
          message: `Successfully pre-registered ${res.count} users!`,
          users: res.users 
        });
        setCsvData('');
      } else {
        setUploadStatus({ success: false, message: res.error || 'Upload failed' });
      }
    } catch (err: any) {
      console.error('CSV Parsing Error:', err);
      setUploadStatus({ 
        success: false, 
        message: err.message || 'Invalid CSV format. Please make sure rows are comma-separated.' 
      });
    }
    setIsLoading(false);
  };

  const handleDownloadTemplate = () => {
    const headers = ['Email', 'Full Name', 'Role', 'Institution Code'];
    const sampleData = [
      {
        'Email': 'student1@gmail.com',
        'Full Name': 'Ajay Kumar',
        'Role': 'student',
        'Institution Code': 'SNS-2026'
      },
      {
        'Email': 'teacher1@gmail.com',
        'Full Name': 'Dr. Rajesh Kumar',
        'Role': 'teacher',
        'Institution Code': 'SNS-2026'
      }
    ];
    
    const worksheet = XLSX.utils.json_to_sheet(sampleData, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Onboarding Template');
    XLSX.writeFile(workbook, 'hynox_bulk_onboard_template.xlsx');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const processSelectedFile = (file: File) => {
    setExcelFile(file);
    setExcelError(null);
    setUploadStatus(null);
    setParsedUsers([]);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonRows = XLSX.utils.sheet_to_json(worksheet) as any[];
        
        if (jsonRows.length === 0) {
          throw new Error('The spreadsheet is empty. Please add some user rows.');
        }

        const users = jsonRows.map((row, idx) => {
          const getVal = (keys: string[]) => {
            for (const k of keys) {
              const foundKey = Object.keys(row).find(
                rk => rk.toLowerCase().trim() === k.toLowerCase().trim()
              );
              if (foundKey && row[foundKey] !== undefined) {
                return String(row[foundKey]).trim();
              }
            }
            return '';
          };

          const email = getVal(['email', 'e-mail', 'email address', 'mail']);
          const full_name = getVal(['full name', 'name', 'student name', 'member name', 'user name']);
          const role = getVal(['role', 'user role', 'type']).toLowerCase();
          const institutionRef = getVal(['institution code', 'institution', 'institution id', 'code']);

          if (!email || !full_name || !role) {
            throw new Error(`Row ${idx + 2} in sheet is missing required fields. Every row must have: Email, Full Name, and Role.`);
          }

          const validRoles = ['student', 'teacher', 'institution_admin', 'super_admin'];
          if (!validRoles.includes(role)) {
            throw new Error(`Row ${idx + 2}: Role "${role}" is invalid. Must be 'student', 'teacher', or 'institution_admin'.`);
          }

          let instId = undefined;
          if (institutionRef) {
            if (institutionRef.includes('-') && institutionRef.length > 20) {
              instId = institutionRef;
            } else {
              const match = institutions.find(
                i => (i.institution_code && i.institution_code.toLowerCase() === institutionRef.toLowerCase()) || 
                     (i.name && i.name.toLowerCase() === institutionRef.toLowerCase())
              );
              if (match) {
                instId = match.id;
              } else {
                throw new Error(`Row ${idx + 2}: Institution "${institutionRef}" is not registered in the system.`);
              }
            }
          }

          return {
            email,
            full_name,
            role,
            institution_id: instId,
            institutionRef: institutionRef || 'None'
          };
        });

        setParsedUsers(users);
      } catch (err: any) {
        console.error('File parsing error:', err);
        setExcelError(err.message || 'Failed to parse file. Please verify columns.');
        setParsedUsers([]);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (['xlsx', 'xls', 'csv'].includes(ext || '')) {
        processSelectedFile(file);
      } else {
        setExcelError('Invalid file type. Only Excel (.xlsx, .xls) and CSV (.csv) files are supported.');
      }
    }
  };

  const handleExcelSubmit = async () => {
    if (parsedUsers.length === 0) return;
    setIsLoading(true);
    setUploadStatus(null);
    try {
      const cleanedUsers = parsedUsers.map(u => ({
        email: u.email,
        full_name: u.full_name,
        role: u.role,
        institution_id: u.institution_id
      }));

      const res = await bulkOnboardUsers(cleanedUsers);
      if (res.success) {
        setUploadStatus({
          success: true,
          message: `Successfully onboarded ${res.count} users from Excel sheet!`,
          users: res.users
        });
        setExcelFile(null);
        setParsedUsers([]);
      } else {
        setUploadStatus({ success: false, message: res.error || 'Upload failed' });
      }
    } catch (err: any) {
      setUploadStatus({ success: false, message: err.message || 'Onboarding failed.' });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-rose-500/30">
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/20">
              <ShieldCheck className="text-slate-950 w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white uppercase">Hynox Admin</h1>
              <p className="text-[10px] font-bold text-rose-500 tracking-[0.2em] uppercase">Platform Controller</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex bg-slate-950 border border-slate-800 rounded-full px-4 py-2 items-center gap-3">
              <Search className="w-4 h-4 text-slate-500" />
              <input type="text" placeholder="Global search..." className="bg-transparent text-sm focus:outline-none w-48" />
            </div>
            <button className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center hover:bg-slate-700 transition-colors">
              <Users className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="w-full md:w-64 space-y-2">
            {[
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'institutions', label: 'Institutions', icon: School },
              { id: 'users', label: 'User Onboarding', icon: UploadCloud },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 font-bold ${
                  activeTab === tab.id 
                    ? 'bg-rose-500 text-slate-950 shadow-xl shadow-rose-500/20' 
                    : 'hover:bg-slate-900 text-slate-500 hover:text-slate-200'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
            
            <div className="pt-4 border-t border-slate-800/80 my-4" />
            
            <button
              onClick={async () => {
                setIsLoading(true);
                await supabase.auth.signOut();
                window.location.href = '/login';
              }}
              disabled={isLoading}
              className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 font-bold text-rose-500/80 hover:text-rose-400 hover:bg-rose-500/5 active:scale-[0.98] border border-transparent hover:border-rose-500/10 disabled:opacity-50"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </aside>

          <div className="flex-1">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                  <StatCard label="Total Students" value="1,284" icon={Users} color="cyan" />
                  <StatCard label="Active Teachers" value="86" icon={Users} color="emerald" />
                  <StatCard label="Colleges" value={institutions.length.toString()} icon={School} color="indigo" />
                  
                  <div className="md:col-span-3 bg-slate-900/50 border border-slate-800 rounded-[2rem] p-8 mt-4">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                      <LayoutDashboard className="text-rose-500" /> System Health
                    </h2>
                    <div className="h-48 flex items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-3xl">
                      Live activity analytics graph will render here.
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'institutions' && (
                <motion.div
                  key="institutions"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-8">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                      <Plus className="text-rose-500" /> Register New Institution
                    </h2>
                    <form onSubmit={handleCreateInstitution} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Institution Name</label>
                        <input 
                          value={instName}
                          onChange={(e) => setInstName(e.target.value)}
                          placeholder="e.g. Hynox Tech Institute"
                          className="w-full px-6 py-4 rounded-2xl bg-slate-950 border border-slate-800 focus:border-rose-500 focus:outline-none transition-all"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Unique Code</label>
                        <input 
                          value={instCode}
                          onChange={(e) => setInstCode(e.target.value)}
                          placeholder="e.g. HTI-2024"
                          className="w-full px-6 py-4 rounded-2xl bg-slate-950 border border-slate-800 focus:border-rose-500 focus:outline-none transition-all"
                          required
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Institution Type</label>
                        <div className="flex gap-4">
                          {[
                            { id: 'college', label: 'College / University' },
                            { id: 'school', label: 'School' }
                          ].map((t) => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => setInstType(t.id as any)}
                              className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold border transition-all ${
                                instType === t.id
                                  ? 'bg-rose-500 text-slate-950 border-rose-500 shadow-md shadow-rose-500/10'
                                  : 'border-slate-800 text-slate-400 hover:text-slate-200 bg-slate-950'
                              }`}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <button 
                        disabled={isLoading}
                        className="md:col-span-2 bg-rose-500 text-slate-950 font-black py-4 rounded-2xl shadow-xl shadow-rose-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                      >
                        {isLoading ? 'PROCESSING...' : 'ADD INSTITUTION'}
                      </button>
                    </form>
                  </div>

                  <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] overflow-hidden">
                    <div className="p-8 border-b border-slate-800">
                      <h2 className="text-xl font-bold flex items-center gap-3">
                        <School className="text-rose-500" /> Active Institutions
                      </h2>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-slate-950/50 text-[10px] font-black uppercase tracking-widest text-slate-500">
                          <tr>
                            <th className="px-8 py-5">Name</th>
                            <th className="px-8 py-5">Code</th>
                            <th className="px-8 py-5">Type</th>
                            <th className="px-8 py-5">Created At</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                          {institutions.map((inst) => (
                            <tr key={inst.id} className="hover:bg-slate-800/20 transition-colors group">
                              <td className="px-8 py-6 font-bold text-white">{inst.name}</td>
                              <td className="px-8 py-6 text-slate-400 font-mono text-xs">{inst.institution_code}</td>
                              <td className="px-8 py-6 text-xs">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                  inst.institution_type === 'school'
                                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                }`}>
                                  {inst.institution_type || 'college'}
                                </span>
                              </td>
                              <td className="px-8 py-6 text-slate-500 text-sm">{new Date(inst.created_at).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'users' && (
                <motion.div
                  key="users"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                      <div>
                        <h2 className="text-xl font-bold flex items-center gap-3">
                          <UploadCloud className="text-rose-500" /> Bulk User Onboarding
                        </h2>
                        <p className="text-slate-500 text-sm mt-1 font-medium">Pre-register professional roles using Excel spreadsheets or CSV.</p>
                      </div>
                      
                      <div className="flex items-center gap-2 bg-slate-950 p-1.5 border border-slate-800 rounded-2xl shrink-0">
                        <button
                          type="button"
                          onClick={() => { setOnboardMode('excel'); setUploadStatus(null); }}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
                            onboardMode === 'excel'
                              ? 'bg-rose-500 text-slate-950 shadow-md shadow-rose-500/10'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Excel File
                        </button>
                        <button
                          type="button"
                          onClick={() => { setOnboardMode('text'); setUploadStatus(null); }}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
                            onboardMode === 'text'
                              ? 'bg-rose-500 text-slate-950 shadow-md shadow-rose-500/10'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Raw CSV Text
                        </button>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {onboardMode === 'excel' && (
                        <div className="space-y-6">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl">
                            <div className="text-xs text-slate-400 leading-relaxed">
                              💡 <strong>Format Guide:</strong> Columns should be named: <code className="text-white">Email</code>, <code className="text-white">Full Name</code>, <code className="text-white">Role</code> (student/teacher), and <code className="text-white">Institution Code</code>.
                            </div>
                            <button
                              type="button"
                              onClick={handleDownloadTemplate}
                              className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/25 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0"
                            >
                              <FileSpreadsheet className="w-4 h-4" />
                              Download Template
                            </button>
                          </div>

                          <div
                            onDragEnter={handleDrag}
                            onDragOver={handleDrag}
                            onDragLeave={handleDrag}
                            onDrop={handleDrop}
                            className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all duration-300 relative flex flex-col items-center justify-center min-h-[200px] ${
                              dragActive
                                ? 'border-rose-500 bg-rose-500/5'
                                : 'border-slate-800 bg-slate-950/30 hover:border-slate-700'
                            }`}
                          >
                            <input
                              type="file"
                              id="excel-file-upload"
                              className="hidden"
                              accept=".xlsx,.xls,.csv"
                              onChange={handleFileChange}
                            />
                            
                            <UploadCloud className="w-12 h-12 text-slate-500 mb-3 animate-bounce" />
                            
                            {excelFile ? (
                              <div>
                                <p className="text-white font-bold text-sm mb-1">{excelFile.name}</p>
                                <p className="text-slate-500 text-xs font-mono">{(excelFile.size / 1024).toFixed(2)} KB</p>
                              </div>
                            ) : (
                              <div>
                                <p className="text-white font-bold text-sm mb-1">Drag &amp; drop your Excel sheet here</p>
                                <p className="text-slate-500 text-xs mb-4">Supports .xlsx, .xls, and .csv formats</p>
                              </div>
                            )}

                            <label
                              htmlFor="excel-file-upload"
                              className="mt-4 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all border border-slate-700"
                            >
                              {excelFile ? 'Choose Different File' : 'Browse Files'}
                            </label>
                          </div>

                          {excelError && (
                            <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl flex items-center gap-3 font-bold text-xs">
                              <AlertCircle className="w-4 h-4 shrink-0" />
                              {excelError}
                            </div>
                          )}

                          {parsedUsers.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden"
                            >
                              <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                                <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Spreadsheet Preview ({parsedUsers.length} Users Parsed)</h3>
                                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded">Valid Sheet</span>
                              </div>
                              <div className="max-h-[260px] overflow-y-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                  <thead className="bg-slate-900 sticky top-0 text-[10px] font-black uppercase text-slate-500 tracking-widest border-b border-slate-800">
                                    <tr>
                                      <th className="px-6 py-3">Full Name</th>
                                      <th className="px-6 py-3">Email Address</th>
                                      <th className="px-6 py-3">Role</th>
                                      <th className="px-6 py-3">Institution Code</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-800/50">
                                    {parsedUsers.slice(0, 10).map((u, i) => (
                                      <tr key={i} className="hover:bg-slate-800/10 transition-colors">
                                        <td className="px-6 py-3.5 font-bold text-white">{u.full_name}</td>
                                        <td className="px-6 py-3.5 text-slate-300 font-mono">{u.email}</td>
                                        <td className="px-6 py-3.5">
                                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                            u.role === 'student'
                                              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                                              : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                          }`}>
                                            {u.role}
                                          </span>
                                        </td>
                                        <td className="px-6 py-3.5 text-slate-400 font-mono">{u.institutionRef}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                              {parsedUsers.length > 10 && (
                                <div className="px-6 py-3 bg-slate-900/40 text-[10px] text-slate-500 font-bold border-t border-slate-800 text-center uppercase tracking-widest">
                                  + and {parsedUsers.length - 10} more rows parsed...
                                </div>
                              )}
                            </motion.div>
                          )}
                        </div>
                      )}

                      {onboardMode === 'text' && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between ml-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">CSV Data Input</label>
                            <span className="text-[10px] text-rose-400 font-mono">Supports Institution UUID or short Code (e.g. SNS-2026)</span>
                          </div>
                          <textarea 
                            value={csvData}
                            onChange={(e) => setCsvData(e.target.value)}
                            rows={8}
                            placeholder="student1@gmail.com, John Doe, student, SNS-2026&#10;teacher1@gmail.com, Sarah Smith, teacher, SNS-2026"
                            className="w-full p-6 rounded-2xl bg-slate-950 border border-slate-800 focus:border-rose-500 focus:outline-none transition-all font-mono text-sm leading-relaxed"
                          />
                        </div>
                      )}

                      {uploadStatus && (
                        <div className="space-y-4">
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`p-4 rounded-2xl flex items-center gap-3 font-bold text-sm ${
                              uploadStatus.success ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                            }`}
                          >
                            {uploadStatus.success ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                            {uploadStatus.message}
                          </motion.div>

                          {uploadStatus.success && uploadStatus.users && uploadStatus.users.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 max-h-[300px] overflow-y-auto"
                            >
                              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Generated Onboarding Invitation Links</h3>
                              <div className="space-y-3">
                                {uploadStatus.users.map((u, idx) => {
                                  const fullLink = `${window.location.origin}${u.verificationLink}`;
                                  return (
                                    <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 bg-slate-900 rounded-xl border border-slate-800/60 hover:border-slate-700 transition-colors">
                                      <div className="overflow-hidden max-w-[60%]">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                           <p className="text-white font-bold text-xs truncate">{u.full_name} ({u.email})</p>
                                           {u.emailSent ? (
                                             <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md text-[9px] font-bold uppercase tracking-wider shrink-0 flex items-center gap-1">
                                               <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                               📩 Sent
                                             </span>
                                           ) : (
                                             <span 
                                               className="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-md text-[9px] font-bold uppercase tracking-wider shrink-0 flex items-center gap-1 cursor-help"
                                               title={u.emailError || 'SMTP Delivery failed'}
                                             >
                                               <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                                               ⚠️ Failed
                                             </span>
                                           )}
                                         </div>
                                        <p className="text-[10px] text-slate-500 font-mono break-all select-all">{fullLink}</p>
                                      </div>
                                      <div className="flex gap-2 shrink-0">
                                        <button
                                          onClick={() => {
                                            navigator.clipboard.writeText(fullLink);
                                            setCopiedIndex(idx);
                                            setTimeout(() => setCopiedIndex(null), 2000);
                                          }}
                                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-[10px] font-bold flex items-center gap-1.5 text-white active:scale-95 transition-all"
                                        >
                                          <Copy className="w-3.5 h-3.5" />
                                          {copiedIndex === idx ? 'Copied!' : 'Copy Link'}
                                        </button>
                                        <a
                                          href={u.verificationLink}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-slate-950 rounded-lg text-[10px] font-bold flex items-center gap-1.5 active:scale-95 transition-all"
                                        >
                                          <ExternalLink className="w-3.5 h-3.5" />
                                          Test Page
                                        </a>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </div>
                      )}

                      {onboardMode === 'excel' ? (
                        <button 
                          onClick={handleExcelSubmit}
                          disabled={isLoading || parsedUsers.length === 0}
                          className="w-full bg-white text-slate-950 font-black py-4 rounded-2xl shadow-xl shadow-white/5 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {isLoading ? 'PROCESSING ONBOARDING...' : 'START ONBOARDING FROM EXCEL'}
                        </button>
                      ) : (
                        <button 
                          onClick={handleBulkUpload}
                          disabled={isLoading || !csvData.trim()}
                          className="w-full bg-white text-slate-950 font-black py-4 rounded-2xl shadow-xl shadow-white/5 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {isLoading ? 'PROCESSING UPLOAD...' : 'START ONBOARDING FROM CSV'}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: any) {
  const colors: any = {
    cyan: 'from-cyan-500/20 to-blue-500/5 border-cyan-500/30 text-cyan-500',
    emerald: 'from-emerald-500/20 to-teal-500/5 border-emerald-500/30 text-emerald-500',
    indigo: 'from-indigo-500/20 to-violet-500/5 border-indigo-500/30 text-indigo-500',
    rose: 'from-rose-500/20 to-pink-500/5 border-rose-500/30 text-rose-500',
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-3xl p-8 shadow-2xl transition-all hover:scale-[1.02] duration-500`}>
      <div className="flex items-center justify-between mb-4">
        <Icon className="w-6 h-6" />
        <div className={`w-2 h-2 rounded-full bg-current animate-pulse`} />
      </div>
      <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">{label}</p>
      <h3 className="text-4xl font-black text-white tracking-tighter">{value}</h3>
    </div>
  );
}
