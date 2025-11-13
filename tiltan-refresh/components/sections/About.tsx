"use client";

import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Award, Users, BookOpen, TrendingUp, Globe, Lightbulb } from "lucide-react";

const About = () => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

  const features = [
    {
      icon: Award,
      title: "Excellence Since 1994",
      description: "Over three decades of educational leadership in design and creative fields",
    },
    {
      icon: Users,
      title: "Industry Experts",
      description: "Learn from working professionals who bring real-world experience to the classroom",
    },
    {
      icon: BookOpen,
      title: "European Accreditation",
      description: "Internationally recognized degrees in partnership with leading European institutions",
    },
    {
      icon: TrendingUp,
      title: "Career-Focused",
      description: "95% of our graduates find employment in their field within 6 months",
    },
    {
      icon: Globe,
      title: "Global Network",
      description: "Connect with 5000+ alumni working at top companies worldwide",
    },
    {
      icon: Lightbulb,
      title: "Innovation Hub",
      description: "Access cutting-edge tools, software, and technologies including Unity authorization",
    },
  ];

  const milestones = [
    { year: "1994", event: "Tiltan College Founded" },
    { year: "2000", event: "European Accreditation Achieved" },
    { year: "2010", event: "Unity Authorized Training Center" },
    { year: "2020", event: "5000+ Alumni Milestone" },
    { year: "2024", event: "30 Years of Excellence" },
  ];

  return (
    <section id="about" className="py-20 lg:py-32 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16 lg:mb-24"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display mb-6">
            About
            <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
              {" "}Tiltan
            </span>
          </h2>
          <p className="text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto">
            Leading design college in Haifa, Israel, dedicated to nurturing creative talent
            and preparing students for successful careers in the evolving creative industries.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                className="group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="p-6 rounded-lg bg-card border border-muted hover:border-accent/50 transition-all h-full">
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                    <Icon className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Timeline */}
        <motion.div
          className="relative max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h3 className="text-3xl font-bold font-display text-center mb-12">Our Journey</h3>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-accent/30 -translate-x-1/2 hidden md:block" />

            {/* Milestones */}
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={index}
                  className={`relative flex items-center gap-8 ${
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className={`flex-1 ${index % 2 === 0 ? "text-right" : "text-left"}`}>
                    <div className="text-3xl font-bold text-accent mb-2">{milestone.year}</div>
                    <div className="text-lg text-muted-foreground">{milestone.event}</div>
                  </div>

                  {/* Timeline Dot */}
                  <div className="w-4 h-4 rounded-full bg-accent border-4 border-background relative z-10 flex-shrink-0" />

                  <div className="flex-1" />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          className="mt-24 p-12 rounded-2xl bg-gradient-to-br from-accent/10 to-primary/10 border border-accent/20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl lg:text-5xl font-bold text-accent mb-2">30+</div>
              <div className="text-muted-foreground">Years Experience</div>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-bold text-accent mb-2">5000+</div>
              <div className="text-muted-foreground">Alumni</div>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-bold text-accent mb-2">95%</div>
              <div className="text-muted-foreground">Employment Rate</div>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-bold text-accent mb-2">9</div>
              <div className="text-muted-foreground">Creative Programs</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
