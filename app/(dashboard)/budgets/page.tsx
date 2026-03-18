"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  PieChart,
  Plus,
  Trash2,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Target,
  TrendingDown,
  X,
  Wallet,
} from "lucide-react";

interface Budget {
  id: number;
  category: string;
  monthlyLimit: number;
  currentSpent: number;
  remaining: number;
  usagePercent: number;
  overBudget: boolean;
  status: "SAFE" | "WARNING" | "DANGER" | "OVER";
}

const statusConfig = {
  SAFE: {
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    bar: "bg-emerald-500",
    label: "Güvenli",
  },
  WARNING: {
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
    bar: "bg-yellow-500",
    label: "Dikkat",
  },
  DANGER: {
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    bar: "bg-orange-500",
    label: "Tehlike",
  },
  OVER: {
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    bar: "bg-red-500",
    label: "Aşıldı!",
  },
};

const suggestedCategories = [
  "Mağaza",
  "Ulaşım",
  "Fatura",
  "Kira",
  "Sağlık",
  "Eğlence",
  "Giyim",
  "Teknoloji",
  "Eğitim",
  "Kahve",
  "Yemek",
  "Abonelik",
];

function displayCategory(category: string) {
  // Eski kayıtlar "Market" olarak tutulmuş olabilir.
  if (category === "Market") return "Mağaza";
  return category;
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState("");
  const [monthlyLimit, setMonthlyLimit] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchBudgets = async () => {
    try {
      const res = await api.get("/budgets");
      setBudgets(res.data?.data ?? []);
    } catch {
      console.error("Bütçeler çekilemedi");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleSubmit = async () => {
    if (!category.trim() || !monthlyLimit) {
      toast.error("Kategori ve limit zorunludur.");
      return;
    }
    const parsed = parseFloat(monthlyLimit);
    if (isNaN(parsed) || parsed < 1) {
      toast.error("Geçerli bir limit girin (min ₺1).");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/budgets", {
        category: category.trim(),
        monthlyLimit: parsed,
      });
      toast.success(`"${category.trim()}" bütçesi kaydedildi.`);
      setCategory("");
      setMonthlyLimit("");
      setShowForm(false);
      await fetchBudgets();
    } catch (err: unknown) {
      toast.error("Bütçe kaydedilemedi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number, cat: string) => {
    if (!confirm(`"${cat}" bütçesini silmek istediğinize emin misiniz?`))
      return;
    setDeletingId(id);
    try {
      await api.delete(`/budgets/${id}`);
      toast.success(`"${cat}" bütçesi silindi.`);
      setBudgets((prev) => prev.filter((b) => b.id !== id));
    } catch {
      toast.error("Silme başarısız.");
    } finally {
      setDeletingId(null);
    }
  };

  const totalLimit = budgets.reduce((s, b) => s + b.monthlyLimit, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.currentSpent, 0);
  const totalRemaining = totalLimit - totalSpent;
  const overCount = budgets.filter((b) => b.overBudget).length;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Bütçe Planlama</h1>
          <p className="text-sm text-zinc-500">
            Kategori bazlı aylık harcama limitleri belirleyin
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
            showForm
              ? "bg-zinc-800 text-zinc-300"
              : "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 hover:bg-emerald-400"
          }`}
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "İptal" : "Bütçe Ekle"}
        </button>
      </div>

      {/* Özet Kartları */}
      {budgets.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-zinc-500" />
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Toplam Bütçe
              </p>
            </div>
            <p className="text-2xl font-extrabold text-zinc-100">
              ₺{totalLimit.toLocaleString("tr-TR")}
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="h-4 w-4 text-zinc-500" />
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Bu Ay Harcanan
              </p>
            </div>
            <p className="text-2xl font-extrabold text-red-400">
              ₺{totalSpent.toLocaleString("tr-TR")}
            </p>
          </div>
          <div
            className={`rounded-2xl border p-5 ${totalRemaining >= 0 ? "border-emerald-500/20 bg-emerald-500/5" : "border-red-500/20 bg-red-500/5"}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="h-4 w-4 text-zinc-500" />
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Kalan
              </p>
            </div>
            <p
              className={`text-2xl font-extrabold ${totalRemaining >= 0 ? "text-emerald-400" : "text-red-400"}`}
            >
              ₺{totalRemaining.toLocaleString("tr-TR")}
            </p>
          </div>
        </div>
      )}

      {/* Aşım Uyarısı */}
      {overCount > 0 && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/5 px-5 py-4">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-400" />
          <div>
            <p className="text-sm font-bold text-red-400">
              {overCount} kategoride bütçe aşımı!
            </p>
            <p className="text-xs text-zinc-500">
              Aşılan kategorilerde harcamalarınızı gözden geçirin.
            </p>
          </div>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="rounded-2xl border border-zinc-700 bg-zinc-900 p-5 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Kategori *
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Örn: Mağaza, Ulaşım, Fatura..."
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-zinc-100 placeholder-zinc-600 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            {/* Hızlı seçim */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {suggestedCategories
                .filter(
                  (c) =>
                    !budgets.some(
                      (b) => b.category.toLowerCase() === c.toLowerCase(),
                    ),
                )
                .map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${
                      category === cat
                        ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30"
                        : "bg-zinc-800 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Aylık Limit (₺) *
            </label>
            <input
              type="number"
              min="1"
              step="0.01"
              value={monthlyLimit}
              onChange={(e) => setMonthlyLimit(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-zinc-100 placeholder-zinc-600 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-bold text-black transition hover:bg-emerald-400 disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Bütçe Kaydet
          </button>
        </div>
      )}

      {/* Bütçe Listesi */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-zinc-500">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Yükleniyor...
        </div>
      ) : budgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 py-20 text-center">
          <PieChart className="mb-4 h-16 w-16 text-zinc-800" />
          <p className="text-lg font-semibold text-zinc-400">Henüz bütçe yok</p>
          <p className="mt-1 text-sm text-zinc-600">
            "Bütçe Ekle" butonuyla kategori bazlı limitler belirleyin
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {budgets.map((budget) => {
            const cfg = statusConfig[budget.status];
            const barWidth = Math.min(budget.usagePercent, 100);

            return (
              <div
                key={budget.id}
                className={`rounded-2xl border bg-zinc-900 p-5 transition-all ${cfg.border}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Üst: Kategori + Durum */}
                    <div className="flex items-center gap-2 mb-3">
                      <p className="text-base font-bold text-zinc-100">
                        {displayCategory(budget.category)}
                      </p>
                      <span
                        className={`rounded-lg px-2 py-0.5 text-[10px] font-bold ${cfg.bg} ${cfg.color}`}
                      >
                        {cfg.label}
                      </span>
                      {budget.overBudget && (
                        <AlertTriangle className="h-4 w-4 text-red-400 animate-pulse" />
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2.5 w-full rounded-full bg-zinc-800">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-700 ${cfg.bar}`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>

                    {/* Alt: Sayılar */}
                    <div className="mt-2 flex items-center justify-between text-[12px]">
                      <span className="text-zinc-500">
                        ₺{budget.currentSpent.toLocaleString("tr-TR")} harcandı
                      </span>
                      <span
                        className={
                          budget.remaining >= 0
                            ? "text-emerald-400 font-semibold"
                            : "text-red-400 font-semibold"
                        }
                      >
                        {budget.remaining >= 0
                          ? `₺${budget.remaining.toLocaleString("tr-TR")} kaldı`
                          : `₺${Math.abs(budget.remaining).toLocaleString("tr-TR")} aşıldı`}
                      </span>
                      <span className="text-zinc-600">
                        / ₺{budget.monthlyLimit.toLocaleString("tr-TR")}
                      </span>
                    </div>
                  </div>

                  {/* Yüzde + Sil */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className={`text-2xl font-extrabold ${cfg.color}`}>
                      %{budget.usagePercent}
                    </span>
                    <button
                      onClick={() => handleDelete(budget.id, displayCategory(budget.category))}
                      disabled={deletingId === budget.id}
                      className="rounded-lg p-2 text-zinc-600 transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                    >
                      {deletingId === budget.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
