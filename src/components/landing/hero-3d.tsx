"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles, ContactShadows } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useRef } from "react";
import * as THREE from "three";

// ─── Mancuerna hecha con geometría Three.js ─────────────────────────────────
function Dumbbell({ position = [0, 0, 0] as [number, number, number], scale = 1, speed = 0.2 }) {
  const group = useRef<THREE.Group>(null);
  const baseAngle = useRef(Math.random() * Math.PI * 2);

  useFrame(({ clock, pointer }) => {
    if (!group.current) return;
    group.current.rotation.y = baseAngle.current + clock.elapsedTime * speed;
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, pointer.y * 0.25, 0.04);
  });

  // Materiales
  const barMat   = <meshStandardMaterial color="#1e293b" metalness={0.98} roughness={0.04} />;
  const plateMat = <meshStandardMaterial color="#0f172a" metalness={0.95} roughness={0.08} />;
  const collarMat = <meshStandardMaterial color="#1d4ed8" emissive="#2563eb" emissiveIntensity={0.6} metalness={1} roughness={0} toneMapped={false} />;

  // Discos: pares izquierdo/derecho
  const plates: { pos: number; r: number }[] = [
    { pos: 1.05, r: 0.56 },
    { pos: 1.28, r: 0.48 },
    { pos: 1.48, r: 0.40 },
  ];

  return (
    <group ref={group} position={position} scale={scale}>
      {/* Barra central */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.055, 0.055, 3.4, 20]} />
        {barMat}
      </mesh>

      {/* Knurling (textura agarre) */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.065, 0.065, 0.9, 20]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.3} />
      </mesh>

      {plates.map(({ pos, r }) => (
        <group key={pos}>
          {/* Izquierda */}
          <mesh position={[-pos, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[r, r, 0.14, 32]} />
            {plateMat}
          </mesh>
          {/* Derecha */}
          <mesh position={[pos, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[r, r, 0.14, 32]} />
            {plateMat}
          </mesh>
        </group>
      ))}

      {/* Collares azules luminosos */}
      {[-0.68, 0.68].map((x) => (
        <mesh key={x} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.1, 0.1, 0.18, 20]} />
          {collarMat}
        </mesh>
      ))}

      {/* Topes exteriores */}
      {[-1.65, 1.65].map((x) => (
        <mesh key={x} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.12, 0.12, 0.12, 20]} />
          {barMat}
        </mesh>
      ))}
    </group>
  );
}

// ─── Anillo de datos flotante ───────────────────────────────────────────────
function DataRing({ radius, speed, tilt }: { radius: number; speed: number; tilt: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.z = clock.elapsedTime * speed;
  });
  return (
    <group rotation={[tilt, 0, 0]}>
      <group ref={ref}>
        <mesh>
          <torusGeometry args={[radius, 0.012, 16, 200]} />
          <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={2} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

// ─── Luces de estudio/gimnasio ──────────────────────────────────────────────
function GymLights() {
  const spotRef = useRef<THREE.SpotLight>(null);
  useFrame(({ clock }) => {
    if (!spotRef.current) return;
    spotRef.current.intensity = 6 + Math.sin(clock.elapsedTime * 0.8) * 0.5;
  });
  return (
    <>
      <spotLight ref={spotRef} position={[0, 8, 4]} angle={0.35} penumbra={0.8} intensity={6} color="#ffffff" castShadow />
      <pointLight position={[-4, 2, 3]} intensity={2} color="#3b82f6" />
      <pointLight position={[4, -2, 2]}  intensity={1.5} color="#7c3aed" />
      {/* Luces de relleno para compensar la ausencia de entorno HDR */}
      <pointLight position={[0, -4, 5]} intensity={1.2} color="#ffffff" />
      <pointLight position={[5, 5, -3]} intensity={0.8} color="#60a5fa" />
      <ambientLight intensity={0.18} />
    </>
  );
}

// ─── Canvas ─────────────────────────────────────────────────────────────────
export function Hero3D() {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 1, 7], fov: 38 }}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
      style={{ width: "100%", height: "100%" }}
    >
      <GymLights />

      {/* Mancuerna principal */}
      <Float speed={1} floatIntensity={0.35} rotationIntensity={0.1}>
        <Dumbbell position={[0, 0.3, 0]} scale={1.15} speed={0.22} />
      </Float>

      {/* Mancuernas de fondo */}
      <Float speed={0.7} floatIntensity={0.5}>
        <Dumbbell position={[-3.2, -1.2, -2]} scale={0.55} speed={-0.18} />
      </Float>
      <Float speed={0.9} floatIntensity={0.4}>
        <Dumbbell position={[3.0, 1.0, -3]} scale={0.45} speed={0.25} />
      </Float>
      <Float speed={0.6} floatIntensity={0.6}>
        <Dumbbell position={[2.4, -2.0, -1.5]} scale={0.35} speed={-0.3} />
      </Float>

      {/* Anillos de datos orbitando la mancuerna central */}
      <DataRing radius={2.4} speed={0.4}   tilt={Math.PI / 6} />
      <DataRing radius={3.0} speed={-0.28} tilt={Math.PI / 3} />

      {/* Partículas de energía */}
      <Sparkles count={60} scale={5} size={1.2} speed={0.25} color="#60a5fa" />

      {/* Sombra de contacto */}
      <ContactShadows position={[0, -2.5, 0]} opacity={0.4} scale={10} blur={3} far={4} color="#1e40af" />

      <EffectComposer>
        <Bloom intensity={1.4} luminanceThreshold={0.15} luminanceSmoothing={0.85} mipmapBlur />
      </EffectComposer>
    </Canvas>
  );
}
