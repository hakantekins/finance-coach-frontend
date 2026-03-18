"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";

type FeedbackItem = {
  id: number;
  name: string;
  message: string;
  createdAt: string;
};

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleString("tr-TR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

export default function AdminFeedbacksPage() {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get("/feedbacks")
      .then((res) => {
        const data = res.data?.data ?? res.data;
        setItems(Array.isArray(data) ? (data as FeedbackItem[]) : []);
      })
      .catch(() => setItems([]))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <Card className="border-zinc-800 bg-zinc-950">
        <CardHeader>
          <CardTitle className="text-zinc-100 font-bold">
            Yönetici - Geri Bildirimler
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-zinc-500">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Yükleniyor...
            </div>
          ) : items.length === 0 ? (
            <div className="py-10 text-center text-sm text-zinc-500">
              Henüz geri bildirim yok
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-zinc-900/50">
                <TableRow>
                  <TableHead className="text-zinc-400 text-[10px] font-bold uppercase">
                    İsim
                  </TableHead>
                  <TableHead className="text-zinc-400 text-[10px] font-bold uppercase">
                    Mesaj
                  </TableHead>
                  <TableHead className="text-zinc-400 text-[10px] font-bold uppercase text-right">
                    Tarih
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((f) => (
                  <TableRow
                    key={f.id}
                    className="border-zinc-800 hover:bg-zinc-900/40 transition-colors"
                  >
                    <TableCell className="text-zinc-200 font-medium">
                      {f.name}
                    </TableCell>
                    <TableCell className="text-zinc-300">{f.message}</TableCell>
                    <TableCell className="text-right text-zinc-500">
                      {formatDate(f.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

