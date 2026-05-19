"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  BookOpen, 
  Code2, 
  Users, 
  Settings, 
  LogOut, 
  Bell, 
  Search,
  Menu,
  X,
  PlusCircle,
  Clock,
  CheckCircle2
} from "lucide-react";

export default function Dashboard() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", active: true },
    { icon: BookOpen, label: "Study Materials", active: false },
    { icon: Code2, label: "My Projects", active: false },
    { icon: Users, label: "Community", active: false },
    { icon: Settings, label: "Settings", active: false },
  ];

  return (
    <div className="flex min-h-screen bg-[#fafafa] dark:bg-[#09090b] text-gray-900 dark:text-gray-100">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? "w-64" : "w-20"
        } transition-all duration-300 glass border-r border-gray-200 dark:border-gray-800 flex flex-col z-20`}
      >
        <div className="p-6 flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 bg-slate-900 dark:bg-cyan-500 rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-slate-900/10 dark:shadow-cyan-500/20">
            <LayoutDashboard className="text-white dark:text-slate-950 w-5 h-5" />
          </div>
          <span className={`font-heading font-bold text-xl transition-opacity duration-300 ${isSidebarOpen ? "opacity-100" : "opacity-0"}`}>
            Hynox
          </span>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {sidebarItems.map((item, index) => (
            <button
              key={index}
              className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-all ${
                item.active 
                  ? "bg-slate-900 dark:bg-cyan-500 text-white dark:text-slate-950 shadow-lg shadow-slate-900/20 dark:shadow-cyan-500/20" 
                  : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span className={`font-medium transition-opacity duration-300 ${isSidebarOpen ? "opacity-100" : "opacity-0"}`}>
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <button className="w-full flex items-center gap-4 px-3 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all">
            <LogOut className="w-5 h-5 shrink-0" />
            <span className={`font-medium transition-opacity duration-300 ${isSidebarOpen ? "opacity-100" : "opacity-0"}`}>
              Sign Out
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-slate-950 border-b border-cyan-500/20 flex items-center justify-between px-8 z-10 shrink-0 shadow-lg shadow-slate-950/20">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="p-2 text-slate-400 hover:bg-slate-900 rounded-lg transition-all"
            >
              {isSidebarOpen ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
            </button>
            <div className="hidden md:flex items-center bg-slate-900 rounded-xl px-4 py-2 border border-slate-800 w-80">
              <Search className="w-4 h-4 text-slate-500 mr-2" />
              <input 
                type="text" 
                placeholder="Search courses, projects..." 
                className="bg-transparent border-none outline-none text-sm w-full text-slate-300 placeholder:text-slate-600"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:bg-slate-900 rounded-lg transition-all">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-cyan-500 rounded-full border-2 border-slate-950"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold leading-none text-white">Student Name</p>
                <p className="text-xs text-slate-500 mt-1">Full Stack Web Dev</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 border-2 border-slate-800 shadow-sm"></div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold font-heading">Welcome, Student! 👋</h1>
              <p className="text-gray-500 mt-1">Here's what's happening in your campus today.</p>
            </div>
            <button className="flex items-center gap-2 bg-slate-900 dark:bg-cyan-500 text-white dark:text-slate-950 px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-slate-900/10 dark:shadow-cyan-500/20 active:scale-[0.98] hover:bg-slate-800 dark:hover:bg-cyan-400">
              <PlusCircle className="w-5 h-5" />
              Submit New Project
            </button>
          </div>

          {/* Empty State / Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Project Card Mock */}
            <div className="glass p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:shadow-cyan-500/5 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-cyan-50 dark:bg-cyan-900/30 rounded-xl flex items-center justify-center text-cyan-600 transition-transform group-hover:scale-110">
                  <Code2 className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-full text-xs font-semibold">In Progress</span>
              </div>
              <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-white">Build a Netflix Clone</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">Complete the frontend using Next.js and Tailwind CSS as discussed in class.</p>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Due in 2 days
                </div>
              </div>
            </div>

            {/* Empty States */}
            <div className="glass p-6 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="font-bold text-gray-400">No Active Courses</h3>
              <p className="text-sm text-gray-400 max-w-[200px] mt-2">Join a physical class to get your study materials here.</p>
            </div>

            <div className="glass p-6 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="font-bold text-gray-400">All Caught Up!</h3>
              <p className="text-sm text-gray-400 max-w-[200px] mt-2">You've completed all your assigned tasks for this week.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
