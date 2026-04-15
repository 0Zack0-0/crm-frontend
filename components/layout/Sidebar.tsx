"use client";

import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  Users,
  Kanban,
  Briefcase,
  CalendarCheck,
  UsersRound,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ChevronsUpDown,
  Menu,
  X,
  Settings2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { AppLogo } from "@/components/ui/AppLogo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "" },
  { id: "companies", label: "Empresas", icon: Building2, path: "/companies" },
  { id: "contacts", label: "Contactos", icon: Users, path: "/contacts" },
  { id: "pipeline", label: "Pipeline", icon: Kanban, path: "/pipeline" },
  { id: "deals", label: "Deals", icon: Briefcase, path: "/deals" },
  { id: "activities", label: "Actividades", icon: CalendarCheck, path: "/activities" },
  { id: "team", label: "Equipo", icon: UsersRound, path: "/team" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, currentTenant, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const tenantSlug = currentTenant?.slug || "";

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const h = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  const getActiveId = () => {
    if (!tenantSlug) return "dashboard";

    const sub = pathname.replace(`/${tenantSlug}`, "");
    const found = menuItems.find(
      (item) => item.path && sub.startsWith(item.path)
    );

    return found?.id || "dashboard";
  };

  const activeId = getActiveId();

  const handleNav = (item: (typeof menuItems)[0]) => {
    if (!tenantSlug) return;
    router.push(`/${tenantSlug}${item.path}`);
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const initials = user?.full_name
    ? user.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "??";

  const sidebarContent = (isMobile: boolean) => (
    <>
      {/* Logo */}
      <div className="p-5 flex items-center justify-between">
        {!collapsed || isMobile ? (
          <AppLogo variant="full" height={28} />
        ) : (
          <AppLogo variant="icon" className="mx-auto" />
        )}
        {isMobile && (
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Tenant selector */}
      {(!collapsed || isMobile) && currentTenant && (
        <div className="px-4 mb-4">
          <button
            onClick={() => router.push("/home")}
            className="w-full flex items-center gap-3 px-3 py-2.5 bg-muted/50 border border-border/50 rounded-2xl hover:border-border hover:bg-muted transition-all"
          >
            <div className="w-7 h-7 bg-foreground text-background flex items-center justify-center text-[10px] font-bold rounded-xl">
              {currentTenant.name[0]?.toUpperCase()}
            </div>
            <span className="flex-1 text-xs font-semibold text-left truncate">
              {currentTenant.name}
            </span>
            <ChevronsUpDown size={14} className="text-muted-foreground" />
          </button>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNav(item)}
            className={cn(
              "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl transition-all duration-200 group",
              activeId === item.id
                ? "bg-foreground text-background shadow-md"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon
              className={cn(
                "w-4.5 h-4.5 shrink-0",
                activeId === item.id
                  ? "text-background"
                  : "text-muted-foreground group-hover:text-foreground"
              )}
            />
            {(!collapsed || isMobile) && (
              <span className="text-sm font-medium whitespace-nowrap overflow-hidden">
                {item.label}
              </span>
            )}
          </button>
        ))}

        {/* Settings — owner only */}
        {currentTenant?.role === "owner" && (
          <button
            onClick={() => router.push(`/${tenantSlug}/settings`)}
            className={cn(
              "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl transition-all duration-200 group",
              pathname.endsWith("/settings")
                ? "bg-foreground text-background shadow-md"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Settings2
              className={cn(
                "w-4.5 h-4.5 shrink-0",
                pathname.endsWith("/settings")
                  ? "text-background"
                  : "text-muted-foreground group-hover:text-foreground"
              )}
            />
            {(!collapsed || isMobile) && (
              <span className="text-sm font-medium whitespace-nowrap overflow-hidden">
                Configuración
              </span>
            )}
          </button>
        )}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-border/50">
        {!isMobile && (
          <div className={cn(
            "flex items-center mb-2",
            collapsed ? "flex-col gap-1" : "justify-between"
          )}>
            <ThemeToggle />
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="flex items-center justify-center p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
            >
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>
        )}

        {(!collapsed || isMobile) && (
          <div className="mt-3 flex items-center gap-3 px-3 py-3 rounded-2xl bg-muted/50">
            <div className="w-9 h-9 rounded-full bg-foreground/10 flex items-center justify-center text-xs font-bold">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">
                {user?.full_name || "Usuario"}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {currentTenant?.role?.toUpperCase() || ""}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="text-muted-foreground hover:text-destructive transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <div className="lg:hidden fixed top-0 left-0 z-50 h-14 px-3 flex items-center justify-center">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2.5 bg-card border border-border rounded-2xl shadow-sm hover:bg-muted transition-colors"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile overlay + sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border flex flex-col shadow-xl rounded-r-3xl"
            >
              {sidebarContent(true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 72 : 260 }}
        className="hidden lg:flex h-screen bg-card border-r border-border flex-col sticky top-0 z-40 shrink-0"
      >
        {sidebarContent(false)}
      </motion.aside>
    </>
  );
}