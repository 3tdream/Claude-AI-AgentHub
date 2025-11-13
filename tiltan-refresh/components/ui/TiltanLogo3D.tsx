"use client";

import React, { useRef, Suspense, useState } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Float, Center } from "@react-three/drei";
import { OBJLoader } from "three-stdlib";
import * as THREE from "three";

interface TiltanLogo3DProps {
  autoRotate?: boolean;
  interactive?: boolean;
  className?: string;
  showDebug?: boolean;
}

function Logo3DModel({ onDebugUpdate }: { onDebugUpdate?: (data: any) => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial | null>(null);

  // Load the OBJ model
  const obj = useLoader(OBJLoader, "/models/tiltan-logo.obj");

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.5;

      // Update debug info
      if (onDebugUpdate && materialRef.current) {
        onDebugUpdate({
          quaternion: groupRef.current.quaternion,
          scale: groupRef.current.scale,
          position: groupRef.current.position,
          color: materialRef.current.color,
          opacity: materialRef.current.opacity,
          roughness: materialRef.current.roughness,
          metalness: materialRef.current.metalness,
          emissive: materialRef.current.emissive,
          emissiveIntensity: materialRef.current.emissiveIntensity,
        });
      }
    }
  });

  // Clone and apply materials to the loaded model
  const model = obj.clone();

  // Apply green material to all meshes
  model.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      const material = new THREE.MeshStandardMaterial({
        color: "#22c55e",
        metalness: 0.6,
        roughness: 0.3,
        emissive: "#166534",
        emissiveIntensity: 0.3,
      });
      child.material = material;
      child.castShadow = true;
      child.receiveShadow = true;

      // Store reference to first material for debug
      if (!materialRef.current) {
        materialRef.current = material;
      }
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
      <Center>
        <group ref={groupRef} scale={0.15}>
          <primitive object={model} />
        </group>
      </Center>
    </Float>
  );
}

const TiltanLogo3D: React.FC<TiltanLogo3DProps> = ({
  autoRotate = true,
  interactive = true,
  className = "",
  showDebug = false,
}) => {
  const [debugData, setDebugData] = useState<any>(null);

  return (
    <div className={`w-full h-full relative ${className}`}>
      <Canvas camera={{ position: [0, 1, 5], fov: 55 }}>
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-10, -10, -5]} intensity={0.6} color="#22c55e" />
        <spotLight
          position={[0, 10, 0]}
          angle={0.5}
          penumbra={1}
          intensity={0.8}
          castShadow
        />

        {/* 3D Model with Suspense for loading */}
        <Suspense fallback={null}>
          <Logo3DModel onDebugUpdate={showDebug ? setDebugData : undefined} />
        </Suspense>

        {/* Camera Controls */}
        {interactive && (
          <OrbitControls
            enableZoom={true}
            enablePan={false}
            minDistance={5}
            maxDistance={15}
            autoRotate={autoRotate}
            autoRotateSpeed={2}
          />
        )}
      </Canvas>

      {/* Debug Overlay */}
      {showDebug && debugData && (
        <div className="absolute top-4 left-4 bg-black/80 text-green-400 p-4 rounded-lg font-mono text-xs space-y-2 pointer-events-none max-h-[90vh] overflow-y-auto">
          <div className="font-bold text-sm mb-2">3D Logo Debug Info</div>

          <div>
            <div className="text-green-300">Scale:</div>
            <div className="ml-2">
              x: {debugData.scale.x.toFixed(3)}<br />
              y: {debugData.scale.y.toFixed(3)}<br />
              z: {debugData.scale.z.toFixed(3)}
            </div>
          </div>

          <div>
            <div className="text-green-300">Position:</div>
            <div className="ml-2">
              x: {debugData.position.x.toFixed(3)}<br />
              y: {debugData.position.y.toFixed(3)}<br />
              z: {debugData.position.z.toFixed(3)}
            </div>
          </div>

          <div>
            <div className="text-green-300">Quaternion:</div>
            <div className="ml-2">
              x: {debugData.quaternion.x.toFixed(3)}<br />
              y: {debugData.quaternion.y.toFixed(3)}<br />
              z: {debugData.quaternion.z.toFixed(3)}<br />
              w: {debugData.quaternion.w.toFixed(3)}
            </div>
          </div>

          <div>
            <div className="text-green-300">Logo Color:</div>
            <div className="ml-2">
              r: {debugData.color.r.toFixed(3)}<br />
              g: {debugData.color.g.toFixed(3)}<br />
              b: {debugData.color.b.toFixed(3)}<br />
              hex: #{debugData.color.getHexString()}
            </div>
          </div>

          <div>
            <div className="text-green-300">Logo Opacity:</div>
            <div className="ml-2">
              {debugData.opacity.toFixed(3)}
            </div>
          </div>

          <div>
            <div className="text-green-300">Logo Roughness:</div>
            <div className="ml-2">
              {debugData.roughness.toFixed(3)}
            </div>
          </div>

          <div>
            <div className="text-green-300">Metalness:</div>
            <div className="ml-2">
              {debugData.metalness.toFixed(3)}
            </div>
          </div>

          <div>
            <div className="text-green-300">Emissive:</div>
            <div className="ml-2">
              r: {debugData.emissive.r.toFixed(3)}<br />
              g: {debugData.emissive.g.toFixed(3)}<br />
              b: {debugData.emissive.b.toFixed(3)}<br />
              intensity: {debugData.emissiveIntensity.toFixed(3)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TiltanLogo3D;
