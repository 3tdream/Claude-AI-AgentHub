/**
 * Solution Slide - Redesigned
 * Feature cards with consistent height and modern design
 * Grid system with clean iconography
 */

import React from 'react';
import { Zap, Check } from 'lucide-react';
import { ColorScheme } from '@/types/deck';
import { Card } from '@/components/ui/primitives';

interface SolutionSlideProps {
  title: string;
  description: string;
  features: string[];
  colorScheme: ColorScheme;
  customBackground?: string;
  slideImage?: string;
  imageStyle?: 'background' | 'corner' | 'center';
}

export const SolutionSlide: React.FC<SolutionSlideProps> = ({
  title,
  description,
  features,
  colorScheme,
  customBackground,
  slideImage,
  imageStyle,
}) => {
  return (
    <div className={`h-full relative overflow-hidden ${customBackground || 'bg-white'} p-8 md:p-12 lg:p-16`}>
      {/* Background Image */}
      {slideImage && imageStyle === 'background' && (
        <div className="absolute inset-0 z-0">
          <img src={slideImage} alt="" className="w-full h-full object-cover opacity-5" />
        </div>
      )}

      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 md:mb-8">
          <div className={`flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-2xl ${colorScheme.primary} flex items-center justify-center shadow-lg`}>
            <Zap className="w-6 h-6 md:w-7 md:h-7 text-white" />
          </div>
          <h2 className={`text-4xl md:text-5xl lg:text-6xl font-black tracking-tight ${colorScheme.accent}`}>
            {title}
          </h2>
        </div>

        {/* Description */}
        <p className="text-lg md:text-xl lg:text-2xl text-gray-600 leading-relaxed mb-6 md:mb-8 w-full break-words">
          {description}
        </p>

        {/* Features Grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {features.slice(0, 4).map((feature, idx) => (
              <Card
                key={idx}
                variant="hover"
                className={`p-6 md:p-8 border-2 border-transparent hover:border-current ${colorScheme.accent.replace('text-', 'hover:border-')} h-full flex flex-col`}
              >
                {/* Icon */}
                <div className="flex-shrink-0 mb-4">
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${colorScheme.secondary} flex items-center justify-center`}>
                    <Check className={`w-5 h-5 md:w-6 md:h-6 ${colorScheme.accent}`} />
                  </div>
                </div>

                {/* Feature Text */}
                <p className="text-lg md:text-xl lg:text-2xl font-semibold text-gray-800 leading-relaxed flex-1 break-words">
                  {feature}
                </p>

                {/* Subtle Number */}
                <div className="text-6xl font-black text-gray-100 absolute bottom-4 right-4 z-0">
                  {idx + 1}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Corner Image */}
        {slideImage && imageStyle === 'corner' && (
          <div className="absolute bottom-8 right-8 z-0">
            <img
              src={slideImage}
              alt=""
              className="w-48 h-48 md:w-64 md:h-64 object-cover rounded-2xl shadow-2xl opacity-80"
            />
          </div>
        )}
      </div>
    </div>
  );
};
