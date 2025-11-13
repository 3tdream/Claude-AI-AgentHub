"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";

const categories = ["All", "Graphic Design", "Interior", "3D", "Animation", "Game Dev"];

const galleryItems = [
  {
    id: 1,
    title: "Brand Identity Project",
    category: "Graphic Design",
    student: "Sarah Cohen",
    image: "/images/placeholder-1.jpg",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: 2,
    title: "Modern Living Space",
    category: "Interior",
    student: "David Levi",
    image: "/images/placeholder-2.jpg",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: 3,
    title: "Character Design",
    category: "3D",
    student: "Maya Tal",
    image: "/images/placeholder-3.jpg",
    color: "from-orange-500 to-red-500",
  },
  {
    id: 4,
    title: "Motion Graphics Reel",
    category: "Animation",
    student: "Ron Shapira",
    image: "/images/placeholder-4.jpg",
    color: "from-green-500 to-emerald-500",
  },
  {
    id: 5,
    title: "Indie Game Prototype",
    category: "Game Dev",
    student: "Noa Ben-David",
    image: "/images/placeholder-5.jpg",
    color: "from-yellow-500 to-orange-500",
  },
  {
    id: 6,
    title: "Packaging Design",
    category: "Graphic Design",
    student: "Eitan Goldberg",
    image: "/images/placeholder-6.jpg",
    color: "from-indigo-500 to-purple-500",
  },
  {
    id: 7,
    title: "Architectural Visualization",
    category: "3D",
    student: "Yael Mizrahi",
    image: "/images/placeholder-7.jpg",
    color: "from-teal-500 to-green-500",
  },
  {
    id: 8,
    title: "Restaurant Interior",
    category: "Interior",
    student: "Amit Rosenfeld",
    image: "/images/placeholder-8.jpg",
    color: "from-pink-500 to-rose-500",
  },
];

const Gallery = () => {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredItems =
    activeCategory === "All"
      ? galleryItems
      : galleryItems.filter((item) => item.category === activeCategory);

  return (
    <section id="gallery" className="py-20 lg:py-32">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display mb-6">
            Student
            <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
              {" "}Work
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore outstanding projects created by our talented students
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === category
                  ? "bg-accent text-accent-foreground scale-105"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {category}
            </button>
          ))}
        </motion.div>

        {/* Gallery Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          layout
        >
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="group cursor-pointer"
            >
              <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                {/* Placeholder with gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-80`} />

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-6">
                  <div className="text-center text-white">
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-sm opacity-90">{item.student}</p>
                    <Badge variant="accent" className="mt-3">
                      {item.category}
                    </Badge>
                  </div>
                </div>

                {/* Category Badge */}
                <div className="absolute top-4 left-4 opacity-100 group-hover:opacity-0 transition-opacity">
                  <Badge variant="secondary">{item.category}</Badge>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* View More CTA */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <button className="text-accent hover:text-accent/80 font-medium transition-colors">
            View Full Portfolio →
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default Gallery;
