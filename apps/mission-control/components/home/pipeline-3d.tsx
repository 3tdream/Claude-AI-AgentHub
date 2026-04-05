"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import type { PipelineExecution, WorkflowStep, StepStatus } from "@/types";
import type * as THREE from "three";

interface Pipeline3DProps {
  steps: WorkflowStep[];
  execution: PipelineExecution;
  onSelectStage: (stageId: string) => void;
  selectedStageId: string | null;
}

// ── Status colors ──
const STATUS_CONFIG: Record<StepStatus, { color: number; emissive: number; intensity: number }> = {
  pending:            { color: 0x4a6080, emissive: 0x4a6080, intensity: 0.05 },
  running:            { color: 0x6366f1, emissive: 0x6366f1, intensity: 0.8 },
  completed:          { color: 0x10b981, emissive: 0x10b981, intensity: 0.4 },
  failed:             { color: 0xef4444, emissive: 0xef4444, intensity: 0.6 },
  skipped:            { color: 0x334155, emissive: 0x334155, intensity: 0.02 },
  awaiting_approval:  { color: 0xf59e0b, emissive: 0xf59e0b, intensity: 0.6 },
  retrying:           { color: 0xf97316, emissive: 0xf97316, intensity: 0.7 },
};

interface NodeData {
  id: string;
  agentName: string;
  status: StepStatus;
  x: number;
  y: number;
  isGate: boolean;
  dependsOn: string[];
}

function layoutNodes(steps: WorkflowStep[], results: Record<string, { status: StepStatus }>): NodeData[] {
  if (steps.length === 0) return [];

  // Topological depth assignment
  const depthMap = new Map<string, number>();
  function getDepth(stepId: string): number {
    if (depthMap.has(stepId)) return depthMap.get(stepId)!;
    const step = steps.find((s) => s.id === stepId);
    if (!step || step.dependsOn.length === 0) { depthMap.set(stepId, 0); return 0; }
    const maxParent = Math.max(...step.dependsOn.map((d) => getDepth(d)));
    const depth = maxParent + 1;
    depthMap.set(stepId, depth);
    return depth;
  }
  steps.forEach((s) => getDepth(s.id));

  // Group by depth
  const maxDepth = Math.max(...Array.from(depthMap.values()), 0);
  const cols: string[][] = [];
  for (let d = 0; d <= maxDepth; d++) {
    cols[d] = steps.filter((s) => depthMap.get(s.id) === d).map((s) => s.id);
  }

  const COL_GAP = 2.5;
  const ROW_GAP = 2.0;
  const nodes: NodeData[] = [];

  for (let col = 0; col < cols.length; col++) {
    const group = cols[col];
    const startY = -(group.length - 1) * ROW_GAP / 2;

    for (let row = 0; row < group.length; row++) {
      const stepId = group[row];
      const step = steps.find((s) => s.id === stepId)!;
      const result = results[stepId];
      const isGate = stepId.includes("-gate") || stepId.includes("verdict") || stepId.includes("consolidation");

      nodes.push({
        id: stepId,
        agentName: step.agentName,
        status: result?.status || "pending",
        x: col * COL_GAP - (maxDepth * COL_GAP) / 2,
        y: startY + row * ROW_GAP,
        isGate,
        dependsOn: step.dependsOn.filter((d) => steps.some((s) => s.id === d)),
      });
    }
  }

  return nodes;
}

export function Pipeline3D({ steps, execution, onSelectStage, selectedStageId }: Pipeline3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Serialize status for change detection
  const stepStatusKey = JSON.stringify(
    Object.entries(execution.stepResults).map(([id, r]) => `${id}:${r.status}`).sort()
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Dynamically import three.js (avoid SSR issues)
    let cancelled = false;

    (async () => {
      const THREE = await import("three");
      const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js");

      if (cancelled) return;

      const W = container.clientWidth;
      const H = container.clientHeight;
      if (W === 0 || H === 0) return;

      // Layout
      const results: Record<string, { status: StepStatus }> = {};
      for (const [id, r] of Object.entries(execution.stepResults)) {
        results[id] = { status: r.status };
      }
      const nodeData = layoutNodes(steps, results);

      // Scene
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(W, H);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x0a0f25, 1);
      container.innerHTML = "";
      container.appendChild(renderer.domElement);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;

      // Lights
      const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
      dirLight.position.set(5, 5, 8);
      scene.add(dirLight);
      scene.add(new THREE.AmbientLight(0x1a2040, 0.6));

      // Grid
      const grid = new THREE.GridHelper(30, 30, 0x1a2550, 0x0a1530);
      grid.rotation.x = Math.PI / 2;
      grid.position.z = -1.5;
      scene.add(grid);

      // Build nodes
      const meshMap = new Map<string, THREE.Mesh>();
      const ringMeshes: THREE.Mesh[] = [];

      nodeData.forEach((node) => {
        const cfg = STATUS_CONFIG[node.status] || STATUS_CONFIG.pending;
        const geo = node.isGate
          ? new THREE.OctahedronGeometry(0.3, 0)
          : node.status === "running"
          ? new THREE.OctahedronGeometry(0.35, 0)
          : new THREE.SphereGeometry(0.3, 16, 16);

        const mat = new THREE.MeshStandardMaterial({
          color: cfg.color,
          emissive: cfg.emissive,
          emissiveIntensity: cfg.intensity,
          roughness: 0.3,
          metalness: 0.7,
        });

        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(node.x, node.y, 0);
        mesh.userData = { nodeId: node.id };
        scene.add(mesh);
        meshMap.set(node.id, mesh);

        // Selection ring
        if (selectedStageId === node.id) {
          const ringGeo = new THREE.TorusGeometry(0.5, 0.04, 8, 32);
          const ringMat = new THREE.MeshBasicMaterial({ color: 0x6366f1, transparent: true, opacity: 0.7 });
          const ring = new THREE.Mesh(ringGeo, ringMat);
          ring.position.copy(mesh.position);
          scene.add(ring);
          ringMeshes.push(ring);
        }

        // Running glow ring
        if (node.status === "running" || node.status === "retrying") {
          const ringGeo = new THREE.TorusGeometry(0.5, 0.025, 8, 32);
          const ringMat = new THREE.MeshBasicMaterial({ color: cfg.color, transparent: true, opacity: 0.4 });
          const ring = new THREE.Mesh(ringGeo, ringMat);
          ring.position.copy(mesh.position);
          scene.add(ring);
          ringMeshes.push(ring);
        }
      });

      // Connections
      nodeData.forEach((node) => {
        node.dependsOn.forEach((depId) => {
          const fromNode = nodeData.find((n) => n.id === depId);
          if (!fromNode) return;

          const points: THREE.Vector3[] = [];
          for (let t = 0; t <= 1; t += 0.05) {
            points.push(new THREE.Vector3(
              fromNode.x + (node.x - fromNode.x) * t,
              fromNode.y + (node.y - fromNode.y) * t,
              Math.sin(t * Math.PI) * 0.4,
            ));
          }
          const curve = new THREE.CatmullRomCurve3(points);
          const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.02, 8, false);
          const completed = fromNode.status === "completed";
          const tubeMat = new THREE.MeshBasicMaterial({
            color: completed ? 0x10b981 : 0x1a3050,
            transparent: true,
            opacity: completed ? 0.5 : 0.15,
          });
          scene.add(new THREE.Mesh(tubeGeo, tubeMat));
        });
      });

      // Particles on active connections
      const particles: Array<{ mesh: THREE.Mesh; from: NodeData; to: NodeData; progress: number; speed: number }> = [];
      const particleGeo = new THREE.SphereGeometry(0.05, 8, 8);

      nodeData.forEach((node) => {
        if (node.status !== "running" && node.status !== "retrying") return;
        node.dependsOn.forEach((depId) => {
          const fromNode = nodeData.find((n) => n.id === depId);
          if (!fromNode || fromNode.status !== "completed") return;
          for (let i = 0; i < 4; i++) {
            const pMat = new THREE.MeshBasicMaterial({
              color: STATUS_CONFIG[fromNode.status].color,
              transparent: true,
              opacity: 0.8,
            });
            const p = new THREE.Mesh(particleGeo, pMat);
            scene.add(p);
            particles.push({ mesh: p, from: fromNode, to: node, progress: Math.random(), speed: 0.004 + Math.random() * 0.004 });
          }
        });
      });

      // Camera position
      const maxX = Math.max(...nodeData.map((n) => Math.abs(n.x)), 4);
      camera.position.set(0, 0, maxX * 2.2);

      // Raycaster for click
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();

      function onClick(event: MouseEvent) {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const meshes = Array.from(meshMap.values());
        const intersects = raycaster.intersectObjects(meshes);
        if (intersects.length > 0) {
          const nodeId = intersects[0].object.userData.nodeId;
          if (nodeId) onSelectStage(nodeId);
        }
      }
      renderer.domElement.addEventListener("click", onClick);

      // Hover cursor
      function onMouseMove(event: MouseEvent) {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const meshes = Array.from(meshMap.values());
        const intersects = raycaster.intersectObjects(meshes);
        renderer.domElement.style.cursor = intersects.length > 0 ? "pointer" : "grab";
      }
      renderer.domElement.addEventListener("mousemove", onMouseMove);

      // Animation
      let animFrame = 0;
      function animate() {
        animFrame = requestAnimationFrame(animate);
        const t = Date.now() * 0.001;

        // Rotate running nodes
        meshMap.forEach((mesh) => {
          const nd = nodeData.find((n) => n.id === mesh.userData.nodeId);
          if (nd && (nd.status === "running" || nd.status === "retrying")) {
            mesh.rotation.y = t * 1.5;
            mesh.position.y = nd.y + Math.sin(t * 2) * 0.1;
          }
        });

        // Rotate rings
        ringMeshes.forEach((ring) => {
          ring.rotation.z = t * 2;
          ring.rotation.x = Math.sin(t) * 0.3;
        });

        // Animate particles
        particles.forEach((p) => {
          p.progress += p.speed;
          if (p.progress > 1) p.progress -= 1;
          const pt = p.progress;
          p.mesh.position.x = p.from.x + (p.to.x - p.from.x) * pt;
          p.mesh.position.y = p.from.y + (p.to.y - p.from.y) * pt;
          p.mesh.position.z = Math.sin(pt * Math.PI) * 0.4;
          (p.mesh.material as THREE.MeshBasicMaterial).opacity = 0.3 + Math.sin(pt * Math.PI) * 0.5;
        });

        controls.update();
        renderer.render(scene, camera);
      }
      animate();

      // Resize
      const observer = new ResizeObserver(() => {
        const w = container.clientWidth;
        const h = container.clientHeight;
        if (w === 0 || h === 0) return;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      });
      observer.observe(container);

      // Cleanup function
      cleanupRef.current = () => {
        cancelAnimationFrame(animFrame);
        observer.disconnect();
        renderer.domElement.removeEventListener("click", onClick);
        renderer.domElement.removeEventListener("mousemove", onMouseMove);
        controls.dispose();
        renderer.dispose();
        scene.clear();
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      };
    })();

    return () => {
      cancelled = true;
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [steps, stepStatusKey, selectedStageId, onSelectStage]);

  return <div ref={containerRef} className="w-full h-full" />;
}
