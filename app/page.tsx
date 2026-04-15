"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import Image from "next/image";

export default function Home() {
  const router = useRouter();
  const { token, loading } = useAuthStore();

  useEffect(() => {
    if (loading) return;

    if (!token) {
      router.replace("/login");
    } else {
      router.replace("/home");
    }
  }, [token, loading, router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-pulse">
          <Image
            src="/logos-negro-simple.png"
            alt="easy-CRM loading"
            width={48}
            height={48}
            className="block dark:hidden"
            priority
          />
          <Image
            src="/logos-blanco-simple.png"
            alt="easy-CRM loading"
            width={48}
            height={48}
            className="hidden dark:block"
            priority
          />
        </div>
        <p className="text-xs font-medium text-muted-foreground">
          Cargando...
        </p>
      </div>
    </div>
  );
}
