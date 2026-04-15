"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/lib/store";
import {
  invitations as invitationsApi,
  type Invitation,
} from "@/lib/api";
import { Building2, Mail, Shield } from "lucide-react";
import {
  EmptyInvitationsState,
  HomeHero,
  InvitationCard,
  SectionHeader,
  RoleBadge,
} from "../_components/home-shared";

type NormalizedInvitation = Invitation & {
  tenant?: { id: string; name: string };
};

export default function HomeInvitationsPage() {
  const { user, fetchUser } = useAuthStore();
  const [invitations, setInvitations] = useState<NormalizedInvitation[]>([]);
  const [loadingMap, setLoadingMap] = useState<
    Record<string, "accept" | "reject" | null>
  >({});

  useEffect(() => {
    invitationsApi
      .list()
      .then((res) => {
        const normalized = res.data
          .map((i) => ({
            ...i,
            tenant: Array.isArray(i.tenant) ? i.tenant[0] : i.tenant,
          }))
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );

        setInvitations(normalized);
      })
      .catch(() => setInvitations([]));
  }, []);

  if (!user) return null;

  const pendingInvitations = useMemo(
    () => invitations.filter((i) => i.status === "pending"),
    [invitations]
  );

  const historyInvitations = useMemo(
    () => invitations.filter((i) => i.status !== "pending"),
    [invitations]
  );

  const handleAcceptInvite = async (id: string) => {
    try {
      setLoadingMap((prev) => ({ ...prev, [id]: "accept" }));
      await invitationsApi.accept(id);
      await fetchUser();

      setInvitations((prev) =>
        prev.map((i) =>
          i.id === id ? { ...i, status: "accepted" as const } : i
        )
      );
    } finally {
      setLoadingMap((prev) => ({ ...prev, [id]: null }));
    }
  };

  const handleRejectInvite = async (id: string) => {
    try {
      setLoadingMap((prev) => ({ ...prev, [id]: "reject" }));
      await invitationsApi.reject(id);
      await fetchUser();

      setInvitations((prev) =>
        prev.map((i) =>
          i.id === id ? { ...i, status: "rejected" as const } : i
        )
      );
    } finally {
      setLoadingMap((prev) => ({ ...prev, [id]: null }));
    }
  };

  return (
    <div className="space-y-8">
      <HomeHero
        title="Mis invitaciones"
        description="Consulta tus invitaciones pendientes y el historial de respuestas."
        stats={[
          {
            icon: <Mail size={18} strokeWidth={2.2} />,
            label: "Pendientes",
            value: String(pendingInvitations.length),
          },
          {
            icon: <Building2 size={18} strokeWidth={2.2} />,
            label: "Total",
            value: String(invitations.length),
          },
          {
            icon: <Shield size={18} strokeWidth={2.2} />,
            label: "Acceso",
            value: "Activo",
          },
        ]}
      />

      <section className="rounded-[28px] border border-border bg-card p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
        <SectionHeader
          eyebrow="Invitaciones"
          title="Pendientes"
          description="Aquí aparecen las invitaciones recibidas que siguen pendientes de respuesta."
        />

        {pendingInvitations.length === 0 ? (
          <EmptyInvitationsState />
        ) : (
          <div className="space-y-3">
            {pendingInvitations.map((inv) => (
              <InvitationCard
                key={inv.id}
                invitation={inv}
                onAccept={handleAcceptInvite}
                onReject={handleRejectInvite}
                loadingAction={loadingMap[inv.id] ?? null}
              />
            ))}
          </div>
        )}
      </section>

      <section className="rounded-[28px] border border-border bg-card p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
        <SectionHeader
          eyebrow="Historial"
          title="Respondidas"
          description="Invitaciones antiguas que ya han sido aceptadas o rechazadas."
        />

        {historyInvitations.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-border bg-gradient-to-b from-muted to-muted/80 p-6 text-center">
            <p className="text-sm font-semibold">Sin historial todavía</p>
            <p className="text-xs text-muted-foreground mt-2">
              Cuando respondas invitaciones, aparecerán aquí.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {historyInvitations.map((inv) => (
              <div
                key={inv.id}
                className="rounded-[24px] border border-border bg-gradient-to-b from-card to-muted p-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-card border border-border flex items-center justify-center shrink-0 shadow-sm">
                    <Mail size={16} className="text-muted-foreground" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <p className="text-sm font-semibold">
                        {inv.tenant?.name || "Organización"}
                      </p>

                      <div className="flex items-center gap-2">
                        <RoleBadge role={inv.role} />
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${
                            inv.status === "accepted"
                              ? "bg-foreground text-background"
                              : "bg-neutral-200 text-neutral-700"
                          }`}
                        >
                          {inv.status === "accepted" ? "Aceptada" : "Rechazada"}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground mt-2">
                      Recibida el{" "}
                      {new Date(inv.created_at).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}