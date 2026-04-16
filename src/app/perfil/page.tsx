import { createClient } from "@/lib/supabase/server";
import type { Subscription, UserProfile } from "@/types/database";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ProfileClient } from "@/components/profile/profile-client";

export const metadata: Metadata = {
  title: "Mi perfil",
};

export default async function PerfilPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: profile }, { data: subscription }, { count: planesCount }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .in("status", ["active", "trialing"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from("plans").select("id", { count: "exact", head: true }).eq("user_id", user.id),
  ]);

  return (
    <ProfileClient
      profile={profile as UserProfile}
      subscription={subscription as Subscription | null}
      planesCreados={planesCount ?? 0}
    />
  );
}
