"use client";

import { Slide as SlideType } from "@/types/slides";
import { Slide } from "./Slide";
import { SlideContent } from "./SlideContent";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { LucideIcon, parseIconText } from "./LucideIcon";
import { motion } from "framer-motion";

// Animation variants for staggered content
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

interface SlideRendererProps {
  slide: SlideType;
}

export function SlideRenderer({ slide }: SlideRendererProps) {
  const { background, overlay, content } = slide;

  // Use fallback URL for images (since local assets may not exist)
  // Use source directly for gradients
  const backgroundSource = background.type === "gradient"
    ? background.source
    : (background.fallback || background.source || "");

  return (
    <Slide key={slide.id} background={backgroundSource} overlay={overlay}>
      <SlideContent alignment={content.alignment}>
        {renderContent(slide)}
      </SlideContent>
    </Slide>
  );
}

function renderContent(slide: SlideType) {
  const { content, type } = slide;

  switch (type) {
    case "title":
      return (
        <motion.div
          className="flex flex-col gap-8 items-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {content.badge && (
            <motion.div variants={itemVariants}>
              <Badge className={`bg-${content.badge.color} text-${content.badge.textColor || "white"} px-6 py-2`}>
                {content.badge.text}
              </Badge>
            </motion.div>
          )}
          {content.title && (
            <motion.h1
              className="text-white text-6xl md:text-8xl text-center"
              variants={itemVariants}
            >
              {content.title}
            </motion.h1>
          )}
          {content.subtitle && (
            <motion.h2
              className="text-white/90 text-2xl md:text-4xl text-center"
              variants={itemVariants}
            >
              {content.subtitle}
            </motion.h2>
          )}
        </motion.div>
      );

    case "content":
      return (
        <motion.div
          className="flex flex-col gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {content.badge && (
            <motion.div variants={itemVariants}>
              <Badge className={`bg-${content.badge.color} text-white px-4 py-2 w-fit ${content.alignment === "center" ? "mx-auto" : ""}`}>
                {content.badge.text}
              </Badge>
            </motion.div>
          )}
          {content.title && (
            <motion.h1
              className={`text-white text-5xl md:text-7xl ${content.alignment === "center" ? "text-center" : ""}`}
              variants={itemVariants}
            >
              {content.title}
            </motion.h1>
          )}
          {content.subtitle && (
            <motion.h3 className="text-white text-3xl mb-4" variants={itemVariants}>
              {content.subtitle}
            </motion.h3>
          )}
          {content.paragraphs && (
            <motion.div className="text-white/90 text-xl md:text-2xl space-y-4" variants={itemVariants}>
              {content.paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </motion.div>
          )}
          {content.quote && (
            <motion.p
              className={`text-${content.quote.color} text-3xl md:text-5xl ${content.alignment === "center" ? "text-center" : ""}`}
              variants={itemVariants}
            >
              "{content.quote.text}"
            </motion.p>
          )}
          {content.items && (
            <motion.div
              className="bg-white/10 backdrop-blur-md p-8 rounded-lg border border-white/20 space-y-4 text-xl"
              variants={itemVariants}
            >
              {content.items.map((item, index) => {
                const { icon, text } = parseIconText(item);
                const isCenter = content.alignment === "center";
                return (
                  <motion.div
                    key={index}
                    className={`flex items-center gap-3 text-white/90 ${isCenter ? "justify-center" : ""}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    {icon ? (
                      <LucideIcon name={icon} size={24} className="flex-shrink-0" />
                    ) : item.startsWith("✓") || item.includes("•") ? null : (
                      <span>✓</span>
                    )}
                    <span>{icon ? text : item.startsWith("✓") || item.includes("•") ? item : text}</span>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
          {content.highlight && (
            <motion.p
              className={`text-${content.highlight.color} text-2xl md:text-3xl`}
              variants={itemVariants}
            >
              {content.highlight.text}
            </motion.p>
          )}
          {typeof content.footer === "string" && (
            <motion.p className="text-xl md:text-2xl text-white/90" variants={itemVariants}>
              {content.footer}
            </motion.p>
          )}
        </motion.div>
      );

    case "cards":
      return (
        <motion.div
          className="flex flex-col gap-8 items-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {content.badge && (
            <motion.div variants={itemVariants}>
              <Badge className={`bg-${content.badge.color} text-white px-4 py-2`}>
                {content.badge.text}
              </Badge>
            </motion.div>
          )}
          {content.title && (
            <motion.h1 className="text-white text-5xl md:text-7xl" variants={itemVariants}>
              {content.title}
            </motion.h1>
          )}
          {content.cards && (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 w-full"
              variants={containerVariants}
            >
              {content.cards.map((card, index) => (
                <motion.div
                  key={index}
                  variants={cardVariants}
                  whileHover={{
                    scale: 1.05,
                    y: -5,
                    transition: { duration: 0.2 },
                  }}
                  className="bg-white/10 backdrop-blur-md p-8 rounded-lg border border-white/20 cursor-pointer"
                >
                  <motion.div
                    className="mb-4 text-white flex justify-center"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <LucideIcon name={card.icon} size={48} />
                  </motion.div>
                  <h3 className="text-white text-2xl mb-2">{card.title}</h3>
                  <p className="text-white/80">{card.description}</p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      );

    case "stats":
      return (
        <motion.div
          className="flex flex-col gap-8 items-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {content.badge && (
            <motion.div variants={itemVariants}>
              <Badge className={`bg-${content.badge.color} text-white px-4 py-2`}>
                {content.badge.text}
              </Badge>
            </motion.div>
          )}
          {content.title && (
            <motion.h1
              className="text-white text-5xl md:text-7xl text-center"
              variants={itemVariants}
            >
              {content.title}
            </motion.h1>
          )}
          {content.stats && (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl"
              variants={containerVariants}
            >
              {content.stats.map((stat, index) => (
                <motion.div
                  key={index}
                  variants={cardVariants}
                  whileHover={{
                    scale: 1.08,
                    borderColor: "rgba(255, 255, 255, 0.5)",
                    transition: { duration: 0.2 },
                  }}
                  className="text-center bg-white/10 backdrop-blur-md p-6 rounded-lg border border-white/20 cursor-default"
                >
                  <motion.div
                    className="text-5xl mb-3"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.1, type: "spring", stiffness: 200 }}
                  >
                    {stat.number}
                  </motion.div>
                  <p className="text-white text-xl">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      );

    case "dual-list":
      return (
        <div className="flex flex-col gap-8">
          {content.badge && (
            <Badge className={`bg-${content.badge.color} text-white px-4 py-2 w-fit mx-auto`}>
              {content.badge.text}
            </Badge>
          )}
          {content.title && (
            <h1 className="text-white text-5xl md:text-7xl text-center">
              {content.title}
            </h1>
          )}
          {content.lists && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {content.lists.map((list, index) => (
                <div key={index} className={index === 0 ? "space-y-4" : "space-y-4"}>
                  <h3 className="text-white text-3xl">{list.title}</h3>
                  <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg border border-white/20 space-y-3 text-white/90 text-lg">
                    {list.items.map((item, itemIndex) => {
                      const { icon, text } = parseIconText(item);
                      const isCenter = content.alignment === "center";
                      return (
                        <div key={itemIndex} className={`flex items-center gap-3 ${isCenter ? "justify-center" : ""}`}>
                          {icon && <LucideIcon name={icon} size={20} className="flex-shrink-0" />}
                          <span>{icon ? text : item}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );

    case "checklist":
      return (
        <div className="flex flex-col gap-6">
          {content.badge && (
            <Badge className={`bg-${content.badge.color} text-white px-4 py-2 w-fit`}>
              {content.badge.text}
            </Badge>
          )}
          {content.title && (
            <h1 className="text-white text-5xl md:text-7xl">{content.title}</h1>
          )}
          {content.items && (
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-lg border border-white/20 space-y-4 text-xl">
              {content.items.map((item, index) => (
                <p key={index} className="text-white/90">
                  ✓ {item}
                </p>
              ))}
            </div>
          )}
          {content.highlight && (
            <p className={`text-${content.highlight.color} text-2xl`}>
              {content.highlight.text}
            </p>
          )}
        </div>
      );

    case "awards":
      return (
        <motion.div
          className="flex flex-col gap-8 items-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {content.badge && (
            <motion.div variants={itemVariants}>
              <Badge className={`bg-${content.badge.color} text-${content.badge.textColor || "white"} px-4 py-2`}>
                {content.badge.text}
              </Badge>
            </motion.div>
          )}
          {content.title && (
            <motion.h1 className="text-white text-5xl md:text-7xl text-center" variants={itemVariants}>
              {content.title}
            </motion.h1>
          )}
          {content.awards && (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-6xl mt-6"
              variants={containerVariants}
            >
              {content.awards.map((award, index) => (
                <motion.div
                  key={index}
                  variants={cardVariants}
                  whileHover={{
                    scale: 1.05,
                    rotate: [0, -2, 2, 0],
                    transition: { duration: 0.3 },
                  }}
                  className="bg-gradient-to-b from-yellow-500/20 to-yellow-600/10 p-6 rounded-lg border border-yellow-500/30 text-center cursor-default"
                >
                  <motion.div
                    className="mb-2 text-yellow-400 flex justify-center"
                    whileHover={{ scale: 1.2, rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <LucideIcon name={award.icon} size={40} />
                  </motion.div>
                  <p className="text-white">{award.title}</p>
                  <p className="text-white/60 text-sm mt-2">{award.source}</p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      );

    case "cta":
      return (
        <motion.div
          className="flex flex-col gap-8 items-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {content.title && (
            <motion.h1
              className="text-white text-6xl md:text-8xl text-center"
              variants={itemVariants}
            >
              {content.title}
            </motion.h1>
          )}
          {content.subtitle && (
            <motion.h2
              className="text-white/90 text-2xl md:text-4xl text-center max-w-4xl"
              variants={itemVariants}
            >
              {content.subtitle}
            </motion.h2>
          )}
          {content.buttons && (
            <motion.div
              className="flex flex-col md:flex-row gap-4 mt-6"
              variants={itemVariants}
            >
              {content.buttons.map((button, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant={button.variant === "primary" ? "default" : "outline"}
                    className={
                      button.variant === "primary"
                        ? "bg-white text-black hover:bg-white/90 px-8 py-6 text-xl"
                        : "border-white bg-transparent !text-white hover:bg-white/10 hover:!text-white px-8 py-6 text-xl [&]:text-white"
                    }
                    style={button.variant !== "primary" ? { color: "white" } : undefined}
                  >
                    {button.text}
                  </Button>
                </motion.div>
              ))}
            </motion.div>
          )}
          {content.footer && Array.isArray(content.footer) && (
            <motion.div
              className="mt-8 text-white/70 text-lg text-center"
              variants={itemVariants}
            >
              {content.footer.map((text, index) => (
                <p key={index} className={index === content.footer!.length - 1 ? "text-white text-2xl" : ""}>
                  {text}
                </p>
              ))}
            </motion.div>
          )}
        </motion.div>
      );

    default:
      return null;
  }
}
