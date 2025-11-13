/**
 * Team Slide - Redesigned
 * Professional member cards with LinkedIn-style layout
 * Emphasis on credentials and expertise
 */

import React from 'react';
import { Linkedin } from 'lucide-react';
import { ColorScheme } from '@/types/deck';

interface TeamMember {
  name: string;
  role: string;
  background: string;
}

interface TeamSlideProps {
  title: string;
  members: TeamMember[];
  colorScheme: ColorScheme;
  customBackground?: string;
  slideImage?: string;
  imageStyle?: 'background' | 'corner' | 'center';
}

export const TeamSlide: React.FC<TeamSlideProps> = ({
  title,
  members,
  colorScheme,
  customBackground,
  slideImage,
  imageStyle,
}) => {
  return (
    <div className={`h-full relative overflow-hidden ${customBackground || 'bg-gradient-to-br from-white to-gray-50'} p-8 md:p-12 lg:p-16`}>
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

        {/* Team Members */}
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-4 md:space-y-6">
            {members.map((member, idx) => (
              <div
                key={idx}
                className="group p-6 md:p-8 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex items-center gap-4 md:gap-6"
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl ${colorScheme.primary} flex items-center justify-center text-white text-2xl md:text-3xl font-black shadow-lg group-hover:scale-110 transition-transform`}>
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                </div>

                {/* Member Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight break-words">
                      {member.name}
                    </h3>
                    <button className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 hover:bg-blue-50 flex items-center justify-center transition-colors group/linkedin">
                      <Linkedin className="w-5 h-5 text-gray-400 group-hover/linkedin:text-blue-600 transition-colors" />
                    </button>
                  </div>

                  <p className={`text-lg md:text-xl font-bold ${colorScheme.accent} mb-3 break-words`}>
                    {member.role}
                  </p>

                  <p className="text-base md:text-lg text-gray-600 leading-relaxed break-words">
                    {member.background}
                  </p>

                  {/* Credential Badge (Mock) */}
                  <div className="flex gap-2 mt-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      {idx === 0 ? '15+ years' : idx === 1 ? 'Stanford MBA' : '10+ exits'}
                    </span>
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
