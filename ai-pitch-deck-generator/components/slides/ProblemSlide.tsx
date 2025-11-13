/**
 * Problem Slide - Redesigned
 * Clean, scannable list with icon badges and better hierarchy
 * Two-column layout for longer lists
 */

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { ColorScheme } from '@/types/deck';
import { Badge } from '@/components/ui/primitives';

interface ProblemSlideProps {
  title: string;
  points: string[];
  colorScheme: ColorScheme;
  customBackground?: string;
  slideImage?: string;
  imageStyle?: 'background' | 'corner' | 'center';
}

export const ProblemSlide: React.FC<ProblemSlideProps> = ({
  title,
  points,
  colorScheme,
  customBackground,
  slideImage,
  imageStyle,
}) => {
  const useDoubleColumn = points.length > 4;

  return (
    <div className={`h-full relative overflow-hidden ${customBackground || 'bg-gradient-to-br from-white to-gray-50'} p-8 md:p-12 lg:p-16`}>
      {/* Background Image */}
      {slideImage && imageStyle === 'background' && (
        <div className="absolute inset-0 z-0">
          <img src={slideImage} alt="" className="w-full h-full object-cover opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-gray-50/80" />
        </div>
      )}

      {/* Subtle Pattern */}
      <div className="absolute inset-0 z-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 md:mb-12">
          <div className="flex-shrink-0">
            <div className={`w-2 h-12 md:h-16 ${colorScheme.primary.replace('bg-gradient-to-br', 'bg-gradient-to-b')} rounded-full`} />
          </div>
          <div className="flex-1">
            <h2 className={`text-4xl md:text-5xl lg:text-6xl font-black tracking-tight ${colorScheme.accent}`}>
              {title}
            </h2>
          </div>
          <div className="flex-shrink-0">
            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl ${colorScheme.primary} flex items-center justify-center`}>
              <AlertCircle className="w-6 h-6 md:w-7 md:h-7 text-white" />
            </div>
          </div>
        </div>

        {/* Points List */}
        <div className={`flex-1 overflow-y-auto`}>
          <div className={useDoubleColumn ? 'columns-1 md:columns-2 gap-6 md:gap-8 space-y-5 md:space-y-6' : 'space-y-5 md:space-y-6'}>
            {points.map((point, idx) => (
              <div
                key={idx}
                className="group flex items-start gap-4 md:gap-5 p-5 md:p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 break-inside-avoid"
              >
                {/* Number Badge */}
                <div className="flex-shrink-0">
                  <Badge variant="primary" size="lg" className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl shadow-sm">
                    <span className="text-base md:text-lg font-black">{idx + 1}</span>
                  </Badge>
                </div>

                {/* Point Text */}
                <div className="flex-1 pt-1 md:pt-2">
                  <p className="text-lg md:text-xl lg:text-2xl text-gray-800 leading-relaxed font-medium break-words">
                    {point}
                  </p>
                </div>
              </div>
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

        {/* Center Image */}
        {slideImage && imageStyle === 'center' && (
          <div className="absolute inset-0 z-0 flex items-center justify-center p-20">
            <img
              src={slideImage}
              alt=""
              className="max-w-full max-h-full object-contain opacity-60 rounded-2xl shadow-2xl"
            />
          </div>
        )}
      </div>
    </div>
  );
};
