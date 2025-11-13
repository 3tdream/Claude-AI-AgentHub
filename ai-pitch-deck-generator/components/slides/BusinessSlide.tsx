/**
 * Business Model Slide - Redesigned
 * Clean pricing tiers with feature comparison
 * Professional table-style layout
 */

import React from 'react';
import { Check } from 'lucide-react';
import { ColorScheme } from '@/types/deck';
import { Card, Badge } from '@/components/ui/primitives';

interface PricingTier {
  name: string;
  price: string;
  users: string;
}

interface BusinessSlideProps {
  title: string;
  tiers: PricingTier[];
  colorScheme: ColorScheme;
  customBackground?: string;
  slideImage?: string;
  imageStyle?: 'background' | 'corner' | 'center';
}

export const BusinessSlide: React.FC<BusinessSlideProps> = ({
  title,
  tiers,
  colorScheme,
  customBackground,
  slideImage,
  imageStyle,
}) => {
  return (
    <div className={`h-full relative overflow-hidden ${customBackground || 'bg-gradient-to-br from-gray-50 to-white'} p-8 md:p-12 lg:p-16`}>
      {/* Background Image */}
      {slideImage && imageStyle === 'background' && (
        <div className="absolute inset-0 z-0">
          <img src={slideImage} alt="" className="w-full h-full object-cover opacity-5" />
        </div>
      )}

      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <h2 className={`text-4xl md:text-5xl lg:text-6xl font-black mb-8 md:mb-12 tracking-tight ${colorScheme.accent}`}>
          {title}
        </h2>

        {/* Pricing Tiers */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {tiers.map((tier, idx) => (
              <Card
                key={idx}
                variant={idx === 1 ? 'hover' : 'default'}
                className={`relative ${
                  idx === 1
                    ? `border-2 ${colorScheme.accent.replace('text-', 'border-')} shadow-2xl md:scale-105`
                    : 'border border-gray-200'
                } transition-all duration-300 hover:scale-105 flex flex-col`}
              >
                {/* Popular Badge */}
                {idx === 1 && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="primary" size="md" className="shadow-lg">
                      POPULAR
                    </Badge>
                  </div>
                )}

                {/* Tier Name */}
                <div className="mb-6">
                  <h3 className={`text-2xl md:text-3xl font-black mb-2 ${
                    idx === 1 ? colorScheme.accent : 'text-gray-800'
                  }`}>
                    {tier.name}
                  </h3>
                </div>

                {/* Price */}
                <div className={`text-4xl md:text-5xl lg:text-6xl font-black mb-4 md:mb-6 ${
                  idx === 1 ? colorScheme.accent : 'text-gray-900'
                }`}>
                  {tier.price}
                </div>

                {/* Users/Description */}
                <p className="text-base md:text-lg text-gray-600 mb-6 flex-1 break-words">
                  {tier.users}
                </p>

                {/* Features (Mock) */}
                <div className="space-y-3 pt-6 border-t border-gray-200">
                  {[
                    'Feature 1',
                    'Feature 2',
                    idx === 1 && 'Premium Feature',
                  ].filter(Boolean).map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2">
                      <Check className={`w-5 h-5 ${colorScheme.accent}`} />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <button className={`mt-6 w-full ${colorScheme.button} text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg`}>
                  Choose Plan
                </button>
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
              className="w-48 h-48 md:w-56 md:h-56 object-cover rounded-2xl shadow-2xl opacity-70"
            />
          </div>
        )}
      </div>
    </div>
  );
};
