"use client";

import { createClient } from "@/lib/supabase/client";
import type { UserProfile } from "@/types/database";
import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

interface UseUserResult {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isPro: boolean;
}

// Hook para acceder al usuario autenticado y su perfil en componentes cliente
export function useUser(): UseUserResult {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function cargarUsuario(userId: string) {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      setProfile(data as UserProfile | null);
    }

    // Obtener sesión inicial
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) {
        cargarUsuario(data.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Escuchar cambios de sesión (login, logout, refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        cargarUsuario(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, profile, loading, isPro: profile?.role === "pro" };
}
