"use client";

import { useAuthStore } from "@/lib/store";

export type UserRole = "owner" | "admin" | "sales";

export function useRole() {
  const { currentTenant } = useAuthStore();
  const role = (currentTenant?.role ?? "sales") as UserRole;

  return {
    role,
    isOwner: role === "owner",
    isAdmin: role === "admin" || role === "owner",
    // companies y contacts: solo admin y owner
    canEdit: role === "admin" || role === "owner",
    canDelete: role === "admin" || role === "owner",
    // deals y pipeline: sales también puede
    canEditDeals: role === "sales" || role === "admin" || role === "owner",
    canDeleteDeals: role === "sales" || role === "admin" || role === "owner",
    // team
    canInvite: role === "owner",
    canSettings: role === "owner",
  };
}
