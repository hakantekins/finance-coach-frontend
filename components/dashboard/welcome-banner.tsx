"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

const STORAGE_KEY = "welcome_banner_seen_v1";

export function WelcomeBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) setVisible(true);
  }, []);

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="col-span-12">
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/20">
              <Sparkles className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Hoş geldiniz
              </p>
              <p className="mt-1 text-sm leading-relaxed text-zinc-200">
                Önce birkaç temel kayıt ekleyin: gelir/gider, yaklaşan ödemeler
                ve alışveriş notları. Sonra AI Koçu size kısa ve anlaşılır
                tasarruf önerileri verir.
              </p>

              {/* Yeni kullanıcı hızlı rehberi (yüzeysel) */}
              <div className="mt-4 flex flex-col gap-2">
                <div className="text-[12px] font-semibold text-zinc-100">
                  Sık kullanacağınız yerler
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href="/expenses"
                    onClick={handleClose}
                    className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-[12px] font-semibold text-emerald-200 transition hover:bg-emerald-500/10"
                  >
                    Harcamalar
                  </Link>
                  <Link
                    href="/coach"
                    onClick={handleClose}
                    className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-[12px] font-semibold text-emerald-200 transition hover:bg-emerald-500/10"
                  >
                    AI Koç
                  </Link>
                  <Link
                    href="/cart"
                    onClick={handleClose}
                    className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-[12px] font-semibold text-emerald-200 transition hover:bg-emerald-500/10"
                  >
                    Sepet
                  </Link>
                  <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-[12px] font-semibold text-emerald-200">
                  {"Zil -> Ödemeler"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/expenses" onClick={handleClose}>
              <Button
                variant="outline"
                className="border-emerald-500/30 bg-emerald-500/5 text-emerald-300 hover:bg-emerald-500/10"
              >
                Gelir ekleyin
              </Button>
            </Link>
            <Button
              variant="ghost"
              onClick={handleClose}
              className="text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100"
            >
              Anladım
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

