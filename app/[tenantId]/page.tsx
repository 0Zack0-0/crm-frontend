"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store";
import {
  dashboard as dashboardApi,
  type DashboardMetrics,
} from "@/lib/api";
import Header from "@/components/layout/Header";
import {
  DollarSign,
  Building2,
  Users,
  Briefcase,
  Activity,
  Clock,
  ArrowUpRight,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Placeholder chart data
const chartData = [
  { name: "ENE", value: 4000, expenses: 2400 },
  { name: "FEB", value: 3000, expenses: 1398 },
  { name: "MAR", value: 5000, expenses: 3800 },
  { name: "ABR", value: 2780, expenses: 3908 },
  { name: "MAY", value: 1890, expenses: 4800 },
  { name: "JUN", value: 4390, expenses: 3200 },
];

export default function DashboardPage() {
  const { currentTenant } = useAuthStore();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  useEffect(() => {
    if (!currentTenant) return;

    dashboardApi
      .metrics(currentTenant.id)
      .then((r) => setMetrics(r.data))
      .catch(() => { });
  }, [currentTenant]);

  const tenantSlug = currentTenant?.slug;

  const winRate =
    metrics && metrics.total_deals > 0
      ? `${((metrics.deals_won / metrics.total_deals) * 100).toFixed(0)}%`
      : "—";

  return (
    <>
      <Header title="Dashboard" />

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-6 sm:space-y-8">
          <section className="relative overflow-hidden rounded-4xl border border-border/50 bg-card p-5 shadow-sm sm:p-6 lg:p-8">
            <div className="absolute inset-0 bg-gradient-to-br from-black/[0.02] via-transparent to-black/[0.04]" />
            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Vista general
                </p>
                <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                  {currentTenant?.name
                    ? `Resumen de ${currentTenant.name}`
                    : "Resumen del CRM"}
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                  Consulta rápidamente el estado del pipeline, tus empresas,
                  contactos, deals y la actividad más reciente de la
                  organización.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
                <QuickLink
                  href={tenantSlug ? `/${tenantSlug}/companies` : undefined}
                  label="Empresas"
                />
                <QuickLink
                  href={tenantSlug ? `/${tenantSlug}/contacts` : undefined}
                  label="Contactos"
                />
                <QuickLink
                  href={tenantSlug ? `/${tenantSlug}/deals` : undefined}
                  label="Deals"
                />
                <QuickLink
                  href={tenantSlug ? `/${tenantSlug}/pipeline` : undefined}
                  label="Pipeline"
                />
              </div>

            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4">
            <MetricCard
              title="Pipeline Total"
              value={`€${((metrics?.pipeline_value ?? 0) / 1000).toFixed(0)}k`}
              change="Ver pipeline"
              icon={DollarSign}
              href={tenantSlug ? `/${tenantSlug}/pipeline` : undefined}
            />
            <MetricCard
              title="Empresas"
              value={String(metrics?.total_companies ?? 0)}
              change="Ver empresas"
              icon={Building2}
              href={tenantSlug ? `/${tenantSlug}/companies` : undefined}
            />
            <MetricCard
              title="Contactos"
              value={String(metrics?.total_contacts ?? 0)}
              change="Ver contactos"
              icon={Users}
              href={tenantSlug ? `/${tenantSlug}/contacts` : undefined}
            />
            <MetricCard
              title="Deals Abiertos"
              value={String(metrics?.deals_open ?? 0)}
              change="Ver deals"
              icon={Briefcase}
              href={tenantSlug ? `/${tenantSlug}/deals` : undefined}
            />
          </section>

          <section className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-4xl border border-border/50 bg-card p-4 shadow-sm sm:p-6">
              <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    <TrendingUp size={12} />
                    Rendimiento
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-muted-foreground">
                    Ingresos vs Gastos
                  </h3>
                  <p className="mt-1 text-xl font-bold tracking-tight sm:text-3xl">
                    €{((metrics?.pipeline_value ?? 0) / 1000).toFixed(0)}k
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Valor acumulado del pipeline mostrado como referencia visual.
                  </p>
                </div>

                <div className="flex items-center gap-4 text-[10px] font-semibold sm:text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-foreground" />
                    <span>INGRESOS</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-muted" />
                    <span>GASTOS</span>
                  </div>
                </div>
              </div>

              <div className="h-[260px] w-full min-w-0 sm:h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#000" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#000" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f0f0f0"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fontWeight: 600, fill: "#999" }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fontWeight: 600, fill: "#999" }}
                      tickFormatter={(v) => `€${v / 1000}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0a0a0a",
                        border: "none",
                        borderRadius: "16px",
                        color: "#fff",
                        fontSize: "11px",
                        fontWeight: "500",
                        padding: "8px 14px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#000"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorVal)"
                    />
                    <Area
                      type="monotone"
                      dataKey="expenses"
                      stroke="#ccc"
                      strokeWidth={2}
                      fill="transparent"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-4xl border border-border/50 bg-card p-4 shadow-sm sm:p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Resumen de Deals
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Estado general del embudo comercial.
                  </p>
                </div>

                {tenantSlug && (
                  <Link
                    href={`/${tenantSlug}/deals`}
                    className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-[11px] font-semibold text-foreground hover:bg-muted"
                  >
                    Ver más
                    <ChevronRight size={14} />
                  </Link>
                )}
              </div>

              <div className="space-y-5">
                <StatItem
                  label="Abiertos"
                  value={metrics?.deals_open ?? 0}
                  color="bg-foreground"
                />
                <StatItem
                  label="Ganados"
                  value={metrics?.deals_won ?? 0}
                  color="bg-emerald-500"
                />
                <StatItem
                  label="Perdidos"
                  value={metrics?.deals_lost ?? 0}
                  color="bg-red-500"
                />
                <StatItem
                  label="Total Deals"
                  value={metrics?.total_deals ?? 0}
                  color="bg-muted"
                />
              </div>

              <div className="mt-8 rounded-3xl border border-border/50 bg-muted/50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    Win Rate
                  </span>
                  <span className="text-2xl font-bold tracking-tight">
                    {winRate}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-4xl border border-border/50 bg-card p-4 shadow-sm sm:p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Actividad Reciente
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Últimos movimientos registrados en la organización.
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
                <Clock size={14} />
                Reciente
              </div>
            </div>

            <div className="space-y-3">
              {metrics?.recent_activities && metrics.recent_activities.length > 0 ? (
                metrics.recent_activities.slice(0, 5).map((a) => (
                  <div
                    key={a.id}
                    className="flex items-start gap-4 rounded-3xl border border-border/40 p-4 transition-colors hover:bg-muted/40"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-muted">
                      <Activity size={16} className="text-foreground" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {a.title || a.type}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(a.created_at).toLocaleDateString("es-ES")} •{" "}
                        {a.type}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-border bg-muted/30 p-6">
                  <p className="text-sm text-muted-foreground">
                    No hay actividad reciente. Crea empresas, contactos y deals
                    para empezar.
                  </p>
                </div>
              )}
            </div>
          </section>

        </div>
      </div>
    </>
  );
}

function QuickLink({
  href,
  label,
}: {
  href?: string;
  label: string;
}) {
  if (!href) {
    return (
      <div className="inline-flex items-center justify-center rounded-2xl border border-border bg-muted/40 px-4 py-3 text-sm font-medium text-muted-foreground">
        {label}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-2xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:bg-muted"
    >
      {label}
    </Link>
  );
}

function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  href,
}: {
  title: string;
  value: string;
  change: string;
  icon: React.ElementType;
  href?: string;
}) {
  const content = (
    <div className="group h-full rounded-4xl border border-border/50 bg-card p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-foreground/15 hover:shadow-md sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="rounded-2xl bg-muted p-3 transition-colors group-hover:bg-foreground group-hover:text-background">
          <Icon size={18} />
        </div>

        <div className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-foreground">
          <ArrowUpRight size={13} />
          <span>{change}</span>
        </div>
      </div>

      <h3 className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
        {title}
      </h3>
      <p className="text-2xl font-bold tracking-tight sm:text-3xl">{value}</p>
    </div>
  );

  if (!href) return content;

  return (
    <Link href={href} className="block h-full">
      {content}
    </Link>
  );
}

function StatItem({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border/40 p-3">
      <div className="flex items-center gap-2">
        <div className={cn("h-2.5 w-2.5 rounded-full", color)} />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className="text-base font-bold">{value}</span>
    </div>
  );
}
