/**
 * Traction Slide - Redesigned
 * Metrics with trend indicators and progress visualization
 * Clean, data-focused design
 */

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { ColorScheme } from '@/types/deck';
import { Metric } from '@/components/ui/primitives';

interface MetricData {
  value: string;
  label: string;
}

interface TractionSlideProps {
  title: string;
  metrics: MetricData[];
  colorScheme: ColorScheme;
  customBackground?: string;
  slideImage?: string;
  imageStyle?: 'background' | 'corner' | 'center';
}

export const TractionSlide: React.FC<TractionSlideProps> = ({
  title,
  metrics,
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
        <div className="flex items-center gap-4 mb-8 md:mb-12">
          <div className={`w-2 md:w-3 h-12 md:h-16 ${colorScheme.primary.replace('bg-gradient-to-br', 'bg-gradient-to-b')} rounded-full flex-shrink-0`} />
          <h2 className={`text-4xl md:text-5xl lg:text-6xl font-black tracking-tight ${colorScheme.accent}`}>
            {title}
          </h2>
        </div>

        {/* Metrics Grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {metrics.map((metric, idx) => (
              <div
                key={idx}
                className={`group p-8 md:p-10 ${colorScheme.secondary} rounded-2xl border-2 border-transparent hover:border-current ${colorScheme.accent.replace('text-', 'hover:border-')} transition-all duration-300 hover:shadow-xl hover:scale-105 relative overflow-hidden`}
              >
                {/* Background Number */}
                <div className="absolute bottom-4 right-4 text-8xl font-black text-gray-100 opacity-50 z-0">
                  {idx + 1}
                </div>

                {/* Metric Content */}
                <div className="relative z-10">
                  {/* Value */}
                  <div className={`text-5xl md:text-6xl font-black ${colorScheme.accent} mb-3 md:mb-4 tracking-tight group-hover:scale-110 transition-transform leading-none`}>
                    {metric.value}
                  </div>

                  {/* Trend Indicator (Mock - positive trend) */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1 text-success">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm font-semibold">+24%</span>
                    </div>
                    <span className="text-xs text-gray-500">vs last month</span>
                  </div>

                  {/* Label */}
                  <p className="text-lg md:text-xl text-gray-600 font-medium leading-tight break-words">
                    {metric.label}
                  </p>

                  {/* Progress Bar */}
                  <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colorScheme.primary} rounded-full transition-all duration-1000`}
                      style={{ width: `${Math.min((idx + 1) * 25, 100)}%` }}
                    />
                  </div>
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
              className="w-48 h-48 md:w-56 md:h-56 object-cover rounded-2xl shadow-2xl opacity-70"
            />
          </div>
        )}
      </div>
    </div>
  );
};
