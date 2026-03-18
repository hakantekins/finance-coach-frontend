"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

interface MarketComparisonDTO {
  productName: string;
  category?: string;
  unit?: string;
  marketPrices: Record<string, number>;
  cheapestMarket: string;
  cheapestPrice: number;
  priceDifference: number;
}

export function MarketComparison() {
  const [data, setData] = useState<MarketComparisonDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await api.get("/market-prices/dashboard-comparison");
        if (response.data.success) {
          setData(response.data.data);
        }
      } catch (error) {
        console.error("Market verileri çekilemedi:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarketData();
  }, []);

  const stores = ["BİM", "A101", "ŞOK", "Migros"];

  const storeLogos: Record<string, string> = {
    BİM: "/logos/bim.png",
    A101: "/logos/a101.png",
    ŞOK: "/logos/sok.png",
    Migros: "/logos/migros.png",
  };

  return (
    <Card className="col-span-12 border-zinc-800 bg-zinc-900">
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-emerald-400" />
          <div>
            <CardTitle className="text-lg text-zinc-100">
              Akıllı Mağaza Karşılaştırması
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Süpermarketler arasındaki fiyatları karşılaştırın ve en ucuz
              seçeneği bulun
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-zinc-400 whitespace-nowrap">
                    Ürün
                  </TableHead>
                  {stores.map((store) => (
                    <TableHead
                      key={store}
                      className="text-center text-zinc-400"
                    >
                      <div className="flex items-center justify-center pb-1">
                        {storeLogos[store] ? (
                          <Image
                            src={storeLogos[store]}
                            alt={`${store} logosu`}
                            width={36}
                            height={18}
                            // Efektler silindi, her zaman renkli
                            className="object-contain drop-shadow-sm"
                          />
                        ) : (
                          store
                        )}
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="text-center text-zinc-400 whitespace-nowrap">
                    En İyi Seçenek
                  </TableHead>
                  <TableHead className="text-right text-zinc-400 whitespace-nowrap">
                    Tasarruf
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-10 text-zinc-500"
                    >
                      Henüz karşılaştırılacak veri bulunamadı.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((item) => (
                    <TableRow
                      key={item.productName}
                      className="border-zinc-800 hover:bg-zinc-800/50"
                    >
                      <TableCell className="font-medium text-zinc-100 whitespace-nowrap">
                        {item.productName}
                        {item.unit && (
                          <span className="ml-1 text-xs text-zinc-500">
                            ({item.unit})
                          </span>
                        )}
                      </TableCell>

                      {stores.map((store) => {
                        const price = item.marketPrices[store];
                        const isCheapest = item.cheapestMarket === store;

                        return (
                          <TableCell key={store} className="text-center">
                            <span
                              className={
                                isCheapest
                                  ? "font-bold text-emerald-400"
                                  : "text-zinc-300"
                              }
                            >
                              {price ? `₺${price.toFixed(2)}` : "-"}
                            </span>
                          </TableCell>
                        );
                      })}

                      {/* Kazanan Market Sütunu */}
                      <TableCell className="text-center align-middle">
                        <div className="flex justify-center items-center">
                          {item.cheapestMarket &&
                          storeLogos[item.cheapestMarket] ? (
                            <div className="inline-flex h-7 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5">
                              <Image
                                src={storeLogos[item.cheapestMarket]}
                                alt={`${item.cheapestMarket} logosu`}
                                width={24}
                                height={12}
                                // Efektler silindi, her zaman renkli
                                className="object-contain"
                              />
                            </div>
                          ) : (
                            <Badge className="bg-emerald-500/20 text-emerald-400 border-0 h-6">
                              {item.cheapestMarket || "-"}
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      {/* EKSİK OLAN TASARRUF SÜTUNU GERİ GELDİ */}
                      <TableCell className="text-right whitespace-nowrap">
                        <span className="text-sm text-emerald-400 font-medium">
                          {item.priceDifference > 0
                            ? `₺${item.priceDifference.toFixed(2)} kazanç`
                            : "-"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
