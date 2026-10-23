"use client";

import React from "react";
import Link from "next/link";
import { Zap, Heart, Shield, ArrowRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative bg-white dark:bg-[#060a0d] border-t border-zinc-200 dark:border-zinc-800/80 pt-20 pb-12 overflow-hidden">
      {/* Pre-footer Call to Action Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="relative rounded-3xl p-8 sm:p-14 bg-zinc-950 text-white shadow-2xl border border-emerald-500/30 overflow-hidden text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8 group">
          {/* Keyboard Background Image */}
          <div className="absolute inset-0 z-0 select-none pointer-events-none">
            <img
              src="https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1600&auto=format&fit=crop&q=80"
              alt="Mechanical Keyboard"
              className="w-full h-full object-cover object-center opacity-30 group-hover:scale-105 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/90 via-zinc-950/85 to-[#0b141b]/95" />
          </div>

          <div className="relative z-10 space-y-3 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold uppercase tracking-wider border border-amber-400/30">
              <Zap className="w-3.5 h-3.5 fill-current" />
              Start Your Typing Journey Today
            </span>
            <h3 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Ready to Break Your Personal Speed Record?
            </h3>
            <p className="text-zinc-300 text-sm sm:text-base">
              Join thousands of typists developing digital literacy, mastering muscle memory, and competing in live multiplayer races.
            </p>
          </div>

          <div className="relative z-10 flex-shrink-0">
            {/* Highly visible Get Started CTA button directing to login */}
            <Link
              href="/login"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl font-black text-zinc-950 bg-amber-400 hover:bg-amber-300 shadow-2xl shadow-amber-400/40 border-2 border-amber-300 ring-4 ring-amber-400/20 hover:scale-105 transition-all text-base cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-zinc-200 dark:border-zinc-800/80">
          {/* Col 1: Brand & Creator */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30">
                <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-zinc-900 dark:text-zinc-100">
                Vuba<span className="text-emerald-600 dark:text-emerald-400">Trust</span>Typing
              </span>
            </div>

            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed">
              A high-performance typing platform combining tactile solo drills, real-time multiplayer car tracks, and AI speed coaching. Created by{" "}
              <strong className="text-zinc-900 dark:text-zinc-200">Djibril Mugisha</strong> to elevate digital literacy worldwide.
            </p>

            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>Admin: mugishadjibril2020@gmail.com</span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-200">
              Platform Features
            </h4>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li>
                <a href="#practice" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Solo Practice Engine
                </a>
              </li>
              <li>
                <a href="#racing" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Multiplayer Racing
                </a>
              </li>
              <li>
                <a href="#whos-the-best" className="hover:text-amber-500 transition-colors">
                  Who's The Best Showcase
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  About Djibril Mugisha
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Authentication & Community */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-200">
              Access & Community
            </h4>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li>
                <Link href="/login" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  OAuth Sign In (Google/GitHub)
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  User Dashboard
                </Link>
              </li>
              <li>
                <span className="text-xs text-zinc-400">
                  Real-time Supabase Realtime Engine
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-400">
          <p>© 2026 VubaTrustTyping Platform. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Designed & Engineered with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 mx-0.5" />
            <span>for Global Typists</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
