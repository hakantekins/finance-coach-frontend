"use client";

import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Trash2,
  Loader2,
  Bell,
  X,
  Clock,
} from "lucide-react";
import { api } from "@/lib/api";

type PaymentCategory = "KREDI_KARTI" | "FATURA" | "KIRA" | "TAKSIT" | "DIGER";

interface Payment {
  id: number;
  title: string;
  category: PaymentCategory;
  amount: number;
  dueDate: string;
  isPaid: boolean;
  creditLimit?: number;
  description?: string;
  isRecurring: boolean;
  daysUntilDue: number;
  isOverdue: boolean;
  isUrgent: boolean;
}

const categoryConfig: Record<
  PaymentCategory,
  { label: string; color: string; bg: string }
> = {
  KREDI_KARTI: {
    label: "Kredi Kartı",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
  FATURA: { label: "Fatura", color: "text-blue-400", bg: "bg-blue-500/10" },
  KIRA: { label: "Kira", color: "text-yellow-400", bg: "bg-yellow-500/10" },
  TAKSIT: { label: "Taksit", color: "text-orange-400", bg: "bg-orange-500/10" },
  DIGER: { label: "Diğer", color: "text-zinc-400", bg: "bg-zinc-500/10" },
};

const categoryOptions: { value: PaymentCategory; label: string }[] = [
  { value: "KREDI_KARTI", label: "Kredi Kartı Ekstresi" },
  { value: "FATURA", label: "Fatura (Elektrik/Su/İnternet)" },
  { value: "KIRA", label: "Kira" },
  { value: "TAKSIT", label: "Taksit / Kredi Ödemesi" },
  { value: "DIGER", label: "Diğer Sabit Gider" },
];

export function UpcomingPaymentsPanel() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [payingId, setPayingId] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  const [form, setForm] = useState({
    title: "",
    category: "" as PaymentCategory | "",
    amount: "",
    dueDate: "",
    creditLimit: "",
    description: "",
    isRecurring: false,
  });

  const setField = (key: keyof typeof form) => (val: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const fetchPayments = async () => {
    try {
      const res = await api.get("/payments");
      const data = res.data?.data ?? [];
      setPayments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Ödemeler çekilemedi:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchPayments();
  }, []);

  const handleAdd = async () => {
    if (!form.title || !form.category || !form.amount || !form.dueDate) {
      toast.error("Lütfen zorunlu alanları doldurun.");
      return;
    }
    try {
      await api.post("/payments", {
        title: form.title,
        category: form.category,
        amount: parseFloat(form.amount),
        dueDate: form.dueDate,
        creditLimit: form.creditLimit ? parseFloat(form.creditLimit) : null,
        description: form.description || null,
        isRecurring: form.isRecurring,
      });
      setForm({
        title: "",
        category: "",
        amount: "",
        dueDate: "",
        creditLimit: "",
        description: "",
        isRecurring: false,
      });
      setShowForm(false);
      await fetchPayments();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Ödeme eklenemedi.");
    }
  };

  const handlePay = async (id: number) => {
    setPayingId(id);
    try {
      // DÜZELTME: api instance'ı token'ı otomatik ekliyor, doğrudan çağır
      await api.put(`/payments/${id}/pay`);
      // Sonucu bekle ve listeyi yenile
      await fetchPayments();
    } catch (err: any) {
      console.error("Ödeme hatası:", err);
      toast.error(err.response?.data?.message ?? "İşlem başarısız.");
    } finally {
      setPayingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bu ödemeyi silmek istediğinize emin misiniz?")) return;
    setDeletingId(id);
    try {
      await api.delete(`/payments/${id}`);
      setPayments((prev) => prev.filter((p) => p.id !== id));
    } catch {
      toast.error("Silme işlemi başarısız.");
    } finally {
      setDeletingId(null);
    }
  };

  // İkiye ayır
  const pending = payments
    .filter((p) => !p.isPaid)
    .sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
    );

  const paid = payments
    .filter((p) => p.isPaid)
    .sort(
      (a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime(),
    );

  const urgentCount = pending.filter((p) => p.isUrgent || p.isOverdue).length;
  const totalPending = pending.reduce((s, p) => s + p.amount, 0);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const PaymentCard = ({ payment }: { payment: Payment }) => {
    const cfg = categoryConfig[payment.category];
    return (
      <div
        className={`rounded-xl border p-3 transition-colors ${
          payment.isPaid
            ? "border-zinc-800 bg-zinc-800/20"
            : payment.isOverdue
              ? "border-red-500/30 bg-red-500/5"
              : payment.isUrgent
                ? "border-yellow-500/30 bg-yellow-500/5"
                : "border-zinc-800 bg-zinc-800/50"
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-sm font-semibold truncate ${payment.isPaid ? "text-zinc-500" : "text-zinc-100"}`}
              >
                {payment.title}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${cfg.bg} ${cfg.color}`}
              >
                {cfg.label}
              </span>
              {payment.isRecurring && (
                <span className="rounded-full bg-zinc-700 px-2 py-0.5 text-[10px] text-zinc-400">
                  ↻ Aylık
                </span>
              )}
            </div>

            <div className="mt-1 flex items-center gap-3">
              <span
                className={`text-sm font-bold ${payment.isPaid ? "text-zinc-500" : "text-zinc-100"}`}
              >
                ₺{payment.amount.toLocaleString("tr-TR")}
              </span>
              {payment.creditLimit && (
                <span className="text-xs text-zinc-600">
                  / Limit: ₺{payment.creditLimit.toLocaleString("tr-TR")}
                </span>
              )}
            </div>

            <div className="mt-1 flex items-center gap-1.5">
              {payment.isPaid ? (
                <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" /> Ödendi ·{" "}
                  {formatDate(payment.dueDate)}
                </span>
              ) : payment.isOverdue ? (
                <span className="flex items-center gap-1 text-[11px] text-red-400">
                  <AlertTriangle className="h-3 w-3" />{" "}
                  {Math.abs(payment.daysUntilDue)} gün gecikti!
                </span>
              ) : payment.isUrgent ? (
                <span className="flex items-center gap-1 text-[11px] text-yellow-400">
                  <AlertTriangle className="h-3 w-3" />
                  {payment.daysUntilDue === 0
                    ? "Bugün son gün!"
                    : `${payment.daysUntilDue} gün kaldı`}
                </span>
              ) : (
                <span className="text-[11px] text-zinc-500">
                  Son: {formatDate(payment.dueDate)} · {payment.daysUntilDue}{" "}
                  gün kaldı
                </span>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {!payment.isPaid && (
              <button
                onClick={() => handlePay(payment.id)}
                disabled={payingId === payment.id}
                className="rounded-lg bg-emerald-500/10 px-2.5 py-1.5 text-[11px] font-bold text-emerald-400 transition hover:bg-emerald-500/20 disabled:opacity-50"
              >
                {payingId === payment.id ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  "Ödendi"
                )}
              </button>
            )}
            <button
              onClick={() => handleDelete(payment.id)}
              disabled={deletingId === payment.id}
              className="rounded-lg p-1.5 text-zinc-600 transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
            >
              {deletingId === payment.id ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="col-span-12 border-zinc-800 bg-zinc-900 lg:col-span-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-emerald-400" />
            <CardTitle className="text-base text-zinc-100">
              Yaklaşan Ödemeler
            </CardTitle>
            {urgentCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {urgentCount}
              </span>
            )}
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100"
          >
            {showForm ? (
              <X className="h-3.5 w-3.5" />
            ) : (
              <Plus className="h-3.5 w-3.5" />
            )}
            {showForm ? "İptal" : "Ekle"}
          </button>
        </div>

        {totalPending > 0 && (
          <div className="mt-2 flex items-center gap-2 rounded-lg bg-zinc-800/50 px-3 py-2">
            <Bell className="h-3.5 w-3.5 text-yellow-400" />
            <span className="text-xs text-zinc-400">
              Bekleyen toplam:
              <span className="ml-1 font-bold text-yellow-400">
                ₺{totalPending.toLocaleString("tr-TR")}
              </span>
            </span>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* ─── Form ────────────────────────────────────────────────────── */}
        {showForm && (
          <div className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  Başlık *
                </Label>
                <Input
                  value={form.title}
                  onChange={(e) => setField("title")(e.target.value)}
                  placeholder="Örn: Garanti Kredi Kartı"
                  className="border-zinc-700 bg-zinc-900 text-zinc-100 text-sm h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  Kategori *
                </Label>
                {mounted && (
                  <Select
                    value={form.category}
                    onValueChange={(v) => setField("category")(v)}
                  >
                    <SelectTrigger className="border-zinc-700 bg-zinc-900 text-zinc-100 text-sm h-9">
                      <SelectValue placeholder="Seçin" />
                    </SelectTrigger>
                    <SelectContent className="border-zinc-800 bg-zinc-900">
                      {categoryOptions.map((opt) => (
                        <SelectItem
                          key={opt.value}
                          value={opt.value}
                          className="text-zinc-100 text-sm"
                        >
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  Tutar (₺) *
                </Label>
                <Input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setField("amount")(e.target.value)}
                  placeholder="0.00"
                  className="border-zinc-700 bg-zinc-900 text-zinc-100 text-sm h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  Son Ödeme Tarihi *
                </Label>
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setField("dueDate")(e.target.value)}
                  className="border-zinc-700 bg-zinc-900 text-zinc-100 text-sm h-9"
                />
              </div>

              {form.category === "KREDI_KARTI" && (
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    Kart Limiti (₺)
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={form.creditLimit}
                    onChange={(e) => setField("creditLimit")(e.target.value)}
                    placeholder="0.00"
                    className="border-zinc-700 bg-zinc-900 text-zinc-100 text-sm h-9"
                  />
                </div>
              )}

              <div className="col-span-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={form.isRecurring}
                  onChange={(e) => setField("isRecurring")(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 accent-emerald-500"
                />
                <label
                  htmlFor="recurring"
                  className="text-xs text-zinc-400 cursor-pointer"
                >
                  Her ay tekrarlansın
                </label>
              </div>
            </div>

            <Button
              onClick={handleAdd}
              className="w-full bg-emerald-500 text-black font-bold hover:bg-emerald-400 h-9 text-sm"
            >
              <Plus className="mr-1.5 h-4 w-4" /> Ekle
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-zinc-500">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Yükleniyor...
          </div>
        ) : (
          <div className="max-h-[480px] overflow-y-auto space-y-4 pr-1">
            {/* ─── BORÇLAR / BEKLEYEN ──────────────────────────────────── */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-3.5 w-3.5 text-yellow-400" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  Bekleyen ({pending.length})
                </span>
              </div>
              {pending.length === 0 ? (
                <div className="rounded-xl border border-zinc-800 bg-zinc-800/20 py-4 text-center text-xs text-zinc-600">
                  ✅ Bekleyen ödeme yok
                </div>
              ) : (
                <div className="space-y-2">
                  {pending.map((p) => (
                    <PaymentCard key={p.id} payment={p} />
                  ))}
                </div>
              )}
            </div>

            {/* ─── ÖDENMİŞLER ─────────────────────────────────────────── */}
            {paid.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                    Ödendi ({paid.length})
                  </span>
                </div>
                <div className="space-y-2 opacity-60">
                  {paid.map((p) => (
                    <PaymentCard key={p.id} payment={p} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
