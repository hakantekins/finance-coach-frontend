"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Bell,
  AlertTriangle,
  CheckCircle2,
  Clock,
  CreditCard,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

interface Payment {
  id: number;
  title: string;
  category: string;
  amount: number;
  dueDate: string;
  isPaid: boolean;
  daysUntilDue: number;
  isOverdue: boolean;
  isUrgent: boolean;
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [payingId, setPayingId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isOpen) return;
    const fetch = async () => {
      setIsLoading(true);
      try {
        const res = await api.get("/payments/pending");
        const data = res.data?.data ?? [];
        setPayments(Array.isArray(data) ? data : []);
      } catch {
        console.error("Bildirimler çekilemedi");
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [isOpen]);

  const handlePay = async (id: number) => {
    setPayingId(id);
    try {
      await api.put(`/payments/${id}/pay`);
      setPayments((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert("İşlem başarısız.");
    } finally {
      setPayingId(null);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
    });

  const overdueCount = payments.filter((p) => p.isOverdue).length;
  const urgentCount = payments.filter((p) => p.isUrgent && !p.isOverdue).length;

  return (
    <>
      {/* Arka plan karartması */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <aside
        className={cn(
          "fixed right-0 top-0 z-50 flex h-screen w-[360px] flex-col border-l border-zinc-800 bg-zinc-950 shadow-2xl transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* Başlık */}
        <div className="flex h-16 items-center justify-between border-b border-zinc-800 px-5">
          <div className="flex items-center gap-2.5">
            <Bell className="h-5 w-5 text-emerald-400" />
            <span className="font-semibold text-zinc-100">Bildirimler</span>
            {payments.length > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-black">
                {payments.length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Özet satırı */}
        {(overdueCount > 0 || urgentCount > 0) && (
          <div className="flex gap-2 border-b border-zinc-800 px-5 py-3">
            {overdueCount > 0 && (
              <div className="flex items-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                <span className="text-xs font-bold text-red-400">
                  {overdueCount} gecikmiş
                </span>
              </div>
            )}
            {urgentCount > 0 && (
              <div className="flex items-center gap-1.5 rounded-lg bg-yellow-500/10 px-3 py-1.5">
                <Clock className="h-3.5 w-3.5 text-yellow-400" />
                <span className="text-xs font-bold text-yellow-400">
                  {urgentCount} acil
                </span>
              </div>
            )}
          </div>
        )}

        {/* İçerik */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-zinc-500">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Yükleniyor...
            </div>
          ) : payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <CheckCircle2 className="mb-3 h-12 w-12 text-emerald-500/30" />
              <p className="font-semibold text-zinc-400">Tüm ödemeler tamam!</p>
              <p className="mt-1 text-sm text-zinc-600">
                Bekleyen ödemeniz bulunmuyor.
              </p>
            </div>
          ) : (
            payments.map((payment) => (
              <div
                key={payment.id}
                className={cn(
                  "rounded-xl border p-4 transition-colors",
                  payment.isOverdue
                    ? "border-red-500/30 bg-red-500/5"
                    : payment.isUrgent
                      ? "border-yellow-500/30 bg-yellow-500/5"
                      : "border-zinc-800 bg-zinc-900",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Sol: İkon + Bilgi */}
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                        payment.isOverdue
                          ? "bg-red-500/10 text-red-400"
                          : payment.isUrgent
                            ? "bg-yellow-500/10 text-yellow-400"
                            : "bg-zinc-800 text-zinc-400",
                      )}
                    >
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-100">
                        {payment.title}
                      </p>
                      <p className="mt-0.5 text-lg font-bold text-zinc-100">
                        ₺{payment.amount.toLocaleString("tr-TR")}
                      </p>
                      {/* Durum mesajı */}
                      <div className="mt-1 flex items-center gap-1">
                        {payment.isOverdue ? (
                          <>
                            <AlertTriangle className="h-3 w-3 text-red-400" />
                            <span className="text-xs text-red-400">
                              {Math.abs(payment.daysUntilDue)} gün gecikti!
                            </span>
                          </>
                        ) : payment.isUrgent ? (
                          <>
                            <Clock className="h-3 w-3 text-yellow-400" />
                            <span className="text-xs text-yellow-400">
                              {payment.daysUntilDue === 0
                                ? "Bugün son gün!"
                                : `${payment.daysUntilDue} gün kaldı`}
                            </span>
                          </>
                        ) : (
                          <span className="text-xs text-zinc-500">
                            Son: {formatDate(payment.dueDate)} ·{" "}
                            {payment.daysUntilDue} gün kaldı
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Sağ: Ödendi butonu */}
                  <button
                    onClick={() => handlePay(payment.id)}
                    disabled={payingId === payment.id}
                    className="shrink-0 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-400 transition hover:bg-emerald-500/20 disabled:opacity-50"
                  >
                    {payingId === payment.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      "Ödendi"
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Alt: Tüm ödemelere git */}
        <div className="border-t border-zinc-800 p-4">
          <button
            onClick={() => {
              onClose();
              router.push("/");
            }}
            className="w-full rounded-lg bg-zinc-800 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-700 hover:text-zinc-100"
          >
            Tüm Ödemeleri Gör
          </button>
        </div>
      </aside>
    </>
  );
}
