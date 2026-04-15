import { isAdmin } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

const NAV = [
  { href: "/admin",          label: "Dashboard",  icon: "📊" },
  { href: "/admin/usuarios", label: "Usuarios",   icon: "👥" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !isAdmin(user.email)) redirect("/dashboard");

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="flex w-56 flex-col border-r border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-5 py-4">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Admin</p>
          <p className="mt-0.5 truncate text-sm font-medium text-gray-700">{user.email}</p>
        </div>
        <nav className="flex-1 space-y-0.5 p-3">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-gray-100 p-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            ← Volver al dashboard
          </Link>
        </div>
      </aside>

      {/* Contenido */}
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}
