"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Palette,
  Home,
  Gamepad2,
  Box,
  Film,
  Sparkles,
  PenTool,
  MessageSquare,
  Layers,
} from "lucide-react";

const programs = [
  {
    id: 1,
    title: "Graphic Design",
    description: "Master visual communication, branding, typography, and digital design principles.",
    icon: Palette,
    duration: "2-3 Years",
    level: "Certificate & Degree",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: 2,
    title: "Interior Design",
    description: "Create stunning spaces that combine aesthetics, functionality, and innovation.",
    icon: Home,
    duration: "3 Years",
    level: "Professional Degree",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: 3,
    title: "Game Development",
    description: "Build immersive gaming experiences with cutting-edge technology and creative storytelling.",
    icon: Gamepad2,
    duration: "2 Years",
    level: "Unity Certified",
    color: "from-green-500 to-emerald-500",
  },
  {
    id: 4,
    title: "3D Design",
    description: "Bring ideas to life with advanced 3D modeling, rendering, and animation techniques.",
    icon: Box,
    duration: "2 Years",
    level: "Certificate",
    color: "from-orange-500 to-red-500",
  },
  {
    id: 5,
    title: "Animation",
    description: "Create captivating motion graphics and character animations for film and digital media.",
    icon: Film,
    duration: "2 Years",
    level: "Certificate",
    color: "from-yellow-500 to-orange-500",
  },
  {
    id: 6,
    title: "Post-Production",
    description: "Master video editing, color grading, and visual effects for professional productions.",
    icon: Layers,
    duration: "1-2 Years",
    level: "Certificate",
    color: "from-indigo-500 to-purple-500",
  },
  {
    id: 7,
    title: "Multimedia & Digital Media",
    description: "Blend various media forms to create engaging digital experiences and content.",
    icon: Sparkles,
    duration: "2 Years",
    level: "Certificate",
    color: "from-pink-500 to-rose-500",
  },
  {
    id: 8,
    title: "Illustration",
    description: "Develop your unique artistic voice through traditional and digital illustration techniques.",
    icon: PenTool,
    duration: "1-2 Years",
    level: "Certificate",
    color: "from-teal-500 to-green-500",
  },
  {
    id: 9,
    title: "Copywriting",
    description: "Craft compelling narratives and creative content for advertising and marketing.",
    icon: MessageSquare,
    duration: "1 Year",
    level: "Certificate",
    color: "from-cyan-500 to-blue-500",
  },
];

const Programs = () => {
  const [filter, setFilter] = useState("all");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <section id="programs" className="py-20 lg:py-32 relative">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display mb-6">
            Explore Our
            <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
              {" "}Programs
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose from our diverse range of creative programs designed by industry professionals
          </p>
        </motion.div>

        {/* Programs Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {programs.map((program) => {
            const Icon = program.icon;
            return (
              <motion.div key={program.id} variants={itemVariants}>
                <Card className="h-full group">
                  <CardHeader>
                    <div className="mb-4">
                      <div
                        className={`w-16 h-16 rounded-lg bg-gradient-to-br ${program.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                      >
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="mb-2">{program.title}</CardTitle>
                      <div className="flex gap-2 mb-3">
                        <Badge variant="accent">{program.duration}</Badge>
                        <Badge variant="outline">{program.level}</Badge>
                      </div>
                    </div>
                    <CardDescription className="text-base">
                      {program.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="ghost" className="w-full group-hover:bg-accent/10">
                      Learn More →
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <Button variant="accent" size="lg">
            View Full Curriculum
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default Programs;
