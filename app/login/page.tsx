"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
  Shield,
  ArrowRight,
  Wallet,
  Target,
  TrendingUp,
  Mail,
  Lock,
  User,
} from "lucide-react";

type Tab = "login" | "register";

export default function AuthPage() {
  const [tab, setTab] = useState<Tab>("login");
  const router = useRouter();

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-8">
      {/* Arka plan efektleri */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-60 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-emerald-500/8 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-[400px] w-[400px] rounded-full bg-emerald-500/5 blur-[100px]" />
        <div className="absolute top-1/4 -left-20 h-[300px] w-[300px] rounded-full bg-emerald-500/3 blur-[80px]" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #10b981 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative w-full max-w-[440px]">
        {/* Logo */}
        <div className="mb-10 text-center">
          <div className="group mx-auto mb-5 flex h-[72px] w-[72px] items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-2xl shadow-emerald-500/30 transition-all duration-500 hover:shadow-emerald-500/50 hover:scale-105">
              <TrendingUp
                className="h-[44px] w-[44px] text-black transition-transform duration-500 group-hover:rotate-12"
                strokeWidth={2.5}
              />
          </div>
          <h1 className="text-[2rem] font-extrabold tracking-tight text-zinc-100">
            AI Finans <span className="text-emerald-400">Koçu</span>
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Finansal özgürlüğünüze giden yol
          </p>
        </div>

        {/* Kart */}
        <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/60 p-8 shadow-2xl backdrop-blur-xl ring-1 ring-white/[0.03]">
          {/* Sekmeler */}
          <div className="relative mb-8 flex rounded-2xl bg-zinc-800/60 p-1.5">
            {/* Sliding indicator */}
            <div
              className="absolute top-1.5 h-[calc(100%-12px)] w-[calc(50%-6px)] rounded-xl bg-zinc-700 shadow-sm transition-all duration-300 ease-out"
              style={{ left: tab === "login" ? "6px" : "calc(50% + 0px)" }}
            />
            {(["login", "register"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`relative z-10 flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors duration-300 ${
                  tab === t
                    ? "text-zinc-100"
                    : "text-zinc-500 hover:text-zinc-400"
                }`}
              >
                {t === "login" ? "Giriş Yap" : "Kayıt Ol"}
              </button>
            ))}
          </div>

          {/* Form içeriği */}
          <div className="min-h-[280px]">
            {tab === "login" ? (
              <LoginForm onSuccess={() => router.push("/")} />
            ) : (
              <RegisterForm onSuccess={() => setTab("login")} />
            )}
          </div>
        </div>

        {/* Alt bilgi */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-zinc-600">
          <Shield className="h-3.5 w-3.5" />
          <span>
            Verileriniz güvenle saklanır ve üçüncü taraflarla paylaşılmaz.
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Login ────────────────────────────────────────────────────────────────────

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const response = await api.post("/auth/login", { email, password });
      const token = response.data?.data?.token;
      if (token) {
        localStorage.setItem("token", token);
        const fullName = response.data?.data?.fullName;
        if (fullName) localStorage.setItem("fullName", fullName);

        // Register sonrası ilk girişte onboarding gösterilsin.
        const pending = localStorage.getItem("onboarding_pending_v1") === "1";
        if (pending) {
          localStorage.setItem("onboarding_show_v1", "1");
          localStorage.removeItem("onboarding_pending_v1");
        }
        onSuccess();
      } else {
        setError("Token alınamadı.");
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(
        axiosErr.response?.data?.message ?? "E-posta veya şifre hatalı.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-5 animate-fade-in">
      <InputField
        label="E-posta"
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="ornek@email.com"
        autoComplete="email"
        icon={<Mail className="h-4 w-4" />}
      />

      <div className="space-y-2">
        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Şifre
        </label>
        <div className="group relative">
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 transition-colors group-focus-within:text-emerald-400">
            <Lock className="h-4 w-4" />
          </div>
          <input
            type={showPass ? "text" : "password"}
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="block w-full rounded-xl border border-zinc-700/80 bg-zinc-800/80 px-4 py-3.5 pl-11 pr-11 text-zinc-100 placeholder-zinc-600 transition-all duration-200 focus:border-emerald-500/50 focus:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-600 transition-colors hover:text-zinc-300"
          >
            {showPass ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {error && <ErrorBox message={error} />}

      <SubmitButton
        isLoading={isLoading}
        label="Giriş Yap"
        loadingLabel="Giriş yapılıyor..."
        icon={<ArrowRight className="h-4 w-4" />}
      />
    </form>
  );
}

// ─── Register ────────────────────────────────────────────────────────────────

function RegisterForm({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    monthlyIncome: "",
    monthlySavingsGoal: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [passwordWarning, setPasswordWarning] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const set = (key: keyof typeof form) => (val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setPasswordWarning("");

    if (form.password.length < 8) {
      setError("Şifre en az 8 karakter olmalıdır.");
      return;
    }

    // Soft validation: uppercase/digit is only a warning now.
    const strengthOk = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(
      form.password,
    );
    if (!strengthOk) {
      setPasswordWarning(
        "Şifre gücü zayıf görünüyor. Bu bir uyarıdır; isterseniz devam edebilirsiniz.",
      );
    }
    setIsLoading(true);
    try {
      await api.post("/auth/register", {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        monthlyIncome: form.monthlyIncome ? parseFloat(form.monthlyIncome) : 0,
        monthlySavingsGoal: form.monthlySavingsGoal
          ? parseFloat(form.monthlySavingsGoal)
          : 0,
      });
      // Kayıt sonrası ilk girişte onboarding'i göster.
      localStorage.setItem("onboarding_pending_v1", "1");
      setSuccess(true);
      setTimeout(() => onSuccess(), 1500);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(
        axiosErr.response?.data?.message ?? "Kayıt sırasında bir hata oluştu.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center animate-fade-in">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 ring-4 ring-emerald-500/10">
          <Sparkles className="h-10 w-10 text-emerald-400" />
        </div>
        <div>
          <p className="text-lg font-bold text-zinc-100">Kayıt başarılı!</p>
          <p className="mt-1 text-sm text-zinc-500">
            Giriş sekmesine yönlendiriliyorsunuz...
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleRegister} className="space-y-4 animate-fade-in">
      <InputField
        label="Ad Soyad"
        type="text"
        value={form.fullName}
        onChange={set("fullName")}
        placeholder="adınız soyadınız"
        autoComplete="name"
        icon={<User className="h-4 w-4" />}
      />
      <InputField
        label="E-posta"
        type="email"
        value={form.email}
        onChange={set("email")}
        placeholder="ornek@email.com"
        autoComplete="email"
        icon={<Mail className="h-4 w-4" />}
      />

      <div className="space-y-2">
        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Şifre
        </label>
        <div className="group relative">
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 transition-colors group-focus-within:text-emerald-400">
            <Lock className="h-4 w-4" />
          </div>
          <input
            type={showPass ? "text" : "password"}
            required
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => set("password")(e.target.value)}
            placeholder="Min. 8 karakter, büyük harf, rakam"
            className="block w-full rounded-xl border border-zinc-700/80 bg-zinc-800/80 px-4 py-3.5 pl-11 pr-11 text-zinc-100 placeholder-zinc-600 transition-all duration-200 focus:border-emerald-500/50 focus:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-600 transition-colors hover:text-zinc-300"
          >
            {showPass ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {/* Password strength */}
        {form.password && <PasswordStrength password={form.password} />}
      </div>

      {/* Ayraç */}
      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-800/80" />
        </div>
        <div className="relative flex justify-center">
          <span className="flex items-center gap-1.5 bg-zinc-900/60 px-3 text-[11px] font-medium text-zinc-600">
            <Sparkles className="h-3 w-3" />
            Finansal Bilgiler (İsteğe Bağlı)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Aylık Gelir ₺
          </label>
          <div className="group relative">
            <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 transition-colors group-focus-within:text-emerald-400">
              <Wallet className="h-4 w-4" />
            </div>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.monthlyIncome}
              onChange={(e) => set("monthlyIncome")(e.target.value)}
              placeholder="0.00"
              className="block w-full rounded-xl border border-zinc-700/80 bg-zinc-800/80 px-4 py-3.5 pl-11 text-zinc-100 placeholder-zinc-600 transition-all duration-200 focus:border-emerald-500/50 focus:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Tasarruf Hedefi ₺
          </label>
          <div className="group relative">
            <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 transition-colors group-focus-within:text-emerald-400">
              <Target className="h-4 w-4" />
            </div>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.monthlySavingsGoal}
              onChange={(e) => set("monthlySavingsGoal")(e.target.value)}
              placeholder="0.00"
              className="block w-full rounded-xl border border-zinc-700/80 bg-zinc-800/80 px-4 py-3.5 pl-11 text-zinc-100 placeholder-zinc-600 transition-all duration-200 focus:border-emerald-500/50 focus:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>
      </div>

      {passwordWarning && <WarningBox message={passwordWarning} />}
      {error && <ErrorBox message={error} />}

      <SubmitButton
        isLoading={isLoading}
        label="Kayıt Ol"
        loadingLabel="Kayıt yapılıyor..."
        icon={<Sparkles className="h-4 w-4" />}
      />
    </form>
  );
}

// ─── Ortak Bileşenler ─────────────────────────────────────────────────────────

function InputField({
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  icon,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoComplete?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">
        {label}
      </label>
      <div className="group relative">
        {icon && (
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 transition-colors group-focus-within:text-emerald-400">
            {icon}
          </div>
        )}
        <input
          type={type}
          required
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`block w-full rounded-xl border border-zinc-700/80 bg-zinc-800/80 px-4 py-3.5 text-zinc-100 placeholder-zinc-600 transition-all duration-200 focus:border-emerald-500/50 focus:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${icon ? "pl-11" : ""}`}
        />
      </div>
    </div>
  );
}

function PasswordStrength({ password }: { password: string }) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { label: "", color: "" },
    { label: "Çok Zayıf", color: "bg-red-500" },
    { label: "Zayıf", color: "bg-orange-500" },
    { label: "Orta", color: "bg-yellow-500" },
    { label: "Güçlü", color: "bg-emerald-400" },
    { label: "Çok Güçlü", color: "bg-emerald-500" },
  ];

  const { label, color } = levels[score] || levels[0];

  return (
    <div className="space-y-1.5 pt-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i <= score ? color : "bg-zinc-800"
            }`}
          />
        ))}
      </div>
      <p className="text-[11px] text-zinc-600">
        Şifre güçü: <span className="font-medium text-zinc-400">{label}</span>
      </p>
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400 animate-fade-in">
      {message}
    </div>
  );
}

function WarningBox({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-300 animate-fade-in">
      {message}
    </div>
  );
}

function SubmitButton({
  isLoading,
  label,
  loadingLabel,
  icon,
}: {
  isLoading: boolean;
  label: string;
  loadingLabel: string;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className="group mt-2 flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-3.5 text-sm font-bold text-black shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:from-emerald-400 hover:to-emerald-500 hover:shadow-emerald-500/30 hover:scale-[1.01] focus:outline-none active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {loadingLabel}
        </>
      ) : (
        <>
          {label}
          <span className="transition-transform duration-200 group-hover:translate-x-0.5">
            {icon}
          </span>
        </>
      )}
    </button>
  );
}
