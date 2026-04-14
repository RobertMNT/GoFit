import { createClient } from "@/lib/supabase/server";
import type { UserProfile } from "@/types/database";
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <ProfileClient
      profile={profile as UserProfile}
      subscription={null}
    />
  );
}
