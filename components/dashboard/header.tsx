"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell,
  Menu,
  LayoutDashboard,
  Wallet,
  Brain,
  TrendingUp,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { NotificationPanel } from "@/components/dashboard/notification-panel";
import { api } from "@/lib/api";

interface HeaderProps {
  onMenuClick: () => void;
}

const topNavItems = [
  { href: "/", icon: LayoutDashboard, label: "Ana Sayfa" },
  { href: "/expenses", icon: Wallet, label: "Harcamalar" },
  { href: "/coach", icon: Brain, label: "AI Koç" },
];

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [initials, setInitials] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [urgentCount, setUrgentCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    setMounted(true);
    const fullName = localStorage.getItem("fullName") ?? "Kullanıcı";
    setInitials(
      fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2),
    );
    fetchUrgentCount();
    fetchCartCount();
  }, []);

  const fetchUrgentCount = async () => {
    try {
      const res = await api.get("/payments/pending");
      const data = res.data?.data ?? [];
      setUrgentCount(
        Array.isArray(data)
          ? data.filter((p: any) => p.isUrgent || p.isOverdue).length
          : 0,
      );
    } catch {
      /* sessizce geç */
    }
  };
  const fetchCartCount = async () => {
    try {
      const res = await api.get("/cart/count");
      setCartCount(res.data?.data ?? 0);
    } catch {
      /* sessizce geç */
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-4 lg:px-6">
          {/* Sol */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-zinc-400 hover:bg-zinc-800/80 hover:text-zinc-100"
              onClick={onMenuClick}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <Link href="/" className="flex items-center gap-2.5">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30">
                <TrendingUp className="h-4 w-4 text-black" strokeWidth={2.5} />
              </div>
              <span className="hidden text-base font-bold text-zinc-100 lg:block">
                AI Finans <span className="text-emerald-400">Koçu</span>
              </span>
            </Link>
          </div>

          {/* Orta: Nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {topNavItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-emerald-500/15 text-emerald-400 shadow-sm ring-1 ring-emerald-500/20"
                      : "text-zinc-400 hover:bg-zinc-800/80 hover:text-zinc-100",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Sağ */}
          <div className="flex items-center gap-2 lg:gap-3">
            {/* Sepet */}
            <Button
              variant="ghost"
              size="icon"
              className="relative text-zinc-400 hover:bg-zinc-800/80 hover:text-zinc-100"
              onClick={() => router.push("/cart")}
            >
              <ShoppingCart className="h-5 w-5" />
              {mounted && cartCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-black ring-2 ring-zinc-950">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Button>

            {/* Zil */}
            <Button
              variant="ghost"
              size="icon"
              className="relative text-zinc-400 hover:bg-zinc-800/80 hover:text-zinc-100"
              onClick={() => setNotifOpen(true)}
            >
              <Bell className="h-5 w-5" />
              {mounted && urgentCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-zinc-950">
                  {urgentCount > 9 ? "9+" : urgentCount}
                </span>
              )}
            </Button>

            {/* Profil */}
            <button
              onClick={() => router.push("/settings")}
              className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition-all hover:bg-zinc-800/80"
            >
              <Avatar className="h-8 w-8 ring-2 ring-zinc-700 ring-offset-2 ring-offset-zinc-950 transition-all group-hover:ring-emerald-500/50">
                <AvatarImage src="/avatar.png" alt="Kullanıcı" />
                <AvatarFallback className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 text-xs font-bold text-emerald-400">
                  {mounted ? initials : ""}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-xs font-medium text-zinc-400 lg:block">
                Profil
              </span>
            </button>
          </div>
        </div>
      </header>

      <NotificationPanel
        isOpen={notifOpen}
        onClose={() => {
          setNotifOpen(false);
          fetchUrgentCount();
        }}
      />
    </>
  );
}
