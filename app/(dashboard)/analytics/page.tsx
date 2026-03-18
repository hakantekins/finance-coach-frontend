"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  Loader2,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart2,
  Trophy,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Percent,
} from "lucide-react";
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  Tooltip as PieTooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as BarTooltip,
  LineChart,
  Line,
  Tooltip as LineTooltip,
} from "recharts";

const PIE_COLORS = [
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#f97316",
  "#84cc16",
];

const DAY_LABELS: Record<string, string> = {
  MON: "Pzt",
  TUE: "Sal",
  WED: "Çar",
  THU: "Per",
  FRI: "Cum",
  SAT: "Cmt",
  SUN: "Paz",
  Monday: "Pzt",
  Tuesday: "Sal",
  Wednesday: "Çar",
  Thursday: "Per",
  Friday: "Cum",
  Saturday: "Cmt",
  Sunday: "Paz",
};

interface CategoryData {
  name: string;
  value: number;
  percent: number;
}
interface MonthlyData {
  month: string;
  income: number;
  expense: number;
  net: number;
}
interface TopExpense {
  category: string;
  totalAmount: number;
  transactionCount: number;
}
interface WeeklyDailyData {
  day: string;
  amount: number;
  isFuture?: boolean;
  isToday?: boolean;
}

export default function AnalyticsPage() {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [monthly, setMonthly] = useState<MonthlyData[]>([]);
  const [topExpenses, setTopExpenses] = useState<TopExpense[]>([]);
  const [weeklyDaily, setWeeklyDaily] = useState<WeeklyDailyData[]>([]);
  const [declaredMonthlyIncome, setDeclaredMonthlyIncome] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/analytics/categories"),
      api.get("/analytics/monthly"),
      api.get("/analytics/top-expenses"),
      api.get("/analytics/weekly-daily").catch(() => ({ data: { data: [] } })),
      api.get("/dashboard").catch(() => ({ data: { data: null } })),
    ])
      .then(([catRes, monthRes, topRes, weeklyRes, dashboardRes]) => {
        setCategories(catRes.data?.data ?? []);
        setMonthly(monthRes.data?.data ?? []);
        setTopExpenses(topRes.data?.data ?? []);
        const income = dashboardRes.data?.data?.declaredMonthlyIncome ?? 0;
        setDeclaredMonthlyIncome(typeof income === "number" ? income : 0);
        const raw = weeklyRes.data?.data ?? [];
        setWeeklyDaily(
          Array.isArray(raw)
            ? raw.map((d: any) => ({
                ...d,
                day: DAY_LABELS[d.day] ?? d.day,
              }))
            : [],
        );
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-zinc-500">
        <Loader2 className="mr-2 h-6 w-6 animate-spin" /> Analizler
        hazırlanıyor...
      </div>
    );
  }

  const totalIncome = monthly.reduce((s, m) => s + m.income, 0);
  const totalExpense = monthly.reduce((s, m) => s + m.expense, 0);
  const netBalance = totalIncome - totalExpense;
  const savingsRate =
    totalIncome > 0
      ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100)
      : 0;
  const clampedRate = Math.max(0, Math.min(100, savingsRate));

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Analizler</h1>
        <p className="text-sm text-zinc-500">
          Son 6 aylık finansal verilerinizin görsel analizi
        </p>
      </div>

      {/* Özet Kartlar */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        {[
          {
            label: "6 Aylık Gelir",
            value: `₺${totalIncome.toLocaleString("tr-TR")}`,
            icon: ArrowUpRight,
            gradient: "from-emerald-500/10",
            border: "border-emerald-500/20",
            color: "text-emerald-400",
          },
          {
            label: "6 Aylık Gider",
            value: `₺${totalExpense.toLocaleString("tr-TR")}`,
            icon: ArrowDownRight,
            gradient: "from-red-500/10",
            border: "border-red-500/20",
            color: "text-red-400",
          },
          {
            label: "Net Birikim",
            value: `₺${netBalance.toLocaleString("tr-TR")}`,
            icon: TrendingUp,
            gradient:
              netBalance >= 0 ? "from-emerald-500/10" : "from-red-500/10",
            border:
              netBalance >= 0 ? "border-emerald-500/20" : "border-red-500/20",
            color: netBalance >= 0 ? "text-emerald-400" : "text-red-400",
          },
          {
            label: "Tasarruf Oranı",
            value: `%${savingsRate}`,
            icon: Percent,
            gradient:
              savingsRate >= 20
                ? "from-emerald-500/10"
                : savingsRate >= 0
                  ? "from-yellow-500/10"
                  : "from-red-500/10",
            border:
              savingsRate >= 20
                ? "border-emerald-500/20"
                : savingsRate >= 0
                  ? "border-yellow-500/20"
                  : "border-red-500/20",
            color:
              savingsRate >= 20
                ? "text-emerald-400"
                : savingsRate >= 0
                  ? "text-yellow-400"
                  : "text-red-400",
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
                  {item.value}
                </p>
              </div>
              <item.icon className={`h-6 w-6 ${item.color} opacity-60`} />
            </div>
          </div>
        ))}
      </div>

      {/* Tasarruf Oranı Göstergesi */}
      {totalIncome > 0 && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-violet-500/10 p-2 ring-1 ring-violet-500/20">
                <Percent className="h-4 w-4 text-violet-400" />
              </div>
              <h3 className="text-sm font-bold text-zinc-100">
                Tasarruf Performansı
              </h3>
            </div>
            <span
              className={`text-sm font-bold ${
                savingsRate >= 20
                  ? "text-emerald-400"
                  : savingsRate >= 0
                    ? "text-yellow-400"
                    : "text-red-400"
              }`}
            >
              %{savingsRate}
            </span>
          </div>
          <div className="h-3 w-full rounded-full bg-zinc-800">
            <div
              className={`h-3 rounded-full transition-all duration-1000 ${
                savingsRate >= 20
                  ? "bg-gradient-to-r from-emerald-600 to-emerald-400"
                  : savingsRate >= 0
                    ? "bg-gradient-to-r from-yellow-600 to-yellow-400"
                    : "bg-gradient-to-r from-red-600 to-red-400"
              }`}
              style={{ width: `${clampedRate}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-zinc-500">
            {savingsRate >= 20
              ? "Harika! Sağlıklı bir tasarruf oranına sahipsiniz."
              : savingsRate >= 10
                ? "İyi gidiyorsunuz, %20 hedefine yaklaşıyorsunuz."
                : savingsRate >= 0
                  ? "Tasarruf oranınızı artırmayı hedefleyin."
                  : "Dikkat! Giderleriniz gelirlerinizi aşmış."}
          </p>
        </div>
      )}

      {/* Pasta + Bar yan yana */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Pasta Grafik */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="mb-4 flex items-center gap-2">
            <div className="rounded-xl bg-emerald-500/10 p-2 ring-1 ring-emerald-500/20">
              <PieChart className="h-4 w-4 text-emerald-400" />
            </div>
            <h3 className="text-sm font-bold text-zinc-100">
              Kategori Dağılımı
            </h3>
          </div>
          {categories.length === 0 ? (
            <div className="flex h-[280px] flex-col items-center justify-center text-zinc-600 text-sm">
              <PieChart className="mb-2 h-8 w-8 text-zinc-700" />
              Harcama verisi yok
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <RechartsPie>
                <Pie
                  data={categories}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categories.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <PieTooltip
                  contentStyle={{
                    backgroundColor: "#09090b",
                    border: "1px solid #27272a",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                  formatter={(v: number) => [
                    `₺${v.toLocaleString("tr-TR")}`,
                    "",
                  ]}
                />
                <Legend
                  formatter={(v) => (
                    <span className="text-xs text-zinc-400">{v}</span>
                  )}
                />
              </RechartsPie>
            </ResponsiveContainer>
          )}
        </div>

        {/* Aylık Bar Chart */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="mb-4 flex items-center gap-2">
            <div className="rounded-xl bg-blue-500/10 p-2 ring-1 ring-blue-500/20">
              <BarChart2 className="h-4 w-4 text-blue-400" />
            </div>
            <h3 className="text-sm font-bold text-zinc-100">
              Aylık Gelir vs Gider
            </h3>
          </div>
          {monthly.length === 0 ? (
            <div className="flex h-[280px] flex-col items-center justify-center text-zinc-600 text-sm">
              <BarChart2 className="mb-2 h-8 w-8 text-zinc-700" />
              Aylık veri yok
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthly} barGap={4}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#27272a"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  stroke="#71717a"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#71717a"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) =>
                    `₺${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`
                  }
                />
                <BarTooltip
                  contentStyle={{
                    backgroundColor: "#09090b",
                    border: "1px solid #27272a",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                  formatter={(v: number, n: string) => [
                    `₺${v.toLocaleString("tr-TR")}`,
                    n === "income" ? "Gelir" : "Gider",
                  ]}
                />
                <Legend
                  formatter={(v) => (
                    <span className="text-xs text-zinc-400">
                      {v === "income" ? "Gelir" : "Gider"}
                    </span>
                  )}
                />
                <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Haftalık Günlük Harcama */}
      {weeklyDaily.length > 0 && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="mb-4 flex items-center gap-2">
            <div className="rounded-xl bg-violet-500/10 p-2 ring-1 ring-violet-500/20">
              <Calendar className="h-4 w-4 text-violet-400" />
            </div>
            <h3 className="text-sm font-bold text-zinc-100">
              Bu Hafta Günlük Harcama
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyDaily} barSize={32}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#27272a"
                vertical={false}
              />
              <XAxis
                dataKey="day"
                stroke="#71717a"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#71717a"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `₺${v}`}
              />
              <BarTooltip
                contentStyle={{
                  backgroundColor: "#09090b",
                  border: "1px solid #27272a",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
                formatter={(v: number) => [
                  `₺${v.toLocaleString("tr-TR")}`,
                  "Harcama",
                ]}
              />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                {weeklyDaily.map((entry, i) => {
                  const dailyBudget =
                    declaredMonthlyIncome > 0
                      ? declaredMonthlyIncome / 30
                      : 0;
                  return (
                    <Cell
                      key={i}
                      fill={
                        entry.isFuture
                          ? "#27272a"
                          : entry.amount === 0
                            ? "#3f3f46"
                            : dailyBudget > 0
                              ? entry.amount <= dailyBudget
                                ? "#10b981"
                                : entry.amount <= dailyBudget * 1.5
                                  ? "#f59e0b"
                                  : "#ef4444"
                              : entry.amount > 500
                                ? "#ef4444"
                                : entry.amount > 200
                                  ? "#f59e0b"
                                  : "#10b981"
                      }
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Net Birikim Trendi */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <div className="mb-4 flex items-center gap-2">
          <div className="rounded-xl bg-emerald-500/10 p-2 ring-1 ring-emerald-500/20">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <h3 className="text-sm font-bold text-zinc-100">
            Aylık Net Birikim Trendi
          </h3>
        </div>
        {monthly.length === 0 ? (
          <div className="flex h-[220px] flex-col items-center justify-center text-zinc-600 text-sm">
            <TrendingUp className="mb-2 h-8 w-8 text-zinc-700" />
            Trend verisi yok
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthly}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#27272a"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                stroke="#71717a"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#71717a"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) =>
                  `₺${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`
                }
              />
              <LineTooltip
                contentStyle={{
                  backgroundColor: "#09090b",
                  border: "1px solid #27272a",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
                formatter={(v: number) => [
                  `₺${v.toLocaleString("tr-TR")}`,
                  "Net Birikim",
                ]}
              />
              <Line
                type="monotone"
                dataKey="net"
                stroke="#10b981"
                strokeWidth={3}
                dot={{
                  r: 4,
                  fill: "#10b981",
                  stroke: "#09090b",
                  strokeWidth: 2,
                }}
                activeDot={{ r: 6 }}
                style={{
                  filter: "drop-shadow(0 0 8px rgba(16,185,129,0.5))",
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Top 5 Harcama */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <div className="mb-5 flex items-center gap-2">
          <div className="rounded-xl bg-yellow-500/10 p-2 ring-1 ring-yellow-500/20">
            <Trophy className="h-4 w-4 text-yellow-400" />
          </div>
          <h3 className="text-sm font-bold text-zinc-100">
            En Yüksek 5 Harcama Kategorisi
          </h3>
        </div>
        {topExpenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-sm text-zinc-600">
            <Trophy className="mb-2 h-8 w-8 text-zinc-700" />
            Henüz harcama verisi yok
          </div>
        ) : (
          <div className="space-y-4">
            {topExpenses.map((item, i) => {
              const maxAmount = topExpenses[0].totalAmount;
              const pct =
                maxAmount > 0 ? (item.totalAmount / maxAmount) * 100 : 0;
              const medals = [
                "bg-yellow-500/20 text-yellow-400",
                "bg-zinc-400/20 text-zinc-300",
                "bg-orange-500/20 text-orange-400",
              ];
              return (
                <div key={item.category} className="flex items-center gap-4">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${medals[i] ?? "bg-zinc-800 text-zinc-500"}`}
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-sm font-semibold text-zinc-100">
                        {item.category ?? "Diğer"}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-zinc-600">
                          {item.transactionCount} işlem
                        </span>
                        <span className="text-sm font-bold text-red-400">
                          ₺{item.totalAmount.toLocaleString("tr-TR")}
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-zinc-800">
                      <div
                        className="h-1.5 rounded-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
