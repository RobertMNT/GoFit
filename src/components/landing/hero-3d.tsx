"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

function Dumbbell({ position = [0, 0, 0] as [number, number, number], scale = 1, speed = 0.2 }) {
  const group = useRef<THREE.Group>(null);
  const baseAngle = useRef(Math.random() * Math.PI * 2);

  useFrame(({ clock, pointer }) => {
    if (!group.current) return;
    group.current.rotation.y = baseAngle.current + clock.elapsedTime * speed;
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, pointer.y * 0.25, 0.04);
  });

  const barMat    = <meshStandardMaterial color="#1e293b" metalness={0.98} roughness={0.04} />;
  const plateMat  = <meshStandardMaterial color="#0f172a" metalness={0.95} roughness={0.08} />;
  const collarMat = <meshStandardMaterial color="#1d4ed8" emissive="#2563eb" emissiveIntensity={0.4} metalness={1} roughness={0} />;

  const plates: { pos: number; r: number }[] = [
    { pos: 1.05, r: 0.56 },
    { pos: 1.28, r: 0.48 },
    { pos: 1.48, r: 0.40 },
  ];

  return (
    <group ref={group} position={position} scale={scale}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.055, 0.055, 3.4, 20]} />
        {barMat}
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.065, 0.065, 0.9, 20]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.3} />
      </mesh>
      {plates.map(({ pos, r }) => (
        <group key={pos}>
          <mesh position={[-pos, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[r, r, 0.14, 32]} />
            {plateMat}
          </mesh>
          <mesh position={[pos, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[r, r, 0.14, 32]} />
            {plateMat}
          </mesh>
        </group>
      ))}
      {[-0.68, 0.68].map((x) => (
        <mesh key={x} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.1, 0.1, 0.18, 20]} />
          {collarMat}
        </mesh>
      ))}
      {[-1.65, 1.65].map((x) => (
        <mesh key={x} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.12, 0.12, 0.12, 20]} />
          {barMat}
        </mesh>
      ))}
    </group>
  );
}

function GymLights() {
  const spotRef = useRef<THREE.SpotLight>(null);
  useFrame(({ clock }) => {
    if (!spotRef.current) return;
    spotRef.current.intensity = 5 + Math.sin(clock.elapsedTime * 0.8) * 0.4;
  });
  return (
    <>
      <spotLight ref={spotRef} position={[0, 8, 4]} angle={0.35} penumbra={0.8} intensity={5} color="#ffffff" castShadow />
      <pointLight position={[-4, 2, 3]} intensity={2} color="#3b82f6" />
      <pointLight position={[4, -2, 2]} intensity={1.5} color="#7c3aed" />
      <pointLight position={[0, -4, 5]} intensity={1.2} color="#ffffff" />
      <ambientLight intensity={0.3} />
    </>
  );
}

export function Hero3D() {
  return (
    <Canvas
      camera={{ position: [0, 1, 7], fov: 38 }}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.LinearToneMapping }}
      style={{ width: "100%", height: "100%", background: "transparent" }}
    >
      <GymLights />

      <Float speed={1} floatIntensity={0.4} rotationIntensity={0.1}>
        <Dumbbell position={[0, 0, 0]} scale={1.2} speed={0.22} />
      </Float>

      <Sparkles count={50} scale={5} size={1.0} speed={0.2} color="#60a5fa" />
    </Canvas>
  );
}
