"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Header } from "@/components/dashboard/header";
import { Sidebar } from "@/components/dashboard/sidebar";
import { FeedbackWidget } from "@/components/dashboard/feedback-widget";
import { OnboardingIntro } from "@/components/dashboard/onboarding-intro";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
    } else {
      setIsAuthenticated(true);
    }

    // Kayıt sonrası ilk girişte tanıtım göster.
    const shouldShow = localStorage.getItem("onboarding_show_v1") === "1";
    if (shouldShow && pathname === "/") {
      setShowOnboarding(true);
    }
    setIsChecking(false);
  }, [router, pathname]);

  const handleDismissOnboarding = () => {
    localStorage.setItem("onboarding_show_v1", "0");
    setShowOnboarding(false);
  };

  if (isChecking || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          <span className="text-sm text-zinc-500">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-zinc-950">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-[400px] w-[400px] rounded-full bg-emerald-500/3 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #10b981 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <Header onMenuClick={() => setSidebarOpen(true)} />

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="relative px-4 py-6 lg:px-8">{children}</main>
      <FeedbackWidget />
      {showOnboarding && pathname === "/" && (
        <OnboardingIntro
          open={showOnboarding}
          onDismiss={handleDismissOnboarding}
        />
      )}
    </div>
  );
}
