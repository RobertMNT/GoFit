"use client";

import type { EjercicioInfo } from "@/app/api/ejercicio-info/route";
import { useEffect, useRef, useState } from "react";
import type { Exercise } from "@/types/plan";

interface EjercicioModalProps {
  ejercicio: Exercise;
  onClose: () => void;
}

// Modal con explicación técnica del ejercicio y enlace a vídeo
export function EjercicioModal({ ejercicio, onClose }: EjercicioModalProps) {
  const [info, setInfo] = useState<EjercicioInfo | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Bloquear scroll del body
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Cargar info del ejercicio
  useEffect(() => {
    fetch("/api/ejercicio-info", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: ejercicio.nombre, notas: ejercicio.notas ?? undefined }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setError(true); } else { setInfo(data as EjercicioInfo); }
      })
      .catch(() => setError(true))
      .finally(() => setCargando(false));
  }, [ejercicio.nombre, ejercicio.notas]);

  const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`cómo hacer ${ejercicio.nombre} ejercicio correctamente`)}`;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-t-2xl bg-white sm:rounded-2xl max-h-[90vh] flex flex-col">

        {/* Cabecera */}
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 p-5">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-900 leading-snug">{ejercicio.nombre}</h2>
            <div className="mt-1 flex flex-wrap gap-1.5 text-xs">
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-gray-600">
                {ejercicio.series} series
              </span>
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-gray-600">
                {ejercicio.repeticiones} reps
              </span>
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-gray-600">
                {ejercicio.descanso_segundos}s descanso
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            aria-label="Cerrar"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenido scrollable */}
        <div className="overflow-y-auto flex-1 p-5 space-y-5">

          {cargando && (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-blue-500" />
              <p className="text-sm">Cargando explicación…</p>
            </div>
          )}

          {error && !cargando && (
            <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 text-center">
              No se pudo cargar la explicación. Prueba con el vídeo de YouTube.
            </div>
          )}

          {info && !cargando && (
            <>
              {/* Músculos */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Músculos trabajados</p>
                <div className="flex flex-wrap gap-1.5">
                  {info.musculos.map((m) => (
                    <span key={m} className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              {/* Descripción */}
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-sm text-gray-700 leading-relaxed">{info.descripcion}</p>
              </div>

              {/* Pasos */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Cómo hacerlo</p>
                <ol className="space-y-2">
                  {info.pasos.map((paso, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                      <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white mt-0.5">
                        {i + 1}
                      </span>
                      {paso.replace(/^Paso \d+:\s*/i, "")}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Errores comunes */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Errores frecuentes</p>
                <ul className="space-y-1.5">
                  {info.errores_comunes.map((err, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="mt-0.5 text-orange-500 flex-shrink-0">⚠</span>
                      {err}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Consejo */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 mb-1">Consejo clave</p>
                <p className="text-sm text-emerald-800">{info.consejo}</p>
              </div>
            </>
          )}
        </div>

        {/* Footer — botón vídeo siempre visible */}
        <div className="border-t border-gray-100 p-4">
          <a
            href={youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-red-600 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            Ver vídeo en YouTube
          </a>
        </div>

      </div>
    </div>
  );
}
