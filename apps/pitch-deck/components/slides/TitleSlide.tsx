/**
 * Title Slide - Redesigned
 * Modern, asymmetric layout with professional typography
 * Inspired by contemporary presentation design (2024-2025)
 */

import React from 'react';
import { Sparkles } from 'lucide-react';
import { ColorScheme } from '@/types/deck';

interface TitleSlideProps {
  title: string;
  subtitle?: string;
  content?: string;
  colorScheme: ColorScheme;
  customBackground?: string;
  slideImage?: string;
  imageStyle?: 'background' | 'corner' | 'center';
}

export const TitleSlide: React.FC<TitleSlideProps> = ({
  title,
  subtitle,
  content,
  colorScheme,
  customBackground,
  slideImage,
  imageStyle,
}) => {
  return (
    <div className={`h-full relative overflow-hidden ${customBackground || colorScheme.primary} text-white`}>
      {/* Background Image */}
      {slideImage && imageStyle === 'background' && (
        <div className="absolute inset-0 z-0">
          <img src={slideImage} alt="" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-black/20" />
        </div>
      )}

      {/* Subtle Background Decoration */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl -translate-y-1/4 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4" />
      </div>

      {/* Main Content - Asymmetric Layout */}
      <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-12 lg:px-16 py-12 md:py-16">
        {/* Icon */}
        <div className="mb-4 md:mb-6 animate-fadeIn">
          <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-white/10 backdrop-blur-sm">
            <Sparkles className="w-6 h-6 md:w-8 md:h-8" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight mb-4 md:mb-6 w-full md:w-11/12 animate-slideIn break-words">
          {title}
        </h1>

        {/* Divider */}
        <div className="w-16 md:w-20 h-1 bg-white/60 rounded-full mb-4 md:mb-6" />

        {/* Subtitle */}
        {subtitle && (
          <p className="text-xl md:text-2xl lg:text-3xl font-light opacity-90 mb-2 md:mb-3 w-full md:w-10/12 leading-snug break-words">
            {subtitle}
          </p>
        )}

        {/* Content */}
        {content && (
          <p className="text-base md:text-lg lg:text-xl font-light opacity-80 w-full md:w-9/12 leading-relaxed break-words">
            {content}
          </p>
        )}

        {/* Corner Image */}
        {slideImage && imageStyle === 'corner' && (
          <div className="absolute bottom-8 right-8 z-0">
            <img
              src={slideImage}
              alt=""
              className="w-48 h-48 md:w-64 md:h-64 object-cover rounded-2xl shadow-2xl opacity-90"
            />
          </div>
        )}

        {/* Center Image */}
        {slideImage && imageStyle === 'center' && (
          <div className="absolute inset-0 z-0 flex items-center justify-end pr-20">
            <img
              src={slideImage}
              alt=""
              className="max-w-md max-h-[70%] object-contain opacity-70 rounded-2xl shadow-2xl"
            />
          </div>
        )}
      </div>

      {/* Bottom Gradient Overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent z-0" />
    </div>
  );
};
