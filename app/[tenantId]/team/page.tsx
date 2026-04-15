"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import { useAuthStore } from "@/lib/store";
import { team as teamApi, type TeamMember, ApiError } from "@/lib/api";
import { useRole } from "@/lib/hooks/useRole";
import {
  Plus,
  Users2,
  Mail,
  X,
  Loader2,
  Trash2,
  ShieldCheck,
  Clock,
  BadgeCheck,
  ArrowRight,
  Inbox,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  UserPlus,
} from "lucide-react";

const ROLE_MAP: Record<
  string,
  {
    label: string;
    softColor: string;
  }
> = {
  owner: {
    label: "Propietario",
    softColor: "bg-foreground text-background border border-foreground",
  },
  admin: {
    label: "Admin",
    softColor: "bg-foreground/90 text-background border border-foreground/90",
  },
  sales: {
    label: "Ventas",
    softColor: "bg-muted text-foreground border border-border/60",
  },
};

const STATUS_MAP: Record<
  string,
  {
    label: string;
    color: string;
  }
> = {
  active: {
    label: "Activo",
    color: "bg-card text-foreground border border-border/60",
  },
  pending: {
    label: "Pendiente",
    color: "bg-card text-muted-foreground border border-border/60",
  },
};

const INVITES_PREVIEW_COUNT = 4;

type RemoveTarget =
  | {
      id: string;
      type: "member";
      name: string;
    }
  | {
      id: string;
      type: "invite";
      email: string;
    };

export default function Page() {
  const router = useRouter();
  const { currentTenant } = useAuthStore();
  const { canInvite, canEdit } = useRole();

  const [allMembers, setAllMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [showAllPending, setShowAllPending] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<RemoveTarget | null>(null);
  const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!currentTenant) return;

    setLoading(true);
    teamApi
      .list(currentTenant.id)
      .then((r) => setAllMembers(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [currentTenant]);

  useEffect(() => {
    load();
  }, [load]);

  const activeMembers = useMemo(
    () => allMembers.filter((m) => m.status === "active"),
    [allMembers]
  );

  const pendingInvites = useMemo(
    () => allMembers.filter((m) => m.status === "pending"),
    [allMembers]
  );

  const ownersCount = useMemo(
    () => activeMembers.filter((m) => m.role === "owner").length,
    [activeMembers]
  );

  const adminsCount = useMemo(
    () => activeMembers.filter((m) => m.role === "admin").length,
    [activeMembers]
  );

  const hasMorePendingThanPreview =
    pendingInvites.length > INVITES_PREVIEW_COUNT;

  const visiblePendingInvites = showAllPending
    ? pendingInvites
    : pendingInvites.slice(0, INVITES_PREVIEW_COUNT);

  const handleConfirmRemove = async () => {
    if (!currentTenant || !removeTarget) return;

    try {
      setRemovingId(removeTarget.id);
      await teamApi.remove(currentTenant.id, removeTarget.id);
      setRemoveTarget(null);
      load();
    } catch {
      setRemoveTarget(null);
    } finally {
      setRemovingId(null);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    if (!currentTenant) return;
    try {
      setUpdatingRoleId(memberId);
      await teamApi.updateRole(currentTenant.id, memberId, newRole);
      load();
    } catch {
      // silently fail
    } finally {
      setUpdatingRoleId(null);
    }
  };

  const goToReceivedInvitations = () => {
    router.push("/home/invitaciones");
  };

  return (
    <>
      <Header title="Equipo" />

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="animate-spin text-muted-foreground" size={24} />
          </div>
        ) : (
          <div className="mx-auto max-w-7xl space-y-8">
            <section className="relative overflow-hidden rounded-[32px] border border-border/60 bg-card shadow-sm">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,0,0,0.05),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(0,0,0,0.04),transparent_28%)]" />
              <div className="relative grid gap-6 p-6 sm:p-7 xl:grid-cols-[minmax(0,1.25fr)_520px] xl:items-end">
                <div>
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background px-3 py-1.5 text-[11px] font-medium text-muted-foreground shadow-sm">
                    <Sparkles size={12} />
                    Gestión de equipo
                  </div>

                  <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    Administra miembros, accesos e invitaciones
                  </h1>

                  <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-[15px]">
                    Controla quién forma parte de la organización, supervisa las
                    invitaciones enviadas y gestiona el acceso del equipo.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <PremiumStatCard
                    label="Miembros"
                    value={activeMembers.length}
                    icon={<Users2 size={16} />}
                  />
                  <PremiumStatCard
                    label="Pendientes"
                    value={pendingInvites.length}
                    icon={<Mail size={16} />}
                  />
                  <PremiumStatCard
                    label="Owners"
                    value={ownersCount}
                    icon={<ShieldCheck size={16} />}
                  />
                  <PremiumStatCard
                    label="Admins"
                    value={adminsCount}
                    icon={<BadgeCheck size={16} />}
                  />
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1.5fr)_390px]">
              <section className="space-y-4">
                <div className="rounded-[28px] border border-border/60 bg-card p-5 shadow-sm sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Equipo activo
                      </p>
                      <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
                        Miembros ({activeMembers.length})
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Usuarios con acceso activo dentro de esta organización.
                      </p>
                    </div>

                    {canInvite && (
                      <button
                        onClick={() => setShowInvite(true)}
                        className="inline-flex items-center gap-2 self-start rounded-2xl bg-foreground px-4 py-2.5 text-xs font-semibold text-background shadow-sm transition-all hover:-translate-y-0.5 hover:bg-foreground/90 hover:shadow-md sm:self-auto"
                        type="button"
                      >
                        <Plus size={14} />
                        Invitar miembro
                      </button>
                    )}
                  </div>
                </div>

                {activeMembers.length === 0 ? (
                  <EmptyState
                    icon={<Users2 size={22} className="text-muted-foreground" />}
                    title="Aún no hay miembros en el equipo"
                    description="Cuando invites usuarios o se incorporen a la organización, aparecerán aquí con su rol y su estado actual."
                    actionLabel={canInvite ? "Invitar miembro" : undefined}
                    onAction={canInvite ? () => setShowInvite(true) : undefined}
                  />
                ) : (
                  <div className="space-y-4">
                    {activeMembers.map((member) => {
                      const role = ROLE_MAP[member.role] || ROLE_MAP.sales;
                      const status =
                        STATUS_MAP[member.status] || STATUS_MAP.active;
                      const canRemoveMember = member.role !== "owner";

                      return (
                        <article
                          key={member.id}
                          className="group relative overflow-hidden rounded-[28px] border border-border/60 bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-foreground/15 hover:shadow-md sm:p-6"
                        >
                          <div className="absolute inset-y-0 left-0 w-1 bg-foreground/80 opacity-0 transition-opacity group-hover:opacity-100" />

                          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                            <PremiumAvatar
                              name={member.profile?.full_name || "Usuario"}
                            />

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                <div className="min-w-0">
                                  <p className="truncate text-base font-semibold tracking-tight text-foreground">
                                    {member.profile?.full_name || "Usuario"}
                                  </p>
                                  <p className="mt-1 truncate text-sm text-muted-foreground">
                                    {member.profile?.email ||
                                      member.invited_email ||
                                      "—"}
                                  </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                  <span
                                    className={`inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-semibold ${role.softColor}`}
                                  >
                                    {role.label}
                                  </span>
                                  <span
                                    className={`inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-semibold ${status.color}`}
                                  >
                                    {status.label}
                                  </span>
                                </div>
                              </div>

                              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="inline-flex items-center gap-2 rounded-full bg-muted/70 px-3 py-1.5 text-[11px] text-muted-foreground">
                                  <ShieldCheck size={13} />
                                  Miembro con acceso habilitado en la organización
                                </div>

                                <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                                  {/* Selector de rol: solo admin+owner, no en el propio owner */}
                                  {canEdit && member.role !== "owner" && (
                                    <div className="relative flex items-center gap-1.5">
                                      {updatingRoleId === member.id && (
                                        <Loader2 size={12} className="animate-spin text-muted-foreground" />
                                      )}
                                      <select
                                        value={member.role}
                                        disabled={updatingRoleId === member.id}
                                        onChange={(e) => handleRoleChange(member.id, e.target.value)}
                                        className="rounded-2xl border border-border bg-card px-3 py-2 text-[11px] font-semibold text-foreground transition-all hover:border-foreground/20 focus:border-foreground/40 focus:outline-none disabled:opacity-50"
                                        aria-label="Cambiar rol"
                                      >
                                        <option value="sales">Ventas</option>
                                        <option value="admin">Admin</option>
                                      </select>
                                    </div>
                                  )}

                                  {canEdit && canRemoveMember ? (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setRemoveTarget({
                                          id: member.id,
                                          type: "member",
                                          name:
                                            member.profile?.full_name || "Usuario",
                                        })
                                      }
                                      disabled={removingId === member.id}
                                      className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2 text-[11px] font-semibold text-muted-foreground transition-all hover:border-foreground/20 hover:bg-muted hover:text-foreground disabled:opacity-50"
                                      title="Quitar acceso"
                                      aria-label="Quitar acceso"
                                    >
                                      {removingId === member.id ? (
                                        <Loader2 size={13} className="animate-spin" />
                                      ) : (
                                        <Trash2 size={13} />
                                      )}
                                      Quitar acceso
                                    </button>
                                  ) : member.role === "owner" ? (
                                    <span className="inline-flex items-center rounded-full bg-muted px-3 py-1.5 text-[11px] font-medium text-muted-foreground">
                                      Acceso protegido
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>

              <aside className="space-y-5">
                <section className="overflow-hidden rounded-[28px] border border-border/60 bg-card shadow-sm">
                  <div className="border-b border-border/50 p-5 sm:p-6">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Invitaciones enviadas
                    </p>
                    <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
                      Pendientes ({pendingInvites.length})
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      
                    </p>
                  </div>

                  <div className="p-4 sm:p-5">
                    {pendingInvites.length === 0 ? (
                      <EmptyState
                        compact
                        icon={<Mail size={20} className="text-muted-foreground" />}
                        title="No hay invitaciones enviadas pendientes"
                        description="Cuando invites a nuevos usuarios, podrás seguir aquí su estado."
                      />
                    ) : (
                      <>
                        <div
                          className={`space-y-3 ${
                            showAllPending && pendingInvites.length > 3
                              ? "max-h-[360px] overflow-y-auto pr-1"
                              : ""
                          }`}
                        >
                          {visiblePendingInvites.map((inv) => {
                            const role = ROLE_MAP[inv.role] || ROLE_MAP.member;
                            const status =
                              STATUS_MAP[inv.status] || STATUS_MAP.pending;

                            return (
                              <article
                                key={inv.id}
                                className="rounded-[24px] border border-dashed border-border/60 bg-background p-4 transition-all hover:border-foreground/15 hover:bg-card hover:shadow-sm"
                              >
                                <div className="flex items-start gap-3">
                                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-card shadow-sm">
                                    <Mail
                                      size={16}
                                      className="text-muted-foreground"
                                    />
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-foreground">
                                      {inv.invited_email || "Invitación pendiente"}
                                    </p>

                                    <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                      <Clock size={12} />
                                      <span>
                                        Enviada el{" "}
                                        {new Date(
                                          inv.created_at
                                        ).toLocaleDateString("es-ES")}
                                      </span>
                                    </div>

                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                      <span
                                        className={`inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-semibold ${role.softColor}`}
                                      >
                                        {role.label}
                                      </span>
                                      <span
                                        className={`inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-semibold ${status.color}`}
                                      >
                                        {status.label}
                                      </span>
                                    </div>
                                  </div>

                                  <button
                                    onClick={() =>
                                      setRemoveTarget({
                                        id: inv.id,
                                        type: "invite",
                                        email:
                                          inv.invited_email || "esta invitación",
                                      })
                                    }
                                    disabled={removingId === inv.id}
                                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-transparent text-muted-foreground transition-all hover:border-border hover:bg-card hover:text-foreground disabled:opacity-50"
                                    aria-label="Cancelar invitación"
                                    title="Cancelar invitación"
                                    type="button"
                                  >
                                    {removingId === inv.id ? (
                                      <Loader2
                                        size={14}
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <Trash2 size={14} />
                                    )}
                                  </button>
                                </div>
                              </article>
                            );
                          })}
                        </div>

                        {hasMorePendingThanPreview && (
                          <div className="pt-4">
                            <button
                              type="button"
                              onClick={() => setShowAllPending((prev) => !prev)}
                              className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition-all hover:border-foreground/20 hover:bg-muted/50"
                            >
                              {showAllPending ? (
                                <>
                                  Ver menos
                                  <ChevronUp size={14} />
                                </>
                              ) : (
                                <>
                                  Ver todas ({pendingInvites.length})
                                  <ChevronDown size={14} />
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </section>

              

                {canInvite && (
                <section className="overflow-hidden rounded-[28px] border border-border/60 bg-foreground text-background shadow-sm">
                
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                        <UserPlus size={18} className="text-background" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-semibold tracking-tight">
                          Añade más personas al equipo
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-background/75">
                          Invita usuarios por correo y asígnales su rol inicial
                          para que empiecen a trabajar dentro del CRM.
                        </p>

                        <button
                          onClick={() => setShowInvite(true)}
                          className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-card px-4 py-2.5 text-xs font-semibold text-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:bg-card/90"
                          type="button"
                        >
                          <Plus size={14} />
                          Invitar miembro
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
                )}
              </aside>
            </div>
          </div>
        )}
      </div>

      {showInvite && currentTenant && (
        <InviteForm
          tenantId={currentTenant.id}
          onClose={() => setShowInvite(false)}
          onCreated={load}
        />
      )}

      {removeTarget && (
        <ConfirmRemoveDialog
          target={removeTarget}
          loading={removingId === removeTarget.id}
          onClose={() => setRemoveTarget(null)}
          onConfirm={handleConfirmRemove}
        />
      )}
    </>
  );
}

function PremiumStatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-[24px] border border-border/60 bg-card/80 p-4 shadow-sm backdrop-blur">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          {label}
        </span>
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          {icon}
        </div>
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight text-foreground">
        {value}
      </p>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  compact = false,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
}) {
  return (
    <div
      className={`rounded-[28px] border border-dashed border-border/60 bg-background text-center shadow-sm ${
        compact ? "p-8" : "p-10 sm:p-12"
      }`}
    >
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-card shadow-sm">
        {icon}
      </div>

      <h3 className="mt-4 text-sm font-semibold text-foreground">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {description}
      </p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-foreground px-4 py-2 text-xs font-semibold text-background shadow-sm transition-all hover:-translate-y-0.5 hover:bg-foreground/90"
          type="button"
        >
          <Plus size={14} />
          {actionLabel}
        </button>
      )}
    </div>
  );
}

function PremiumAvatar({ name }: { name: string }) {
  const initials = name
    .trim()
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-foreground text-sm font-bold text-background shadow-sm">
      <div className="absolute inset-0 rounded-[20px] bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_45%)]" />
      <span className="relative">{initials || "?"}</span>
    </div>
  );
}

function InviteForm({
  tenantId,
  onClose,
  onCreated,
}: {
  tenantId: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("sales");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await teamApi.invite(tenantId, email, role);
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error al invitar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-[30px] border border-border/60 bg-card shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-border/40 bg-background/80 px-6 py-5 backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Nuevo acceso
              </p>
              <h2 className="mt-1 text-lg font-bold tracking-tight text-foreground">
                Invitar miembro
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Envía una invitación por email y asigna el rol inicial.
              </p>
            </div>

            <button
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-2xl text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
              aria-label="Cerrar"
              type="button"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Email *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="correo@ejemplo.com"
              className="w-full rounded-2xl border border-border/60 bg-muted/50 px-4 py-3 text-sm transition-colors placeholder:text-muted-foreground/40 focus:border-foreground/40 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Rol
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-2xl border border-border/60 bg-muted/50 px-4 py-3 text-sm transition-colors focus:border-foreground/40 focus:outline-none"
            >
              <option value="sales">Ventas</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div className="rounded-2xl border border-border/60 bg-background p-4">
            <p className="text-xs font-medium text-foreground">
              Resumen de acceso
            </p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              La invitación se enviará a{" "}
              <span className="font-medium text-foreground">
                {email || "correo@ejemplo.com"}
              </span>{" "}
              con el rol{" "}
              <span className="font-medium text-foreground">
                {(ROLE_MAP[role] || ROLE_MAP.sales).label}
              </span>
              .
            </p>
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
              <p className="text-xs font-medium text-red-600">{error}</p>
            </div>
          ) : null}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl border border-border py-2.5 text-xs font-semibold transition-colors hover:border-foreground/30"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-foreground py-2.5 text-xs font-semibold text-background shadow-sm transition-colors hover:bg-foreground/90 disabled:opacity-50"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              Invitar miembro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ConfirmRemoveDialog({
  target,
  loading,
  onClose,
  onConfirm,
}: {
  target: RemoveTarget;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const isMember = target.type === "member";

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) onClose();
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [loading, onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm"
      onClick={() => {
        if (!loading) onClose();
      }}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-[30px] border border-border/60 bg-card shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4 px-6 py-6">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-muted">
            <AlertTriangle size={18} className="text-foreground" />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              {isMember ? "Quitar acceso" : "Cancelar invitación"}
            </h2>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {isMember ? (
                <>
                  Vas a quitar el acceso de{" "}
                  <span className="font-medium text-foreground">
                    {target.name}
                  </span>{" "}
                  a esta organización.
                </>
              ) : (
                <>
                  Vas a cancelar la invitación enviada a{" "}
                  <span className="font-medium text-foreground">
                    {target.email}
                  </span>
                  .
                </>
              )}
            </p>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {isMember
                ? "Esta acción retirará su acceso actual al CRM."
                : "La persona invitada dejará de ver esta invitación pendiente."}
            </p>
          </div>
        </div>

        <div className="flex gap-3 border-t border-border/40 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-2xl border border-border py-2.5 text-xs font-semibold transition-colors hover:border-foreground/30 disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-foreground py-2.5 text-xs font-semibold text-background shadow-sm transition-colors hover:bg-foreground/90 disabled:opacity-50"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {isMember ? "Quitar acceso" : "Cancelar invitación"}
          </button>
        </div>
      </div>
    </div>
  );
}