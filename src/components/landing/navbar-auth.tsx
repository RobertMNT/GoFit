"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface NavbarAuthProps {
  user: { name: string | null; email: string | null } | null;
}

export function NavbarAuth({ user }: NavbarAuthProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  if (!user) {
    return (
      <>
        <Link href="/login" className="text-sm font-medium text-gray-400 transition hover:text-white">
          Iniciar sesión
        </Link>
        <Link
          href="/registro"
          className="rounded-xl border border-blue-500/40 bg-blue-600/20 px-5 py-2 text-sm font-semibold text-blue-300 backdrop-blur-sm transition hover:bg-blue-600 hover:text-white hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]"
        >
          Empezar gratis
        </Link>
      </>
    );
  }

  const displayName = user.name ?? user.email?.split("@")[0] ?? "Usuario";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-300 transition hover:bg-white/10 hover:text-white"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
          {displayName[0].toUpperCase()}
        </span>
        {displayName}
        <svg className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-white/10 bg-[#0d1425] shadow-xl">
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="block px-4 py-3 text-sm text-gray-300 transition hover:bg-white/5 hover:text-white"
          >
            Mi dashboard
          </Link>
          <Link
            href="/perfil"
            onClick={() => setOpen(false)}
            className="block px-4 py-3 text-sm text-gray-300 transition hover:bg-white/5 hover:text-white"
          >
            Mi perfil
          </Link>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 text-left text-sm text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
