"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  PieChart,
  LayoutDashboard,
  Wallet,
  PiggyBank,
  TrendingUp,
  BarChart3,
  Settings,
  X,
  LogOut,
  ShoppingCart,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  {
    section: "Ana Menü",
    items: [
      { href: "/", icon: LayoutDashboard, label: "Ana Sayfa" },
      { href: "/expenses", icon: Wallet, label: "Harcamalarım" },
      { href: "/coach", icon: PiggyBank, label: "AI Koç" },
      { href: "/cart", icon: ShoppingCart, label: "Alışveriş Sepeti" },
      { href: "/budgets", icon: PieChart, label: "Bütçe Planlama" },
    ],
  },
  {
    section: "Finansal Araçlar",
    items: [
      { href: "/market", icon: TrendingUp, label: "Mağaza Fiyatları" },
      { href: "/analytics", icon: BarChart3, label: "Analizler" },
      { href: "/settings", icon: Settings, label: "Ayarlar" },
    ],
  },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [fullName, setFullName] = useState("Kullanıcı");
  const [initials, setInitials] = useState("?");

  useEffect(() => {
    const name = localStorage.getItem("fullName") ?? "Kullanıcı";
    setFullName(name);
    setInitials(
      name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2),
    );
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("fullName");
    router.push("/login");
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen w-[260px] flex-col border-r border-zinc-800 bg-zinc-950 shadow-2xl shadow-black/50 transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full",
      )}
    >
      {/* Üst: Logo + Kapat */}
      <div className="flex h-16 items-center justify-between border-b border-zinc-800 px-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500">
            <Image
              src="/icon.png"
              alt="Finans Koçu"
              width={20}
              height={20}
              className="h-4 w-4 object-contain"
              priority
            />
          </div>
          <span className="text-base font-semibold italic tracking-tight text-zinc-100">
            Finans Koçu
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-zinc-400 hover:text-white"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Menü öğeleri */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        {menuItems.map((group) => (
          <div key={group.section}>
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
              {group.section}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5 shrink-0",
                        isActive ? "text-emerald-400" : "text-zinc-500",
                      )}
                    />
                    {item.label}
                    {isActive && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Alt: Kullanıcı + Çıkış */}
      <div className="border-t border-zinc-800 p-4 space-y-2">
        <div className="flex items-center gap-3 rounded-lg bg-zinc-900 px-3 py-2.5 border border-zinc-800">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-400">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-zinc-100">
              {fullName}
            </p>
            <p className="text-[10px] text-zinc-500">Premium Üye</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut className="h-4 w-4" />
          Çıkış Yap
        </button>
      </div>
    </aside>
  );
}
