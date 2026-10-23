"use client";

import React, { useState } from "react";
import StickyNavbar from "@/src/components/landing/StickyNavbar";
import HeroSection from "@/src/components/landing/HeroSection";
import PracticeShowcase from "@/src/components/landing/PracticeShowcase";
import RaceShowcase from "@/src/components/landing/RaceShowcase";
import WhosTheBestSection from "@/src/components/landing/WhosTheBestSection";
import AboutSection from "@/src/components/landing/AboutSection";
import Footer from "@/src/components/landing/Footer";
import DragonCursor from "@/src/components/landing/DragonCursor";
import AiCoachWidget from "@/src/components/landing/AiCoachWidget";

export default function LandingPage() {
  const [isCoachOpen, setIsCoachOpen] = useState(false);

  return (
    <div className="relative min-h-screen flex flex-col bg-white dark:bg-[#070c0f] text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      {/* 3D Dotted Dragon Interactive Cursor Animation (Landing page exclusive) */}
      <DragonCursor />

      {/* Floating Sticky Navigation Bar */}
      <StickyNavbar onOpenCoach={() => setIsCoachOpen(true)} />

      {/* Main Page Flow */}
      <main className="flex-1 flex flex-col">
        {/* Hero Section with looping video container & 3 consecutive scenarios */}
        <HeroSection onOpenCoach={() => setIsCoachOpen(true)} />

        {/* Solo Practice Engine & Soundpacks Showcase */}
        <PracticeShowcase />

        {/* Multiplayer Racetrack & Real-Time Alerts Showcase */}
        <RaceShowcase />

        {/* Who's The Best - Top 3 Typists Showcase */}
        <WhosTheBestSection />

        {/* About Djibril Mugisha & Digital Literacy Origin Story */}
        <AboutSection />
      </main>

      {/* Footer with Get Started CTA */}
      <Footer />

      {/* Interactive AI Coach Widget & Floating Trigger */}
      <AiCoachWidget
        isOpen={isCoachOpen}
        onClose={() => setIsCoachOpen(false)}
        onToggle={() => setIsCoachOpen((prev) => !prev)}
      />
    </div>
  );
}
