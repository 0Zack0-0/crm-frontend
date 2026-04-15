"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import Sidebar from "@/components/layout/Sidebar";
import AuthProvider from "@/components/providers/AuthProvider";
import Image from "next/image";

export default function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tenantId: string }>;
}) {
  return (
    <AuthProvider>
      <TenantShell params={params}>{children}</TenantShell>
    </AuthProvider>
  );
}

function TenantShell({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tenantId: string }>;
}) {
  const router = useRouter();
  const { token, user, loading, setCurrentTenant } = useAuthStore();

  useEffect(() => {
    if (loading) return;

    if (!token) {
      router.replace("/login");
      return;
    }

    if (user) {
      params.then(({ tenantId }) => {
        const found = user.tenants.find((t) => t.slug === tenantId);

        if (found) {
          setCurrentTenant(found);
        } else if (user.tenants.length > 0) {
          router.replace(`/${user.tenants[0].slug}`);
        } else {
          router.replace("/home");
        }
      });
    }
  }, [token, user, loading, params, router, setCurrentTenant]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse">
          <Image
            src="/logos-negro-simple.png"
            alt="easy-CRM loading"
            width={40}
            height={40}
            className="block dark:hidden"
            priority
          />
          <Image
            src="/logos-blanco-simple.png"
            alt="easy-CRM loading"
            width={40}
            height={40}
            className="hidden dark:block"
            priority
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        {children}

        <footer className="h-10 border-t border-border/50 px-4 sm:px-8 flex items-center justify-between bg-card text-[10px] font-medium text-muted-foreground mt-auto">
          <div className="flex items-center gap-4">
            <span>© 2026 easy-CRM</span>
            <span className="w-1 h-1 bg-border rounded-full hidden sm:block" />
            <span className="hidden sm:block">v 2.0.0</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            <span>Sistema operativo</span>
          </div>
        </footer>
      </main>
    </div>
  );
}