"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

interface Tiltan3DLogoProps {
  autoRotate?: boolean;
  interactive?: boolean;
  className?: string;
  scale?: number;
}

// Clover petal component
function CloverPetal({ rotation, color }: { rotation: number; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Subtle floating animation
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime + rotation) * 0.02;
    }
  });

  // Create heart-shaped petal using curve
  const shape = new THREE.Shape();
  const x = 0, y = 0;
  shape.moveTo(x, y);
  shape.bezierCurveTo(x, y - 0.3, x - 0.6, y - 0.3, x - 0.6, y);
  shape.bezierCurveTo(x - 0.6, y + 0.3, x - 0.3, y + 0.5, x, y + 0.8);
  shape.bezierCurveTo(x + 0.3, y + 0.5, x + 0.6, y + 0.3, x + 0.6, y);
  shape.bezierCurveTo(x + 0.6, y - 0.3, x, y - 0.3, x, y);

  const extrudeSettings = {
    depth: 0.15,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.05,
    bevelSegments: 5,
  };

  return (
    <mesh
      ref={meshRef}
      rotation={[0, 0, rotation]}
      position={[0, 0, 0]}
      castShadow
      receiveShadow
    >
      <extrudeGeometry args={[shape, extrudeSettings]} />
      <meshStandardMaterial
        color={color}
        metalness={0.2}
        roughness={0.3}
        emissive={color}
        emissiveIntensity={0.1}
      />
    </mesh>
  );
}

// Stem component
function Stem() {
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <group position={[0, -1.2, 0]}>
      <mesh ref={meshRef} castShadow receiveShadow>
        <cylinderGeometry args={[0.08, 0.12, 1.5, 16]} />
        <meshStandardMaterial
          color="#4ade80"
          metalness={0.3}
          roughness={0.5}
          emissive="#16a34a"
          emissiveIntensity={0.1}
        />
      </mesh>
      {/* Stem highlight */}
      <mesh position={[-0.04, 0, 0.08]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 1.5, 16]} />
        <meshStandardMaterial
          color="#22c55e"
          metalness={0.4}
          roughness={0.4}
          transparent
          opacity={0.8}
        />
      </mesh>
    </group>
  );
}

// Main clover component
function CloverModel({ autoRotate }: { autoRotate: boolean }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += delta * 0.5;
    }
  });

  // Pink gradient colors for petals
  const petalColors = [
    "#ffc0cb", // Light pink
    "#ffb6c1",
    "#ffadb9",
    "#ffa4b1",
    "#ff9ba9",
  ];

  return (
    <group ref={groupRef}>
      {/* 5 petals arranged in a circle */}
      {[0, 1, 2, 3, 4].map((i) => (
        <CloverPetal
          key={i}
          rotation={(Math.PI * 2 * i) / 5}
          color={petalColors[i]}
        />
      ))}

      {/* Stem */}
      <Stem />

      {/* Center sphere */}
      <mesh position={[0, 0, 0.1]} castShadow>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial
          color="#ffd700"
          metalness={0.6}
          roughness={0.2}
          emissive="#ffa500"
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  );
}

// Main component
const Tiltan3DLogo: React.FC<Tiltan3DLogoProps> = ({
  autoRotate = true,
  interactive = true,
  className = "",
  scale = 1,
}) => {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={45} />

        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-5, 5, 5]} intensity={0.5} color="#ffc0cb" />
        <spotLight
          position={[0, 10, 0]}
          angle={0.3}
          penumbra={1}
          intensity={0.5}
          castShadow
          color="#ffffff"
        />

        {/* 3D Model */}
        <CloverModel autoRotate={autoRotate} />

        {/* Environment */}
        <Environment preset="city" />

        {/* Ground plane */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -2, 0]}
          receiveShadow
        >
          <planeGeometry args={[10, 10]} />
          <shadowMaterial opacity={0.3} />
        </mesh>

        {/* Controls */}
        {interactive && (
          <OrbitControls
            enableZoom={true}
            enablePan={false}
            minDistance={3}
            maxDistance={8}
            maxPolarAngle={Math.PI / 2}
          />
        )}
      </Canvas>
    </div>
  );
};

export default Tiltan3DLogo;
