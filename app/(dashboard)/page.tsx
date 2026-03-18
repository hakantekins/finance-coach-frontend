"use client";

import { useState } from "react";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { WeeklyStats } from "@/components/dashboard/weekly-stats";
import { ExpensePanel } from "@/components/dashboard/expense-panel";
import { SavingsCoach } from "@/components/dashboard/savings-coach";
import { UpcomingPaymentsPanel } from "@/components/dashboard/upcoming-payments-panel";
import { SavingsChart } from "@/components/dashboard/savings-chart";
import { IncomePanel } from "@/components/dashboard/income-panel";
import { WelcomeBanner } from "@/components/dashboard/welcome-banner";

export default function Dashboard() {
  // Gelir veya gider eklenince bu sayacı artır → SavingsChart yeniden fetch eder
  const [chartRefreshKey, setChartRefreshKey] = useState(0);

  const handleTransactionAdded = () => {
    setChartRefreshKey((prev) => prev + 1);
  };

  return (
    <main>
      <div className="mx-auto max-w-[1600px] grid grid-cols-12 gap-6">
        <WelcomeBanner />

        {/* Satır 1: Özet Kartlar */}
        <SummaryCards />

        {/* Satır 2: Haftalık İstatistik Widgetları */}
        <WeeklyStats />

        {/* Satır 3: Harcama (4) + AI Koç (4) + Yaklaşan Ödemeler (4) */}
        <ExpensePanel onTransactionAdded={handleTransactionAdded} />
        <SavingsCoach />
        <UpcomingPaymentsPanel />

        {/* Satır 4: Grafik (4) + Gelir Ekle (8) */}
        <div className="col-span-12 grid grid-cols-12 gap-6">
          <SavingsChart refreshKey={chartRefreshKey} />
          <IncomePanel onTransactionAdded={handleTransactionAdded} />
        </div>
      </div>
    </main>
  );
}
