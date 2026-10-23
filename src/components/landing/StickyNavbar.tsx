"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "@/src/context/ThemeContext";
import {
  Sun,
  Moon,
  Keyboard,
  Sparkles,
  Trophy,
  Users,
  Info,
  Menu,
  X,
  Zap,
} from "lucide-react";

import { supabase } from "@/src/lib/supabase";

interface StickyNavbarProps {
  onOpenCoach?: () => void;
}

export default function StickyNavbar({ onOpenCoach }: StickyNavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    async function checkUser() {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        setIsLoggedIn(true);
      }
    }
    checkUser();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Solo Practice", href: "#practice", icon: Keyboard },
    { name: "Live Race", href: "#racing", icon: Users },
    { name: "Who's The Best", href: "#whos-the-best", icon: Trophy },
    { name: "About", href: "#about", icon: Info },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? "py-3 bg-white/80 dark:bg-[#070c0f]/85 backdrop-blur-md shadow-lg shadow-black/5 dark:shadow-emerald-950/20 border-b border-zinc-200/80 dark:border-emerald-900/30"
          : "py-5 bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group focus:outline-none"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-800 text-white shadow-md shadow-emerald-500/25 group-hover:scale-105 transition-transform duration-200">
            <Zap className="w-5 h-5 text-yellow-300 fill-yellow-300 animate-pulse" />
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-black/80 dark:border-zinc-900" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Vuba<span className="text-emerald-600 dark:text-emerald-400">Trust</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-700 dark:text-amber-300 border border-amber-400/30">
                PRO
              </span>
            </div>
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 tracking-wider uppercase -mt-0.5">
              Typing Platform
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 lg:gap-2 px-3 py-1.5 rounded-full bg-zinc-100/70 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/80 backdrop-blur-sm">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.name}
                href={link.href}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full text-zinc-600 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-white dark:hover:bg-zinc-800/80 transition-all duration-150"
              >
                <Icon className="w-4 h-4 opacity-70" />
                <span>{link.name}</span>
              </a>
            );
          })}

          {/* AI Coach Button */}
          <button
            type="button"
            onClick={onOpenCoach}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full text-amber-700 dark:text-amber-300 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 transition-all duration-150 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>AI Coach</span>
          </button>
        </nav>

        {/* Action Controls & Theme Toggle */}
        <div className="flex items-center gap-3">
          {/* Theme Switcher */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle color theme"
            className="relative p-2.5 rounded-xl text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700/60 transition-all duration-200 cursor-pointer focus:outline-none"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400 transition-transform rotate-0 hover:rotate-90 duration-300" />
            ) : (
              <Moon className="w-4 h-4 text-emerald-600 transition-transform -rotate-12 hover:rotate-0 duration-300" />
            )}
          </button>

          {/* Get Started / Dashboard Button */}
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="hidden sm:inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/25 transition-all duration-200 hover:-translate-y-0.5"
            >
              <span>Dashboard</span>
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            </Link>
          ) : (
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-600/20 hover:shadow-emerald-500/35 transition-all duration-200 hover:-translate-y-0.5"
            >
              Get Started
            </Link>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Open mobile menu"
            className="md:hidden p-2.5 rounded-xl text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-3 pb-5 bg-white/95 dark:bg-[#080d11]/95 backdrop-blur-lg border-b border-zinc-200 dark:border-zinc-800 transition-all animate-fadeIn">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{link.name}</span>
                </a>
              );
            })}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenCoach?.();
              }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-amber-700 dark:text-amber-400 bg-amber-400/10"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>AI Typing Coach</span>
            </button>
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-2 text-center py-2.5 rounded-lg font-semibold text-white bg-emerald-600 hover:bg-emerald-500"
            >
              Get Started (Sign In)
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
