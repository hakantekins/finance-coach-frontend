"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Sparkles, Loader2, TrendingDown, Zap } from "lucide-react";
import { api } from "@/lib/api";

const savingsRules = [
  {
    priority: 1,
    reduction: 5,
    label: "Çok Önemli",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    ring: "ring-emerald-500/20",
  },
  {
    priority: 2,
    reduction: 10,
    label: "Önemli",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    ring: "ring-blue-500/20",
  },
  {
    priority: 3,
    reduction: 15,
    label: "Faydalı",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    ring: "ring-cyan-500/20",
  },
  {
    priority: 4,
    reduction: 25,
    label: "İsteğe Bağlı",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    ring: "ring-yellow-500/20",
  },
  {
    priority: 5,
    reduction: 35,
    label: "Düşük Öncelik",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    ring: "ring-orange-500/20",
  },
  {
    priority: 6,
    reduction: 45,
    label: "Gereksiz",
    color: "text-red-400",
    bg: "bg-red-500/10",
    ring: "ring-red-500/20",
  },
];

export function SavingsCoach() {
  const [aiAdvice, setAiAdvice] = useState("");
  const [potentialSavings, setPotentialSavings] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAiCoachData = async () => {
      try {
        const dashResponse = await api.get("/dashboard");
        setPotentialSavings(
          dashResponse.data.data?.potentialMonthlySavings ?? 0,
        );

        const coachResponse = await api.get("/coach/advice");
        const rawData = coachResponse.data.data;
        const advice =
          (typeof rawData === "object" && rawData?.message) ??
          (typeof rawData === "string" ? rawData : "") ??
          "Tavsiye alınamadı.";
        setAiAdvice(advice);
      } catch (error) {
        console.error("AI Coach verisi alınamadı:", error);
        setAiAdvice(
          "Harcamalarınızı analiz edebilmem için biraz daha veri eklemelisiniz.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchAiCoachData();
  }, []);

  return (
    <Card className="col-span-12 border-zinc-800 bg-zinc-900/80 lg:col-span-4 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/20">
            <Brain className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-zinc-100">
              AI Tasarruf Koçu
            </CardTitle>
            <p className="text-[11px] text-zinc-600">
              Kişiselleştirilmiş analiz
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        {/* AI Tavsiyesi */}
        <div className="relative overflow-hidden rounded-xl bg-emerald-500/[0.06] border border-emerald-500/15 p-4">
          <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-emerald-500/10 blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-1.5 mb-2.5">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                Yapay Zeka Analizi
              </span>
            </div>
            {isLoading ? (
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Analiz
                ediliyor...
              </div>
            ) : (
              <p className="text-[13px] leading-relaxed text-zinc-200">
                {aiAdvice}
              </p>
            )}
          </div>
        </div>

        {/* Öncelik Tablosu — Kompakt */}
        <div>
          <p className="mb-2.5 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
            Öncelik Bazlı Tasarruf Rehberi
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {savingsRules.map((rule) => (
              <div
                key={rule.priority}
                className={`group flex items-center gap-2.5 rounded-lg border border-zinc-800/60 bg-zinc-800/30 px-3 py-2.5 transition-all duration-200 hover:bg-zinc-800/60 hover:border-zinc-700/60`}
              >
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-extrabold ring-1 ${rule.bg} ${rule.color} ${rule.ring}`}
                >
                  P{rule.priority}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-zinc-300 truncate">
                    {rule.label}
                  </p>
                  <div className="flex items-center gap-1">
                    <TrendingDown className="h-2.5 w-2.5 text-zinc-600" />
                    <span className="text-[10px] text-zinc-500">
                      %{rule.reduction}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Potansiyel Tasarruf */}
        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/15 via-emerald-500/8 to-transparent p-5">
          <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-emerald-500/10 blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-4 w-4 text-emerald-400" />
              <span className="text-[11px] font-semibold text-emerald-400/80">
                Aylık Potansiyel Tasarruf
              </span>
            </div>
            <p className="text-3xl font-extrabold tracking-tight text-emerald-400">
              ₺{potentialSavings.toLocaleString("tr-TR")}
            </p>
            {potentialSavings === 0 && (
              <p className="mt-2 text-[12px] leading-relaxed text-emerald-200/80">
                Bu değer, bu ay eklediğiniz değişken giderlere göre hesaplanır.
                Henüz veri yoksa 0 görünebilir.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
