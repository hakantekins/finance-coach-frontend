"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Brain,
  Sparkles,
  Loader2,
  RefreshCw,
  TrendingDown,
  ShoppingCart,
  Clock,
  CheckCircle2,
} from "lucide-react";

interface Recommendation {
  id: number;
  type: "GENERAL" | "CATEGORY_ALERT" | "MARKET_COMPARISON";
  message: string;
  analyzedCategory?: string;
  createdAt: string;
}

const typeConfig = {
  GENERAL: {
    label: "Genel Analiz",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  CATEGORY_ALERT: {
    label: "Kategori Uyarısı",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
  },
  MARKET_COMPARISON: {
    label: "Market Karşılaştırma",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
};

export default function CoachPage() {
  const [advice, setAdvice] = useState("");
  const [history, setHistory] = useState<Recommendation[]>([]);
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAdvice = async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoadingAdvice(true);
    try {
      const res = await api.get("/coach/advice");
      const raw = res.data?.data;
      setAdvice(
        typeof raw === "object" && raw?.message
          ? raw.message
          : typeof raw === "string"
            ? raw
            : "Tavsiye alınamadı.",
      );
      if (refresh) toast.success("Tavsiye yenilendi!");
    } catch {
      setAdvice("Tavsiye alınamadı. Lütfen daha sonra tekrar deneyin.");
      if (refresh) toast.error("Tavsiye yenilenemedi.");
    } finally {
      setIsLoadingAdvice(false);
      setIsRefreshing(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await api.get("/coach/history");
      const data = res.data?.data ?? [];
      setHistory(Array.isArray(data) ? data : []);
    } catch {
      console.error("Geçmiş çekilemedi");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleRefresh = async () => {
    await fetchAdvice(true);
    fetchHistory();
  };

  useEffect(() => {
    fetchAdvice();
    fetchHistory();
  }, []);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">AI Tasarruf Koçu</h1>
        <p className="text-sm text-zinc-500">
          Kişiselleştirilmiş finansal analizler ve öneriler
        </p>
      </div>

      {/* Güncel Tavsiye */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-zinc-900 p-6">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/8 to-transparent" />
        <div className="relative">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/20">
                <Brain className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-100">
                  Güncel Tavsiye
                </p>
                <p className="text-xs text-zinc-500">
                  AI destekli finansal analiz
                </p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-400 transition hover:bg-zinc-700 hover:text-zinc-100 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Yenile
            </button>
          </div>

          <div className="rounded-xl bg-zinc-800/60 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Yapay Zeka Analizi
              </span>
            </div>
            {isLoadingAdvice ? (
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <Loader2 className="h-4 w-4 animate-spin" /> Analiz ediliyor...
              </div>
            ) : (
              <p className="text-sm leading-relaxed text-zinc-100 whitespace-pre-line">
                {advice}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Hızlı Analizler */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[
          {
            icon: TrendingDown,
            title: "Kategori Analizi",
            desc: "En yüksek harcama kategorinizi analiz et",
            label: "Analiz Et",
            color: "text-yellow-400",
            bg: "bg-yellow-500/10",
            border: "border-yellow-500/20",
            action: async () => {
              await api.get("/coach/analyze/category");
              toast.success("Kategori analizi tamamlandı!");
              fetchHistory();
            },
          },
          {
            icon: ShoppingCart,
            title: "Market Karşılaştırması",
            desc: "Süt, ekmek gibi temel ürünler için fiyat analizi",
            label: "Karşılaştır",
            color: "text-blue-400",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20",
            action: async () => {
              await api.get("/coach/analyze/market?product=Tam Yağlı Süt 1L");
              toast.success("Market karşılaştırması tamamlandı!");
              fetchHistory();
            },
          },
        ].map((item) => (
          <AnalysisCard key={item.title} {...item} />
        ))}
      </div>

      {/* Geçmiş */}
      <div>
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-zinc-600">
          Tavsiye Geçmişi ({Math.min(history.length, 20)}
          {history.length > 20 ? " / " + history.length : ""})
        </h2>
        <div className="space-y-3">
          {isLoadingHistory ? (
            <div className="flex items-center justify-center py-12 text-zinc-500">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Yükleniyor...
            </div>
          ) : history.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 py-12 text-center text-zinc-500">
              Henüz tavsiye geçmişi yok.
            </div>
          ) : (
            history.slice(0, 20).map((rec) => {
              const cfg = typeConfig[rec.type];
              return (
                <div
                  key={rec.id}
                  className={`rounded-2xl border bg-zinc-900 p-5 ${cfg.border}`}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${cfg.bg} ${cfg.color}`}
                    >
                      {cfg.label}
                      {rec.analyzedCategory ? ` · ${rec.analyzedCategory}` : ""}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-zinc-600">
                      <Clock className="h-3 w-3" />
                      {formatDate(rec.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-zinc-300 whitespace-pre-line">
                    {rec.message}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function AnalysisCard({
  icon: Icon,
  title,
  desc,
  label,
  color,
  bg,
  border,
  action,
}: {
  icon: any;
  title: string;
  desc: string;
  label: string;
  color: string;
  bg: string;
  border: string;
  action: () => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handle = async () => {
    setLoading(true);
    try {
      await action();
      setDone(true);
      setTimeout(() => setDone(false), 3000);
    } catch {
      toast.error("İşlem başarısız. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-zinc-900 p-5 ${border}`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br from-current/5 to-transparent opacity-20`}
      />
      <div className="relative">
        <div className="mb-4 flex items-start gap-3">
          <div className={`rounded-xl p-2.5 ${bg}`}>
            <Icon className={`h-5 w-5 ${color}`} />
          </div>
          <div>
            <p className="text-sm font-bold text-zinc-100">{title}</p>
            <p className="mt-0.5 text-xs text-zinc-500">{desc}</p>
          </div>
        </div>
        <button
          onClick={handle}
          disabled={loading}
          className="w-full rounded-xl bg-zinc-800 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-700 hover:text-zinc-100 disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Analiz ediliyor...
            </span>
          ) : done ? (
            <span className="flex items-center justify-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Tamamlandı
            </span>
          ) : (
            label
          )}
        </button>
      </div>
    </div>
  );
}
