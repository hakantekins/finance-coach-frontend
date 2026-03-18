"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Loader2, ShoppingCart, TrendingDown, Star, Info } from "lucide-react";
import Image from "next/image";

interface MarketComparisonDTO {
  productName: string;
  unit?: string;
  marketPrices: Record<string, number>;
  cheapestMarket: string;
  cheapestPrice: number;
  priceDifference: number;
}

const STORES = ["BİM", "A101", "ŞOK", "Migros"];

const storeConfig: Record<string, { color: string; logo: string; bg: string }> =
  {
    BİM: {
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
      logo: "/logos/bim.png",
    },
    A101: {
      color: "text-red-400",
      bg: "bg-red-500/10",
      logo: "/logos/a101.png",
    },
    ŞOK: {
      color: "text-orange-400",
      bg: "bg-orange-500/10",
      logo: "/logos/sok.png",
    },
    Migros: {
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      logo: "/logos/migros.png",
    },
  };

function StoreLogo({ name }: { name: string }) {
  const cfg = storeConfig[name];
  const [imgError, setImgError] = useState(false);

  if (imgError || !cfg?.logo) {
    return (
      <div
        className={`flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-extrabold ${cfg?.bg ?? "bg-zinc-800"} ${cfg?.color ?? "text-zinc-400"}`}
      >
        {name.slice(0, 2)}
      </div>
    );
  }

  return (
    <div
      className={`flex h-7 w-7 items-center justify-center rounded-lg ${cfg.bg}`}
    >
      <Image
        src={cfg.logo}
        alt={name}
        width={18}
        height={18}
        onError={() => setImgError(true)}
        className="rounded object-contain"
      />
    </div>
  );
}

export default function MarketPage() {
  const [data, setData] = useState<MarketComparisonDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get("/market-prices/dashboard-comparison")
      .then((res) => {
        if (res.data.success) setData(res.data.data);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Market Fiyatları</h1>
        <p className="text-sm text-zinc-500">
          Marketler arası fiyat karşılaştırması — en ucuz seçeneği bulun
        </p>
      </div>

      {/* Mağaza kartları */}
      <div className="flex flex-wrap items-center gap-3">
        {STORES.map((store) => {
          const cfg = storeConfig[store];
          return (
            <div
              key={store}
              className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2"
            >
              <StoreLogo name={store} />
              <span className={`text-sm font-bold ${cfg.color}`}>{store}</span>
            </div>
          );
        })}
        <div className="ml-auto flex items-center gap-1.5 rounded-xl bg-emerald-500/10 px-3 py-2 border border-emerald-500/20">
          <Star className="h-3 w-3 text-emerald-400" />
          <span className="text-xs font-bold text-emerald-400">En ucuz</span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-zinc-500">
          <Loader2 className="mr-2 h-6 w-6 animate-spin" /> Fiyatlar
          yükleniyor...
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-7 gap-4 border-b border-zinc-800 bg-zinc-800/40 px-5 py-3">
            <div className="col-span-2 text-xs font-bold uppercase tracking-wider text-zinc-500">
              Ürün
            </div>
            {STORES.map((s) => (
              <div key={s} className="flex items-center justify-center gap-1.5">
                <StoreLogo name={s} />
                <span
                  className={`hidden text-xs font-bold lg:block ${storeConfig[s].color}`}
                >
                  {s}
                </span>
              </div>
            ))}
            <div className="text-right text-xs font-bold uppercase tracking-wider text-emerald-500">
              Tasarruf
            </div>
          </div>

          {/* Satırlar */}
          <div className="divide-y divide-zinc-800/60">
            {data.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-zinc-600">
                <ShoppingCart className="mb-3 h-10 w-10" />
                <p className="text-sm">Henüz veri yok.</p>
              </div>
            ) : (
              data.map((item) => (
                <div
                  key={item.productName}
                  className="group grid grid-cols-7 gap-4 items-center px-5 py-4 transition-colors hover:bg-zinc-800/30"
                >
                  {/* Ürün */}
                  <div className="col-span-2">
                    <p className="text-sm font-semibold text-zinc-100">
                      {item.productName}
                    </p>
                    {item.unit && (
                      <p className="text-xs text-zinc-600">({item.unit})</p>
                    )}
                  </div>

                  {/* Market fiyatları */}
                  {STORES.map((store) => {
                    const price = item.marketPrices[store];
                    const isCheapest = item.cheapestMarket === store;
                    return (
                      <div key={store} className="text-center">
                        {price ? (
                          <div
                            className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 ${
                              isCheapest
                                ? "bg-emerald-500/15 ring-1 ring-emerald-500/30"
                                : ""
                            }`}
                          >
                            {isCheapest && (
                              <Star className="h-2.5 w-2.5 text-emerald-400" />
                            )}
                            <span
                              className={`text-sm font-bold ${
                                isCheapest
                                  ? "text-emerald-400"
                                  : "text-zinc-400"
                              }`}
                            >
                              ₺{price.toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-700">—</span>
                        )}
                      </div>
                    );
                  })}

                  {/* Tasarruf */}
                  <div className="text-right">
                    {item.priceDifference > 0 ? (
                      <div className="inline-flex items-center gap-1">
                        <TrendingDown className="h-3 w-3 text-emerald-400" />
                        <span className="text-sm font-bold text-emerald-400">
                          ₺{item.priceDifference.toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-zinc-700">—</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tasarruf Özeti */}
      {data.length > 0 && (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
            💡 Tasarruf İpucu
          </p>
          <p className="text-sm text-zinc-300">
            Tüm ürünleri en ucuz marketten alarak toplam{" "}
            <span className="font-bold text-emerald-400">
              ₺{data.reduce((s, d) => s + d.priceDifference, 0).toFixed(2)}
            </span>{" "}
            tasarruf edebilirsiniz.
          </p>
        </div>
      )}

      {/* Hukuki Disclaimer */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
        <div className="flex gap-3">
          <Info className="h-5 w-5 shrink-0 text-zinc-600 mt-0.5" />
          <div className="space-y-2">
            <p className="text-xs font-semibold text-zinc-400">Yasal Uyarı</p>
            <p className="text-[11px] leading-relaxed text-zinc-600">
              Bu sayfadaki fiyat bilgileri yalnızca bilgilendirme amaçlıdır ve
              herhangi bir satış taahhüdü içermez. Fiyatlar, ilgili marketlerin
              online platformlarından ve kamuya açık kaynaklardan otomatik
              olarak derlenmekte olup anlık değişiklik gösterebilir. AI Finans
              Koçu, fiyatların doğruluğunu, güncelliğini veya eksiksizliğini
              garanti etmez. Gösterilen market isimleri ve logoları ilgili
              şirketlerin tescilli markalarıdır; bu platform söz konusu
              markalarla herhangi bir ticari ortaklık, sponsorluk veya bağlantı
              ilişkisine sahip değildir. Satın alma kararlarınızı vermeden önce
              güncel fiyatlar için ilgili marketlerin resmi web siteleri veya
              mobil uygulamalarını kontrol etmenizi öneririz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
