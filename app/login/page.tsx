"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth as authApi, ApiError } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { AppLogo } from "@/components/ui/AppLogo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function LoginPage() {
  const router = useRouter();
  const { setSession, fetchUser } = useAuthStore();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let accessToken: string;
      let refreshToken: string;

      if (isRegister) {
        const res = await authApi.register(email, password, fullName);

        if (!res.data.session) {
          setError("Revisa tu email para confirmar la cuenta.");
          setLoading(false);
          return;
        }

        accessToken = res.data.session.access_token;
        refreshToken = res.data.session.refresh_token;
      } else {
        const res = await authApi.login(email, password);
        accessToken = res.data.session.access_token;
        refreshToken = res.data.session.refresh_token;
      }

      setSession(accessToken, refreshToken);
      await fetchUser();
      router.push("/home");
    } catch (err) {
      if (err instanceof ApiError) {
        const message = err.message.toLowerCase();

        if (message.includes("invalid login")) {
          setError("Email o contraseña incorrectos");
        } else if (message.includes("email")) {
          setError("El email no es válido");
        } else if (message.includes("password")) {
          setError("La contraseña debe tener al menos 6 caracteres");
        } else {
          setError("Ha ocurrido un error. Inténtalo de nuevo");
        }
      } else {
        setError("No se pudo conectar con el servidor");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Theme toggle flotante */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="grid min-h-screen lg:grid-cols-2">
        {/* ── PANEL IZQUIERDO ── */}
        <section className="hidden lg:flex flex-col justify-between border-r border-border bg-foreground p-10 text-background">
          <div className="space-y-6">
            <AppLogo variant="full" height={36} className="invert" />

            <div className="max-w-md space-y-4 mt-6">
              <h1 className="text-4xl font-semibold tracking-tight leading-tight">
                Gestiona clientes, organizaciones e invitaciones en un solo lugar.
              </h1>
              <p className="text-base leading-7 opacity-60">
                Accede a tu espacio de trabajo y continúa con tu flujo de trabajo
                dentro del CRM con una experiencia más clara y ordenada.
              </p>
            </div>

            <div className="grid max-w-xl grid-cols-3 gap-4 mt-4">
              <div className="border border-background/10 bg-background/5 p-4 rounded-2xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] opacity-50">
                  Acceso
                </p>
                <p className="mt-3 text-sm opacity-70">
                  Inicio de sesión y registro en un mismo flujo.
                </p>
              </div>

              <div className="border border-background/10 bg-background/5 p-4 rounded-2xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] opacity-50">
                  Flujo
                </p>
                <p className="mt-3 text-sm opacity-70">
                  Entrada rápida al panel y onboarding.
                </p>
              </div>

              <div className="border border-background/10 bg-background/5 p-4 rounded-2xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] opacity-50">
                  Multi-tenant
                </p>
                <p className="mt-3 text-sm opacity-70">
                  Organizaciones y usuarios conectados.
                </p>
              </div>
            </div>
          </div>

          <footer className="text-[11px] opacity-40">
            © 2026 easy-CRM
          </footer>
        </section>

        {/* ── PANEL DERECHO (LOGIN) ── */}
        <section className="flex items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-md border border-border bg-card backdrop-blur-sm p-8 shadow-lg rounded-3xl">
            <div className="mb-8 space-y-4 text-center">
              <div className="flex justify-center">
                <AppLogo variant="icon" className="w-14 h-14" />
              </div>

              <div className="space-y-2">
                <AppLogo variant="full" height={22} className="mx-auto" />
                <h2 className="text-3xl font-semibold tracking-tight text-foreground mt-3">
                  {isRegister ? "Crea tu cuenta" : "Inicia sesión"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {isRegister
                    ? "Empieza tu acceso al espacio de trabajo."
                    : "Accede a tu panel para continuar."}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    setError("");
                  }}
                  placeholder="Nombre completo"
                  required
                  className="h-12 w-full border border-border bg-muted px-4 text-sm text-foreground outline-none transition focus:border-foreground focus:bg-card rounded-2xl placeholder:text-muted-foreground"
                />
              )}

              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="Email"
                required
                className="h-12 w-full border border-border bg-muted px-4 text-sm text-foreground outline-none transition focus:border-foreground focus:bg-card rounded-2xl placeholder:text-muted-foreground"
              />

              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Contraseña"
                  required
                  minLength={6}
                  className="h-12 w-full border border-border bg-muted px-4 pr-12 text-sm text-foreground outline-none transition focus:border-foreground focus:bg-card rounded-2xl placeholder:text-muted-foreground"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
                  <span>⚠️</span>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center gap-2 bg-foreground text-background px-4 text-sm font-semibold rounded-2xl transition hover:opacity-90 disabled:opacity-60"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {isRegister ? "Crear cuenta" : "Entrar"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsRegister((prev) => !prev);
                  setError("");
                  setFullName("");
                  setPassword("");
                }}
                className="text-sm text-muted-foreground underline hover:text-foreground transition-colors"
              >
                {isRegister
                  ? "¿Ya tienes cuenta? Inicia sesión"
                  : "¿No tienes cuenta? Regístrate"}
              </button>
            </div>

            <p className="mt-8 text-center text-xs text-muted-foreground">
              © 2026 easy-CRM
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
