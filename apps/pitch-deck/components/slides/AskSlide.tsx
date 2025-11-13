/**
 * Ask Slide - Redesigned
 * Clear funding request with infographic-style breakdown
 * Professional, focused on action items
 */

import React from 'react';
import { Target, TrendingUp, Calendar } from 'lucide-react';
import { ColorScheme } from '@/types/deck';

interface AskSlideProps {
  title: string;
  amount: string;
  usage: string;
  goal: string;
  colorScheme: ColorScheme;
  customBackground?: string;
  slideImage?: string;
  imageStyle?: 'background' | 'corner' | 'center';
}

export const AskSlide: React.FC<AskSlideProps> = ({
  title,
  amount,
  usage,
  goal,
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

      {/* Subtle Background Decoration */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] md:w-[500px] md:h-[500px] bg-white/5 rounded-full blur-3xl -translate-y-1/4 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] md:w-[400px] md:h-[400px] bg-white/5 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4" />
      </div>

      <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-12">
        {/* Icon */}
        <div className="flex justify-center mb-4 md:mb-6">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <Target className="w-6 h-6 md:w-8 md:h-8" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 md:mb-8 text-center opacity-95 tracking-tight break-words">
          {title}
        </h2>

        {/* Main Amount */}
        <div className="text-center mb-6 md:mb-8">
          <div className="text-4xl md:text-6xl lg:text-7xl font-black mb-4 md:mb-6 tracking-tighter drop-shadow-2xl leading-none">
            {amount}
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 w-full">
            {/* Usage Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-white/20 shadow-2xl text-left">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5" />
                <h3 className="text-lg md:text-xl font-bold">Use of Funds</h3>
              </div>
              <p className="text-sm md:text-base font-light opacity-90 leading-relaxed break-words">
                {usage}
              </p>
            </div>

            {/* Goal Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-white/20 shadow-2xl text-left">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5" />
                <h3 className="text-lg md:text-xl font-bold">12-Month Goals</h3>
              </div>
              <p className="text-sm md:text-base font-light opacity-90 leading-relaxed break-words">
                {goal}
              </p>
            </div>
          </div>
        </div>

        {/* Timeline Visualization (Mock) */}
        <div className="w-full">
          <div className="flex items-center justify-between mb-2 text-xs md:text-sm">
            <span className="opacity-80">Progress</span>
            <span className="font-bold">Q1-Q4 2025</span>
          </div>
          <div className="h-2 md:h-3 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white/80 rounded-full" style={{ width: '60%' }} />
          </div>
          <div className="flex justify-between mt-2 text-xs opacity-70">
            <span>Launch</span>
            <span>Scale</span>
            <span>Profitability</span>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-6 md:mt-8">
          <button className="inline-flex items-center gap-2 bg-white text-gray-900 font-bold px-6 py-3 md:px-8 md:py-4 rounded-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 text-sm md:text-base">
            <span>Let's Talk</span>
            <Target className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>

        {/* Corner Image */}
        {slideImage && imageStyle === 'corner' && (
          <div className="absolute bottom-8 right-8 z-0">
            <img
              src={slideImage}
              alt=""
              className="w-48 h-48 md:w-56 md:h-56 object-cover rounded-2xl shadow-2xl opacity-70"
            />
          </div>
        )}
      </div>
    </div>
  );
};
