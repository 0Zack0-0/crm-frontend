"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import {
  Building2,
  Mail,
  Shield,
} from "lucide-react";
import {
  HomeHero,
  HomeNavCard,
  ProfileCard,
} from "./_components/home-shared";

export default function HomePage() {
  const router = useRouter();
  const { user, currentTenant, subscription } = useAuthStore();

  if (!user) return null;

  const firstName = user.full_name.split(" ")[0];
  const tenantSlug = currentTenant?.slug;

  return (
    <div className="space-y-8">
      <HomeHero
        title={`Hola, ${firstName} 👋`}
        description="Gestiona tu perfil, revisa invitaciones y entra a tus organizaciones."
        stats={[
          {
            icon: <Building2 size={18} strokeWidth={2.2} />,
            label: "Organizaciones",
            value: String(user.tenants.length),
          },
          {
            icon: <Mail size={18} strokeWidth={2.2} />,
            label: "Invitaciones",
            value: String(user.pending_invitations),
          },
          {
            icon: <Shield size={18} strokeWidth={2.2} />,
            label: "Acceso",
            value: "Activo",
          },
        ]}
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-5">
          <ProfileCard
            fullName={user.full_name}
            email={user.email}
            createdAt={user.created_at}
            tenantsCount={user.tenants.length}
            currentTenantName={currentTenant?.name}
            currentRole={currentTenant?.role}
            planName={subscription?.plan?.name || "—"}
          />
        </div>

        <div className="xl:col-span-7">
          <section className="rounded-[28px] border border-border bg-card p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-2 text-muted-foreground mb-5">
              <Shield size={15} />
              <span className="text-xs font-semibold uppercase tracking-[0.18em]">
                Accesos rápidos
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <HomeNavCard
                href="/home/organizaciones"
                icon={<Building2 size={18} strokeWidth={2.2} />}
                eyebrow="Organizaciones"
                title="Mis organizaciones"
                description="Accede a tus espacios de trabajo o crea una nueva organización."
                badge={String(user.tenants.length)}
              />

              <HomeNavCard
                href="/home/invitaciones"
                icon={<Mail size={18} strokeWidth={2.2} />}
                eyebrow="Invitaciones"
                title="Invitaciones"
                description="Consulta tus invitaciones pendientes."
                badge={
                  user.pending_invitations > 0
                    ? String(user.pending_invitations)
                    : undefined
                }
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
