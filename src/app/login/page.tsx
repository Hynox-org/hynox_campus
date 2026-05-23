"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Mail, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) console.error("Error logging in:", error.message);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <div className="bg-slate-950 rounded-[2.5rem] p-10 shadow-2xl shadow-slate-950/50 border border-slate-800 relative overflow-hidden">
          {/* Subtle top gradient line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500" />
          
          <div className="flex flex-col items-center mb-10">
            <div className="w-20 h-20 bg-cyan-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-cyan-500/20 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
              <GraduationCap className="text-slate-950 w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold text-white font-heading tracking-tight">Hynox Portal</h1>
            <p className="text-slate-500 mt-2 text-center font-medium text-sm">Professional Learning Management</p>
          </div>

          <div className="space-y-4">
            <button 
              onClick={handleGoogleLogin}
              className="w-full bg-white hover:bg-slate-100 text-slate-950 font-black py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl transition-all active:scale-[0.98] group"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1.01.68-2.31 1.09-3.71 1.09-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              LOGIN WITH GOOGLE
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <p className="text-[10px] text-center text-slate-600 font-bold uppercase tracking-[0.2em] mt-6">
              Exclusive for registered users
            </p>
          </div>

          <p className="mt-10 text-center text-xs font-medium text-slate-600">
            Authorized students only. Need help?{" "}
            <a href="#" className="text-cyan-500 font-bold hover:underline transition-all">Contact Support</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
