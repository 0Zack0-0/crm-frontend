"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, X, TrendingUp } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { deals as dealsApi, type Deal } from "@/lib/api";

interface HeaderProps {
  title: string;
  children?: React.ReactNode;
}

function daysUntil(dateStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default function Header({ title, children }: HeaderProps) {
  const { currentTenant } = useAuthStore();
  const [notifications, setNotifications] = useState<Deal[]>([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  /* ── Fetch deals closing within 7 days ── */
  useEffect(() => {
    if (!currentTenant?.id) return;
    dealsApi
      .list(currentTenant.id)
      .then((res) => {
        const urgent = (res.data ?? []).filter((d) => {
          if (d.status !== "open" || !d.expected_close_date) return false;
          const days = daysUntil(d.expected_close_date);
          return days >= 0 && days <= 7;
        });
        setNotifications(urgent);
      })
      .catch(() => {/* silencioso */});
  }, [currentTenant?.id]);

  /* ── Close dropdown on outside click ── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="h-14 bg-card border-b border-border/50 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-40">
      <div className="flex items-center gap-4 lg:gap-6">
        {/* Spacer for mobile hamburger */}
        <div className="w-8 lg:hidden" />
        <h1 className="text-base sm:text-lg font-bold tracking-tight">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* ── Bell ── */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors relative"
          >
            <Bell size={16} />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-3.5 h-3.5 bg-foreground text-background text-[9px] font-bold rounded-full border-2 border-card flex items-center justify-center px-0.5 leading-none">
                {notifications.length > 9 ? "9+" : notifications.length}
              </span>
            )}
          </button>

          {/* Dropdown */}
          {open && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border/50 rounded-2xl shadow-xl overflow-hidden z-50">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <Bell size={14} className="text-foreground" />
                  <span className="text-sm font-semibold">Notificaciones</span>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              {/* List */}
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <Bell size={24} className="text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Sin notificaciones pendientes</p>
                  </div>
                ) : (
                  notifications.map((deal) => {
                    const days = daysUntil(deal.expected_close_date!);
                    return (
                      <div
                        key={deal.id}
                        className="px-4 py-3 border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 rounded-xl bg-foreground/10 flex items-center justify-center shrink-0 mt-0.5">
                            <TrendingUp size={13} className="text-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold truncate">{deal.name}</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              {days === 0
                                ? "Cierra hoy"
                                : days === 1
                                ? "Cierra mañana"
                                : `Cierra en ${days} días`}
                            </p>
                          </div>
                          {deal.value != null && (
                            <span className="text-[11px] font-semibold text-foreground shrink-0">
                              €{deal.value.toLocaleString("es-ES")}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="px-4 py-2.5 border-t border-border/50 bg-muted/20">
                  <p className="text-[10px] text-muted-foreground text-center">
                    {notifications.length} deal{notifications.length > 1 ? "s" : ""} con cierre en los próximos 7 días
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {children}
      </div>
    </header>
  );
}

