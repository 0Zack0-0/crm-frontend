"use client";

import { useState } from "react";
import Link from "next/link";
import {
    ApiError,
    tenants as tenantsApi,
    type Invitation,
    type Plan,
    type Tenant,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import {
    ArrowRight,
    Building2,
    CalendarDays,
    Check,
    ChevronRight,
    Crown,
    Loader2,
    Mail,
    Plus,
    ShieldCheck,
    Sparkles,
    User,
    Users,
    X,
} from "lucide-react";

export function HomeHero({
    title,
    description,
    stats,
}: {
    title: string;
    description: string;
    stats: Array<{
        icon: React.ReactNode;
        label: string;
        value: string;
    }>;
}) {
    return (
        <section className="relative overflow-hidden rounded-[28px] border border-border bg-card shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,0,0,0.04),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(0,0,0,0.03),transparent_30%)]" />
            <div className="relative px-6 py-8 sm:px-8 sm:py-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground mb-3">
                        Workspace home
                    </p>
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                        {title}
                    </h1>
                    <p className="text-sm sm:text-base text-muted-foreground mt-3 max-w-2xl">
                        {description}
                    </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full lg:w-auto lg:min-w-[360px]">
                    {stats.map((stat) => (
                        <MiniStat
                            key={stat.label}
                            icon={stat.icon}
                            label={stat.label}
                            value={stat.value}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

export function MiniStat({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-2xl border border-border bg-card/80 px-4 py-3 shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <div className="w-4 h-4 flex items-center justify-center shrink-0">
                    {icon}
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.15em]">
                    {label}
                </span>
            </div>
            <p className="text-lg font-bold tracking-tight">{value}</p>
        </div>
    );
}

export function HomeNavCard({
    href,
    icon,
    eyebrow,
    title,
    description,
    badge,
}: {
    href: string;
    icon: React.ReactNode;
    eyebrow: string;
    title: string;
    description: string;
    badge?: string;
}) {
    return (
        <Link
            href={href}
            className="group block rounded-[26px] border border-border bg-card p-5 shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(0,0,0,0.06)]"
        >
            <div className="flex items-start justify-between gap-3 mb-5">
                <div className="w-11 h-11 rounded-2xl bg-foreground text-background flex items-center justify-center shadow-sm">
                    {icon}
                </div>

                <div className="flex items-center gap-2">
                    {badge ? (
                        <span className="inline-flex min-w-6 h-6 items-center justify-center rounded-full bg-foreground text-background px-2 text-[10px] font-bold">
                            {badge}
                        </span>
                    ) : null}
                    <div className="w-8 h-8 rounded-full border border-border bg-card flex items-center justify-center text-muted-foreground group-hover:bg-foreground group-hover:text-background transition-colors">
                        <ChevronRight size={14} />
                    </div>
                </div>
            </div>

            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-2">
                {eyebrow}
            </p>
            <h3 className="text-base font-bold tracking-tight">{title}</h3>
            <p className="text-sm text-muted-foreground mt-2 leading-6">
                {description}
            </p>
        </Link>
    );
}

export function ProfileCard({
    fullName,
    email,
    createdAt,
    tenantsCount,
    currentTenantName,
    currentRole,
    planName,
}: {
    fullName: string;
    email: string;
    createdAt: string;
    tenantsCount: number;
    currentTenantName?: string;
    currentRole?: string;
    planName?: string;
}) {
    const initials = fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <section className="rounded-[28px] border border-border bg-card p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-2 text-muted-foreground mb-5">
                <User size={15} />
                <span className="text-xs font-semibold uppercase tracking-[0.18em]">
                    Mi perfil
                </span>
            </div>

            <div className="rounded-[24px] bg-[linear-gradient(135deg,#111111_0%,#2a2a2a_100%)] p-5 text-white mb-5 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-sm font-bold">
                        {initials}
                    </div>
                    <div className="min-w-0">
                        <p className="text-base font-bold tracking-tight truncate">
                            {fullName}
                        </p>
                        <p className="text-sm text-white/70 truncate">{email}</p>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <ProfileRow
                    icon={<Users size={15} className="text-muted-foreground" />}
                    title="Organizaciones"
                    value={`${tenantsCount} organización${tenantsCount !== 1 ? "es" : ""}`}
                />
                <ProfileRow
                    icon={<Mail size={15} className="text-muted-foreground" />}
                    title="Correo de acceso"
                    value={email}
                />
                <ProfileRow
                    icon={<CalendarDays size={15} className="text-muted-foreground" />}
                    title="Miembro desde"
                    value={new Date(createdAt).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                    })}
                />
            </div>

            <div className="mt-5 rounded-2xl border border-dashed border-border bg-foreground/[0.02] p-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="rounded-2xl border border-border bg-card px-4 py-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-1">
                            Plan actual
                        </p>
                        <p className="text-sm font-semibold truncate">{planName || "—"}</p>
                    </div>

                    <div className="rounded-2xl border border-border bg-card px-4 py-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-1">
                            Organización actual
                        </p>
                        <p className="text-sm font-semibold truncate">
                            {currentTenantName || "—"}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-border bg-card px-4 py-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-1">
                            Rol actual
                        </p>
                        <p className="text-sm font-semibold truncate">
                            {formatRoleLabel(currentRole)}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

export function ProfileRow({
    icon,
    title,
    value,
}: {
    icon: React.ReactNode;
    title: string;
    value: string;
}) {
    return (
        <div className="flex items-start gap-3 rounded-2xl border border-border bg-gradient-to-b from-card to-muted px-4 py-3">
            <div className="mt-0.5">{icon}</div>
            <div className="min-w-0">
                <p className="text-sm font-medium">{title}</p>
                <p className="text-sm text-muted-foreground break-all">{value}</p>
            </div>
        </div>
    );
}

function formatRoleLabel(role?: string) {
    switch ((role || "").toLowerCase()) {
        case "owner":
            return "Propietario";
        case "admin":
            return "Administrador";
        case "member":
            return "Miembro";
        default:
            return "—";
    }
}

export function SectionHeader({
    eyebrow,
    title,
    description,
    action,
}: {
    eyebrow: string;
    title: string;
    description: string;
    action?: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
            <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground mb-2">
                    {eyebrow}
                </p>
                <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
                <p className="text-sm text-muted-foreground mt-2">{description}</p>
            </div>
            {action}
        </div>
    );
}

export function EmptyOrganizationsState({
    onCreate,
}: {
    onCreate: () => void;
}) {
    return (
        <div className="rounded-[26px] border border-dashed border-border bg-gradient-to-b from-muted to-muted/80 p-10 sm:p-12 text-center">
            <div className="w-16 h-16 bg-card rounded-full border border-border flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Building2 size={28} className="text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold tracking-tight mb-1">
                Sin organizaciones
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
                Crea tu primera organización seleccionando un plan para empezar a usar
                el CRM.
            </p>
            <button
                onClick={onCreate}
                className="bg-foreground text-background px-6 py-2.5 rounded-2xl text-sm font-semibold hover:bg-foreground/90 transition-colors shadow-md"
            >
                Crear organización
            </button>
        </div>
    );
}

function getRoleMeta(role?: string) {
    switch ((role || "").toLowerCase()) {
        case "owner":
            return {
                label: "Propietario",
                icon: <Crown size={12} strokeWidth={2.2} />,
                className:
                    "bg-neutral-500 text-white border border-neutral-800",
            };
        case "admin":
            return {
                label: "Administrador",
                icon: <ShieldCheck size={12} strokeWidth={2.2} />,
                className:
                    "bg-neutral-300 text-neutral border border-neutral-500",
            };
        default:
            return {
                label: "Miembro",
                icon: <User size={12} strokeWidth={2.2} />,
                className:
                    "bg-neutral-100 text-neutral-800 border border-neutral-500",
            };
    }
}

export function RoleBadge({ role }: { role?: string }) {
    const meta = getRoleMeta(role);

    return (
        <div
            className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] shadow-sm",
                meta.className
            )}
            title={meta.label}
        >
            {meta.icon}
            <span>{meta.label}</span>
        </div>
    );
}

export function OrgCard({
    tenant,
    onEnter,
}: {
    tenant: Tenant;
    onEnter: () => void;
}) {
    return (
        <div className="group min-h-[210px] rounded-[26px] border border-border bg-gradient-to-b from-card to-muted p-5 shadow-[0_8px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_14px_30px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all flex flex-col">
            <div className="flex items-start justify-between gap-3 mb-5">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 bg-foreground text-background rounded-2xl flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                        {tenant.name[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-sm font-bold tracking-tight truncate">
                            {tenant.name}
                        </h3>
                        <p className="text-[11px] text-muted-foreground mt-1 truncate">
                            ID: {tenant.slug.split("-").pop()}
                        </p>
                    </div>
                </div>

                <RoleBadge role={tenant.role} />
            </div>

            <div className="space-y-2 mb-5">
                {tenant.joined_at && (
                    <p className="text-[11px] text-muted-foreground/80">
                        Miembro desde{" "}
                        {new Date(tenant.joined_at).toLocaleDateString("es-ES", {
                            year: "numeric",
                            month: "short",
                        })}
                    </p>
                )}
            </div>

            <div className="mt-auto">
                <button
                    onClick={onEnter}
                    className="w-full flex items-center justify-center gap-2 bg-foreground text-background py-2.5 rounded-2xl text-xs font-semibold hover:bg-foreground/90 transition-colors shadow-sm"
                >
                    Entrar
                    <ArrowRight size={14} />
                </button>
            </div>
        </div>
    );
}

export function AddOrganizationCard({
    onCreate,
}: {
    onCreate: () => void;
}) {
    return (
        <button
            onClick={onCreate}
            className="group min-h-[210px] rounded-[26px] border-2 border-dashed border-border bg-background p-8 flex flex-col items-center justify-center hover:border-foreground/20 hover:bg-card transition-all"
        >
            <div className="w-14 h-14 rounded-full bg-card border border-border flex items-center justify-center mb-4 group-hover:bg-foreground group-hover:text-background transition-colors shadow-sm">
                <Plus size={24} />
            </div>
            <p className="text-sm font-semibold">Añadir organización</p>
            <p className="text-xs text-muted-foreground mt-1">
                Crea un nuevo espacio de trabajo
            </p>
        </button>
    );
}

type NormalizedInvitation = Invitation & {
    tenant?: { id: string; name: string };
};

export function EmptyInvitationsState() {
    return (
        <div className="rounded-[24px] border border-dashed border-border bg-gradient-to-b from-muted to-muted/80 p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Mail size={18} className="text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold">No hay invitaciones pendientes</p>
            <p className="text-xs text-muted-foreground mt-2">
                Cuando otra organización te invite, aparecerá aquí para que puedas
                aceptarla o rechazarla.
            </p>
        </div>
    );
}

export function InvitationCard({
    invitation,
    onAccept,
    onReject,
    loadingAction,
}: {
    invitation: NormalizedInvitation;
    onAccept: (id: string) => void;
    onReject: (id: string) => void;
    loadingAction?: "accept" | "reject" | null;
}) {
    return (
        <div className="rounded-[24px] border border-amber-200 bg-[linear-gradient(180deg,rgba(255,251,235,0.9)_0%,rgba(255,247,222,0.9)_100%)] p-4 shadow-sm">
            <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-card border border-amber-200 flex items-center justify-center shrink-0 shadow-sm">
                    <Mail size={16} className="text-amber-600" />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <p className="text-sm font-semibold">
                            {invitation.tenant?.name || "Organización"}
                        </p>
                        <RoleBadge role={invitation.role} />
                    </div>

                    <p className="text-xs text-muted-foreground mt-2">
                        Recibida el{" "}
                        {new Date(invitation.created_at).toLocaleDateString("es-ES", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        })}
                    </p>

                    <div className="flex items-center gap-2 mt-4">
                        <button
                            onClick={() => onAccept(invitation.id)}
                            disabled={loadingAction !== null}
                            className="bg-foreground text-background px-4 py-2 rounded-2xl text-xs font-semibold hover:bg-foreground/90 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                        >
                            {loadingAction === "accept" && (
                                <Loader2 size={12} className="animate-spin" />
                            )}
                            Aceptar
                        </button>
                        <button
                            onClick={() => onReject(invitation.id)}
                            disabled={loadingAction !== null}
                            className="border border-border bg-card px-4 py-2 rounded-2xl text-xs font-semibold hover:border-red-300 hover:text-red-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {loadingAction === "reject" && (
                                <Loader2 size={12} className="animate-spin" />
                            )}
                            Rechazar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function CreateOrgModal({
    plans,
    onClose,
    onCreated,
}: {
    plans: Plan[];
    onClose: () => void;
    onCreated: (tenant: Tenant) => void;
}) {
    const [step, setStep] = useState<1 | 2>(1);
    const [selectedPlan, setSelectedPlan] = useState("");
    const [orgName, setOrgName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const selectedPlanData = plans.find((p) => p.id === selectedPlan);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPlan || !orgName.trim()) return;
        setLoading(true);
        setError("");

        try {
            const res = await tenantsApi.create(orgName.trim(), selectedPlan);
            onCreated({
                id: res.data.tenant.id,
                name: res.data.tenant.name,
                slug: res.data.tenant.slug,
                role: "owner",
            });
        } catch (err) {
            setError(
                err instanceof ApiError ? err.message : "Error al crear la organización"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-[28px] shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card z-10 rounded-t-[28px]">
                    <div>
                        <h2 className="text-sm font-bold">
                            {step === 1 ? "Selecciona un plan" : "Nombre de la organización"}
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {step === 1
                                ? "Primero elige el plan para tu nueva organización"
                                : `Plan seleccionado: ${selectedPlanData?.name}`}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground transition-colors p-1"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="flex items-center justify-center gap-3 py-4 border-b border-border">
                    <StepDot number={1} active={step >= 1} done={step > 1} label="Plan" />
                    <div className="w-12 h-px bg-black/10" />
                    <StepDot number={2} active={step >= 2} done={false} label="Nombre" />
                </div>

                {step === 1 && (
                    <div className="p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {plans.map((plan) => (
                                <button
                                    key={plan.id}
                                    onClick={() => setSelectedPlan(plan.id)}
                                    className={cn(
                                        "bg-card border rounded-2xl p-5 text-left transition-all hover:border-foreground/20 hover:shadow-sm",
                                        selectedPlan === plan.id
                                            ? "border-foreground ring-1 ring-foreground/10 shadow-sm"
                                            : "border-border"
                                    )}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h3 className="text-sm font-bold">{plan.name}</h3>
                                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                                {plan.description}
                                            </p>
                                        </div>
                                        {selectedPlan === plan.id && (
                                            <div className="w-5 h-5 bg-foreground rounded-full flex items-center justify-center shrink-0">
                                                <Check size={12} className="text-background" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-border">
                                        <p className="text-2xl font-bold tracking-tight">
                                            {plan.price === 0 ? "Gratis" : `€${plan.price}`}
                                            {plan.price > 0 && (
                                                <span className="text-xs font-normal text-muted-foreground">
                                                    /mes
                                                </span>
                                            )}
                                        </p>
                                    </div>

                                    <div className="mt-3 space-y-1.5">
                                        <PlanFeature
                                            text={`${plan.max_users} usuario${plan.max_users > 1 ? "s" : ""
                                                }`}
                                        />
                                        <PlanFeature
                                            text={`${plan.max_contacts.toLocaleString(
                                                "es-ES"
                                            )} contactos`}
                                        />
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={onClose}
                                className="flex-1 border border-border py-2.5 rounded-2xl text-xs font-semibold hover:border-foreground/20 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => setStep(2)}
                                disabled={!selectedPlan}
                                className="flex-1 bg-foreground text-background py-2.5 rounded-2xl text-xs font-semibold hover:bg-foreground/90 transition-colors disabled:opacity-30 flex items-center justify-center gap-2 shadow-sm"
                            >
                                Continuar
                                <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <form onSubmit={handleCreate} className="p-6">
                        <div className="bg-black/[0.03] border border-border rounded-2xl p-4 mb-6 flex items-center gap-3">
                            <Sparkles size={16} className="text-muted-foreground shrink-0" />
                            <div>
                                <p className="text-xs font-semibold">
                                    Plan: {selectedPlanData?.name}
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                    {selectedPlanData?.price === 0
                                        ? "Gratis"
                                        : `€${selectedPlanData?.price}/mes`}
                                    {" · "}
                                    {selectedPlanData?.max_users} usuarios ·{" "}
                                    {selectedPlanData?.max_contacts.toLocaleString("es-ES")}{" "}
                                    contactos
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="ml-auto text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Cambiar
                            </button>
                        </div>

                        <div className="mb-6">
                            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                                Nombre de la organización *
                            </label>
                            <input
                                value={orgName}
                                onChange={(e) => setOrgName(e.target.value)}
                                placeholder="Mi empresa"
                                required
                                autoFocus
                                className="w-full bg-foreground/[0.02] border border-border rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-black/30 transition-all placeholder:text-muted-foreground/50"
                            />
                            <p className="text-[10px] text-muted-foreground/60 mt-1.5">
                                Podrás cambiar el nombre más adelante.
                            </p>
                        </div>

                        {error && (
                            <p className="text-xs text-red-600 font-medium mb-4">{error}</p>
                        )}

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="flex-1 border border-border py-2.5 rounded-2xl text-xs font-semibold hover:border-foreground/20 transition-colors"
                            >
                                Atrás
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !orgName.trim()}
                                className="flex-1 bg-foreground text-background py-2.5 rounded-2xl text-xs font-semibold hover:bg-foreground/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                            >
                                {loading && <Loader2 size={14} className="animate-spin" />}
                                Crear organización
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

export function PlansModal({
    plans,
    onClose,
}: {
    plans: Plan[];
    onClose: () => void;
}) {
    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-[28px] shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card rounded-t-[28px]">
                    <div>
                        <h2 className="text-sm font-bold">Planes disponibles</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Compara los planes y elige el que mejor se adapte
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground transition-colors p-1"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {plans.map((plan) => (
                            <div
                                key={plan.id}
                                className="bg-card border border-border rounded-2xl p-5 hover:border-border hover:shadow-sm transition-all"
                            >
                                <h3 className="text-sm font-bold mb-1">{plan.name}</h3>
                                <p className="text-xs text-muted-foreground line-clamp-2 mb-4">
                                    {plan.description}
                                </p>

                                <p className="text-2xl font-bold tracking-tight mb-4">
                                    {plan.price === 0 ? "Gratis" : `€${plan.price}`}
                                    {plan.price > 0 && (
                                        <span className="text-xs font-normal text-muted-foreground">
                                            /mes
                                        </span>
                                    )}
                                </p>

                                <div className="space-y-1.5 border-t border-border pt-3">
                                    <PlanFeature
                                        text={`${plan.max_users} usuario${plan.max_users > 1 ? "s" : ""
                                            }`}
                                    />
                                    <PlanFeature
                                        text={`${plan.max_contacts.toLocaleString("es-ES")} contactos`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="px-6 pb-6">
                    <button
                        onClick={onClose}
                        className="w-full border border-border py-2.5 rounded-2xl text-xs font-semibold hover:border-foreground/20 transition-colors"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}

function StepDot({
    number,
    active,
    done,
    label,
}: {
    number: number;
    active: boolean;
    done: boolean;
    label: string;
}) {
    return (
        <div className="flex items-center gap-2">
            <div
                className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold",
                    active ? "bg-foreground text-background" : "bg-muted text-muted-foreground"
                )}
            >
                {done ? <Check size={12} /> : number}
            </div>
            <span className="text-xs font-medium text-muted-foreground">{label}</span>
        </div>
    );
}

function PlanFeature({ text }: { text: string }) {
    return (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Check size={12} className="text-foreground shrink-0" />
            <span>{text}</span>
        </div>
    );
}