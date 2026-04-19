"use client";

import { useEffect, useState, useTransition } from "react";
import { Spinner } from "@/components/ui/spinner";

interface UsuarioAdmin {
  id: string;
  email: string;
  full_name: string | null;
  role: "free" | "pro";
  blocked: boolean;
  pro_expires_at: string | null;
  created_at: string;
  planes: number;
  last_sign_in_at: string | null;
}

type SortField = "full_name" | "role" | "planes" | "last_sign_in_at" | "created_at" | "blocked";
type SortDir = "asc" | "desc";

const DURACIONES = [
  { label: "1 mes",    meses: 1 },
  { label: "3 meses",  meses: 3 },
  { label: "6 meses",  meses: 6 },
  { label: "1 año",    meses: 12 },
  { label: "Indefinido", meses: null },
] as const;

function fechaCorta(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
}

function SortIcon({ field, sortField, sortDir }: { field: SortField; sortField: SortField; sortDir: SortDir }) {
  if (sortField !== field) {
    return (
      <svg className="ml-1 inline h-3 w-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    );
  }
  return sortDir === "asc" ? (
    <svg className="ml-1 inline h-3 w-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
    </svg>
  ) : (
    <svg className="ml-1 inline h-3 w-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function tiempoRelativo(iso: string | null) {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Ahora mismo";
  if (mins < 60) return `Hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Hace ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `Hace ${days}d`;
  return fechaCorta(iso);
}

export default function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [filtro, setFiltro] = useState("");
  const [tabRol, setTabRol] = useState<"todos" | "pro" | "free">("todos");
  const [cargando, setCargando] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "err"; texto: string } | null>(null);
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [duracionSeleccionada, setDuracionSeleccionada] = useState<Record<string, number | null>>({});
  const [expandido, setExpandido] = useState<string | null>(null);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  useEffect(() => {
    fetch("/api/admin/usuarios")
      .then((r) => r.json())
      .then((data) => {
        setUsuarios(data.usuarios ?? []);
        setCargando(false);
      });
  }, []);

  const mostrarMensaje = (tipo: "ok" | "err", texto: string) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 3500);
  };

  const cambiarRol = (userId: string, nuevoRol: "pro" | "free") => {
    const meses = nuevoRol === "pro" ? (duracionSeleccionada[userId] ?? null) : undefined;
    startTransition(async () => {
      const res = await fetch("/api/admin/dar-pro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, role: nuevoRol, meses }),
      });
      const data = await res.json();
      if (!res.ok) { mostrarMensaje("err", data.error ?? "Error"); return; }

      setUsuarios((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, role: nuevoRol, pro_expires_at: data.pro_expires_at ?? null }
            : u,
        ),
      );
      mostrarMensaje(
        "ok",
        nuevoRol === "pro"
          ? `PRO activado${data.pro_expires_at ? ` hasta ${fechaCorta(data.pro_expires_at)}` : " indefinidamente"}`
          : "Acceso revertido a FREE",
      );
    });
  };

  const toggleBloqueo = (userId: string, bloqueado: boolean) => {
    startTransition(async () => {
      const res = await fetch("/api/admin/bloquear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, blocked: !bloqueado }),
      });
      const data = await res.json();
      if (!res.ok) { mostrarMensaje("err", data.error ?? "Error"); return; }

      setUsuarios((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, blocked: !bloqueado } : u)),
      );
      mostrarMensaje("ok", !bloqueado ? "Usuario bloqueado" : "Usuario desbloqueado");
    });
  };

  const filtrados = usuarios
    .filter((u) => {
      const coincideTexto =
        u.email.toLowerCase().includes(filtro.toLowerCase()) ||
        (u.full_name ?? "").toLowerCase().includes(filtro.toLowerCase());
      const coincideRol = tabRol === "todos" || u.role === tabRol;
      return coincideTexto && coincideRol;
    })
    .sort((a, b) => {
      let valA: string | number;
      let valB: string | number;

      switch (sortField) {
        case "full_name":
          valA = (a.full_name ?? a.email).toLowerCase();
          valB = (b.full_name ?? b.email).toLowerCase();
          break;
        case "role":
          valA = a.role;
          valB = b.role;
          break;
        case "planes":
          valA = a.planes;
          valB = b.planes;
          break;
        case "last_sign_in_at":
          valA = a.last_sign_in_at ?? "";
          valB = b.last_sign_in_at ?? "";
          break;
        case "created_at":
          valA = a.created_at;
          valB = b.created_at;
          break;
        case "blocked":
          valA = a.blocked ? 1 : 0;
          valB = b.blocked ? 1 : 0;
          break;
        default:
          return 0;
      }

      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Usuarios</h1>
      <p className="mb-6 text-sm text-gray-500">{usuarios.length} usuarios registrados</p>

      {mensaje && (
        <div
          className={`mb-4 rounded-xl px-4 py-3 text-sm font-medium ${
            mensaje.tipo === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}
        >
          {mensaje.texto}
        </div>
      )}

      {/* Tabs rol */}
      <div className="mb-4 flex gap-2">
        {(["todos", "pro", "free"] as const).map((tab) => {
          const count =
            tab === "todos" ? usuarios.length : usuarios.filter((u) => u.role === tab).length;
          return (
            <button
              key={tab}
              onClick={() => setTabRol(tab)}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                tabRol === tab
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}{" "}
              <span className={`ml-1 text-xs ${tabRol === tab ? "opacity-75" : "text-gray-400"}`}>
                ({count})
              </span>
            </button>
          );
        })}
      </div>

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
                <th className="px-5 py-3 text-left">
                  <button onClick={() => toggleSort("full_name")} className="flex items-center hover:text-gray-700 transition">
                    Usuario <SortIcon field="full_name" sortField={sortField} sortDir={sortDir} />
                  </button>
                </th>
                <th className="px-5 py-3 text-center">
                  <button onClick={() => toggleSort("role")} className="inline-flex items-center hover:text-gray-700 transition">
                    Rol / Expira <SortIcon field="role" sortField={sortField} sortDir={sortDir} />
                  </button>
                </th>
                <th className="px-5 py-3 text-center">
                  <button onClick={() => toggleSort("planes")} className="inline-flex items-center hover:text-gray-700 transition">
                    Planes <SortIcon field="planes" sortField={sortField} sortDir={sortDir} />
                  </button>
                </th>
                <th className="px-5 py-3 text-center">
                  <button onClick={() => toggleSort("last_sign_in_at")} className="inline-flex items-center hover:text-gray-700 transition">
                    Último acceso <SortIcon field="last_sign_in_at" sortField={sortField} sortDir={sortDir} />
                  </button>
                </th>
                <th className="px-5 py-3 text-center">
                  <button onClick={() => toggleSort("blocked")} className="inline-flex items-center hover:text-gray-700 transition">
                    Estado <SortIcon field="blocked" sortField={sortField} sortDir={sortDir} />
                  </button>
                </th>
                <th className="px-5 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtrados.map((u) => (
                <>
                  <tr
                    key={u.id}
                    className={`hover:bg-gray-50/50 ${u.blocked ? "opacity-60" : ""}`}
                  >
                    {/* Usuario */}
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => setExpandido(expandido === u.id ? null : u.id)}
                        className="text-left"
                      >
                        <div className="font-medium text-gray-900">
                          {u.full_name ?? "—"}
                          {u.blocked && (
                            <span className="ml-2 rounded-full bg-red-100 px-1.5 py-0.5 text-xs font-semibold text-red-600">
                              BLOQUEADO
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">{u.email}</div>
                        <div className="text-xs text-gray-300">Registro: {fechaCorta(u.created_at)}</div>
                      </button>
                    </td>

                    {/* Rol */}
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
                      {u.role === "pro" && u.pro_expires_at && (
                        <div className="mt-0.5 text-xs text-gray-400">
                          hasta {fechaCorta(u.pro_expires_at)}
                        </div>
                      )}
                      {u.role === "pro" && !u.pro_expires_at && (
                        <div className="mt-0.5 text-xs text-gray-400">indefinido</div>
                      )}
                    </td>

                    {/* Planes */}
                    <td className="px-5 py-3.5 text-center text-gray-600 font-medium">
                      {u.planes}
                    </td>

                    {/* Último acceso */}
                    <td className="px-5 py-3.5 text-center text-xs text-gray-400">
                      {tiempoRelativo(u.last_sign_in_at)}
                    </td>

                    {/* Estado */}
                    <td className="px-5 py-3.5 text-center">
                      <button
                        onClick={() => toggleBloqueo(u.id, u.blocked)}
                        disabled={isPending}
                        className={`rounded-lg px-2.5 py-1 text-xs font-medium transition disabled:opacity-50 ${
                          u.blocked
                            ? "bg-red-100 text-red-700 hover:bg-red-200"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                        }`}
                      >
                        {u.blocked ? "Desbloquear" : "Activo"}
                      </button>
                    </td>

                    {/* Acciones */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        {u.role === "free" ? (
                          <div className="flex items-center gap-2">
                            {/* Selector de duración */}
                            <select
                              value={
                                duracionSeleccionada[u.id] === undefined
                                  ? "null"
                                  : String(duracionSeleccionada[u.id])
                              }
                              onChange={(e) =>
                                setDuracionSeleccionada((prev) => ({
                                  ...prev,
                                  [u.id]: e.target.value === "null" ? null : Number(e.target.value),
                                }))
                              }
                              className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-700 outline-none focus:border-blue-400"
                            >
                              {DURACIONES.map((d) => (
                                <option key={d.label} value={String(d.meses)}>
                                  {d.label}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => cambiarRol(u.id, "pro")}
                              disabled={isPending}
                              className="rounded-lg bg-yellow-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-yellow-600 disabled:opacity-50"
                            >
                              Dar PRO
                            </button>
                          </div>
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

                  {/* Fila expandida con stats */}
                  {expandido === u.id && (
                    <tr key={`${u.id}-stats`} className="bg-blue-50/40">
                      <td colSpan={6} className="px-5 py-3">
                        <div className="grid grid-cols-4 gap-4 text-xs">
                          <div>
                            <div className="text-gray-400 mb-0.5">Planes generados</div>
                            <div className="font-semibold text-gray-800 text-base">{u.planes}</div>
                          </div>
                          <div>
                            <div className="text-gray-400 mb-0.5">Fecha de registro</div>
                            <div className="font-semibold text-gray-800">{fechaCorta(u.created_at)}</div>
                          </div>
                          <div>
                            <div className="text-gray-400 mb-0.5">Último acceso</div>
                            <div className="font-semibold text-gray-800">{fechaCorta(u.last_sign_in_at)}</div>
                          </div>
                          <div>
                            <div className="text-gray-400 mb-0.5">PRO expira</div>
                            <div className="font-semibold text-gray-800">
                              {u.role === "pro"
                                ? u.pro_expires_at
                                  ? fechaCorta(u.pro_expires_at)
                                  : "Indefinido"
                                : "—"}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-gray-400">
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
