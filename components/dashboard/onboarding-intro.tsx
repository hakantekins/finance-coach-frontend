"use client";

import { useRouter, usePathname } from "next/navigation";
import type { ComponentType } from "react";
import {
  Wallet,
  TrendingUp,
  Brain,
  Bell,
  Target,
  ShoppingCart,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface OnboardingIntroProps {
  open: boolean;
  onDismiss: () => void;
}

type Step = {
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  cta: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
};

export function OnboardingIntro({ open, onDismiss }: OnboardingIntroProps) {
  const router = useRouter();
  usePathname();

  if (!open) return null;

  const steps: Step[] = [
    {
      title: "Gider Ekle",
      description:
        "Kayıt başlatmak için harcamalarınızı girin. İsterseniz sonraki adımda gelir sekmesine geçebilirsiniz. Dashboard metrikleri buradaki verilerle hesaplanır.",
      icon: Wallet,
      cta: {
        label: "Gider ekle",
        href: "/expenses?tab=EXPENSE",
      },
    },
    {
      title: "Gelir Ekle",
      description:
        "Gelirinizi ekleyin ki tasarruf potansiyeli ve hedef ilerlemesi anlamlı hesaplanabilsin.",
      icon: TrendingUp,
      cta: {
        label: "Gelir ekle",
        href: "/expenses?tab=INCOME",
      },
    },
    {
      title: "AI Koç’u kullan",
      description:
        "İşlemleriniz hazır olduğunda AI Koç kısa ve net öneriler üretir. Öncelik harcamalarınızı görürsünüz.",
      icon: Brain,
      cta: {
        label: "AI Koç’a git",
        href: "/coach",
      },
    },
    {
      title: "Yaklaşan Ödemeler",
      description:
        "Sağ üstteki Zil ikonuna tıklayın. Yaklaşan/gecikmiş ödemeler burada görünür, “Ödendi” deyince otomatik gider kaydı oluşur.",
      icon: Bell,
      cta: {
        label: "Tamam",
        onClick: () => {
          onDismiss();
        },
      },
    },
    {
      title: "Akıllı Sepet",
      description:
        "Market fiyatlarını karşılaştırıp en uygun planı önerir. Sepetiniz hazırsa tek tek ürünleri farklı marketlere dağıtır.",
      icon: ShoppingCart,
      cta: {
        label: "Sepete git",
        href: "/cart",
      },
    },
    {
      title: "Bütçe Planlama (opsiyonel)",
      description:
        "Kategori bazlı aylık limitler belirleyin. Böylece harcama eğiliminizi daha erken fark edersiniz.",
      icon: Target,
      cta: {
        label: "Bütçeler",
        href: "/budgets",
      },
    },
  ];

  const handleStepCTA = (href?: string, onClick?: () => void) => {
    if (onClick) {
      onClick();
      return;
    }
    if (href) router.push(href);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center px-4 pt-20">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onDismiss}
      />

      <div className="relative w-full max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-950/95 p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/20">
              <Sparkles className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                Yeni kullanıcı tanıtımı
              </p>
              <h2 className="mt-1 text-lg font-bold text-zinc-100">
                Finans Koçu’na hoş geldin
              </h2>
              <p className="mt-1 text-sm text-zinc-400">
                5 dakikada başlayalım: en çok kullanılan yerler burada.
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
            onClick={onDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.title}
                className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 ring-1 ring-emerald-500/20">
                    <Icon className="h-4 w-4 text-emerald-300" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-zinc-100">{s.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                      {s.description}
                    </p>
                  </div>
                </div>

                <div className="mt-3">
                  <Button
                    onClick={() => handleStepCTA(s.cta.href, s.cta.onClick)}
                    className="w-full bg-emerald-500 text-black font-bold hover:bg-emerald-400"
                  >
                    {s.cta.label}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <Button
            variant="outline"
            onClick={onDismiss}
            className="border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
          >
            Daha sonra
          </Button>
        </div>
      </div>
    </div>
  );
}

