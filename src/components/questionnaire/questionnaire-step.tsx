"use client";

import { useState, useEffect } from "react";
import type { QuestionnaireData } from "@/lib/questionnaire-schema";

interface QuestionnaireStepProps {
  step: number;
  data: QuestionnaireData;
  onChange: (updates: Partial<QuestionnaireData>) => void;
}

// Renderiza la pregunta correspondiente al paso actual
export function QuestionnaireStep({ step, data, onChange }: QuestionnaireStepProps) {
  switch (step) {
    case 0:
      return <StepObjetivo data={data} onChange={onChange} />;
    case 1:
      return <StepNivel data={data} onChange={onChange} />;
    case 2:
      return <StepFrequencia data={data} onChange={onChange} />;
    case 3:
      return <StepLugar data={data} onChange={onChange} />;
    case 4:
      return <StepEquipamiento data={data} onChange={onChange} />;
    case 5:
      return <StepDatosFisicos data={data} onChange={onChange} />;
    case 6:
      return <StepActividad data={data} onChange={onChange} />;
    case 7:
      return <StepRestricciones data={data} onChange={onChange} />;
    case 8:
      return <StepDieta data={data} onChange={onChange} />;
    default:
      return null;
  }
}

// ── Paso 0: Objetivo ──────────────────────────────────────────
function StepObjetivo({ data, onChange }: Omit<QuestionnaireStepProps, "step">) {
  const opciones = [
    { value: "perder_peso", label: "Perder peso", emoji: "🔥" },
    { value: "ganar_musculo", label: "Ganar músculo", emoji: "💪" },
    { value: "mejorar_resistencia", label: "Mejorar resistencia", emoji: "🏃" },
    { value: "bienestar_general", label: "Bienestar general", emoji: "🧘" },
  ] as const;

  return (
    <div>
      <h2 className="mb-2 text-xl font-semibold text-gray-900">¿Cuál es tu objetivo principal?</h2>
      <p className="mb-6 text-sm text-gray-500">Selecciona el que mejor describe tu meta</p>
      <div className="grid grid-cols-2 gap-3">
        {opciones.map((op) => (
          <OptionCard
            key={op.value}
            emoji={op.emoji}
            label={op.label}
            selected={data.objetivo === op.value}
            onClick={() => onChange({ objetivo: op.value })}
          />
        ))}
      </div>
    </div>
  );
}

// ── Paso 1: Nivel de experiencia ──────────────────────────────
function StepNivel({ data, onChange }: Omit<QuestionnaireStepProps, "step">) {
  const opciones = [
    { value: "principiante", label: "Principiante", desc: "Menos de 6 meses de experiencia" },
    { value: "intermedio", label: "Intermedio", desc: "6 meses a 2 años" },
    { value: "avanzado", label: "Avanzado", desc: "Más de 2 años entrenando" },
  ] as const;

  return (
    <div>
      <h2 className="mb-2 text-xl font-semibold text-gray-900">¿Cuál es tu nivel de experiencia?</h2>
      <p className="mb-6 text-sm text-gray-500">Sé honesto/a — tu plan se adaptará a ello</p>
      <div className="space-y-3">
        {opciones.map((op) => (
          <button
            key={op.value}
            onClick={() => onChange({ nivel: op.value })}
            className={`w-full rounded-xl border-2 p-4 text-left transition ${
              data.nivel === op.value
                ? "border-violet-500 bg-violet-50"
                : "border-gray-200 hover:border-violet-200"
            }`}
          >
            <div className="font-medium text-gray-900">{op.label}</div>
            <div className="text-sm text-gray-500">{op.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Paso 2: Frecuencia y duración ─────────────────────────────
function StepFrequencia({ data, onChange }: Omit<QuestionnaireStepProps, "step">) {
  return (
    <div>
      <h2 className="mb-2 text-xl font-semibold text-gray-900">¿Cuánto tiempo puedes entrenar?</h2>
      <p className="mb-6 text-sm text-gray-500">Sé realista con tu disponibilidad</p>

      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Días por semana: <span className="text-violet-600">{data.dias_por_semana}</span>
        </label>
        <input
          type="range"
          min={2}
          max={5}
          value={data.dias_por_semana}
          onChange={(e) => onChange({ dias_por_semana: Number(e.target.value) })}
          className="w-full accent-violet-600"
        />
        <div className="mt-1 flex justify-between text-xs text-gray-400">
          <span>2 días</span>
          <span>5 días</span>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Minutos por sesión: <span className="text-violet-600">{data.duracion_sesion} min</span>
        </label>
        <div className="grid grid-cols-4 gap-2">
          {[20, 30, 45, 60, 75, 90, 105, 120].map((min) => (
            <button
              key={min}
              onClick={() => onChange({ duracion_sesion: min })}
              className={`rounded-lg border py-2 text-sm transition ${
                data.duracion_sesion === min
                  ? "border-violet-500 bg-violet-50 font-semibold text-violet-700"
                  : "border-gray-200 text-gray-600 hover:border-violet-200"
              }`}
            >
              {min}m
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Paso 3: Lugar de entrenamiento ────────────────────────────
function StepLugar({ data, onChange }: Omit<QuestionnaireStepProps, "step">) {
  const opciones = [
    { value: "casa", label: "En casa", emoji: "🏠" },
    { value: "gimnasio", label: "Gimnasio", emoji: "🏋️" },
    { value: "exterior", label: "Exterior", emoji: "🌳" },
  ] as const;

  const toggle = (value: "casa" | "gimnasio" | "exterior") => {
    const actual = data.lugar_entreno as string[];
    const nuevo = actual.includes(value)
      ? actual.filter((v) => v !== value)
      : [...actual, value];
    if (nuevo.length > 0) onChange({ lugar_entreno: nuevo as ("casa" | "gimnasio" | "exterior")[] });
  };

  return (
    <div>
      <h2 className="mb-2 text-xl font-semibold text-gray-900">¿Dónde vas a entrenar?</h2>
      <p className="mb-6 text-sm text-gray-500">Puedes seleccionar varios lugares</p>
      <div className="grid grid-cols-3 gap-3">
        {opciones.map((op) => (
          <OptionCard
            key={op.value}
            emoji={op.emoji}
            label={op.label}
            selected={(data.lugar_entreno as string[]).includes(op.value)}
            onClick={() => toggle(op.value)}
          />
        ))}
      </div>
    </div>
  );
}

// ── Paso 4: Equipamiento disponible ───────────────────────────
const TODO_EQUIPAMIENTO = [
  { value: "sin_equipamiento", label: "Sin equipamiento" },
  { value: "mancuernas", label: "Mancuernas" },
  { value: "barra", label: "Barra + discos" },
  { value: "maquinas", label: "Máquinas gimnasio" },
  { value: "bandas", label: "Bandas elásticas" },
  { value: "kettlebell", label: "Kettlebell" },
  { value: "cuerda", label: "Cuerda de saltar" },
  { value: "esterilla", label: "Esterilla" },
];

function StepEquipamiento({ data, onChange }: Omit<QuestionnaireStepProps, "step">) {
  const toggle = (value: string) => {
    const actual = data.equipamiento;
    // "sin_equipamiento" es exclusivo con el resto
    if (value === "sin_equipamiento") {
      onChange({ equipamiento: ["sin_equipamiento"] });
      return;
    }
    const sinEq = actual.filter((v) => v !== "sin_equipamiento");
    const nuevo = sinEq.includes(value) ? sinEq.filter((v) => v !== value) : [...sinEq, value];
    onChange({ equipamiento: nuevo.length > 0 ? nuevo : ["sin_equipamiento"] });
  };

  return (
    <div>
      <h2 className="mb-2 text-xl font-semibold text-gray-900">¿Con qué equipamiento cuentas?</h2>
      <p className="mb-6 text-sm text-gray-500">Puedes seleccionar varias opciones</p>
      <div className="grid grid-cols-2 gap-2">
        {TODO_EQUIPAMIENTO.map((eq) => (
          <button
            key={eq.value}
            onClick={() => toggle(eq.value)}
            className={`rounded-xl border-2 px-4 py-3 text-left text-sm transition ${
              data.equipamiento.includes(eq.value)
                ? "border-violet-500 bg-violet-50 font-medium text-violet-700"
                : "border-gray-200 text-gray-600 hover:border-violet-200"
            }`}
          >
            {eq.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Paso 5: Datos físicos ─────────────────────────────────────
function StepDatosFisicos({ data, onChange }: Omit<QuestionnaireStepProps, "step">) {
  const sexoOpciones = [
    { value: "hombre", label: "Hombre" },
    { value: "mujer", label: "Mujer" },
    { value: "prefiero_no_decirlo", label: "Prefiero no decirlo" },
  ] as const;

  return (
    <div>
      <h2 className="mb-2 text-xl font-semibold text-gray-900">Cuéntanos sobre ti</h2>
      <p className="mb-6 text-sm text-gray-500">
        Datos usados exclusivamente para personalizar tu plan. No se comparten con nadie.
      </p>

      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          {sexoOpciones.map((op) => (
            <button
              key={op.value}
              onClick={() => onChange({ sexo: op.value })}
              className={`rounded-xl border-2 py-2 text-sm transition ${
                data.sexo === op.value
                  ? "border-violet-500 bg-violet-50 font-medium text-violet-700"
                  : "border-gray-200 text-gray-600 hover:border-violet-200"
              }`}
            >
              {op.label}
            </button>
          ))}
        </div>

        <NumberInput
          label="Edad"
          value={data.edad}
          min={16}
          max={80}
          unit="años"
          onChange={(v) => onChange({ edad: v })}
        />
        <NumberInput
          label="Peso"
          value={data.peso_kg}
          min={30}
          max={250}
          unit="kg"
          step={0.5}
          onChange={(v) => onChange({ peso_kg: v })}
        />
        <NumberInput
          label="Altura"
          value={data.altura_cm}
          min={130}
          max={230}
          unit="cm"
          onChange={(v) => onChange({ altura_cm: v })}
        />
      </div>
    </div>
  );
}

// ── Paso 6: Nivel de actividad diaria ─────────────────────────
function StepActividad({ data, onChange }: Omit<QuestionnaireStepProps, "step">) {
  const opciones = [
    { value: "sedentario", label: "Sedentario", desc: "Trabajo de oficina, poco movimiento" },
    { value: "ligero", label: "Ligero", desc: "Caminas un poco al día" },
    { value: "moderado", label: "Moderado", desc: "Activo durante el día" },
    { value: "activo", label: "Muy activo", desc: "Trabajo físico o mucho deporte" },
  ] as const;

  return (
    <div>
      <h2 className="mb-2 text-xl font-semibold text-gray-900">¿Cómo es tu actividad diaria?</h2>
      <p className="mb-6 text-sm text-gray-500">Al margen del ejercicio planificado</p>
      <div className="space-y-3">
        {opciones.map((op) => (
          <button
            key={op.value}
            onClick={() => onChange({ nivel_actividad_diaria: op.value })}
            className={`w-full rounded-xl border-2 p-4 text-left transition ${
              data.nivel_actividad_diaria === op.value
                ? "border-violet-500 bg-violet-50"
                : "border-gray-200 hover:border-violet-200"
            }`}
          >
            <div className="font-medium text-gray-900">{op.label}</div>
            <div className="text-sm text-gray-500">{op.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Paso 7: Restricciones / lesiones ─────────────────────────
function StepRestricciones({ data, onChange }: Omit<QuestionnaireStepProps, "step">) {
  return (
    <div>
      <h2 className="mb-2 text-xl font-semibold text-gray-900">
        ¿Tienes alguna lesión o limitación?
      </h2>
      <p className="mb-6 text-sm text-gray-500">
        Opcional — nos ayuda a evitar ejercicios que puedan hacerte daño
      </p>
      <textarea
        value={data.restricciones}
        onChange={(e) => onChange({ restricciones: e.target.value })}
        rows={5}
        maxLength={500}
        placeholder="Ej: lesión en rodilla derecha, dolor lumbar, no puedo hacer saltos..."
        className="w-full resize-none rounded-xl border border-gray-300 p-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
      />
      <p className="mt-1 text-right text-xs text-gray-400">{data.restricciones.length}/500</p>
    </div>
  );
}

// ── Paso 8: Preferencias de dieta ────────────────────────────
function StepDieta({ data, onChange }: Omit<QuestionnaireStepProps, "step">) {
  const opciones = [
    { value: "sin_restriccion", label: "Sin restricciones", emoji: "🍽️", desc: "Como de todo" },
    { value: "vegetariano",     label: "Vegetariano",       emoji: "🥦", desc: "Sin carne ni pescado" },
    { value: "vegano",          label: "Vegano",            emoji: "🌱", desc: "Solo alimentos de origen vegetal" },
    { value: "sin_gluten",      label: "Sin gluten",        emoji: "🌾", desc: "Intolerante al gluten / celiaco" },
    { value: "sin_lactosa",     label: "Sin lactosa",       emoji: "🥛", desc: "Intolerante a la lactosa" },
    { value: "sin_cerdo",       label: "Sin cerdo",         emoji: "🚫", desc: "No consumo cerdo ni derivados" },
  ] as const;

  return (
    <div>
      <h2 className="mb-2 text-xl font-semibold text-gray-900">¿Tienes alguna preferencia alimentaria?</h2>
      <p className="mb-6 text-sm text-gray-500">Tu plan de dieta se adaptará a ella</p>

      <div className="grid grid-cols-2 gap-2 mb-5">
        {opciones.map((op) => (
          <button
            key={op.value}
            onClick={() => onChange({ preferencia_dieta: op.value })}
            className={`rounded-xl border-2 p-3 text-left transition ${
              data.preferencia_dieta === op.value
                ? "border-violet-500 bg-violet-50"
                : "border-gray-200 hover:border-violet-200"
            }`}
          >
            <span className="text-2xl">{op.emoji}</span>
            <div className={`mt-1 text-sm font-medium ${data.preferencia_dieta === op.value ? "text-violet-700" : "text-gray-800"}`}>
              {op.label}
            </div>
            <div className="text-xs text-gray-400">{op.desc}</div>
          </button>
        ))}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Alergias u otros alimentos que evitar <span className="text-gray-400">(opcional)</span>
        </label>
        <textarea
          value={data.restricciones_alimentarias}
          onChange={(e) => onChange({ restricciones_alimentarias: e.target.value })}
          rows={3}
          maxLength={300}
          placeholder="Ej: alergia a los frutos secos, no me gusta el pescado..."
          className="w-full resize-none rounded-xl border border-gray-300 p-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
        />
        <p className="mt-1 text-right text-xs text-gray-400">{data.restricciones_alimentarias.length}/300</p>
      </div>
    </div>
  );
}

// ── Componentes auxiliares ────────────────────────────────────

interface OptionCardProps {
  emoji: string;
  label: string;
  selected: boolean;
  onClick: () => void;
}

function OptionCard({ emoji, label, selected, onClick }: OptionCardProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center rounded-xl border-2 p-4 transition ${
        selected ? "border-violet-500 bg-violet-50" : "border-gray-200 hover:border-violet-200"
      }`}
    >
      <span className="text-3xl">{emoji}</span>
      <span className={`mt-2 text-sm font-medium ${selected ? "text-violet-700" : "text-gray-700"}`}>
        {label}
      </span>
    </button>
  );
}

interface NumberInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  step?: number;
  onChange: (value: number) => void;
}

function NumberInput({ label, value, min, max, unit, step = 1, onChange }: NumberInputProps) {
  // Estado local en string para que el usuario pueda escribir libremente
  const [raw, setRaw] = useState(String(value));

  // Sincronizar si el valor externo cambia (ej: botones ±)
  useEffect(() => {
    setRaw(String(value));
  }, [value]);

  const decrement = () => {
    const next = Math.round((value - step) * 10) / 10;
    if (next >= min) onChange(next);
  };
  const increment = () => {
    const next = Math.round((value + step) * 10) / 10;
    if (next <= max) onChange(next);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Permite escribir libremente (incluso valores parciales como "7" o "")
    setRaw(e.target.value);
  };

  const handleBlur = () => {
    const v = parseFloat(raw);
    if (!isNaN(v) && v >= min && v <= max) {
      // Redondear al step más cercano
      const snapped = Math.round(v / step) * step;
      const clamped = Math.min(max, Math.max(min, Math.round(snapped * 10) / 10));
      onChange(clamped);
      setRaw(String(clamped));
    } else {
      // Valor inválido: volver al último valor válido
      setRaw(String(value));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") (e.target as HTMLInputElement).blur();
  };

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-600">{label}</label>
      <div className="flex items-center gap-4">
        <div className="flex items-center overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {/* Botón − */}
          <button
            type="button"
            onClick={decrement}
            disabled={value <= min}
            className="flex h-12 w-12 items-center justify-center border-r border-gray-200 text-gray-400 transition hover:bg-violet-50 hover:text-violet-600 active:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
            </svg>
          </button>

          {/* Campo editable — escribe libremente, confirma al salir o con Enter */}
          <input
            type="text"
            inputMode="decimal"
            value={raw}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-20 bg-transparent py-2 text-center text-2xl font-bold text-gray-900 outline-none"
          />

          {/* Botón + */}
          <button
            type="button"
            onClick={increment}
            disabled={value >= max}
            className="flex h-12 w-12 items-center justify-center border-l border-gray-200 text-gray-400 transition hover:bg-violet-50 hover:text-violet-600 active:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        <span className="text-sm font-medium text-gray-400">{unit}</span>
      </div>
    </div>
  );
}
