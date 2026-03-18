"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import {
  Wallet,
  TrendingUp,
  Brain,
  Target,
  Sparkles,
  Info,
} from "lucide-react";
import { api } from "@/lib/api";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DashboardData {
  totalSpending: number;
  potentialSavings: number;
  spendingScore: number;
  savingsProgress: number;
}

const defaultData: DashboardData = {
  totalSpending: 0,
  potentialSavings: 0,
  spendingScore: 0,
  savingsProgress: 0,
};

export function SummaryCards() {
  const [data, setData] = useState<DashboardData>(defaultData);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    api
      .get("/dashboard")
      .then((res) => {
        const d = res.data?.data;
        if (!d) {
          setHasError(true);
          return;
        }
        setData({
          // UI kartı "Aylık Toplam Harcama" olduğu için doğru alan: currentMonthExpenseTotal
          totalSpending: d.currentMonthExpenseTotal ?? 0,
          potentialSavings: d.potentialMonthlySavings ?? 0,
          spendingScore: d.smartSpendingScore ?? 0,
          savingsProgress: d.savingsGoalProgressPct ?? 0,
        });
      })
      .catch(() => setHasError(true))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="col-span-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton h-[130px] rounded-2xl" />
        ))}
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="col-span-12 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-center text-sm text-red-400">
        Dashboard verisi yüklenemedi.
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Mükemmel";
    if (score >= 60) return "İyi";
    if (score >= 40) return "Orta";
    return "Dikkat";
  };

  const cards = [
    {
      title: "Aylık Toplam Harcama",
      value: `₺${data.totalSpending.toLocaleString("tr-TR")}`,
      subtitle: "Bu ay toplam gider",
      icon: Wallet,
      gradient: "from-red-500/15 via-red-500/5 to-transparent",
      border: "border-red-500/20",
      iconBg: "bg-red-500/10",
      iconColor: "text-red-400",
      valueColor: "text-red-400",
      glowColor: "shadow-red-500/5",
    },
    {
      title: "Potansiyel Tasarruf",
      value: `₺${data.potentialSavings.toLocaleString("tr-TR")}`,
      subtitle: "İyileştirilebilir tasarruf tutarı",
      icon: TrendingUp,
      gradient: "from-emerald-500/15 via-emerald-500/5 to-transparent",
      border: "border-emerald-500/20",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-400",
      valueColor: "text-emerald-400",
      glowColor: "shadow-emerald-500/5",
      tooltip:
        "Değişken giderlerinizi daha verimli hale getirerek tahmini aylık tasarruf potansiyelinizi gösterir.",
    },
    {
      title: "Harcama Skoru",
      value: `${Number(data.spendingScore).toFixed(1)}`,
      subtitle: getScoreLabel(data.spendingScore),
      icon: Brain,
      gradient: "from-blue-500/15 via-blue-500/5 to-transparent",
      border: "border-blue-500/20",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-400",
      valueColor: getScoreColor(data.spendingScore),
      glowColor: "shadow-blue-500/5",
      showScoreBar: true,
      tooltip:
        "0-100 arası bir değerlendirmedir. Skor yükseldikçe tasarruf potansiyeli daha iyi yönetiliyor demektir.",
    },
    {
      title: "Tasarruf Hedefi",
      value: `%${Number(data.savingsProgress).toFixed(1)}`,
      subtitle: `Hedefin %${data.savingsProgress.toFixed(0)}'ine ulaşıldı`,
      icon: Target,
      gradient: "from-purple-500/15 via-purple-500/5 to-transparent",
      border: "border-purple-500/20",
      iconBg: "bg-purple-500/10",
      iconColor: "text-purple-400",
      valueColor: "text-purple-400",
      glowColor: "shadow-purple-500/5",
      progress: data.savingsProgress,
    },
  ];

  return (
    <div className="col-span-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, i) => (
        <div
          key={card.title}
          className={`
            group relative overflow-hidden rounded-2xl border bg-zinc-900/80
            p-5 transition-all duration-300
            hover:-translate-y-1 hover:shadow-xl
            ${card.border} ${card.glowColor}
          `}
          style={{
            animationDelay: `${i * 80}ms`,
            animationFillMode: "backwards",
          }}
        >
          {/* Gradient arka plan */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-80 transition-opacity duration-300 group-hover:opacity-100`}
          />

          {/* Dekoratif köşe ışığı */}
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/[0.02] blur-2xl transition-all duration-500 group-hover:bg-white/[0.04]" />

          <div className="relative">
            {/* Üst: Başlık + İkon */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                  {card.title}
                </p>
                {(card as any).tooltip ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3.5 w-3.5 text-zinc-600" />
                    </TooltipTrigger>
                    <TooltipContent>{(card as any).tooltip}</TooltipContent>
                  </Tooltip>
                ) : null}
              </div>
              <div
                className={`rounded-xl p-2.5 ring-1 ring-white/[0.06] transition-transform duration-300 group-hover:scale-110 ${card.iconBg}`}
              >
                <card.icon className={`h-[18px] w-[18px] ${card.iconColor}`} />
              </div>
            </div>

            {/* Değer */}
            <p
              className={`mt-3 text-[1.75rem] font-extrabold tracking-tight ${card.valueColor}`}
            >
              {card.value}
            </p>

            {/* Alt bilgi / Skor bar / Progress */}
            <div className="mt-3">
              {"showScoreBar" in card && card.showScoreBar ? (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-zinc-500">
                      {card.subtitle}
                    </span>
                    <span className="text-[11px] font-bold text-zinc-400">
                      / 100
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-zinc-800">
                    <div
                      className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-1000"
                      style={{
                        width: `${Math.min(data.spendingScore, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ) : "progress" in card && card.progress !== undefined ? (
                <div className="space-y-1.5">
                  <Progress
                    value={card.progress}
                    className="h-1.5 bg-zinc-800 [&>div]:bg-gradient-to-r [&>div]:from-purple-500 [&>div]:to-purple-400 [&>div]:transition-all [&>div]:duration-1000"
                  />
                  <p className="text-[11px] text-zinc-500">{card.subtitle}</p>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-zinc-600" />
                  <p className="text-[11px] text-zinc-500">{card.subtitle}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
