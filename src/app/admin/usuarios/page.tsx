"use client";

import { useEffect, useState, useTransition } from "react";
import { Spinner } from "@/components/ui/spinner";

interface UsuarioAdmin {
  id: string;
  email: string;
  full_name: string | null;
  role: "free" | "pro";
  created_at: string;
  planes: number;
}

// Página de gestión de usuarios — dar/quitar PRO, buscar usuarios
export default function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [filtro, setFiltro] = useState("");
  const [cargando, setCargando] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "err"; texto: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/usuarios")
      .then((r) => r.json())
      .then((data) => { setUsuarios(data.usuarios ?? []); setCargando(false); });
  }, []);

  const mostrarMensaje = (tipo: "ok" | "err", texto: string) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 3000);
  };

  const cambiarRol = (userId: string, nuevoRol: "pro" | "free", meses?: number) => {
    startTransition(async () => {
      const res = await fetch("/api/admin/dar-pro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, role: nuevoRol, meses }),
      });
      const data = await res.json();
      if (!res.ok) {
        mostrarMensaje("err", data.error ?? "Error");
        return;
      }
      setUsuarios((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: nuevoRol } : u)),
      );
      mostrarMensaje("ok", nuevoRol === "pro" ? "Acceso PRO activado ✓" : "Acceso revertido a FREE");
    });
  };

  const filtrados = usuarios.filter(
    (u) =>
      u.email.toLowerCase().includes(filtro.toLowerCase()) ||
      (u.full_name ?? "").toLowerCase().includes(filtro.toLowerCase()),
  );

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Usuarios</h1>
      <p className="mb-6 text-sm text-gray-500">{usuarios.length} usuarios registrados</p>

      {/* Mensaje de feedback */}
      {mensaje && (
        <div
          className={`mb-4 rounded-xl px-4 py-3 text-sm font-medium ${
            mensaje.tipo === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}
        >
          {mensaje.texto}
        </div>
      )}

      {/* Buscador */}
      <input
        type="search"
        placeholder="Buscar por email o nombre..."
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        className="mb-5 w-full max-w-sm rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
      />

      {cargando ? (
        <div className="flex justify-center py-16">
          <Spinner size={40} />
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-400">
              <tr>
                <th className="px-5 py-3 text-left">Usuario</th>
                <th className="px-5 py-3 text-center">Rol</th>
                <th className="px-5 py-3 text-center">Planes</th>
                <th className="px-5 py-3 text-center">Registro</th>
                <th className="px-5 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtrados.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-gray-900">{u.full_name ?? "—"}</div>
                    <div className="text-xs text-gray-400">{u.email}</div>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        u.role === "pro"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center text-gray-600">{u.planes}</td>
                  <td className="px-5 py-3.5 text-center text-xs text-gray-400">
                    {new Date(u.created_at).toLocaleDateString("es-ES")}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      {u.role === "free" ? (
                        <>
                          <button
                            onClick={() => cambiarRol(u.id, "pro")}
                            disabled={isPending}
                            className="rounded-lg bg-yellow-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-yellow-600 disabled:opacity-50"
                          >
                            Dar PRO
                          </button>
                          <button
                            onClick={() => cambiarRol(u.id, "pro", 1)}
                            disabled={isPending}
                            className="rounded-lg border border-yellow-300 px-3 py-1.5 text-xs font-semibold text-yellow-700 transition hover:bg-yellow-50 disabled:opacity-50"
                          >
                            Regalar 1 mes
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => cambiarRol(u.id, "free")}
                          disabled={isPending}
                          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 transition hover:bg-gray-100 disabled:opacity-50"
                        >
                          Quitar PRO
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-400">
                    No se encontraron usuarios
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
