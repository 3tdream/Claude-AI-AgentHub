"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

// Dynamically import 3D components to avoid SSR issues
const Tiltan3DLogo = dynamic(
  () => import("@/components/ui/Tiltan3DLogo"),
  { ssr: false }
);

const Tiltan3DLogoSimple = dynamic(
  () => import("@/components/ui/Tiltan3DLogoSimple"),
  { ssr: false }
);

export default function Demo3DPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-muted">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold font-display">Tiltan 3D Logo Demo</h1>
            <Link href="/">
              <Button variant="outline" size="sm">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Intro */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold font-display mb-4">
              Interactive 3D
              <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                {" "}Clover Logo
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore our 3D logo designs created with Three.js and React Three Fiber.
              Click and drag to rotate, scroll to zoom.
            </p>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Realistic Version */}
            <div className="space-y-4">
              <div className="bg-card border border-muted rounded-lg p-6">
                <h3 className="text-2xl font-bold mb-2">Realistic Clover</h3>
                <p className="text-muted-foreground mb-4">
                  High-fidelity 3D model with heart-shaped petals, smooth shading, and realistic lighting
                </p>
                <div className="aspect-square w-full bg-gradient-to-br from-background to-muted rounded-lg overflow-hidden">
                  <Suspense
                    fallback={
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-muted-foreground">Loading 3D model...</div>
                      </div>
                    }
                  >
                    <Tiltan3DLogo autoRotate={true} interactive={true} />
                  </Suspense>
                </div>
                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <p>• 5 heart-shaped petals with gradient pink colors</p>
                  <p>• Green stem with highlights</p>
                  <p>• Golden center sphere</p>
                  <p>• Realistic shadows and lighting</p>
                  <p>• Subtle floating animation</p>
                </div>
              </div>
            </div>

            {/* Geometric Version */}
            <div className="space-y-4">
              <div className="bg-card border border-muted rounded-lg p-6">
                <h3 className="text-2xl font-bold mb-2">Geometric Style</h3>
                <p className="text-muted-foreground mb-4">
                  Modern, abstract interpretation with distortion effects and glowing particles
                </p>
                <div className="aspect-square w-full bg-gradient-to-br from-background to-muted rounded-lg overflow-hidden">
                  <Suspense
                    fallback={
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-muted-foreground">Loading 3D model...</div>
                      </div>
                    }
                  >
                    <Tiltan3DLogoSimple autoRotate={true} interactive={true} />
                  </Suspense>
                </div>
                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <p>• Capsule-shaped petals with distortion shader</p>
                  <p>• Floating animation for depth</p>
                  <p>• Green glowing center orb</p>
                  <p>• Metallic reflective surfaces</p>
                  <p>• Particle effects around the logo</p>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="bg-card border border-muted rounded-lg p-8">
            <h3 className="text-2xl font-bold mb-6 text-center">Features & Capabilities</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <h4 className="font-bold mb-2">Interactive Controls</h4>
                <p className="text-sm text-muted-foreground">
                  Drag to rotate, scroll to zoom. Full orbit controls for exploration.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="font-bold mb-2">Real-time Rendering</h4>
                <p className="text-sm text-muted-foreground">
                  60 FPS performance with dynamic lighting and shadows.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
                <h4 className="font-bold mb-2">Customizable</h4>
                <p className="text-sm text-muted-foreground">
                  Easily adjust colors, materials, and animation speeds.
                </p>
              </div>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="mt-12 text-center">
            <h3 className="text-xl font-bold mb-4">Built With</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <span className="px-4 py-2 bg-muted rounded-full text-sm">Three.js</span>
              <span className="px-4 py-2 bg-muted rounded-full text-sm">React Three Fiber</span>
              <span className="px-4 py-2 bg-muted rounded-full text-sm">React Three Drei</span>
              <span className="px-4 py-2 bg-muted rounded-full text-sm">WebGL</span>
              <span className="px-4 py-2 bg-muted rounded-full text-sm">Next.js 15</span>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <Link href="/">
              <Button variant="accent" size="lg">
                Back to Main Site
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
