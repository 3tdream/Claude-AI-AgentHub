/**
 * Market Slide - Redesigned
 * Data-focused with professional metric display
 * Clean, modern aesthetic without excessive decoration
 */

import React from 'react';
import { TrendingUp } from 'lucide-react';
import { ColorScheme } from '@/types/deck';

interface MarketSlideProps {
  title: string;
  stat: string;
  description: string;
  details: string;
  colorScheme: ColorScheme;
  customBackground?: string;
  slideImage?: string;
  imageStyle?: 'background' | 'corner' | 'center';
}

export const MarketSlide: React.FC<MarketSlideProps> = ({
  title,
  stat,
  description,
  details,
  colorScheme,
  customBackground,
  slideImage,
  imageStyle,
}) => {
  return (
    <div className={`h-full relative overflow-hidden ${customBackground || colorScheme.primary} text-white p-8 md:p-12 lg:p-16`}>
      {/* Background Image */}
      {slideImage && imageStyle === 'background' && (
        <div className="absolute inset-0 z-0">
          <img src={slideImage} alt="" className="w-full h-full object-cover opacity-15" />
          <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-black/20" />
        </div>
      )}

      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-12">
        {/* Header */}
        <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
          <TrendingUp className="w-8 h-8 md:w-10 md:h-10 opacity-90 flex-shrink-0" />
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold opacity-90 tracking-tight">
            {title}
          </h2>
        </div>

        {/* Main Stat */}
        <div className="text-center mb-6 md:mb-8">
          <div className="text-5xl md:text-7xl lg:text-8xl font-black mb-4 md:mb-6 tracking-tighter drop-shadow-2xl leading-none">
            {stat}
          </div>

          {/* Description */}
          <p className="text-xl md:text-2xl lg:text-3xl font-light mb-4 md:mb-6 leading-tight break-words">
            {description}
          </p>

          {/* Details Card */}
          <div className="w-full flex justify-center">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 md:px-8 py-3 md:py-4 border border-white/20 shadow-2xl max-w-full">
              <p className="text-base md:text-lg lg:text-xl font-medium break-words">
                {details}
              </p>
            </div>
          </div>
        </div>

        {/* Optional: Progress Bar Visualization */}
        <div className="mt-auto">
          <div className="flex items-center gap-4 mb-3">
            <span className="text-sm md:text-base font-medium opacity-80">Market Growth</span>
            <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white/80 rounded-full animate-[slideIn_1s_ease-out]" style={{ width: '75%' }} />
            </div>
            <span className="text-sm md:text-base font-bold">75%</span>
          </div>
        </div>

        {/* Corner Image */}
        {slideImage && imageStyle === 'corner' && (
          <div className="absolute bottom-8 right-8 z-0">
            <img
              src={slideImage}
              alt=""
              className="w-48 h-48 md:w-64 md:h-64 object-cover rounded-2xl shadow-2xl opacity-70"
            />
          </div>
        )}
      </div>
    </div>
  );
};
