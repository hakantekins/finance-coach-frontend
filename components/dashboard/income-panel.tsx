"use client";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2, TrendingUp } from "lucide-react";
import { api } from "@/lib/api";

const incomeCategories = [
  "Maaş",
  "Serbest Çalışma",
  "Kira Geliri",
  "Yatırım Getirisi",
  "Ek İş",
  "Diğer",
];

interface Props {
  onTransactionAdded?: () => void;
}

export function IncomePanel({ onTransactionAdded }: Props) {
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringDay, setRecurringDay] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAddIncome = async () => {
    if (!category || !amount) {
      toast.error("Lütfen tüm alanları doldurun.");
      return;
    }
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) {
      toast.error("Geçerli bir tutar girin.");
      return;
    }
    if (isRecurring && !recurringDay) {
      toast.error("Tekrarlayan gelir için gün seçin.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/transactions", {
        amount: parsed,
        type: "INCOME",
        category,
        description: "Dashboard'dan eklendi",
        transactionDate: new Date().toISOString().split("T")[0],
        isRecurring,
        recurringDay: isRecurring ? parseInt(recurringDay) : null,
      });
      setCategory("");
      setAmount("");
      setIsRecurring(false);
      setRecurringDay("");
      toast.success("Gelir başarıyla eklendi!");

      onTransactionAdded?.();
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? "Gelir eklenemedi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="col-span-12 border-zinc-800 bg-zinc-950 lg:col-span-8 shadow-xl">
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-emerald-400" />
          <CardTitle className="text-lg text-zinc-100 font-bold">
            Gelir Ekle
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {/* Kategori */}
          <div className="space-y-2">
            <Label className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">
              Gelir Türü
            </Label>
            {mounted ? (
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="border-zinc-800 bg-zinc-900 text-zinc-100">
                  <SelectValue placeholder="Seçiniz" />
                </SelectTrigger>
                <SelectContent className="border-zinc-800 bg-zinc-900">
                  {incomeCategories.map((cat) => (
                    <SelectItem key={cat} value={cat} className="text-zinc-100">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="h-10 rounded-lg border border-zinc-800 bg-zinc-900" />
            )}
          </div>

          {/* Tutar */}
          <div className="space-y-2">
            <Label className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">
              Tutar (₺)
            </Label>
            <Input
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="border-zinc-800 bg-zinc-900 text-zinc-100"
              onKeyDown={(e) => e.key === "Enter" && handleAddIncome()}
            />
          </div>

          {/* Buton */}
          <div className="flex items-end">
            <Button
              onClick={handleAddIncome}
              disabled={isSubmitting}
              className="w-full bg-emerald-500 text-black font-bold hover:bg-emerald-400"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Ekleniyor...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" /> Geliri Kaydet
                </>
              )}
            </Button>
          </div>

          {/* Tekrarlayan Gelir Toggle */}
          <div className="space-y-2 sm:col-span-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsRecurring(!isRecurring);
                  if (isRecurring) setRecurringDay("");
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isRecurring ? "bg-emerald-500" : "bg-zinc-700"
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

            {isRecurring && (
              <div className="flex items-center gap-3 mt-2">
                <Label className="text-zinc-400 text-xs whitespace-nowrap">
                  Her ayın
                </Label>
                <Select value={recurringDay} onValueChange={setRecurringDay}>
                  <SelectTrigger className="w-24 border-zinc-800 bg-zinc-900 text-zinc-100">
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
        </div>

        {/* Hızlı seçim kartları */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { label: "Maaş", desc: "Aylık düzenli maaş geliri" },
            { label: "Serbest Çalışma", desc: "Proje veya danışmanlık geliri" },
            { label: "Yatırım", desc: "Faiz, temettü, kira getirisi" },
          ].map((item) => (
            <div
              key={item.label}
              onClick={() =>
                setCategory(
                  item.label === "Yatırım" ? "Yatırım Getirisi" : item.label,
                )
              }
              className="cursor-pointer rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition-colors hover:border-emerald-500/30 hover:bg-emerald-500/5"
            >
              <p className="text-sm font-semibold text-zinc-100">
                {item.label}
              </p>
              <p className="mt-1 text-xs text-zinc-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
