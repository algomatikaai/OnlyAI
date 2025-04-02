import React, { useState } from "react";
import Sidebar from "@/components/navigation/sidebar";
import MobileNav from "@/components/navigation/mobile-nav";
import { useLocation } from "wouter";
import AIStudio from "@/components/ai-studio";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [location] = useLocation();
  const [studioOpen, setStudioOpen] = useState(false);

  // Don't show navigation on auth pages
  const isAuthPage = location.startsWith("/login") || location.startsWith("/register");

  if (isAuthPage) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar - hidden on mobile */}
      <Sidebar className="hidden md:flex" />

      {/* Main content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Main scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>

        {/* AI Creation Button (Desktop) */}
        <div className="hidden md:block fixed bottom-8 right-8">
          <button
            onClick={() => setStudioOpen(true)}
            className="bg-primary hover:bg-primary/90 text-white rounded-full p-4 shadow-lg flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="m21.64 3.64-1.28-1.28a1.08 1.08 0 0 0-1.52 0L2.36 18.36a1.08 1.08 0 0 0 0 1.52l1.28 1.28c.42.42 1.1.42 1.52 0L21.64 5.16a1.08 1.08 0 0 0 0-1.52Z"></path>
              <path d="m14 7 3 3"></path>
              <path d="M5 6v4"></path>
              <path d="M19 14v4"></path>
              <path d="M10 2v2"></path>
              <path d="M7 8H3"></path>
              <path d="M21 16h-4"></path>
              <path d="M11 3H9"></path>
            </svg>
            <span className="font-medium">Create AI Content</span>
          </button>
        </div>

        {/* Mobile Navigation Bar */}
        <MobileNav onCreateClick={() => setStudioOpen(true)} />

        {/* AI Studio Modal */}
        <AIStudio open={studioOpen} onClose={() => setStudioOpen(false)} />
      </main>
    </div>
  );
}
