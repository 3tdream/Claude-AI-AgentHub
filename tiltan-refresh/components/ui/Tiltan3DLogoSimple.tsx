"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float, MeshDistortMaterial, Sphere } from "@react-three/drei";
import * as THREE from "three";

interface Tiltan3DLogoSimpleProps {
  autoRotate?: boolean;
  interactive?: boolean;
  className?: string;
}

// Create heart-shaped petal geometry based on Tiltan SVG icon
function createHeartShape() {
  const shape = new THREE.Shape();

  // Heart shape matching the SVG clover design
  shape.moveTo(0, 0);
  shape.bezierCurveTo(0, -0.5, -0.8, -0.8, -0.8, -0.2);
  shape.bezierCurveTo(-0.8, 0.4, -0.4, 0.8, 0, 1.2);
  shape.bezierCurveTo(0.4, 0.8, 0.8, 0.4, 0.8, -0.2);
  shape.bezierCurveTo(0.8, -0.8, 0, -0.5, 0, 0);

  return shape;
}

// Tiltan clover with 4 heart-shaped petals
function GeometricClover() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  const heartShape = useMemo(() => createHeartShape(), []);

  // 4 petals arranged in clover pattern (rotated 90 degrees left)
  const petals = useMemo(() => {
    return Array.from({ length: 4 }, (_, i) => {
      const angle = (Math.PI * 2 * i) / 4; // Aligned to cardinal directions
      const distance = 0.8;
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      return { x, z, angle };
    });
  }, []);

  return (
    <group ref={groupRef}>
      {petals.map((petal, i) => (
        <Float key={i} speed={2} rotationIntensity={0.3} floatIntensity={0.4}>
          <mesh
            position={[petal.x, 0, petal.z]}
            rotation={[0, petal.angle + Math.PI / 2, 0]}
            castShadow
          >
            <extrudeGeometry
              args={[
                heartShape,
                {
                  depth: 0.35,
                  bevelEnabled: true,
                  bevelThickness: 0.1,
                  bevelSize: 0.08,
                  bevelSegments: 10,
                },
              ]}
            />
            <MeshDistortMaterial
              color="#22c55e"
              speed={2}
              distort={0.15}
              radius={1}
              metalness={0.5}
              roughness={0.3}
              emissive="#166534"
              emissiveIntensity={0.4}
            />
          </mesh>
        </Float>
      ))}

      {/* Center golden sphere */}
      <Float speed={3} rotationIntensity={0.2} floatIntensity={0.3}>
        <Sphere args={[0.35, 32, 32]} castShadow>
          <MeshDistortMaterial
            color="#fbbf24"
            speed={3}
            distort={0.25}
            radius={1}
            metalness={0.8}
            roughness={0.15}
            emissive="#f59e0b"
            emissiveIntensity={0.6}
          />
        </Sphere>
      </Float>

      {/* Subtle glowing particles around the clover */}
      {[...Array(16)].map((_, i) => {
        const radius = 2.5 + Math.random() * 0.5;
        const theta = (Math.PI * 2 * i) / 16;
        const x = radius * Math.cos(theta);
        const z = radius * Math.sin(theta);
        const y = (Math.random() - 0.5) * 1.5;

        return (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial
              color="#22c55e"
              emissive="#22c55e"
              emissiveIntensity={1.5}
              transparent
              opacity={0.7}
            />
          </mesh>
        );
      })}
    </group>
  );
}

const Tiltan3DLogoSimple: React.FC<Tiltan3DLogoSimpleProps> = ({
  autoRotate = true,
  interactive = true,
  className = "",
}) => {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }} shadows>
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#ff69b4" />
        <spotLight
          position={[0, 10, 0]}
          angle={0.5}
          penumbra={1}
          intensity={1}
          castShadow
        />

        {/* 3D Model */}
        <GeometricClover />

        {/* Ground */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]} receiveShadow>
          <circleGeometry args={[5, 64]} />
          <meshStandardMaterial
            color="#0a0a0a"
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>

        {/* Fog for depth */}
        <fog attach="fog" args={["#0a0a0a", 5, 15]} />

        {/* Controls */}
        {interactive && (
          <OrbitControls
            enableZoom={true}
            enablePan={false}
            minDistance={4}
            maxDistance={10}
            autoRotate={autoRotate}
            autoRotateSpeed={2}
          />
        )}
      </Canvas>
    </div>
  );
};

export default Tiltan3DLogoSimple;
