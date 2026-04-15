"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { plans as plansApi, type Plan, type Tenant } from "@/lib/api";
import { Building2, Mail, Plus, Shield } from "lucide-react";
import {
    AddOrganizationCard,
    CreateOrgModal,
    EmptyOrganizationsState,
    HomeHero,
    OrgCard,
    SectionHeader,
} from "../_components/home-shared";

export default function HomeOrganizationsPage() {
    const router = useRouter();
    const { user, fetchUser, setCurrentTenant } = useAuthStore();

    const [plans, setPlans] = useState<Plan[]>([]);
    const [showCreateOrg, setShowCreateOrg] = useState(false);

    useEffect(() => {
        plansApi
            .list()
            .then((r) => setPlans(r.data))
            .catch(() => setPlans([]));
    }, []);

    if (!user) return null;

    const handleEnterOrg = (tenant: Tenant) => {
        setCurrentTenant(tenant);
        router.push(`/${tenant.slug}`);
    };

    return (
        <div className="space-y-8">
            <HomeHero
                title="Mis organizaciones"
                description="Accede a tus espacios de trabajo actuales o crea una nueva organización."
                stats={[
                    {
                        icon: <Building2 size={15} />,
                        label: "Organizaciones",
                        value: String(user.tenants.length),
                    },
                    {
                        icon: <Mail size={15} />,
                        label: "Invitaciones",
                        value: String(user.pending_invitations),
                    },
                    {
                        icon: <Shield size={15} />,
                        label: "Acceso",
                        value: "Activo",
                    },
                ]}
            />

            <section className="rounded-[28px] border border-border bg-card p-6 sm:p-7 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                <SectionHeader
                    eyebrow="Espacios de trabajo"
                    title="Tus organizaciones"
                    description="Entra a tus espacios actuales o crea una nueva organización."
                    action={
                        <button
                            onClick={() => setShowCreateOrg(true)}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-foreground px-4 py-2.5 text-sm font-semibold text-background hover:bg-foreground/90 transition-colors shadow-sm"
                        >
                            <Plus size={14} />
                            Nueva organización
                        </button>
                    }
                />

                {user.tenants.length === 0 ? (
                    <EmptyOrganizationsState onCreate={() => setShowCreateOrg(true)} />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {user.tenants.map((tenant) => (
                            <OrgCard
                                key={tenant.id}
                                tenant={tenant}
                                onEnter={() => handleEnterOrg(tenant)}
                            />
                        ))}

                        <AddOrganizationCard onCreate={() => setShowCreateOrg(true)} />
                    </div>
                )}
            </section>

            {showCreateOrg && (
                <CreateOrgModal
                    plans={plans}
                    onClose={() => setShowCreateOrg(false)}
                    onCreated={async (tenant) => {
                        await fetchUser();
                        setCurrentTenant(tenant);
                        router.push(`/${tenant.slug}`);
                    }}
                />
            )}
        </div>
    );
}