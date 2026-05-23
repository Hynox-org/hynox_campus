'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Bell, 
  Lock, 
  ShieldAlert, 
  Save, 
  CheckCircle2, 
  Fingerprint
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [notifications, setNotifications] = useState({
    quizReminders: true,
    projectGrading: true,
    generalAnnouncements: false
  });
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      const { data: { user: activeUser } } = await supabase.auth.getUser();
      if (activeUser) {
        setUser(activeUser);
        setEmail(activeUser.email || '');
        setFullName(activeUser.user_metadata?.full_name || activeUser.email?.split('@')[0] || 'Scholar');
      }
    }
    fetchUser();
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 2000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Header */}
      <div>
        <h2 className="text-3xl font-black text-white tracking-tight uppercase">Account Settings</h2>
        <p className="text-slate-400 text-xs mt-1">Manage your campus profile, security preferences, and dashboard notification settings.</p>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile Card Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* General Profile settings */}
          <div className="bg-slate-900/40 border border-slate-850 rounded-[2rem] p-6 md:p-8 space-y-6">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <User className="w-4.5 h-4.5 text-cyan-400" />
              Student Profile
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Full Name</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-xs text-slate-200 focus:border-cyan-500/50 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Email Address</label>
                <input 
                  type="email" 
                  disabled
                  value={email}
                  className="w-full bg-slate-950/60 border border-slate-850/80 rounded-xl px-4 py-3 text-xs text-slate-400 cursor-not-allowed"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Student Roll No.</label>
                <input 
                  type="text" 
                  disabled
                  value="HY-2026-CS-409"
                  className="w-full bg-slate-950/60 border border-slate-850/80 rounded-xl px-4 py-3 text-xs text-slate-400 cursor-not-allowed font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Institution Scope</label>
                <input 
                  type="text" 
                  disabled
                  value="School of Computer Engineering"
                  className="w-full bg-slate-950/60 border border-slate-850/80 rounded-xl px-4 py-3 text-xs text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Security details placeholder */}
          <div className="bg-slate-900/40 border border-slate-850 rounded-[2rem] p-6 md:p-8 space-y-6">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-4.5 h-4.5 text-cyan-400" />
              Security Settings
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-950/40 border border-slate-850 rounded-2xl">
                <div className="flex items-center gap-3">
                  <Fingerprint className="text-slate-500 w-6 h-6" />
                  <div>
                    <h4 className="text-xs font-bold text-white">OAuth / Google Integration</h4>
                    <p className="text-[10px] text-slate-550 mt-0.5">Secure Google SSO authentication active.</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-md text-[9px] font-bold uppercase tracking-wider">
                  Linked
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Preferences / Toggles Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900/40 border border-slate-850 rounded-[2rem] p-6 space-y-6">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Bell className="w-4.5 h-4.5 text-cyan-400" />
              Alert Toggles
            </h3>

            <div className="space-y-4">
              
              {/* Toggle 1 */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Quiz Deadlines</h4>
                  <p className="text-[9px] text-slate-500 mt-0.5">Receive reminders 24h before test expires.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifications(prev => ({ ...prev, quizReminders: !prev.quizReminders }))}
                  className={`w-10 h-6 rounded-full p-1 transition-all ${
                    notifications.quizReminders ? 'bg-cyan-500' : 'bg-slate-950 border border-slate-800'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full transition-transform ${
                    notifications.quizReminders ? 'translate-x-4 bg-slate-950' : 'translate-x-0 bg-slate-600'
                  }`} />
                </button>
              </div>

              {/* Toggle 2 */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Project Grades</h4>
                  <p className="text-[9px] text-slate-500 mt-0.5">Get notified immediately when project is graded.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifications(prev => ({ ...prev, projectGrading: !prev.projectGrading }))}
                  className={`w-10 h-6 rounded-full p-1 transition-all ${
                    notifications.projectGrading ? 'bg-cyan-500' : 'bg-slate-950 border border-slate-800'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full transition-transform ${
                    notifications.projectGrading ? 'translate-x-4 bg-slate-950' : 'translate-x-0 bg-slate-600'
                  }`} />
                </button>
              </div>

              {/* Toggle 3 */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Campus News</h4>
                  <p className="text-[9px] text-slate-500 mt-0.5">Alerts for system updates & schedules.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifications(prev => ({ ...prev, generalAnnouncements: !prev.generalAnnouncements }))}
                  className={`w-10 h-6 rounded-full p-1 transition-all ${
                    notifications.generalAnnouncements ? 'bg-cyan-500' : 'bg-slate-950 border border-slate-800'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full transition-transform ${
                    notifications.generalAnnouncements ? 'translate-x-4 bg-slate-950' : 'translate-x-0 bg-slate-600'
                  }`} />
                </button>
              </div>

            </div>
          </div>

          {/* Submit */}
          <div className="space-y-3">
            <button 
              type="submit"
              className="w-full py-4 bg-cyan-500 text-slate-950 font-black rounded-xl text-xs tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-cyan-500/10"
            >
              <Save className="w-4 h-4" />
              <span>SAVE CONFIGURATIONS</span>
            </button>

            {isSaved && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-xs bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Preferences updated successfully!</span>
              </motion.div>
            )}
          </div>
        </div>

      </form>

    </div>
  );
}
