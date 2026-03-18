"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  User,
  Target,
  TrendingUp,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Mail,
  AlertTriangle,
  Info,
} from "lucide-react";
import { api } from "@/lib/api";

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState({
    fullName: "",
    monthlyIncome: "",
    monthlySavingsGoal: "",
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    const levels = [
      { label: "", color: "" },
      { label: "Çok Zayıf", color: "bg-red-500" },
      { label: "Zayıf", color: "bg-orange-500" },
      { label: "Orta", color: "bg-yellow-500" },
      { label: "Güçlü", color: "bg-emerald-400" },
      { label: "Çok Güçlü", color: "bg-emerald-500" },
    ];
    return { score, ...levels[score] };
  };

  const strength = getPasswordStrength(passwords.newPassword);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const dash = await api.get("/dashboard");
        const d = dash.data?.data;
        setEmail(localStorage.getItem("email") ?? "");
        setProfile({
          fullName: localStorage.getItem("fullName") ?? "",
          monthlyIncome: d?.declaredMonthlyIncome?.toString() ?? "",
          monthlySavingsGoal: d?.monthlySavingsGoal?.toString() ?? "",
        });
      } catch (err) {
        console.error("Profil yüklenemedi:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const setProfileField =
    (key: keyof typeof profile) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setProfile((prev) => ({ ...prev, [key]: e.target.value }));

  const setPasswordField =
    (key: keyof typeof passwords) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setPasswords((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSaving(true);
    try {
      await api.put("/users/profile", {
        fullName: profile.fullName || undefined,
        monthlyIncome: profile.monthlyIncome
          ? parseFloat(profile.monthlyIncome)
          : undefined,
        monthlySavingsGoal: profile.monthlySavingsGoal
          ? parseFloat(profile.monthlySavingsGoal)
          : undefined,
      });
      if (profile.fullName) localStorage.setItem("fullName", profile.fullName);
      setSaved(true);
      toast.success("Profil başarıyla güncellendi!");
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      const msg = err.response?.data?.message ?? "Güncelleme başarısız.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordError("Yeni şifre ve tekrarı eşleşmiyor.");
      return;
    }
    if (passwords.newPassword.length < 8) {
      setPasswordError("Şifre en az 8 karakter olmalıdır.");
      return;
    }

    setPasswordSaving(true);
    try {
      await api.put("/users/password", {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
        confirmPassword: passwords.confirmPassword,
      });
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordSaved(true);
      toast.success("Şifre başarıyla değiştirildi!");
      setTimeout(() => setPasswordSaved(false), 3000);
    } catch (err: any) {
      const msg = err.response?.data?.message ?? "Şifre değiştirilemedi.";
      setPasswordError(msg);
      toast.error(msg);
    } finally {
      setPasswordSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-zinc-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Yükleniyor...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Ayarlar</h1>
        <p className="text-sm text-zinc-500">
          Profil bilgilerinizi ve güvenlik ayarlarınızı yönetin
        </p>
      </div>

      {/* ─── Profil Formu ──────────────────────────────────────────────────── */}
      <form onSubmit={handleSaveProfile} className="space-y-4">
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="flex flex-row items-center gap-2 pb-4">
            <User className="h-5 w-5 text-zinc-400" />
            <CardTitle className="text-base text-zinc-100">
              Profil Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Ad Soyad
              </Label>
              <Input
                value={profile.fullName}
                onChange={setProfileField("fullName")}
                placeholder="Adınız Soyadınız"
                className="border-zinc-700 bg-zinc-800 text-zinc-100"
              />
            </div>

            {email && (
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  E-posta
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
                  <Input
                    value={email}
                    readOnly
                    className="border-zinc-700 bg-zinc-800/50 pl-10 text-zinc-500 cursor-not-allowed"
                  />
                </div>
                <p className="text-[11px] text-zinc-600">
                  E-posta adresi değiştirilemez
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="flex flex-row items-center gap-2 pb-4">
            <Target className="h-5 w-5 text-emerald-400" />
            <CardTitle className="text-base text-zinc-100">
              Finansal Hedefler
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Aylık Net Gelir (₺)
              </Label>
              <div className="relative">
                <TrendingUp className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={profile.monthlyIncome}
                  onChange={setProfileField("monthlyIncome")}
                  placeholder="0.00"
                  className="border-zinc-700 bg-zinc-800 pl-10 text-zinc-100"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Aylık Tasarruf Hedefi (₺)
              </Label>
              <div className="relative">
                <Target className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={profile.monthlySavingsGoal}
                  onChange={setProfileField("monthlySavingsGoal")}
                  placeholder="0.00"
                  className="border-zinc-700 bg-zinc-800 pl-10 text-zinc-100"
                />
              </div>
              <p className="text-xs text-zinc-600">
                Önerilen: Gelirinizin %20'si → ₺
                {profile.monthlyIncome
                  ? (parseFloat(profile.monthlyIncome) * 0.2).toLocaleString(
                      "tr-TR",
                    )
                  : "0"}
              </p>
            </div>

            {/* Hızlı öneri butonları */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "%10", pct: 0.1 },
                { label: "%20", pct: 0.2 },
                { label: "%30", pct: 0.3 },
              ].map((rule) => (
                <button
                  key={rule.label}
                  type="button"
                  onClick={() => {
                    if (!profile.monthlyIncome) return;
                    setProfile((prev) => ({
                      ...prev,
                      monthlySavingsGoal: (
                        parseFloat(profile.monthlyIncome) * rule.pct
                      ).toFixed(2),
                    }));
                  }}
                  className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-2.5 text-center transition hover:border-emerald-500/40 hover:bg-emerald-500/5"
                >
                  <p className="text-xs font-bold text-zinc-100">
                    {rule.label}
                  </p>
                  {profile.monthlyIncome && (
                    <p className="text-xs font-semibold text-emerald-400">
                      ₺
                      {(
                        parseFloat(profile.monthlyIncome) * rule.pct
                      ).toLocaleString("tr-TR")}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSaving}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 py-3 text-sm font-bold text-black transition hover:bg-emerald-400 disabled:opacity-60"
        >
          {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
          {saved ? (
            <>
              <CheckCircle2 className="h-4 w-4" /> Kaydedildi!
            </>
          ) : isSaving ? (
            "Kaydediliyor..."
          ) : (
            "Değişiklikleri Kaydet"
          )}
        </button>
      </form>

      {/* ─── Şifre Değiştirme ──────────────────────────────────────────────── */}
      <form onSubmit={handleChangePassword}>
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="flex flex-row items-center gap-2 pb-4">
            <Lock className="h-5 w-5 text-zinc-400" />
            <CardTitle className="text-base text-zinc-100">
              Şifre Değiştir
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Mevcut şifre */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Mevcut Şifre
              </Label>
              <div className="relative">
                <input
                  type={showPasswords.current ? "text" : "password"}
                  required
                  value={passwords.currentPassword}
                  onChange={setPasswordField("currentPassword")}
                  placeholder="••••••••"
                  className="block w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 pr-11 text-zinc-100 placeholder-zinc-500 transition focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords((p) => ({ ...p, current: !p.current }))
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showPasswords.current ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Yeni şifre */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Yeni Şifre
              </Label>
              <div className="relative">
                <input
                  type={showPasswords.new ? "text" : "password"}
                  required
                  value={passwords.newPassword}
                  onChange={setPasswordField("newPassword")}
                  placeholder="Min. 8 karakter, büyük harf, rakam"
                  className="block w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 pr-11 text-zinc-100 placeholder-zinc-500 transition focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords((p) => ({ ...p, new: !p.new }))
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showPasswords.new ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {passwords.newPassword && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          i <= strength.score ? strength.color : "bg-zinc-700"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-zinc-500">
                    Şifre güçü:{" "}
                    <span className="font-semibold text-zinc-300">
                      {strength.label}
                    </span>
                  </p>
                  {strength.score < 3 && (
                    <p className="text-xs text-yellow-300">
                      Uyarı: Şifre gücü düşük görünüyor. İsterseniz
                      devam edebilirsiniz.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Şifre tekrar */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Yeni Şifre Tekrar
              </Label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  required
                  value={passwords.confirmPassword}
                  onChange={setPasswordField("confirmPassword")}
                  placeholder="••••••••"
                  className={`block w-full rounded-lg border px-4 py-3 pr-11 text-zinc-100 placeholder-zinc-500 transition focus:outline-none focus:ring-1 ${
                    passwords.confirmPassword &&
                    passwords.newPassword !== passwords.confirmPassword
                      ? "border-red-500/50 bg-zinc-800 focus:border-red-500 focus:ring-red-500"
                      : passwords.confirmPassword &&
                          passwords.newPassword === passwords.confirmPassword
                        ? "border-emerald-500/50 bg-zinc-800 focus:border-emerald-500 focus:ring-emerald-500"
                        : "border-zinc-700 bg-zinc-800 focus:border-emerald-500 focus:ring-emerald-500"
                  }`}
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords((p) => ({ ...p, confirm: !p.confirm }))
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {passwords.confirmPassword && (
                <p
                  className={`text-xs ${
                    passwords.newPassword === passwords.confirmPassword
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  {passwords.newPassword === passwords.confirmPassword
                    ? "✅ Şifreler eşleşiyor"
                    : "❌ Şifreler eşleşmiyor"}
                </p>
              )}
            </div>

            {passwordError && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {passwordError}
              </div>
            )}

            <button
              type="submit"
              disabled={
                passwordSaving ||
                passwords.newPassword !== passwords.confirmPassword
              }
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-700 py-3 text-sm font-bold text-zinc-100 transition hover:bg-zinc-600 disabled:opacity-60"
            >
              {passwordSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              {passwordSaved ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Şifre
                  Değiştirildi!
                </>
              ) : passwordSaving ? (
                "Değiştiriliyor..."
              ) : (
                "Şifreyi Değiştir"
              )}
            </button>
          </CardContent>
        </Card>
      </form>

      {/* ─── Tehlike Bölgesi ───────────────────────────────────────────────── */}
      <Card className="border-red-500/20 bg-zinc-900">
        <CardHeader className="flex flex-row items-center gap-2 pb-4">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <CardTitle className="text-base text-red-400">
            Tehlikeli Bölge
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-100">Hesabı Sil</p>
              <p className="text-xs text-zinc-500">
                Tüm verileriniz kalıcı olarak silinir. Bu işlem geri alınamaz.
              </p>
            </div>
            <button
              onClick={() =>
                toast.error(
                  "Bu özellik henüz aktif değil. Hesap silme için destek ekibine ulaşın.",
                )
              }
              className="shrink-0 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/20"
            >
              Hesabı Sil
            </button>
          </div>
        </CardContent>
      </Card>

      {/* ─── Uygulama Bilgisi ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-2 pb-4 text-[11px] text-zinc-700">
        <Info className="h-3 w-3" />
        <span>AI Finans Koçu v1.0 · Spring Boot + Next.js · Groq AI</span>
      </div>
    </div>
  );
}
