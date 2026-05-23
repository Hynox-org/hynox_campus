"use client";

import React, { useState } from "react";
import { 
  Terminal, 
  BookOpen, 
  ExternalLink, 
  Award, 
  FileText, 
  Cpu, 
  CheckCircle2, 
  Sparkles, 
  ChevronRight, 
  Users, 
  Check, 
  Clock, 
  Building,
  Menu,
  X,
  MapPin,
  ArrowRight,
  TrendingUp,
  Search,
  ShieldCheck,
  Zap,
  Info
} from "lucide-react";

function GithubIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

export default function Home() {
  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Interactive Token Verification Mock
  const [tokenInput, setTokenInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [verifyStatus, setVerifyStatus] = useState<"idle" | "verifying" | "success" | "error">("idle");
  const [verifyMessage, setVerifyMessage] = useState("");

  // Interactive Git Checker Mock
  const [repoUrl, setRepoUrl] = useState("github.com/alex-dev/hynox-lab");
  const [gitStatus, setGitStatus] = useState<"idle" | "checking" | "verified">("idle");

  // Interactive AI Resume Polisher Mock
  const [selectedRawBullet, setSelectedRawBullet] = useState(0);
  const [polishState, setPolishState] = useState<"idle" | "polishing" | "completed">("idle");

  const rawBullets = [
    "I made a website for our class assignment using React.",
    "I wrote python scripts to check student files in SQL.",
    "I helped other students fix bugs in their code."
  ];

  const polishedBullets = [
    "Engineered a responsive, full-stack React platform featuring Supabase integration and secure role-based access control.",
    "Architected and deployed automated Python validation scripts to query and audit SQL database structures.",
    "Mentored 15+ student developers by establishing Git workflow guidelines and debugging core project features."
  ];

  // Placement Leaderboard Search Mock
  const [searchTerm, setSearchTerm] = useState("");
  
  // Dummy Leaderboard Data
  const leaderboardData = [
    { name: "Alex Rivera", dept: "Computer Science", resumeStrength: 94, badges: 12, status: "Verified Ready", avatar: "AR" },
    { name: "Meera Patel", dept: "Information Tech", resumeStrength: 91, badges: 14, status: "Verified Ready", avatar: "MP" },
    { name: "Rahul Sharma", dept: "Electronics & Comm", resumeStrength: 88, badges: 9, status: "Interviewing", avatar: "RS" },
    { name: "Jessica Chen", dept: "Computer Science", resumeStrength: 95, badges: 15, status: "Verified Ready", avatar: "JC" },
    { name: "David Vance", dept: "Mechanical Eng", resumeStrength: 85, badges: 7, status: "Preparing", avatar: "DV" },
  ];

  const filteredLeaderboard = leaderboardData.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.dept.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle Token Verification Submit
  const handleTokenVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !tokenInput) {
      setVerifyStatus("error");
      setVerifyMessage("Please provide both a valid email and enrollment token.");
      return;
    }

    setVerifyStatus("verifying");
    setTimeout(() => {
      if (tokenInput.toUpperCase().startsWith("HYN-")) {
        setVerifyStatus("success");
        setVerifyMessage(`Welcome! Invitation verified for ${emailInput}. Redirecting to onboarding wizard...`);
      } else {
        setVerifyStatus("error");
        setVerifyMessage("Invalid invitation token format. Tokens should start with 'HYN-' (e.g., HYN-102-CS).");
      }
    }, 1500);
  };

  // Handle Git Checker Simulation
  const handleGitCheck = () => {
    setGitStatus("checking");
    setTimeout(() => {
      setGitStatus("verified");
    }, 1800);
  };

  // Handle AI Resume Polisher Simulation
  const handleAiPolish = () => {
    setPolishState("polishing");
    setTimeout(() => {
      setPolishState("completed");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background font-sans text-text-primary selection:bg-primary/10 selection:text-primary flex flex-col">
      
      {/* 1. Header / Navigation */}
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-muted-surface shadow-subtle transition-all">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="bg-primary/10 text-primary p-2 rounded-xl border border-primary/20">
              <Terminal size={18} className="stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-text-primary tracking-tight text-sm leading-tight">Hynox Campus</span>
              <span className="text-[10px] text-text-secondary font-medium tracking-wide">ACADEMIC ENGINE v1.0</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-xs font-medium text-text-secondary hover:text-text-primary transition-colors">Core Pillars</a>
            <a href="#demo" className="text-xs font-medium text-text-secondary hover:text-text-primary transition-colors">Digital Sandbox</a>
            <a href="#leaderboard" className="text-xs font-medium text-text-secondary hover:text-text-primary transition-colors">Placement Console</a>
            <a href="#onboarding" className="text-xs font-medium text-text-secondary hover:text-text-primary transition-colors">Onboarding</a>
          </nav>

          {/* Action Button */}
          <div className="hidden md:flex items-center gap-4">
            <a 
              href="#onboarding" 
              className="text-xs font-medium text-primary hover:text-primary/80 transition-colors px-3 py-1.5"
            >
              Portal Login
            </a>
            <a 
              href="#onboarding"
              className="bg-primary text-white text-xs font-medium px-4 py-2 rounded-xl shadow-subtle hover:bg-primary/95 transition-all duration-200"
            >
              Claim Invitation
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-surface border-b border-muted-surface px-6 py-4 flex flex-col gap-4 shadow-subtle">
            <a 
              href="#features" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-text-secondary hover:text-text-primary py-1"
            >
              Core Pillars
            </a>
            <a 
              href="#demo" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-text-secondary hover:text-text-primary py-1"
            >
              Digital Sandbox
            </a>
            <a 
              href="#leaderboard" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-text-secondary hover:text-text-primary py-1"
            >
              Placement Console
            </a>
            <a 
              href="#onboarding" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-text-secondary hover:text-text-primary py-1"
            >
              Onboarding
            </a>
            <div className="h-px bg-muted-surface my-1" />
            <div className="flex flex-col gap-2.5">
              <a 
                href="#onboarding"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-sm font-medium text-primary border border-muted-surface rounded-xl hover:bg-muted-surface transition-all"
              >
                Portal Login
              </a>
              <a 
                href="#onboarding"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-sm font-medium bg-primary text-white rounded-xl shadow-subtle hover:bg-primary/95 transition-all"
              >
                Claim Invitation
              </a>
            </div>
          </div>
        )}
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden py-16 md:py-24 border-b border-muted-surface bg-surface">
        {/* Subtle grid background to look like Vercel/Linear */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35" />
        
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-14">
            
            {/* Version Badge */}
            <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full px-3 py-1 text-xs font-semibold mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Next-Gen Academic ERP
            </div>

            {/* Headline */}
            <h1 className="text-3xl md:text-[2.6rem] md:leading-[3.1rem] font-bold tracking-tight text-text-primary mb-6">
              Bridging Physical Classrooms with Digital Labs & Placements
            </h1>

            {/* Sub-headline */}
            <p className="text-sm md:text-base leading-relaxed text-text-secondary mb-8 max-w-2xl">
              Hynox Campus is an educational portal engineered for modern technical institutions. 
              We replace outdated administrative tools with a Git-first curriculum, automated assignment 
              validation, AI-powered portfolios, and real-time placement tracking dashboards.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
              <a 
                href="#onboarding"
                className="w-full sm:w-auto bg-primary text-white text-xs font-medium px-5 py-3 rounded-xl shadow-subtle hover:bg-primary/95 transition-all duration-200 flex items-center justify-center gap-2 group"
              >
                Claim Invitation Token
                <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </a>
              <a 
                href="#demo"
                className="w-full sm:w-auto bg-surface text-text-primary border border-muted-surface text-xs font-medium px-5 py-3 rounded-xl shadow-subtle hover:bg-muted-surface hover:text-text-primary transition-all duration-200 flex items-center justify-center gap-2"
              >
                Try Live Playground
              </a>
            </div>
          </div>

          {/* Hero Dashboard Preview Mock - Notion / Vercel style */}
          <div className="max-w-5xl mx-auto rounded-xl border border-muted-surface bg-surface shadow-card overflow-hidden">
            
            {/* Window bar */}
            <div className="bg-muted-surface/40 px-4 py-3 border-b border-muted-surface flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-slate-300" />
                <span className="w-3 h-3 rounded-full bg-slate-300" />
                <span className="w-3 h-3 rounded-full bg-slate-300" />
                <span className="text-[11px] font-medium text-text-secondary ml-2 font-mono">console.hynox.in/student/alex-rivera</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-medium text-text-secondary bg-surface border border-muted-surface px-2 py-0.5 rounded-md">
                <span className="w-1.5 h-1.5 rounded-full bg-success" />
                Live Sync
              </div>
            </div>

            {/* Dashboard Workspace */}
            <div className="grid grid-cols-1 md:grid-cols-4 division-x division-muted-surface min-h-[350px]">
              
              {/* Sidebar */}
              <div className="bg-slate-50/50 p-4 border-r border-muted-surface flex flex-col justify-between md:col-span-1">
                <div className="flex flex-col gap-4">
                  
                  {/* Student Profile Card */}
                  <div className="flex items-center gap-2.5 pb-3 border-b border-muted-surface">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                      AR
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-text-primary leading-tight">Alex Rivera</span>
                      <span className="text-[10px] text-text-secondary leading-none">ID: CSE-2026-084</span>
                    </div>
                  </div>

                  {/* Sidebar Nav links */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-primary/5 text-primary text-[11px] font-semibold">
                      <Terminal size={14} />
                      Dashboard
                    </div>
                    <div className="flex items-center justify-between px-2.5 py-1.5 text-[11px] font-medium text-text-secondary hover:text-text-primary hover:bg-slate-50 rounded-lg cursor-pointer">
                      <span className="flex items-center gap-2"><BookOpen size={14} /> Syllabus & Labs</span>
                      <span className="text-[9px] bg-muted-surface px-1.5 py-0.5 rounded font-mono text-text-secondary">Level 3</span>
                    </div>
                    <div className="flex items-center gap-2 px-2.5 py-1.5 text-[11px] font-medium text-text-secondary hover:text-text-primary hover:bg-slate-50 rounded-lg cursor-pointer">
                      <Award size={14} />
                      Earned Badges
                    </div>
                    <div className="flex items-center justify-between px-2.5 py-1.5 text-[11px] font-medium text-text-secondary hover:text-text-primary hover:bg-slate-50 rounded-lg cursor-pointer">
                      <span className="flex items-center gap-2"><FileText size={14} /> Resume Builder</span>
                      <span className="w-2 h-2 rounded-full bg-warning" />
                    </div>
                  </div>
                </div>

                {/* Integration Status */}
                <div className="mt-8 pt-3 border-t border-muted-surface">
                  <div className="flex items-center gap-1.5 text-[10px] text-text-secondary mb-1">
                    <GithubIcon size={12} />
                    <span>GitHub Integration</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-medium text-text-primary">
                    <span className="truncate">alex-dev/hynox-lab</span>
                    <span className="text-success text-[10px] flex items-center gap-0.5">
                      <CheckCircle2 size={10} /> Active
                    </span>
                  </div>
                </div>
              </div>

              {/* Main Console Area */}
              <div className="p-6 md:col-span-3 flex flex-col gap-6">
                
                {/* Stats Header */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-surface border border-muted-surface p-3.5 rounded-xl shadow-subtle">
                    <span className="text-[10px] font-medium text-text-secondary block mb-1">COMPLETION PROGRESS</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-text-primary">82%</span>
                      <span className="text-[10px] text-success font-medium">Level 3/4</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{ width: "82%" }} />
                    </div>
                  </div>

                  <div className="bg-surface border border-muted-surface p-3.5 rounded-xl shadow-subtle">
                    <span className="text-[10px] font-medium text-text-secondary block mb-1">RESUME STRENGTH</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-text-primary">94%</span>
                      <span className="text-[10px] text-success font-medium">ATS Compliant</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-accent h-full rounded-full" style={{ width: "94%" }} />
                    </div>
                  </div>

                  <div className="bg-surface border border-muted-surface p-3.5 rounded-xl shadow-subtle">
                    <span className="text-[10px] font-medium text-text-secondary block mb-1">EARNED CREDITS</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-text-primary">2,850 XP</span>
                      <span className="text-[10px] text-text-secondary font-mono">12 Badges</span>
                    </div>
                    <div className="flex gap-1 mt-2">
                      <span className="w-3.5 h-3.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px] flex items-center justify-center font-bold">R</span>
                      <span className="w-3.5 h-3.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20 text-[9px] flex items-center justify-center font-bold">G</span>
                      <span className="w-3.5 h-3.5 rounded bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 text-[9px] flex items-center justify-center font-bold">S</span>
                      <span className="text-[9px] text-text-secondary font-medium self-center ml-1">+9 more</span>
                    </div>
                  </div>
                </div>

                {/* Assignment Status Table */}
                <div className="border border-muted-surface rounded-xl overflow-hidden bg-surface">
                  <div className="bg-slate-50/50 px-4 py-2 border-b border-muted-surface flex items-center justify-between">
                    <span className="text-[11px] font-bold text-text-primary tracking-wide">ACTIVE LAB PROJECTS</span>
                    <span className="text-[10px] font-medium text-text-secondary font-mono">Syllabus ID: COL-CS-V1</span>
                  </div>
                  
                  <div className="divide-y divide-muted-surface">
                    
                    {/* Row 1 */}
                    <div className="px-4 py-3 flex items-center justify-between text-xs hover:bg-slate-50/30 transition-all">
                      <div className="flex flex-col">
                        <span className="font-semibold text-text-primary">Lab 3.2: Secure API Handlers with Supabase RLS</span>
                        <span className="text-[10px] text-text-secondary mt-0.5">Linked branch: `feature/rls-setup`</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono bg-success/10 text-success border border-success/20 px-2 py-0.5 rounded-full font-medium">
                          Verified ✅
                        </span>
                        <span className="text-text-secondary font-mono text-[10px]">Passed 12/12 tests</span>
                      </div>
                    </div>

                    {/* Row 2 */}
                    <div className="px-4 py-3 flex items-center justify-between text-xs hover:bg-slate-50/30 transition-all">
                      <div className="flex flex-col">
                        <span className="font-semibold text-text-primary">Lab 3.3: Server Action Mutations & Data Refresh</span>
                        <span className="text-[10px] text-text-secondary mt-0.5">Linked branch: `feature/mutations`</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono bg-warning/10 text-warning border border-warning/20 px-2 py-0.5 rounded-full font-medium">
                          Review Needed
                        </span>
                        <span className="text-text-secondary font-mono text-[10px]">Commit #4a2f8c</span>
                      </div>
                    </div>

                    {/* Row 3 */}
                    <div className="px-4 py-3 flex items-center justify-between text-xs hover:bg-slate-50/30 transition-all opacity-60">
                      <div className="flex flex-col">
                        <span className="font-semibold text-text-primary">Lab 3.4: Progressive Web Apps and Service Workers</span>
                        <span className="text-[10px] text-text-secondary mt-0.5">Locks until Lab 3.3 is approved</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono bg-slate-100 text-text-secondary border border-muted-surface px-2 py-0.5 rounded-full font-medium">
                          Locked
                        </span>
                        <span className="text-text-secondary font-mono text-[10px]">-- / -- tests</span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* AI Review Prompt Mock */}
                <div className="bg-primary/[0.03] border border-primary/20 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary p-2 rounded-xl">
                      <Sparkles size={14} className="stroke-[2.5]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-text-primary">AI Career Copilot Message</h4>
                      <p className="text-[11px] text-text-secondary mt-0.5">
                        Your project "Secure API Handlers" is ready to scan. Let's do a quick code explanation interview to boost your Resume Score.
                      </p>
                    </div>
                  </div>
                  <button className="bg-primary text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg shadow-subtle hover:bg-primary/95 transition-all">
                    Start Code Interview
                  </button>
                </div>

              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Pillars Grid */}
      <section id="features" className="py-20 md:py-28 border-b border-muted-surface bg-background">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Section Header */}
          <div className="max-w-xl mb-16">
            <span className="text-xs font-bold text-primary tracking-wider uppercase block mb-3">Academic Infrastructure</span>
            <h2 className="text-2xl font-bold tracking-tight text-text-primary mb-4">
              Designed around five core career pillars
            </h2>
            <p className="text-xs md:text-sm text-text-secondary leading-relaxed">
              We replace standard learning management systems with tools that reflect professional developer environments. 
              Students build actual portfolios, write production code, and interact with modern dev ops pipelines.
            </p>
          </div>

          {/* Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Pillar 1 */}
            <div className="bg-surface border border-muted-surface rounded-xl p-6 shadow-subtle hover:shadow-card hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between min-h-[220px]">
              <div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 mb-5">
                  <BookOpen size={18} className="stroke-[2]" />
                </div>
                <h3 className="text-sm font-semibold text-text-primary mb-2.5">1. The Interactive Learning Bridge</h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Maps physical lectures directly to step-by-step digital roadmaps. Contains recorded session libraries, study resources, and a geo-fenced attendance tracker to secure cohort integrity.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-muted-surface/60 flex items-center justify-between text-[11px] font-medium text-primary">
                <span>Features: roadmap, wifi-checks, classes</span>
                <ArrowRight size={10} />
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="bg-surface border border-muted-surface rounded-xl p-6 shadow-subtle hover:shadow-card hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between min-h-[220px]">
              <div>
                <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center border border-accent/20 mb-5">
                  <GithubIcon size={18} className="stroke-[2]" />
                </div>
                <h3 className="text-sm font-semibold text-text-primary mb-2.5">2. Practical Labs & Git Validation</h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Students link their public GitHub repositories. Our platform validates assignment commits, reviews codebase accessibility, and tracks production build configurations on real URLs.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-muted-surface/60 flex items-center justify-between text-[11px] font-medium text-accent">
                <span>Features: API validation, git check, deploy link</span>
                <ArrowRight size={10} />
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="bg-surface border border-muted-surface rounded-xl p-6 shadow-subtle hover:shadow-card hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between min-h-[220px]">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 mb-5">
                  <Award size={18} className="stroke-[2]" />
                </div>
                <h3 className="text-sm font-semibold text-text-primary mb-2.5">3. Real-Time Gamification & Badges</h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Earn XP by resolving daily challenges and coding labs. Complete course segments to unlock verifiable digital badges, displayed on student public "Proof of Work" portfolios.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-muted-surface/60 flex items-center justify-between text-[11px] font-medium text-amber-500">
                <span>Features: XP, badges, public profile URLs</span>
                <ArrowRight size={10} />
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="bg-surface border border-muted-surface rounded-xl p-6 shadow-subtle hover:shadow-card hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between min-h-[220px]">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20 mb-5">
                  <FileText size={18} className="stroke-[2]" />
                </div>
                <h3 className="text-sm font-semibold text-text-primary mb-2.5">4. Auto-Resume & Placement Prep</h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Compiles verified student labs, linked GitHub commits, and digital badges automatically. Generates ATS-compliant resumes with a verification stamp QR code for recruiters.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-muted-surface/60 flex items-center justify-between text-[11px] font-medium text-emerald-500">
                <span>Features: ATS parsing, PDF exports, QR stamps</span>
                <ArrowRight size={10} />
              </div>
            </div>

            {/* Pillar 5 */}
            <div className="bg-surface border border-muted-surface rounded-xl p-6 shadow-subtle hover:shadow-card hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between min-h-[220px]">
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center border border-purple-500/20 mb-5">
                  <Cpu size={18} className="stroke-[2]" />
                </div>
                <h3 className="text-sm font-semibold text-text-primary mb-2.5">5. AI Career Copilot & Interviewer</h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Runs interactive, chat-based mock interviews when students submit coding labs. Prompts users to explain their framework architecture, calculating a verified Communication Score.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-muted-surface/60 flex items-center justify-between text-[11px] font-medium text-purple-500">
                <span>Features: architecture questions, speech score</span>
                <ArrowRight size={10} />
              </div>
            </div>

            {/* B2B placement leaderboard block */}
            <div className="bg-secondary text-white rounded-xl p-6 shadow-subtle hover:shadow-card hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between min-h-[220px]">
              <div>
                <div className="w-10 h-10 rounded-xl bg-white/10 text-accent flex items-center justify-center border border-white/20 mb-5">
                  <Users size={18} className="stroke-[2]" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-2.5">Campus B2B Placement Cell</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Dedicated admin dashboards for HODs and Placement Cells. Identify job-ready candidates instantly by sorting students based on verified projects, credentials, and resume scores.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-medium text-accent">
                <span>Features: cell dashboards, hiring filters</span>
                <ArrowRight size={10} />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Interactive Feature Sandbox (Digital Playground) */}
      <section id="demo" className="py-20 md:py-28 border-b border-muted-surface bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Section title */}
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-xs font-bold text-primary tracking-wider uppercase block mb-3">Live Interactive Sandbox</span>
            <h2 className="text-2xl font-bold tracking-tight text-text-primary mb-4">
              Experience the core engine in action
            </h2>
            <p className="text-xs md:text-sm text-text-secondary leading-relaxed">
              Test Hynox's automated verification capabilities. Interact with the sandbox widgets below to see how our Git checker and AI tools process student data.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">
            
            {/* Left Sandbox Widget: Git Verification & AI Resume Polisher */}
            <div className="flex flex-col gap-6">
              
              {/* Widget A: Git Verifier */}
              <div className="bg-background border border-muted-surface rounded-xl p-5 shadow-subtle">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-muted-surface/60">
                  <div className="flex items-center gap-2">
                    <GithubIcon size={16} className="text-text-primary" />
                    <span className="text-xs font-bold text-text-primary">AUTOMATED GIT VERIFIER</span>
                  </div>
                  <span className="text-[10px] font-mono bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded">
                    Lab v1.2
                  </span>
                </div>

                <p className="text-[11px] text-text-secondary mb-4">
                  Simulate verification of a student's project repository. The engine checks if the repository exists, is public, and validates recent branch activities.
                </p>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2.5 text-xs text-text-secondary font-mono">https://</span>
                    <input 
                      type="text" 
                      value={repoUrl}
                      onChange={(e) => setRepoUrl(e.target.value)}
                      className="w-full bg-surface border border-muted-surface rounded-lg pl-14 pr-3 py-2 text-xs font-mono text-text-primary focus:outline-none focus:border-primary"
                    />
                  </div>
                  <button 
                    onClick={handleGitCheck}
                    disabled={gitStatus !== "idle"}
                    className="bg-primary text-white text-xs font-semibold px-4 rounded-lg shadow-subtle hover:bg-primary/95 transition-all disabled:opacity-50"
                  >
                    {gitStatus === "idle" && "Verify Repository"}
                    {gitStatus === "checking" && "Checking API..."}
                    {gitStatus === "verified" && "Verified ✅"}
                  </button>
                </div>

                {gitStatus === "checking" && (
                  <div className="mt-3.5 bg-slate-50 border border-muted-surface/80 rounded-lg p-3 flex items-center gap-3 animate-pulse">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                    <span className="text-[10px] text-text-secondary font-mono">Resolving metadata path for API query...</span>
                  </div>
                )}

                {gitStatus === "verified" && (
                  <div className="mt-3.5 bg-success/5 border border-success/20 rounded-lg p-3 flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-success">
                      <CheckCircle2 size={12} />
                      <span className="text-[11px] font-bold">Verification Successful</span>
                    </div>
                    <p className="text-[10px] text-text-secondary leading-relaxed">
                      GitHub URL verified. Connected user: <code className="bg-muted-surface/65 px-1 py-0.5 rounded text-text-primary text-[9px]">alex-dev</code>. 
                      Found 8 branches and 4 main branch commits. Initializing student project board triggers.
                    </p>
                    <button 
                      onClick={() => setGitStatus("idle")}
                      className="text-left text-[10px] font-semibold text-primary mt-1 hover:underline"
                    >
                      Reset Sim
                    </button>
                  </div>
                )}
              </div>

              {/* Widget B: AI Resume Polisher */}
              <div className="bg-background border border-muted-surface rounded-xl p-5 shadow-subtle">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-muted-surface/60">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-primary" />
                    <span className="text-xs font-bold text-text-primary">AI RESUME BULLET POLISHER</span>
                  </div>
                  <span className="text-[10px] font-mono bg-purple-500/10 text-purple-600 border border-purple-500/20 px-2 py-0.5 rounded">
                    Copilot v1.0
                  </span>
                </div>

                <p className="text-[11px] text-text-secondary mb-3">
                  Our server-side LLM parses raw student descriptions into action-oriented bullet points incorporating verified lab skills:
                </p>

                {/* Bullet Selector */}
                <div className="flex flex-col gap-2 mb-4">
                  {rawBullets.map((bullet, idx) => (
                    <div 
                      key={idx}
                      onClick={() => {
                        setSelectedRawBullet(idx);
                        setPolishState("idle");
                      }}
                      className={`text-xs p-2.5 rounded-lg border text-left cursor-pointer transition-all duration-200 ${
                        selectedRawBullet === idx 
                          ? "bg-surface border-primary text-text-primary shadow-subtle" 
                          : "bg-surface/50 border-muted-surface text-text-secondary hover:bg-slate-50"
                      }`}
                    >
                      "{bullet}"
                    </div>
                  ))}
                </div>

                <button 
                  onClick={handleAiPolish}
                  disabled={polishState === "polishing"}
                  className="w-full bg-primary text-white text-xs font-semibold py-2.5 rounded-lg shadow-subtle hover:bg-primary/95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Sparkles size={12} />
                  {polishState === "idle" && "Optimize with AI"}
                  {polishState === "polishing" && "Running Prompt Engineering..."}
                  {polishState === "completed" && "Re-Optimize Bullet"}
                </button>

                {polishState === "polishing" && (
                  <div className="mt-3.5 bg-slate-50 border border-muted-surface/80 rounded-lg p-3 flex items-center gap-3 animate-pulse">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping" />
                    <span className="text-[10px] text-text-secondary font-mono">Parsing skill taxonomy and formatting ATS metadata...</span>
                  </div>
                )}

                {polishState === "completed" && (
                  <div className="mt-3.5 bg-purple-500/[0.02] border border-purple-500/20 rounded-lg p-3.5">
                    <span className="text-[10px] font-bold text-purple-600 block mb-1">POLISHED ATS BULLET POINT</span>
                    <p className="text-[11px] font-medium text-text-primary leading-relaxed">
                      "{polishedBullets[selectedRawBullet]}"
                    </p>
                    <div className="mt-2.5 flex items-center gap-3 text-[9px] text-text-secondary font-mono">
                      <span className="flex items-center gap-1"><Check size={12} className="text-success" /> Active Verbs</span>
                      <span className="flex items-center gap-1"><Check size={12} className="text-success" /> Tech Stack Listed</span>
                      <span className="flex items-center gap-1"><Check size={12} className="text-success" /> Action Impact</span>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Right Sandbox Widget: Institutional Placement Leaderboard Mock */}
            <div id="leaderboard" className="bg-background border border-muted-surface rounded-xl p-6 shadow-subtle flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-muted-surface/60">
                  <div className="flex items-center gap-2.5">
                    <div className="bg-primary/10 text-primary p-1.5 rounded-lg border border-primary/20">
                      <Users size={16} />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-text-primary leading-none">PLACEMENT CELL PORTAL</h3>
                      <span className="text-[9px] text-text-secondary font-mono tracking-wider">B2B DEPT CONSOLE</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-emerald-500/15 border border-emerald-500/20 text-emerald-600 px-2 py-0.5 rounded font-mono text-[9px] font-bold">
                    <TrendingUp size={10} />
                    100% Placement Ready
                  </div>
                </div>

                <p className="text-xs text-text-secondary mb-5 leading-relaxed">
                  This administrative panel allows the Department Head and Placement Officer to look up candidates. 
                  Unlike traditional systems that list grades, Hynox ranks candidates by verified repository achievements and resume completeness.
                </p>

                {/* Leaderboard Table Search */}
                <div className="relative mb-4">
                  <Search size={14} className="absolute left-3 top-2.5 text-text-secondary" />
                  <input 
                    type="text" 
                    placeholder="Search candidate or department..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-surface border border-muted-surface rounded-lg pl-9 pr-3 py-2 text-xs text-text-primary focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Table */}
                <div className="border border-muted-surface rounded-xl overflow-hidden bg-surface shadow-subtle">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-muted-surface text-[10px] font-bold text-text-secondary uppercase">
                          <th className="px-4 py-2.5">Candidate</th>
                          <th className="px-4 py-2.5">Department</th>
                          <th className="px-4 py-2.5 text-center">Resume Score</th>
                          <th className="px-4 py-2.5 text-center">Badges</th>
                          <th className="px-4 py-2.5 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-muted-surface text-[11px]">
                        {filteredLeaderboard.length > 0 ? (
                          filteredLeaderboard.map((student, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/40 transition-colors">
                              <td className="px-4 py-3 font-semibold text-text-primary flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-[9px]">
                                  {student.avatar}
                                </div>
                                <span className="truncate">{student.name}</span>
                              </td>
                              <td className="px-4 py-3 text-text-secondary">{student.dept}</td>
                              <td className="px-4 py-3 text-center font-mono font-bold text-text-primary">{student.resumeStrength}%</td>
                              <td className="px-4 py-3 text-center">
                                <span className="bg-slate-100 text-text-secondary border border-muted-surface px-1.5 py-0.5 rounded font-mono text-[9px] font-bold">
                                  {student.badges}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <span className={`inline-flex px-1.5 py-0.5 rounded-full text-[9px] font-medium border ${
                                  student.status === "Verified Ready" 
                                    ? "bg-success/10 text-success border-success/20" 
                                    : student.status === "Interviewing" 
                                    ? "bg-amber-500/10 text-amber-500 border-amber-500/20" 
                                    : "bg-slate-100 text-text-secondary border-muted-surface"
                                }`}>
                                  {student.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="px-4 py-6 text-center text-text-secondary">
                              No candidates found matching query.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Placement stamp verification details */}
              <div className="mt-6 pt-4 border-t border-muted-surface flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/5 text-primary p-1.5 rounded-lg">
                    <ShieldCheck size={14} />
                  </div>
                  <span className="text-[10px] text-text-secondary">
                    All candidates stamp-verified by Hynox Smart Contract logic.
                  </span>
                </div>
                <button 
                  onClick={() => alert("Verification portal download available in institutional admin module.")}
                  className="bg-secondary text-white text-[10px] font-semibold px-3 py-1.5 rounded-lg shadow-subtle hover:bg-secondary/90 transition-all w-full sm:w-auto"
                >
                  Export Placed Report
                </button>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 5. Token Activation Portal (Interactive Form) */}
      <section id="onboarding" className="py-20 md:py-28 border-b border-muted-surface bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-xl mx-auto bg-surface border border-muted-surface rounded-xl shadow-card p-8 relative">
            
            {/* Form decorative stamp */}
            <div className="absolute -top-3 right-6 bg-primary text-white text-[9px] font-bold font-mono tracking-wider px-2 py-1 rounded shadow-subtle flex items-center gap-1 border border-primary/20">
              <ShieldCheck size={10} />
              VERIFIED PORTAL
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="bg-primary/10 text-primary p-2.5 rounded-xl border border-primary/20">
                <Building size={20} className="stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-text-primary leading-tight">Claim Academic Invitation</h3>
                <p className="text-[11px] text-text-secondary mt-0.5">
                  Sign in or activate your provisioned account token.
                </p>
              </div>
            </div>

            <form onSubmit={handleTokenVerify} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-text-primary uppercase tracking-wide mb-1.5">
                  Institutional Email
                </label>
                <input 
                  type="email" 
                  placeholder="name@college.edu" 
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full bg-surface border border-muted-surface rounded-lg px-3 py-2.5 text-xs text-text-primary focus:outline-none focus:border-primary shadow-subtle"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[10px] font-bold text-text-primary uppercase tracking-wide">
                    Enrollment Token
                  </label>
                  <span className="text-[9px] text-primary font-medium hover:underline cursor-pointer" onClick={() => setTokenInput("HYN-102-CS")}>
                    (Use Test Token: HYN-102-CS)
                  </span>
                </div>
                <input 
                  type="text" 
                  placeholder="HYN-XXX-XX" 
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  className="w-full bg-surface border border-muted-surface rounded-lg px-3 py-2.5 text-xs font-mono text-text-primary focus:outline-none focus:border-primary shadow-subtle uppercase"
                />
              </div>

              <button 
                type="submit"
                disabled={verifyStatus === "verifying"}
                className="w-full bg-primary text-white text-xs font-semibold py-3 rounded-lg shadow-subtle hover:bg-primary/95 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {verifyStatus === "verifying" ? (
                  <>Checking database...</>
                ) : (
                  <>
                    Initialize Account
                    <ArrowRight size={12} />
                  </>
                )}
              </button>
            </form>

            {/* Error or Success Messages */}
            {verifyStatus === "success" && (
              <div className="mt-5 bg-success/5 border border-success/20 text-success rounded-lg p-3 text-xs flex items-start gap-2">
                <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold block mb-0.5">Activation Complete</span>
                  <span>{verifyMessage}</span>
                </div>
              </div>
            )}

            {verifyStatus === "error" && (
              <div className="mt-5 bg-error/5 border border-error/20 text-error rounded-lg p-3 text-xs flex items-start gap-2">
                <Info size={14} className="mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold block mb-0.5">Verification Failed</span>
                  <span>{verifyMessage}</span>
                </div>
              </div>
            )}

            <div className="mt-6 pt-5 border-t border-muted-surface flex items-center justify-between text-[10px] text-text-secondary">
              <span className="flex items-center gap-1">
                <Clock size={12} /> Link expires in 7 days
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={12} /> Geofencing Enabled
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="mt-auto bg-surface border-t border-muted-surface py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            
            {/* Column 1 */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 text-primary p-1.5 rounded-lg border border-primary/20">
                  <Terminal size={14} className="stroke-[2.5]" />
                </div>
                <span className="font-semibold text-text-primary text-xs tracking-tight">Hynox Campus</span>
              </div>
              <p className="text-[11px] text-text-secondary leading-relaxed max-w-[200px]">
                A product of Hynox Academic Engines. Designed to deliver measurable code competency.
              </p>
            </div>

            {/* Column 2 */}
            <div>
              <h4 className="text-[10px] font-bold text-text-primary uppercase tracking-wider mb-3">Product</h4>
              <ul className="flex flex-col gap-2 text-[11px] text-text-secondary font-medium">
                <li><a href="#features" className="hover:text-text-primary transition-colors">Core Pillars</a></li>
                <li><a href="#demo" className="hover:text-text-primary transition-colors">Sandbox Demos</a></li>
                <li><a href="#leaderboard" className="hover:text-text-primary transition-colors">Placement Hub</a></li>
              </ul>
            </div>

            {/* Column 3 */}
            <div>
              <h4 className="text-[10px] font-bold text-text-primary uppercase tracking-wider mb-3">Documentation</h4>
              <ul className="flex flex-col gap-2 text-[11px] text-text-secondary font-medium">
                <li><a href="#" className="hover:text-text-primary transition-colors">Integration Guide</a></li>
                <li><a href="#" className="hover:text-text-primary transition-colors">Teacher Guide</a></li>
                <li><a href="#" className="hover:text-text-primary transition-colors">Supabase Migrations</a></li>
              </ul>
            </div>

            {/* Column 4 */}
            <div>
              <h4 className="text-[10px] font-bold text-text-primary uppercase tracking-wider mb-3">Corporate</h4>
              <ul className="flex flex-col gap-2 text-[11px] text-text-secondary font-medium">
                <li><a href="#" className="hover:text-text-primary transition-colors">About Hynox</a></li>
                <li><a href="#" className="hover:text-text-primary transition-colors">Request Trial</a></li>
                <li><a href="#" className="hover:text-text-primary transition-colors">Academic Contracts</a></li>
              </ul>
            </div>

          </div>

          <div className="pt-6 border-t border-muted-surface flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-text-secondary font-medium">
            <span>© {new Date().getFullYear()} Hynox Org. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-text-primary transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-text-primary transition-colors">Security Audit</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
