"use client";

import { toast } from "sonner";
import { useEffect, useState, useRef } from "react";
import { api } from "@/lib/api";
import {
  ShoppingCart,
  Plus,
  Trash2,
  Loader2,
  Minus,
  Search,
  Sparkles,
  Store,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  X,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";

// ─── Types ───────────────────────────────────────────────────────────────────

interface CartItem {
  id: number;
  productName: string;
  unit?: string;
  category?: string;
  quantity: number;
  marketPrices: Record<string, number>;
  cheapestMarket?: string;
  cheapestPrice?: number;
  totalCost: number;
}

interface MarketGroup {
  productName: string;
  unit?: string;
  price: number;
  quantity: number;
  totalCost: number;
}

interface SmartCartData {
  items: CartItem[];
  marketDistribution: Record<string, MarketGroup[]>;
  optimizedTotal: number;
  secondBestTotal: number;
  totalSavings: number;
  marketCount: number;
  itemCount: number;
}

// ─── Market Config ───────────────────────────────────────────────────────────

const marketConfig: Record<
  string,
  { color: string; bg: string; border: string; logo: string }
> = {
  BİM: {
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
    logo: "/logos/bim.png",
  },
  A101: {
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    logo: "/logos/a101.png",
  },
  ŞOK: {
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    logo: "/logos/sok.png",
  },
  Migros: {
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    logo: "/logos/migros.png",
  },
};

// ─── Main Component ──────────────────────────────────────────────────────────

export default function CartPage() {
  const [smartCart, setSmartCart] = useState<SmartCartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // ─── Fetch ──────────────────────────────────────────────────────────────

  const fetchSmartCart = async () => {
    try {
      const res = await api.get("/cart/smart");
      setSmartCart(res.data?.data ?? null);
    } catch (err) {
      console.error("Sepet çekilemedi:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSmartCart();
  }, []);

  // Click outside to close suggestions
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ─── Search / Autocomplete ──────────────────────────────────────────────

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await api.get(
          `/cart/products?q=${encodeURIComponent(value)}`,
        );
        const data = res.data?.data ?? [];
        setSuggestions(Array.isArray(data) ? data : []);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      }
    }, 300);
  };

  // ─── Actions ────────────────────────────────────────────────────────────

  const handleAddToCart = async (productName: string) => {
    setIsAdding(true);
    setShowSuggestions(false);
    try {
      await api.post("/cart", { productName, quantity: 1 });
      setSearchQuery("");
      setSuggestions([]);
      await fetchSmartCart();
    } catch (err: unknown) {
      toast.error("Ürün eklenemedi.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemove = async (id: number) => {
    setDeletingId(id);
    try {
      await api.delete(`/cart/${id}`);
      await fetchSmartCart();
    } catch {
      toast.error("Silme başarısız.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleQuantityChange = async (id: number, newQty: number) => {
    try {
      if (newQty <= 0) {
        await api.delete(`/cart/${id}`);
      } else {
        await api.put(`/cart/${id}`, { quantity: newQty });
      }
      await fetchSmartCart();
    } catch {
      toast.error("Güncelleme başarısız.");
    }
  };

  const handleComplete = async () => {
    if (!confirm("Alışverişi tamamlamak istediğinize emin misiniz?")) return;
    setIsCompleting(true);
    try {
      await api.post("/cart/complete");
      await fetchSmartCart();
    } catch {
      toast.error("İşlem başarısız.");
    } finally {
      setIsCompleting(false);
    }
  };

  const handleClear = async () => {
    if (!confirm("Sepeti tamamen temizlemek istediğinize emin misiniz?"))
      return;
    setIsClearing(true);
    try {
      await api.delete("/cart");
      await fetchSmartCart();
    } catch {
      toast.error("Temizleme başarısız.");
    } finally {
      setIsClearing(false);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────

  const items = smartCart?.items ?? [];
  const distribution = smartCart?.marketDistribution ?? {};
  const hasItems = items.length > 0;

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      {/* Başlık */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Alışveriş Sepeti</h1>
        <p className="text-sm text-zinc-500">
          Ürünleri ekleyin — en ucuz mağazadan almanız gereken listeyi
          oluşturalım
        </p>
      </div>

      {/* Ürün Ekleme */}
      <div ref={searchRef} className="relative">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim().length >= 2) {
                  if (suggestions.length > 0) {
                    handleAddToCart(suggestions[0]);
                  } else {
                    handleAddToCart(searchQuery.trim());
                  }
                }
              }}
              placeholder="Ürün ara... (örn: süt, peynir, yağ)"
              className="w-full rounded-xl border border-zinc-700/80 bg-zinc-900/80 py-3.5 pl-11 pr-4 text-zinc-100 placeholder-zinc-600 transition-all focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSuggestions([]);
                  setShowSuggestions(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <button
            onClick={() =>
              searchQuery.trim().length >= 2 &&
              handleAddToCart(
                suggestions.length > 0 ? suggestions[0] : searchQuery.trim(),
              )
            }
            disabled={isAdding || searchQuery.trim().length < 2}
            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 text-sm font-bold text-black shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-emerald-500"
          >
            {isAdding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Ekle
          </button>
        </div>

        {/* Autocomplete dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-20 mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 py-2 shadow-2xl">
            {suggestions.map((name) => (
              <button
                key={name}
                onClick={() => handleAddToCart(name)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-zinc-300 transition-colors hover:bg-emerald-500/10 hover:text-emerald-400"
              >
                <ShoppingBag className="h-4 w-4 shrink-0 text-zinc-600" />
                {name}
                <Plus className="ml-auto h-3.5 w-3.5 text-zinc-600" />
              </button>
            ))}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-zinc-500">
          <Loader2 className="mr-2 h-6 w-6 animate-spin" /> Sepet yükleniyor...
        </div>
      ) : !hasItems ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950 py-20 text-center">
          <ShoppingCart className="mb-4 h-16 w-16 text-zinc-800" />
          <p className="text-lg font-semibold text-zinc-400">Sepetiniz boş</p>
          <p className="mt-1 text-sm text-zinc-600">
            Yukarıdan ürün arayarak sepetinize ekleyin
          </p>
        </div>
      ) : (
        <>
          {/* Sepet Özeti */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400/70">
                Optimum Toplam
              </p>
              <p className="mt-1 text-2xl font-extrabold text-emerald-400">
                ₺
                {(smartCart?.optimizedTotal ?? 0).toLocaleString("tr-TR", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                2. En Ucuz Toplam
              </p>
              <p className="mt-1 text-2xl font-extrabold text-zinc-400">
                ₺
                {(smartCart?.secondBestTotal ?? 0).toLocaleString("tr-TR", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-5">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-yellow-400" />
                <p className="text-xs font-semibold uppercase tracking-wider text-yellow-400/70">
                  Tasarrufunuz
                </p>
              </div>
              <p className="mt-1 text-2xl font-extrabold text-yellow-400">
                ₺
                {(smartCart?.totalSavings ?? 0).toLocaleString("tr-TR", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>

          {/* Market Bazlı Dağıtım */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
                Mağaza Bazlı Alışveriş Listeniz
              </h2>
              <span className="rounded-lg bg-zinc-800 px-2 py-0.5 text-[11px] font-medium text-zinc-500">
                {smartCart?.marketCount ?? 0} mağaza
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {Object.entries(distribution).map(([marketName, products]) => {
                const cfg = marketConfig[marketName] ?? {
                  color: "text-zinc-400",
                  bg: "bg-zinc-800",
                  border: "border-zinc-700",
                  logo: "",
                };
                const marketTotal = products.reduce(
                  (s, p) => s + p.totalCost,
                  0,
                );

                return (
                  <div
                    key={marketName}
                    className={`rounded-2xl border bg-zinc-950/60 overflow-hidden ${cfg.border}`}
                  >
                    {/* Market başlığı */}
                    <div
                      className={`flex items-center justify-between px-5 py-3.5 ${cfg.bg}`}
                    >
                      <div className="flex items-center gap-3">
                        {cfg.logo ? (
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-lg ${cfg.bg}`}
                          >
                            <Image
                              src={cfg.logo}
                              alt={marketName}
                              width={20}
                              height={20}
                              className="object-contain"
                            />
                          </div>
                        ) : (
                          <Store className={`h-5 w-5 ${cfg.color}`} />
                        )}
                        <div>
                          <p className={`text-sm font-bold ${cfg.color}`}>
                            {marketName}
                          </p>
                          <p className="text-[11px] text-zinc-500">
                            {products.length} ürün
                          </p>
                        </div>
                      </div>
                      <p className={`text-lg font-extrabold ${cfg.color}`}>
                        ₺
                        {marketTotal.toLocaleString("tr-TR", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>

                    {/* Ürün listesi */}
                    <div className="divide-y divide-zinc-800/60">
                      {products.map((product) => (
                        <div
                          key={product.productName}
                          className="flex items-center justify-between px-5 py-3"
                        >
                          <div>
                            <p className="text-sm font-medium text-zinc-200">
                              {product.productName}
                            </p>
                            {product.unit && (
                              <p className="text-[11px] text-zinc-600">
                                {product.unit} × {product.quantity}
                              </p>
                            )}
                          </div>
                          <p className="text-sm font-bold text-zinc-300">
                            ₺
                            {product.totalCost.toLocaleString("tr-TR", {
                              minimumFractionDigits: 2,
                            })}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sepetteki Tüm Ürünler — Düzenle/Sil */}
          <div>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-zinc-400">
              Sepetinizdeki Ürünler ({items.length})
            </h2>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden">
              <div className="divide-y divide-zinc-800/60">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between px-5 py-3.5"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-zinc-100 truncate">
                          {item.productName}
                        </p>
                        {item.cheapestMarket && (
                          <span
                            className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                              marketConfig[item.cheapestMarket]?.bg ??
                              "bg-zinc-800"
                            } ${marketConfig[item.cheapestMarket]?.color ?? "text-zinc-400"}`}
                          >
                            {item.cheapestMarket}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-500">
                        {item.cheapestPrice
                          ? `₺${item.cheapestPrice.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`
                          : "Fiyat bulunamadı"}
                        {item.unit ? ` / ${item.unit}` : ""}
                      </p>
                    </div>

                    {/* Miktar kontrol */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center rounded-lg border border-zinc-700 bg-zinc-800">
                        <button
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity - 1)
                          }
                          className="px-2.5 py-1.5 text-zinc-400 transition hover:text-zinc-100"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="min-w-[28px] text-center text-sm font-bold text-zinc-100">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity + 1)
                          }
                          className="px-2.5 py-1.5 text-zinc-400 transition hover:text-zinc-100"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <p className="min-w-[70px] text-right text-sm font-bold text-zinc-100">
                        ₺
                        {item.totalCost.toLocaleString("tr-TR", {
                          minimumFractionDigits: 2,
                        })}
                      </p>

                      <button
                        onClick={() => handleRemove(item.id)}
                        disabled={deletingId === item.id}
                        className="rounded-lg p-2 text-zinc-600 transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                      >
                        {deletingId === item.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Alt Butonlar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <button
              onClick={handleClear}
              disabled={isClearing}
              className="flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 px-6 py-3 text-sm font-medium text-zinc-400 transition hover:bg-zinc-700 hover:text-zinc-100 disabled:opacity-50"
            >
              {isClearing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Sepeti Temizle
            </button>

            <button
              onClick={handleComplete}
              disabled={isCompleting}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-8 py-3 text-sm font-bold text-black shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400 disabled:opacity-50"
            >
              {isCompleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Alışverişi Tamamla
            </button>
          </div>

          {/* Disclaimer */}
          <div className="rounded-xl border border-zinc-800/60 bg-zinc-950/50 px-5 py-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-600" />
              <div className="text-[11px] leading-relaxed text-zinc-600">
                <p>
                  Fiyatlar bilgilendirme amaçlıdır. Mağaza sitelerinden alınan
                  veriler haftalık güncellenmektedir.
                </p>
                <p className="mt-0.5">
                  Gerçek fiyatlar mağazaya göre farklılık gösterebilir.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
