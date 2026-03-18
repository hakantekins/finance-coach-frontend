"use client";

import { toast } from "sonner";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet,
  Plus,
  X,
  ArrowUpRight,
  ArrowDownRight,
  Repeat,
  Search,
} from "lucide-react";

interface Transaction {
  id: number;
  amount: number;
  type: "INCOME" | "EXPENSE";
  category: string;
  description: string;
  transactionDate: string;
  isRecurring?: boolean;
  recurringDay?: number;
}

type Filter = "ALL" | "INCOME" | "EXPENSE";
type FormTab = "EXPENSE" | "INCOME";

const expenseCategories = [
  "Market",
  "Kira",
  "Fatura",
  "Ulaşım",
  "Sağlık",
  "Eğlence",
  "Giyim",
  "Teknoloji",
  "Eğitim",
  "Diğer",
];
const incomeCategories = [
  "Maaş",
  "Serbest Çalışma",
  "Kira Geliri",
  "Yatırım Getirisi",
  "Ek İş",
  "Diğer",
];
const priorityLabels: Record<string, string> = {
  "1": "Çok Önemli",
  "2": "Önemli",
  "3": "Faydalı",
  "4": "İsteğe Bağlı",
  "5": "Düşük",
  "6": "Gereksiz",
};

export default function ExpensesPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formTab, setFormTab] = useState<FormTab>("EXPENSE");
  const [mounted, setMounted] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringDay, setRecurringDay] = useState("");
  const [form, setForm] = useState({
    category: "",
    amount: "",
    priority: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setField = (key: keyof typeof form) => (val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const fetchTransactions = async () => {
    try {
      const res = await api.get("/transactions");
      const data = res.data?.data ?? res.data;
      setTransactions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("İşlemler çekilemedi:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchTransactions();
  }, []);

  const handleSubmit = async () => {
    if (!form.category || !form.amount) {
      toast.error("Lütfen zorunlu alanları doldurun.");
      return;
    }
    const parsed = parseFloat(form.amount);
    if (isNaN(parsed) || parsed <= 0) {
      toast.error("Geçerli bir tutar girin.");
      return;
    }
    if (isRecurring && !recurringDay) {
      toast.error("Tekrarlayan işlem için gün seçin.");
      return;
    }

    setIsSubmitting(true);
    try {
      const priority = form.priority
        ? form.priority.startsWith("P")
          ? form.priority
          : `P${form.priority}`
        : undefined;
      await api.post("/transactions", {
        amount: parsed,
        type: formTab,
        category: form.category,
        description: priority
          ? `Öncelik: ${priority}` +
            (form.description ? ` - ${form.description}` : "")
          : form.description || undefined,
        transactionDate: new Date().toISOString().split("T")[0],
        isRecurring,
        recurringDay: isRecurring ? parseInt(recurringDay) : null,
      });
      setForm({ category: "", amount: "", priority: "", description: "" });
      setIsRecurring(false);
      setRecurringDay("");
      setShowForm(false);
      toast.success(
        formTab === "EXPENSE"
          ? "Gider başarıyla eklendi!"
          : "Gelir başarıyla eklendi!",
      );
      await fetchTransactions();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "İşlem eklenemedi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await api.delete(`/transactions/${id}`);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      toast.success("İşlem silindi.");
    } catch {
      toast.error("Silme işlemi başarısız.");
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const filtered = transactions
    .filter((t) => (filter === "ALL" ? true : t.type === filter))
    .filter((t) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        t.category?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q)
      );
    });

  const totalIncome = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((s, t) => s + t.amount, 0);
  const netBalance = totalIncome - totalExpense;

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Harcamalarım</h1>
          <p className="text-sm text-zinc-500">
            Tüm gelir ve gider işlemleriniz
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
            showForm
              ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              : "bg-emerald-500 text-black hover:bg-emerald-400 shadow-lg shadow-emerald-500/20"
          }`}
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "İptal" : "Yeni İşlem"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="rounded-2xl border border-zinc-700 bg-zinc-900 p-5">
          <div className="mb-5 flex rounded-xl bg-zinc-800 p-1 w-fit gap-1">
            {(["EXPENSE", "INCOME"] as FormTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setFormTab(tab);
                  setForm({
                    category: "",
                    amount: "",
                    priority: "",
                    description: "",
                  });
                  setIsRecurring(false);
                  setRecurringDay("");
                }}
                className={`flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold transition-all ${
                  formTab === tab
                    ? tab === "EXPENSE"
                      ? "bg-red-500/20 text-red-400 ring-1 ring-red-500/30"
                      : "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {tab === "EXPENSE" ? (
                  <>
                    <TrendingDown className="h-4 w-4" /> Gider Ekle
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-4 w-4" /> Gelir Ekle
                  </>
                )}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                {formTab === "EXPENSE" ? "Harcama Kategorisi" : "Gelir Türü"} *
              </Label>
              {mounted ? (
                <Select
                  value={form.category}
                  onValueChange={setField("category")}
                >
                  <SelectTrigger className="border-zinc-700 bg-zinc-800 text-zinc-100">
                    <SelectValue placeholder="Seçiniz" />
                  </SelectTrigger>
                  <SelectContent className="border-zinc-800 bg-zinc-900">
                    {(formTab === "EXPENSE"
                      ? expenseCategories
                      : incomeCategories
                    ).map((cat) => (
                      <SelectItem
                        key={cat}
                        value={cat}
                        className="text-zinc-100"
                      >
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="h-10 rounded-lg border border-zinc-700 bg-zinc-800" />
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Tutar (₺) *
              </Label>
              <Input
                type="number"
                min="0.01"
                step="0.01"
                value={form.amount}
                onChange={(e) => setField("amount")(e.target.value)}
                placeholder="0.00"
                className="border-zinc-700 bg-zinc-800 text-zinc-100"
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>

            {formTab === "EXPENSE" && mounted && (
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Öncelik
                </Label>
                <Select
                  value={form.priority}
                  onValueChange={setField("priority")}
                >
                  <SelectTrigger className="border-zinc-700 bg-zinc-800 text-zinc-100">
                    <SelectValue placeholder="Opsiyonel" />
                  </SelectTrigger>
                  <SelectContent className="border-zinc-800 bg-zinc-900">
                    {Object.entries(priorityLabels).map(([val, label]) => (
                      <SelectItem
                        key={val}
                        value={val}
                        className="text-zinc-100"
                      >
                        {val} - {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Açıklama
              </Label>
              <Input
                value={form.description}
                onChange={(e) => setField("description")(e.target.value)}
                placeholder="Not ekle... (opsiyonel)"
                className="border-zinc-700 bg-zinc-800 text-zinc-100"
              />
            </div>
          </div>

          {/* Tekrarlayan İşlem Toggle */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsRecurring(!isRecurring);
                  if (isRecurring) setRecurringDay("");
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isRecurring
                    ? formTab === "EXPENSE"
                      ? "bg-red-500"
                      : "bg-emerald-500"
                    : "bg-zinc-700"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isRecurring ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
              <Label className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                Her Ay Tekrarla
              </Label>
            </div>

            {isRecurring && mounted && (
              <div className="flex items-center gap-3 mt-2">
                <Label className="text-zinc-400 text-xs whitespace-nowrap">
                  Her ayın
                </Label>
                <Select value={recurringDay} onValueChange={setRecurringDay}>
                  <SelectTrigger className="w-24 border-zinc-700 bg-zinc-800 text-zinc-100">
                    <SelectValue placeholder="Gün" />
                  </SelectTrigger>
                  <SelectContent className="border-zinc-800 bg-zinc-900 max-h-48">
                    {Array.from({ length: 28 }, (_, i) => (
                      <SelectItem
                        key={i + 1}
                        value={String(i + 1)}
                        className="text-zinc-100"
                      >
                        {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Label className="text-zinc-400 text-xs whitespace-nowrap">
                  'inde tekrarla
                </Label>
              </div>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all ${
              formTab === "EXPENSE"
                ? "bg-red-500 text-white hover:bg-red-400 shadow-lg shadow-red-500/20"
                : "bg-emerald-500 text-black hover:bg-emerald-400 shadow-lg shadow-emerald-500/20"
            } disabled:opacity-60`}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {formTab === "EXPENSE" ? "Gideri Kaydet" : "Geliri Kaydet"}
          </button>
        </div>
      )}

      {/* Özet Kartlar */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            label: "Toplam Gelir",
            value: totalIncome,
            color: "text-emerald-400",
            border: "border-emerald-500/20",
            gradient: "from-emerald-500/10",
            icon: ArrowUpRight,
          },
          {
            label: "Toplam Gider",
            value: totalExpense,
            color: "text-red-400",
            border: "border-red-500/20",
            gradient: "from-red-500/10",
            icon: ArrowDownRight,
          },
          {
            label: "Net Bakiye",
            value: netBalance,
            color: netBalance >= 0 ? "text-emerald-400" : "text-red-400",
            border:
              netBalance >= 0 ? "border-emerald-500/20" : "border-red-500/20",
            gradient: "from-zinc-700/30",
            icon: Wallet,
          },
        ].map((item) => (
          <div
            key={item.label}
            className={`relative overflow-hidden rounded-2xl border bg-zinc-900 p-5 ${item.border}`}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${item.gradient} to-transparent opacity-60`}
            />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500">{item.label}</p>
                <p className={`mt-1 text-xl font-bold ${item.color}`}>
                  ₺{item.value.toLocaleString("tr-TR")}
                </p>
              </div>
              <item.icon className={`h-6 w-6 ${item.color} opacity-60`} />
            </div>
          </div>
        ))}
      </div>

      {/* Filtreler + Arama */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          {(["ALL", "INCOME", "EXPENSE"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                filter === f
                  ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100"
              }`}
            >
              {f === "ALL" ? "Tümü" : f === "INCOME" ? "Gelirler" : "Giderler"}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Kategori veya açıklama ara..."
            className="w-full border-zinc-800 bg-zinc-900 pl-10 text-zinc-100 sm:w-64"
          />
        </div>
      </div>

      <p className="text-xs text-zinc-600">
        {filtered.length} işlem listeleniyor
      </p>

      {/* Liste */}
      <Card className="border-zinc-800 bg-zinc-900 overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-zinc-500">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Yükleniyor...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Wallet className="mb-3 h-10 w-10 text-zinc-700" />
              <p className="text-sm text-zinc-500">
                {searchQuery
                  ? "Aramayla eşleşen işlem bulunamadı."
                  : "Henüz işlem bulunmuyor."}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-3 text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  + İlk işlemi ekle
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/60">
              {filtered.map((t) => (
                <div
                  key={t.id}
                  className="group relative flex items-center justify-between px-5 py-4 transition-colors hover:bg-zinc-800/40"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        t.type === "INCOME"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {t.type === "INCOME" ? (
                        <TrendingUp className="h-5 w-5" />
                      ) : (
                        <TrendingDown className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-zinc-100">
                          {t.category ?? "—"}
                        </p>
                        {t.isRecurring && (
                          <span className="flex items-center gap-1 rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium text-violet-400">
                            <Repeat className="h-3 w-3" />
                            {t.recurringDay
                              ? `${t.recurringDay}. gün`
                              : "Aylık"}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500">
                        {t.description ? `${t.description} · ` : ""}
                        {formatDate(t.transactionDate)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span
                      className={`text-base font-bold ${
                        t.type === "INCOME"
                          ? "text-emerald-400"
                          : "text-red-400"
                      }`}
                    >
                      {t.type === "INCOME" ? "+" : "-"}₺
                      {t.amount.toLocaleString("tr-TR")}
                    </span>
                    <Badge
                      variant="outline"
                      className={`hidden border-0 text-[10px] sm:inline-flex ${
                        t.type === "INCOME"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {t.type === "INCOME" ? "Gelir" : "Gider"}
                    </Badge>

                    {/* Silme - Onay mekanizması */}
                    {confirmDeleteId === t.id ? (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={deletingId === t.id}
                          onClick={() => handleDelete(t.id)}
                          className="h-8 w-8 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                        >
                          {deletingId === t.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setConfirmDeleteId(null)}
                          className="h-8 w-8 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setConfirmDeleteId(t.id)}
                        className="h-8 w-8 text-zinc-700 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
