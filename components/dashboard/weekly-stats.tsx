"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";
import { api } from "@/lib/api";

interface WeeklyData {
  thisWeekExpense: number;
  thisWeekIncome: number;
  lastWeekExpense: number;
  lastWeekIncome: number;
  expenseChangePct: number;
  incomeChangePct: number;
  transactionCount: number;
  dailyAvgExpense: number;
  weekStartDate: string;
  weekEndDate: string;
}

export function WeeklyStats() {
  const [data, setData] = useState<WeeklyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get("/analytics/weekly")
      .then((res) => setData(res.data?.data ?? null))
      .catch((err) => console.error("Haftalık istatistikler çekilemedi:", err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="col-span-12 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton h-[120px] rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "short" });

  const widgets = [
    {
      title: "Bu Hafta Harcama",
      value: `₺${data.thisWeekExpense.toLocaleString("tr-TR")}`,
      prev: `Geçen: ₺${data.lastWeekExpense.toLocaleString("tr-TR")}`,
      change: data.expenseChangePct,
      // Harcama azaldıysa pozitif (iyi)
      positive: data.expenseChangePct <= 0,
      icon: TrendingDown,
      gradient: "from-red-500/12 via-red-500/4 to-transparent",
      border: "border-red-500/15 hover:border-red-500/30",
      iconBg: "bg-red-500/10",
      iconColor: "text-red-400",
      barColor: data.expenseChangePct <= 0 ? "bg-emerald-500" : "bg-red-500",
      barWidth:
        data.lastWeekExpense > 0
          ? Math.min(
              (data.thisWeekExpense /
                Math.max(data.thisWeekExpense, data.lastWeekExpense)) *
                100,
              100,
            )
          : 100,
    },
    {
      title: "Bu Hafta Gelir",
      value: `₺${data.thisWeekIncome.toLocaleString("tr-TR")}`,
      prev: `Geçen: ₺${data.lastWeekIncome.toLocaleString("tr-TR")}`,
      change: data.incomeChangePct,
      positive: data.incomeChangePct >= 0,
      icon: TrendingUp,
      gradient: "from-emerald-500/12 via-emerald-500/4 to-transparent",
      border: "border-emerald-500/15 hover:border-emerald-500/30",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-400",
      barColor: data.incomeChangePct >= 0 ? "bg-emerald-500" : "bg-red-500",
      barWidth:
        data.lastWeekIncome > 0
          ? Math.min(
              (data.thisWeekIncome /
                Math.max(data.thisWeekIncome, data.lastWeekIncome)) *
                100,
              100,
            )
          : 100,
    },
    {
      title: "İşlem Sayısı",
      value: `${data.transactionCount}`,
      prev: "Bu hafta toplam işlem",
      change: null,
      positive: true,
      icon: Activity,
      gradient: "from-blue-500/12 via-blue-500/4 to-transparent",
      border: "border-blue-500/15 hover:border-blue-500/30",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-400",
      barColor: "bg-blue-500",
      barWidth: Math.min(data.transactionCount * 10, 100),
    },
    {
      title: "Günlük Ortalama",
      value: `₺${data.dailyAvgExpense.toLocaleString("tr-TR")}`,
      prev: "Günlük harcama ortalaması",
      change: null,
      positive: true,
      icon: Calendar,
      gradient: "from-amber-500/12 via-amber-500/4 to-transparent",
      border: "border-amber-500/15 hover:border-amber-500/30",
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-400",
      barColor: "bg-amber-500",
      barWidth: 50,
    },
  ];

  return (
    <div className="col-span-12 space-y-3">
      {/* Başlık */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
            Bu Hafta
          </span>
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-zinc-800 to-transparent" />
        <span className="rounded-lg bg-zinc-800/60 px-2.5 py-1 text-[11px] font-medium text-zinc-500">
          {formatDate(data.weekStartDate)} – {formatDate(data.weekEndDate)}
        </span>
      </div>

      {/* Kartlar */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {widgets.map((w, i) => (
          <div
            key={w.title}
            className={`
              group relative overflow-hidden rounded-2xl border bg-zinc-900/70 p-4
              transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg
              ${w.border}
            `}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            {/* Gradient */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${w.gradient} opacity-80 transition-opacity group-hover:opacity-100`}
            />

            <div className="relative">
              {/* Başlık + İkon */}
              <div className="flex items-start justify-between mb-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                  {w.title}
                </p>
                <div
                  className={`rounded-lg p-1.5 ring-1 ring-white/[0.05] transition-transform duration-300 group-hover:scale-110 ${w.iconBg}`}
                >
                  <w.icon className={`h-3.5 w-3.5 ${w.iconColor}`} />
                </div>
              </div>

              {/* Değer */}
              <p className="text-xl font-extrabold tracking-tight text-zinc-100">
                {w.value}
              </p>

              {/* Değişim / Alt bilgi */}
              <div className="mt-2 flex items-center gap-1.5">
                {w.change !== null ? (
                  <>
                    <div
                      className={`flex items-center gap-0.5 rounded-md px-1.5 py-0.5 ${
                        w.positive
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {w.change === 0 ? (
                        <Minus className="h-3 w-3" />
                      ) : w.change > 0 ? (
                        <ArrowUp className="h-3 w-3" />
                      ) : (
                        <ArrowDown className="h-3 w-3" />
                      )}
                      <span className="text-[11px] font-bold">
                        %{Math.abs(w.change).toFixed(1)}
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-600">
                      geçen haftaya göre
                    </span>
                  </>
                ) : (
                  <span className="text-[10px] text-zinc-600">{w.prev}</span>
                )}
              </div>

              {/* Progress bar */}
              <div className="mt-3 h-1 w-full rounded-full bg-zinc-800/80">
                <div
                  className={`h-1 rounded-full transition-all duration-1000 ease-out ${w.barColor}`}
                  style={{ width: `${w.barWidth}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
