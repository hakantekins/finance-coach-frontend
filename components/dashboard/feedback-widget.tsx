"use client";

import { useState } from "react";
import { toast } from "sonner";
import { MessageSquare, Send } from "lucide-react";

import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const trimmed = message.trim();
    if (!trimmed) {
      toast.error("Lütfen geri bildiriminizi yazın.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/feedback", { message: trimmed });
      toast.success("Geri bildiriminiz alındı. Teşekkürler!");
      setMessage("");
      setOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Geri bildirim gönderilemedi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="shadow-lg shadow-emerald-500/20 rounded-full bg-emerald-500 text-black hover:bg-emerald-400">
            <MessageSquare className="h-4 w-4" />
            Geri Bildirim
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Geri Bildirim</DialogTitle>
            <DialogDescription>
              Önerilerinizi veya hata bildirimlerinizi yazın. Ekibimiz inceleyecektir.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="feedback-message">Mesaj</Label>
            <Textarea
              id="feedback-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Örn: ... Uygulama ekranında şu sorun var / Şu özelliği ekleyebilir misiniz?"
              className="min-h-[140px]"
              maxLength={2000}
            />
            <p className="text-[11px] text-zinc-600">
              {message.trim().length}/2000 karakter
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setOpen(false);
                setMessage("");
              }}
              disabled={isSubmitting}
            >
              İptal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-emerald-500 text-black hover:bg-emerald-400"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? "Gönderiliyor..." : "Gönder"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

