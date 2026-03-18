"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Stack trace/logs kullanıcıya gösterilmez, sadece konsola düşer.
  useEffect(() => {
    console.error("Next.js hata yakalandı:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-zinc-950 p-6 flex items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
          <div>
            <h1 className="text-lg font-bold text-zinc-100">
              Bir şeyler ters gitti
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              Lütfen tekrar deneyin. Sorun devam ederse bize yazın.
            </p>
          </div>
        </div>

        <div className="mt-4">
          <Button
            onClick={reset}
            className="w-full bg-red-500/20 text-red-200 hover:bg-red-500/30"
          >
            Tekrar dene
          </Button>
        </div>
      </div>
    </div>
  );
}

