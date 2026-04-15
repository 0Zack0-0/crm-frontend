"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Header from "@/components/layout/Header";
import { useAuthStore } from "@/lib/store";
import { settings as settingsApi, type TenantSettings, ApiError } from "@/lib/api";
import {
  Building2,
  CreditCard,
  Users2,
  Check,
  Loader2,
  Save,
  Sparkles,
  AlertTriangle,
  ShieldAlert,
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const params = useParams<{ tenantId: string }>();
  const { currentTenant } = useAuthStore();

  const [data, setData] = useState<TenantSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ── Name editing ── */
  const [orgName, setOrgName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  /* ── Plan change ── */
  const [changingPlan, setChangingPlan] = useState<string | null>(null);
  const [planError, setPlanError] = useState<string | null>(null);

  /* ── Guard: only owners ── */
  useEffect(() => {
    if (currentTenant && currentTenant.role !== "owner") {
      router.replace(`/${params.tenantId}`);
    }
  }, [currentTenant, params.tenantId, router]);

  const fetchSettings = useCallback(async () => {
    if (!currentTenant) return;
    setLoading(true);
    setError(null);
    try {
      const res = await settingsApi.get(currentTenant.id);
      setData(res.data);
      setOrgName(res.data.tenant.name);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Error al cargar configuración");
    } finally {
      setLoading(false);
    }
  }, [currentTenant]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSaveName = async () => {
    if (!currentTenant || !orgName.trim()) return;
    setSavingName(true);
    setNameError(null);
    setNameSaved(false);
    try {
      await settingsApi.updateName(currentTenant.id, orgName.trim());
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 2500);
    } catch (e) {
      setNameError(e instanceof ApiError ? e.message : "Error al guardar");
    } finally {
      setSavingName(false);
    }
  };

  const handleChangePlan = async (planId: string) => {
    if (!currentTenant) return;
    setChangingPlan(planId);
    setPlanError(null);
    try {
      await settingsApi.changePlan(currentTenant.id, planId);
      await fetchSettings();
    } catch (e) {
      setPlanError(e instanceof ApiError ? e.message : "Error al cambiar el plan");
    } finally {
      setChangingPlan(null);
    }
  };

  if (currentTenant?.role !== "owner") return null;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header title="Configuración" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto w-full space-y-6">
        {/* ── Loading ── */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="animate-spin text-muted-foreground" size={28} />
          </div>
        )}

        {/* ── Error ── */}
        {!loading && error && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 flex items-start gap-3">
            <AlertTriangle size={18} className="text-destructive mt-0.5 shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* ── Content ── */}
        {!loading && data && (
          <>
            {/* ── Org name ── */}
            <section className="rounded-3xl border border-border/50 bg-card p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-foreground flex items-center justify-center shrink-0">
                  <Building2 size={16} className="text-background" />
                </div>
                <div>
                  <h2 className="font-semibold text-sm">Organización</h2>
                  <p className="text-xs text-muted-foreground">
                    Nombre visible para todos los miembros
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                  className="flex-1 h-10 rounded-xl border border-border/50 bg-muted/50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all"
                  placeholder="Nombre de la organización"
                />
                <button
                  onClick={handleSaveName}
                  disabled={savingName || orgName.trim() === data.tenant.name}
                  className="h-10 px-4 rounded-xl bg-foreground text-background text-sm font-medium flex items-center gap-2 hover:bg-foreground/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {savingName ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : nameSaved ? (
                    <Check size={14} />
                  ) : (
                    <Save size={14} />
                  )}
                  {nameSaved ? "Guardado" : "Guardar"}
                </button>
              </div>

              {nameError && (
                <p className="text-xs text-destructive flex items-center gap-1.5">
                  <AlertTriangle size={12} />
                  {nameError}
                </p>
              )}

              <p className="text-xs text-muted-foreground">
                Slug:{" "}
                <span className="font-mono bg-muted px-1.5 py-0.5 rounded-md">
                  {data.tenant.slug}
                </span>
              </p>
            </section>

            {/* ── Current plan ── */}
            <section className="rounded-3xl border border-border/50 bg-card p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-foreground flex items-center justify-center shrink-0">
                  <CreditCard size={16} className="text-background" />
                </div>
                <div>
                  <h2 className="font-semibold text-sm">Plan actual</h2>
                  <p className="text-xs text-muted-foreground">
                    Gestiona tu suscripción
                  </p>
                </div>
              </div>

              {data.subscription ? (
                <div className="rounded-2xl border border-border/50 bg-muted/30 p-4 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-sm">
                      {data.subscription.plan?.name ?? "Plan activo"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Estado:{" "}
                      <span className="capitalize font-medium text-foreground">
                        {data.subscription.status}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-foreground text-background text-xs font-medium">
                    <Sparkles size={12} />
                    Activo
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Sin suscripción activa.</p>
              )}

              {/* Members usage */}
              <div className="flex items-center gap-3 text-sm">
                <Users2 size={15} className="text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">
                  Miembros:{" "}
                  <span className="font-semibold text-foreground">
                    {data.memberCount}
                  </span>
                  {data.subscription?.plan?.max_users && (
                    <span className="text-muted-foreground">
                      {" "}
                      / {data.subscription.plan.max_users} máx.
                    </span>
                  )}
                </span>
              </div>
            </section>

            {/* ── Available plans ── */}
            {data.plans.length > 0 && (
              <section className="rounded-3xl border border-border/50 bg-card p-6 shadow-sm space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-foreground flex items-center justify-center shrink-0">
                    <Sparkles size={16} className="text-background" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-sm">Planes disponibles</h2>
                    <p className="text-xs text-muted-foreground">
                      Cambia tu plan en cualquier momento
                    </p>
                  </div>
                </div>

                {planError && (
                  <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-3 flex items-start gap-2">
                    <AlertTriangle size={14} className="text-destructive mt-0.5 shrink-0" />
                    <p className="text-xs text-destructive">{planError}</p>
                  </div>
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                  {data.plans.map((plan) => {
                    const isCurrent = data.subscription?.plan?.id === plan.id;
                    const isChanging = changingPlan === plan.id;
                    // Bloquear si el número actual de miembros supera el límite del plan
                    const exceedsUsers = data.memberCount > plan.max_users;
                    const canActivate = !isCurrent && !exceedsUsers;
                    return (
                      <div
                        key={plan.id}
                        className={`rounded-2xl border p-4 flex flex-col gap-3 transition-all ${
                          isCurrent
                            ? "border-foreground bg-foreground/5"
                            : exceedsUsers
                            ? "border-border/40 bg-muted/10 opacity-60"
                            : "border-border/50 bg-muted/20 hover:border-foreground/30"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-sm">{plan.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Hasta {plan.max_users} usuario{plan.max_users !== 1 ? "s" : ""}
                              {plan.max_contacts != null && ` · ${plan.max_contacts} contactos`}
                            </p>
                          </div>
                          <p className="text-sm font-bold shrink-0">
                            {plan.price === 0 ? (
                              <span className="text-muted-foreground">Gratis</span>
                            ) : (
                              `€${plan.price}/mes`
                            )}
                          </p>
                        </div>

                        {exceedsUsers && !isCurrent && (
                          <p className="text-[11px] text-destructive flex items-start gap-1.5">
                            <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                            Tienes {data.memberCount} miembro{data.memberCount !== 1 ? "s" : ""} activo{data.memberCount !== 1 ? "s" : ""}. Reduce el equipo a {plan.max_users} antes de cambiar a este plan.
                          </p>
                        )}

                        {isCurrent ? (
                          <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                            <Check size={13} />
                            Plan actual
                          </div>
                        ) : (
                          <button
                            onClick={() => canActivate && handleChangePlan(plan.id)}
                            disabled={!!changingPlan || !canActivate}
                            title={exceedsUsers ? `Necesitas reducir el equipo a ${plan.max_users} miembros` : undefined}
                            className="h-8 rounded-xl bg-foreground text-background text-xs font-medium flex items-center justify-center gap-2 hover:bg-foreground/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                          >
                            {isChanging ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : null}
                            {isChanging ? "Cambiando..." : "Activar plan"}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ── Danger zone ── */}
            <section className="rounded-3xl border border-destructive/30 bg-card p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                  <ShieldAlert size={16} className="text-destructive" />
                </div>
                <div>
                  <h2 className="font-semibold text-sm text-destructive">Zona peligrosa</h2>
                  <p className="text-xs text-muted-foreground">
                    Acciones irreversibles
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Para eliminar la organización o transferir la propiedad, contacta
                con el soporte de la plataforma.
              </p>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
