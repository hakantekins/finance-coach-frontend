"use client";
import { toast } from "sonner";
import { useState, useEffect } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Loader2, Lock } from "lucide-react";
import { api } from "@/lib/api";

interface Transaction {
  id: number;
  amount: number;
  type: "INCOME" | "EXPENSE";
  category: string;
  description: string;
  transactionDate: string;
  isFixed: boolean;
  paymentMethod?: "CASH" | "CARD";
  createdAt: string;
  updatedAt: string;
}

const priorityLabels: Record<string, string> = {
  "1": "Çok Önemli",
  "2": "Önemli",
  "3": "Faydalı",
  "4": "İsteğe Bağlı",
  "5": "Düşük Öncelik",
  "6": "Gereksiz",
};

interface Props {
  onTransactionAdded?: () => void;
}

export function ExpensePanel({ onTransactionAdded }: Props) {
  const [expenses, setExpenses] = useState<Transaction[]>([]);
  const [expenseName, setExpenseName] = useState("");
  const [amount, setAmount] = useState("");
  const [priority, setPriority] = useState("");
  const [isFixed, setIsFixed] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CARD">("CASH");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [fetchError, setFetchError] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringDay, setRecurringDay] = useState(new Date().getDate());

  const fetchExpenses = async () => {
    try {
      const response = await api.get("/transactions");
      const data = response.data?.data ?? response.data;
      setExpenses(Array.isArray(data) ? data : []);
      setFetchError(false);
    } catch {
      setFetchError(true);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchExpenses();
  }, []);

  const handleAddExpense = async () => {
    if (!expenseName.trim() || !amount) {
      toast.error("Lütfen tüm alanları doldurun.");
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Geçerli bir tutar girin.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedPriority = priority
        ? priority.startsWith("P")
          ? priority
          : `P${priority}`
        : undefined;

      await api.post("/transactions", {
        amount: parsedAmount,
        type: "EXPENSE",
        category: expenseName.trim(),
        description: formattedPriority
          ? `Öncelik: ${formattedPriority}`
          : undefined,
        transactionDate: new Date().toISOString().split("T")[0],
        isFixed,
        isRecurring,
        recurringDay: isRecurring ? recurringDay : null,
        paymentMethod,
      });

      setExpenseName("");
      setAmount("");
      setPriority("");
      setIsFixed(false);
      setPaymentMethod("CASH");
      setIsRecurring(false);
      setRecurringDay(new Date().getDate());
      await fetchExpenses();
      onTransactionAdded?.();
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "Harcama eklenemedi.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bu harcamayı silmek istediğinize emin misiniz?")) return;
    setDeletingId(id);
    try {
      await api.delete(`/transactions/${id}`);
      setExpenses((prev) => prev.filter((exp) => exp.id !== id));
      onTransactionAdded?.();
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "Harcama silinemedi.";
      alert(msg);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("tr-TR", {
        month: "short",
        day: "numeric",
      });
    } catch {
      return "-";
    }
  };

  const onlyExpenses = expenses.filter((e) => e.type === "EXPENSE");
  const fixedList = onlyExpenses.filter((e) => e.isFixed);
  const variableList = onlyExpenses.filter((e) => !e.isFixed);

  const ExpenseTable = ({
    items,
    emptyMsg,
  }: {
    items: Transaction[];
    emptyMsg: string;
  }) => (
    <div className="rounded-xl border border-zinc-800 overflow-hidden">
      <Table>
        <TableHeader className="bg-zinc-900/50">
          <TableRow className="border-zinc-800 hover:bg-transparent">
            <TableHead className="text-zinc-400 text-[10px] font-bold uppercase">
              İsim
            </TableHead>
            <TableHead className="text-zinc-400 text-[10px] font-bold uppercase text-right">
              Tutar
            </TableHead>
            <TableHead className="text-zinc-400 text-[10px] font-bold uppercase text-center w-[50px]">
              Sil
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={3}
                className="text-center text-zinc-600 py-4 text-xs"
              >
                {emptyMsg}
              </TableCell>
            </TableRow>
          ) : (
            items.slice(0, 6).map((expense) => (
              <TableRow
                key={expense.id}
                className="border-zinc-800 hover:bg-zinc-900/40 transition-colors"
              >
                <TableCell className="py-3">
                  <div className="flex items-center gap-1.5">
                    {expense.isFixed && (
                      <Lock className="h-3 w-3 shrink-0 text-orange-400" />
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-zinc-100">
                        {expense.category ?? "—"}
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        {formatDate(expense.transactionDate)}
                      </span>
                    </div>
                    <span
                      className={`ml-1 text-[10px] font-bold ${
                        expense.paymentMethod === "CARD"
                          ? "text-purple-400"
                          : "text-emerald-400"
                      }`}
                    >
                      {expense.paymentMethod === "CARD" ? "Kart" : "Nakit"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right text-sm font-bold text-red-400">
                  -₺{expense.amount?.toLocaleString("tr-TR") ?? "0"}
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={deletingId === expense.id}
                    className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-red-400/10"
                    onClick={() => handleDelete(expense.id)}
                  >
                    {deletingId === expense.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <Card className="col-span-12 border-zinc-800 bg-zinc-950 lg:col-span-4">
      <CardHeader>
        <CardTitle className="text-lg text-zinc-100 font-bold">
          Harcama Ekle
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">
            Harcama Adı
          </Label>
          <Input
            value={expenseName}
            onChange={(e) => setExpenseName(e.target.value)}
            placeholder="Örn: Mağaza"
            className="border-zinc-800 bg-zinc-900 text-zinc-100"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">
            Tutar
          </Label>
          <Input
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="border-zinc-800 bg-zinc-900 text-zinc-100"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">
              Öncelik
            </Label>
            {mounted ? (
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="border-zinc-800 bg-zinc-900 text-zinc-100 h-10">
                  <SelectValue placeholder="Seçiniz" />
                </SelectTrigger>
                <SelectContent className="border-zinc-800 bg-zinc-900">
                  {Object.entries(priorityLabels).map(([value, label]) => (
                    <SelectItem
                      key={value}
                      value={value}
                      className="text-zinc-100"
                    >
                      {value} - {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="h-10 rounded-lg border border-zinc-800 bg-zinc-900" />
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">
              Sabit Gider
            </Label>
            <button
              type="button"
              onClick={() => setIsFixed(!isFixed)}
              className={`flex h-10 w-full items-center justify-between rounded-lg border px-3 transition-all ${
                isFixed
                  ? "border-orange-500/40 bg-orange-500/10"
                  : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <Lock
                  className={`h-3.5 w-3.5 ${isFixed ? "text-orange-400" : "text-zinc-600"}`}
                />
                <span
                  className={`text-xs font-medium ${isFixed ? "text-orange-400" : "text-zinc-500"}`}
                >
                  {isFixed ? "Aktif" : "Kapalı"}
                </span>
              </div>
              <div
                className={`relative h-5 w-9 rounded-full transition-colors ${isFixed ? "bg-orange-500" : "bg-zinc-700"}`}
              >
                <div
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all duration-200 ${isFixed ? "left-4" : "left-0.5"}`}
                />
              </div>
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">
            Ödeme Yöntemi
          </Label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPaymentMethod("CASH")}
              className={`flex h-10 w-full items-center justify-center rounded-lg border px-3 transition-all ${
                paymentMethod === "CASH"
                  ? "border-emerald-500/40 bg-emerald-500/10"
                  : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
              }`}
            >
              Nakit
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("CARD")}
              className={`flex h-10 w-full items-center justify-center rounded-lg border px-3 transition-all ${
                paymentMethod === "CARD"
                  ? "border-purple-500/40 bg-purple-500/10"
                  : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
              }`}
            >
              Kart
            </button>
          </div>
        </div>

        {isFixed && (
          <p className="text-[10px] text-orange-400/70">
            🔒 AI koç bu harcamayı tasarruf analizine dahil etmeyecek
          </p>
        )}
        {/* Tekrarlayan İşlem */}
        <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-800/30 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-zinc-300">
              Tekrarlayan işlem
            </p>
            <p className="text-[11px] text-zinc-600">
              Her ay otomatik tekrarlanır
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsRecurring(!isRecurring)}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              isRecurring ? "bg-emerald-500" : "bg-zinc-700"
            }`}
          >
            <span
              className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                isRecurring ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {isRecurring && (
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              Ayın Kaçında Tekrarlansın?
            </label>
            <select
              value={recurringDay}
              onChange={(e) => setRecurringDay(parseInt(e.target.value))}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-zinc-100 focus:border-emerald-500/50 focus:outline-none"
            >
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                <option key={day} value={day}>
                  Her ayın {day}. günü
                </option>
              ))}
            </select>
          </div>
        )}
        <Button
          onClick={handleAddExpense}
          disabled={isSubmitting}
          className="w-full bg-emerald-500 text-black font-bold hover:bg-emerald-400"
        >
          <Plus className="mr-2 h-4 w-4" />
          {isSubmitting ? "Ekleniyor..." : "Harcamayı Kaydet"}
        </Button>

        {fetchError ? (
          <p className="text-center text-xs text-red-400">
            Veriler yüklenemedi.
          </p>
        ) : (
          <div className="space-y-4 mt-2">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Lock className="h-3 w-3 text-orange-400" />
                <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                  Sabit Giderler ({fixedList.length})
                </h4>
              </div>
              <ExpenseTable items={fixedList} emptyMsg="Sabit gider yok" />
            </div>

            <div>
              <h4 className="mb-2 text-xs font-bold uppercase tracking-widest text-zinc-500">
                Son Harcamalar ({variableList.length})
              </h4>
              <ExpenseTable
                items={variableList}
                emptyMsg="Henüz harcama eklenmedi"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
