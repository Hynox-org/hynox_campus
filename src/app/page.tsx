import React from "react";
import { ArrowRight, GraduationCap, Laptop, Users, ShieldCheck, CheckCircle, Trophy, BookOpen } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950">
      {/* Navigation */}
      <nav className="h-20 flex items-center justify-between px-8 md:px-24 bg-slate-950 sticky top-0 z-50 border-b border-cyan-500/20 shadow-xl shadow-slate-950/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <GraduationCap className="text-slate-950 w-6 h-6" />
          </div>
          <span className="font-heading font-bold text-2xl tracking-tight text-white">Hynox Campus</span>
        </div>
        <div className="flex items-center gap-8">
          <Link href="/login" className="hidden md:block font-medium text-slate-300 hover:text-cyan-400 transition-colors">Course Catalog</Link>
          <Link href="/login" className="font-medium text-slate-300 hover:text-cyan-400 transition-colors">Student Login</Link>
          <Link 
            href="/login" 
            className="bg-cyan-500 text-slate-950 px-6 py-2.5 rounded-xl font-bold hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/20 active:scale-[0.98]"
          >
            Join Portal
          </Link>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-24 pb-20 md:pt-32 md:pb-32 px-8 md:px-24 overflow-hidden">
          {/* Background Decorative Elements */}
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-100/30 dark:bg-cyan-500/10 blur-[120px] rounded-full -z-10" />
          <div className="absolute bottom-[10%] left-[-10%] w-[40%] h-[40%] bg-slate-200/40 dark:bg-slate-800/20 blur-[120px] rounded-full -z-10" />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-50 dark:bg-cyan-900/30 border border-cyan-100 dark:border-cyan-800 text-cyan-700 dark:text-cyan-400 text-sm font-bold tracking-wide animate-fade-in">
                <CheckCircle className="w-4 h-4" />
                Trusted by 5000+ Students
              </div>
              <h1 className="text-5xl md:text-7xl font-bold font-heading leading-tight tracking-tight text-slate-900 dark:text-white">
                Elevate Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400">Coding Journey</span> at Hynox
              </h1>
              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Experience the perfect blend of physical mentorship and digital excellence. Our portal empowers you with the resources to master tech skills.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <Link 
                  href="/login" 
                  className="w-full sm:w-auto bg-slate-900 dark:bg-white text-white dark:text-slate-950 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2 group"
                >
                  Explore Dashboard
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all text-slate-900 dark:text-white">
                  View Courses
                </button>
              </div>
              
              <div className="flex items-center justify-center lg:justify-start gap-8 pt-8">
                <div className="text-center lg:text-left">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">98%</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Placement Rate</p>
                </div>
                <div className="w-px h-10 bg-slate-200 dark:bg-slate-800" />
                <div className="text-center lg:text-left">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">200+</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Core Projects</p>
                </div>
                <div className="w-px h-10 bg-slate-200 dark:bg-slate-800" />
                <div className="text-center lg:text-left">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">1-on-1</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Mentorship</p>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 blur-3xl rounded-[3rem] -z-10 group-hover:scale-110 transition-transform duration-700" />
              <div className="glass rounded-[2rem] border border-slate-200/50 dark:border-slate-800/50 p-4 shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500" />
                <div className="bg-slate-100 dark:bg-slate-900 rounded-xl p-4 md:p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-amber-400" />
                      <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    </div>
                    <div className="px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-400 text-[10px] font-bold">LIVE PROGRESS</div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
                    <div className="grid grid-cols-3 gap-4">
                      <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                      <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                      <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Value Props Section */}
        <section className="py-24 bg-slate-50 dark:bg-slate-900/50 px-8 md:px-24">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-slate-900 dark:text-white">Why Choose Hynox Campus?</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">We don't just teach code; we build careers through a rigorous curriculum and practical site projects.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4 shadow-sm hover:shadow-xl hover:shadow-cyan-500/5 transition-all group">
              <div className="w-14 h-14 bg-cyan-50 dark:bg-cyan-900/30 rounded-2xl flex items-center justify-center text-cyan-600 transition-transform group-hover:scale-110">
                <Laptop className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold font-heading text-slate-900 dark:text-white">Digital Library</h3>
              <p className="text-slate-500 dark:text-slate-400">Instant access to comprehensive course materials, recorded lectures, and curated study notes.</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4 shadow-sm hover:shadow-xl hover:shadow-cyan-500/5 transition-all group">
              <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 transition-transform group-hover:scale-110">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold font-heading text-slate-900 dark:text-white">Real-world Projects</h3>
              <p className="text-slate-500 dark:text-slate-400">Work on industry-level projects and submit them directly via GitHub for expert code reviews.</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4 shadow-sm hover:shadow-xl hover:shadow-cyan-500/5 transition-all group">
              <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600 transition-transform group-hover:scale-110">
                <Trophy className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold font-heading text-slate-900 dark:text-white">Global Certification</h3>
              <p className="text-slate-500 dark:text-slate-400">Earn recognized certificates upon completion of tracks, validated by our industry partners.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200 dark:border-slate-800 text-center text-slate-500 dark:text-slate-400 text-sm bg-white dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            <span className="font-bold text-slate-900 dark:text-white">Hynox Campus</span>
          </div>
          <p>&copy; {new Date().getFullYear()} Hynox Campus Portal. Empowering the next generation of developers.</p>
        </div>
      </footer>
    </div>
  );
}
