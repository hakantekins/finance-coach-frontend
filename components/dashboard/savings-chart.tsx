"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { api } from "@/lib/api";
import { Loader2, CalendarDays } from "lucide-react";

interface DayData {
  day: string;
  date: string;
  amount: number;
  isToday: boolean;
  isFuture: boolean;
}

const fallbackData: DayData[] = [
  { day: "Pzt", date: "", amount: 0, isToday: false, isFuture: false },
  { day: "Sal", date: "", amount: 0, isToday: false, isFuture: false },
  { day: "Çar", date: "", amount: 0, isToday: false, isFuture: false },
  { day: "Per", date: "", amount: 0, isToday: false, isFuture: false },
  { day: "Cum", date: "", amount: 0, isToday: false, isFuture: false },
  { day: "Cmt", date: "", amount: 0, isToday: false, isFuture: false },
  { day: "Paz", date: "", amount: 0, isToday: false, isFuture: false },
];

interface Props {
  refreshKey?: number;
}

export function SavingsChart({ refreshKey = 0 }: Props) {
  const [chartData, setChartData] = useState<DayData[]>(fallbackData);
  const [isLoading, setIsLoading] = useState(true);
  const [declaredMonthlyIncome, setDeclaredMonthlyIncome] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [weeklyRes, dashboardRes] = await Promise.all([
          api.get("/analytics/weekly-daily"),
          api.get("/dashboard").catch(() => ({ data: { data: null } })),
        ]);

        const data = weeklyRes.data?.data;
        if (data && Array.isArray(data) && data.length > 0) {
          setChartData(data);
        }

        const income =
          dashboardRes.data?.data?.declaredMonthlyIncome ?? 0;
        setDeclaredMonthlyIncome(typeof income === "number" ? income : 0);
      } catch (error) {
        console.error("Haftalık grafik çekilemedi:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [refreshKey]);

  const weekTotal = chartData.reduce((sum, d) => sum + (d.amount || 0), 0);
  const maxDay = chartData.reduce(
    (max, d) => (d.amount > max.amount ? d : max),
    chartData[0],
  );

  const getBarColor = (entry: DayData) => {
    if (entry.isFuture) return "#27272a"; // zinc-800 — gelecek günler
    if (entry.amount === 0) return "#3f3f46"; // zinc-700 — harcama yok

    // Renk eşiği: maaş/30
    const dailyBudget = declaredMonthlyIncome > 0 ? declaredMonthlyIncome / 30 : 0;
    if (dailyBudget > 0) {
      const yellowAt = dailyBudget * 1.5;
      if (entry.amount <= dailyBudget) return "#10b981"; // düşük
      if (entry.amount <= yellowAt) return "#f59e0b"; // orta
      return "#ef4444"; // yüksek
    }

    // Maaş bilgisi yoksa geçmişteki sabit eşiklere dön.
    if (entry.amount > 500) return "#ef4444";
    if (entry.amount > 200) return "#f59e0b";
    return "#10b981";
  };

  return (
    <Card className="col-span-12 border-zinc-800 bg-zinc-950 lg:col-span-4 shadow-xl overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 ring-1 ring-emerald-500/20">
              <CalendarDays className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-zinc-100">
                Haftalık Harcama
              </CardTitle>
              <p className="text-[11px] text-zinc-600">
                Bu hafta günlük dağılım
              </p>
            </div>
          </div>
          {!isLoading && (
            <div className="text-right">
              <p className="text-lg font-extrabold text-zinc-100">
                ₺{weekTotal.toLocaleString("tr-TR")}
              </p>
              <p className="text-[10px] text-zinc-600">haftalık toplam</p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[260px] w-full">
          {isLoading ? (
            <div className="flex h-full items-center justify-center text-zinc-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Yükleniyor...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 8, right: 4, left: -12, bottom: 0 }}
                barCategoryGap="20%"
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#27272a"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  stroke="#71717a"
                  fontSize={12}
                  fontWeight={600}
                  tickLine={false}
                  axisLine={false}
                  tick={({ x, y, payload }: any) => {
                    const entry = chartData.find(
                      (d) => d.day === payload.value,
                    );
                    const isToday = entry?.isToday;
                    const barColor = entry ? getBarColor(entry) : "#71717a";
                    return (
                      <g transform={`translate(${x},${y})`}>
                        <text
                          x={0}
                          y={0}
                          dy={14}
                          textAnchor="middle"
                          fill={isToday ? barColor : "#71717a"}
                          fontSize={12}
                          fontWeight={isToday ? 700 : 500}
                        >
                          {payload.value}
                        </text>
                        {isToday && (
                          <circle cx={0} cy={24} r={2} fill={barColor} />
                        )}
                      </g>
                    );
                  }}
                />
                <YAxis
                  stroke="#71717a"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => {
                    if (value === 0) return "₺0";
                    if (value >= 1000) {
                      const bin = (value / 1000).toLocaleString("tr-TR", {
                        maximumFractionDigits: 1,
                      });
                      return `₺${bin} bin`;
                    }
                    return `₺${value.toLocaleString("tr-TR")}`;
                  }}
                />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.03)", radius: 8 }}
                  contentStyle={{
                    backgroundColor: "#18181b",
                    border: "1px solid #27272a",
                    borderRadius: "12px",
                    padding: "10px 14px",
                  }}
                  labelFormatter={(label) => {
                    const entry = chartData.find((d) => d.day === label);
                    if (!entry) return label;
                    const date = entry.date
                      ? new Date(entry.date).toLocaleDateString("tr-TR", {
                          day: "numeric",
                          month: "long",
                        })
                      : "";
                    return `${label} — ${date}${entry.isToday ? " (Bugün)" : ""}`;
                  }}
                  formatter={(value: number) => [
                    `₺${value.toLocaleString("tr-TR")}`,
                    "Harcama",
                  ]}
                  labelStyle={{
                    color: "#a1a1aa",
                    fontWeight: "bold",
                    marginBottom: "4px",
                    fontSize: "12px",
                  }}
                  itemStyle={{ color: "#10b981", fontSize: "13px" }}
                />
                <Bar dataKey="amount" radius={[8, 8, 4, 4]} maxBarSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={getBarColor(entry)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Alt bilgi — renk açıklaması */}
        {!isLoading && (
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-zinc-800/60 pt-3">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] text-zinc-600">Düşük</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              <span className="text-[10px] text-zinc-600">Orta</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
              <span className="text-[10px] text-zinc-600">Yüksek</span>
            </div>
            {maxDay && maxDay.amount > 0 && (
              <span className="ml-auto text-[10px] text-zinc-500">
                En çok: {maxDay.day} — ₺{maxDay.amount.toLocaleString("tr-TR")}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
