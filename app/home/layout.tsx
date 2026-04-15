"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import {
  invitations as invitationsApi,
  plans as plansApi,
  type Invitation,
  type Plan,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  Building2,
  CreditCard,
  LogOut,
  Mail,
  User,
} from "lucide-react";
import { PlansModal } from "./_components/home-shared";
import { AppLogo } from "@/components/ui/AppLogo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

type NormalizedInvitation = Invitation & {
  tenant?: { id: string; name: string };
};

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuthStore();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<
    NormalizedInvitation[]
  >([]);
  const [showPlans, setShowPlans] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }

    plansApi
      .list()
      .then((r) => setPlans(r.data))
      .catch(() => setPlans([]));

    invitationsApi
      .list()
      .then((r) => {
        const normalized = r.data.map((i) => ({
          ...i,
          tenant: Array.isArray(i.tenant) ? i.tenant[0] : i.tenant,
        }));
        setPendingInvitations(
          normalized.filter((i) => i.status === "pending")
        );
      })
      .catch(() => setPendingInvitations([]));
  }, [user, loading, router]);

  const initials = useMemo(() => {
    if (!user?.full_name) return "C";
    return user.full_name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [user?.full_name]);

  const nav = [
    { label: "Mi perfil", href: "/home", icon: User },
    {
      label: "Mis organizaciones",
      href: "/home/organizaciones",
      icon: Building2,
    },
    {
      label: "Invitaciones",
      href: "/home/invitaciones",
      icon: Mail,
      badge: pendingInvitations.length,
    },
  ];

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">
          <Image
            src="/logos-negro-simple.png"
            alt="easy-CRM loading"
            width={56}
            height={56}
            className="block dark:hidden"
            priority
          />
          <Image
            src="/logos-blanco-simple.png"
            alt="easy-CRM loading"
            width={56}
            height={56}
            className="hidden dark:block"
            priority
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-card/85 backdrop-blur-md">
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <AppLogo variant="icon" className="w-9 h-9 shrink-0" />

            <div className="hidden md:block">
              <AppLogo variant="full" height={22} />
              <span className="block text-[10px] uppercase tracking-[0.22em] text-muted-foreground mt-0.5">
                workspace home
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <button
              onClick={() => setShowPlans(true)}
              className="flex items-center gap-2 rounded-2xl border border-black/10 bg-card dark:bg-muted px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:border-black/20 dark:hover:border-white/20 transition-colors"
            >
              <CreditCard size={14} />
              <span className="font-semibold hidden sm:inline">Planes</span>
            </button>

            <div className="w-px h-6 bg-border hidden sm:block" />

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center text-[10px] font-bold shadow-sm">
                {initials}
              </div>
              <span className="text-xs font-semibold hidden lg:inline max-w-35 truncate">
                {user.full_name}
              </span>
            </div>

            <ThemeToggle />

            <button
              onClick={handleLogout}
              className="rounded-2xl p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Cerrar sesión"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        <div className="px-4 sm:px-6 pb-3">
          <nav className="flex items-center gap-2 overflow-x-auto">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-semibold transition-all whitespace-nowrap",
                    active
                      ? "bg-foreground text-background shadow-sm"
                      : "bg-card text-muted-foreground border border-border hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon size={14} />
                  <span>{item.label}</span>
                  {item.badge ? (
                    <span
                      className={cn(
                        "ml-1 inline-flex min-w-5 h-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold",
                        active
                          ? "bg-background/10 text-background"
                          : "bg-foreground text-background"
                      )}
                    >
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {children}
      </main>

      {showPlans && (
        <PlansModal plans={plans} onClose={() => setShowPlans(false)} />
      )}
    </div>
  );
}