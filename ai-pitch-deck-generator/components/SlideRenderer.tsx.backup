import React from 'react';
import { Sparkles, Wand2, Zap, TrendingUp } from 'lucide-react';
import { Slide, ColorScheme } from '@/types/deck';

interface SlideRendererProps {
  slide: Slide;
  colorScheme: ColorScheme;
}

export function SlideRenderer({ slide, colorScheme }: SlideRendererProps) {
  switch (slide.type) {
    case 'title':
      return (
        <div className={`h-full flex flex-col items-center justify-center ${colorScheme.primary} text-white p-12 relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          <div className="relative z-10 text-center">
            <div className="mb-8 inline-block">
              <Sparkles className="w-20 h-20 opacity-90 animate-pulse" />
            </div>
            <h1 className="text-7xl font-black mb-6 tracking-tight">{slide.title}</h1>
            <div className="w-24 h-1 bg-white opacity-50 mx-auto mb-6"></div>
            <p className="text-3xl mb-3 font-light opacity-95">{slide.subtitle}</p>
            <p className="text-xl opacity-80 font-light">{slide.content}</p>
          </div>
        </div>
      );

    case 'problem':
      return (
        <div className="h-full bg-gradient-to-br from-white to-gray-50 p-12">
          <div className="flex items-center mb-10">
            <div className={`w-2 h-16 ${colorScheme.primary} mr-4 rounded-full`}></div>
            <h2 className={`text-6xl font-black ${colorScheme.accent}`}>{slide.title}</h2>
          </div>
          <div className="space-y-7">
            {slide.points.map((point, idx) => (
              <div key={idx} className="flex items-start group hover:translate-x-2 transition-transform duration-300">
                <div className={`w-14 h-14 rounded-2xl ${colorScheme.primary} flex items-center justify-center text-white font-bold mr-6 flex-shrink-0 shadow-lg group-hover:shadow-xl transition-shadow`}>
                  <span className="text-xl">{idx + 1}</span>
                </div>
                <p className="text-2xl text-gray-700 pt-3 leading-relaxed">{point}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case 'solution':
      return (
        <div className="h-full bg-white p-12">
          <div className="flex items-center mb-8">
            <Wand2 className={`w-12 h-12 mr-4 ${colorScheme.accent}`} />
            <h2 className={`text-6xl font-black ${colorScheme.accent}`}>{slide.title}</h2>
          </div>
          <p className="text-2xl text-gray-600 mb-12 leading-relaxed max-w-4xl">{slide.description}</p>
          <div className="grid grid-cols-2 gap-6">
            {slide.features.map((feature, idx) => (
              <div key={idx} className={`group p-8 ${colorScheme.secondary} rounded-2xl border-2 border-transparent hover:border-current ${colorScheme.accent} transition-all hover:shadow-xl hover:scale-105 duration-300 cursor-pointer`}>
                <div className={`w-12 h-12 rounded-xl ${colorScheme.primary} mb-4 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <p className="text-xl font-bold text-gray-800">{feature}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case 'market':
      return (
        <div className={`h-full ${colorScheme.primary} text-white p-12 flex flex-col justify-center relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black opacity-5"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border-4 border-white opacity-5 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border-4 border-white opacity-5 rounded-full"></div>
          <div className="relative z-10">
            <div className="flex items-center mb-8">
              <TrendingUp className="w-12 h-12 mr-4 opacity-90" />
              <h2 className="text-5xl font-bold opacity-90">{slide.title}</h2>
            </div>
            <div className="text-center mt-12">
              <div className="text-9xl font-black mb-6 tracking-tighter drop-shadow-2xl">{slide.stat}</div>
              <p className="text-4xl mb-8 font-light">{slide.description}</p>
              <div className="inline-block bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl px-8 py-4">
                <p className="text-xl font-medium">{slide.details}</p>
              </div>
            </div>
          </div>
        </div>
      );

    case 'business':
      return (
        <div className="h-full bg-gradient-to-br from-gray-50 to-white p-12">
          <h2 className={`text-6xl font-black mb-12 ${colorScheme.accent}`}>{slide.title}</h2>
          <div className="grid grid-cols-3 gap-8">
            {slide.tiers.map((tier, idx) => (
              <div key={idx} className={`group p-8 bg-white rounded-2xl shadow-lg border-2 ${idx === 1 ? `border-current ${colorScheme.accent} shadow-2xl scale-105` : 'border-gray-200 hover:border-gray-300'} transition-all hover:shadow-2xl hover:scale-105 duration-300`}>
                <div className="mb-6">
                  <h3 className={`text-3xl font-black mb-2 ${idx === 1 ? colorScheme.accent : 'text-gray-700'}`}>{tier.name}</h3>
                  {idx === 1 && (
                    <span className={`inline-block ${colorScheme.primary} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                      POPULAR
                    </span>
                  )}
                </div>
                <div className={`text-5xl font-black mb-6 ${idx === 1 ? colorScheme.accent : 'text-gray-800'}`}>{tier.price}</div>
                <p className="text-lg text-gray-600">{tier.users}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case 'traction':
      return (
        <div className="h-full bg-white p-12">
          <h2 className={`text-6xl font-black mb-12 ${colorScheme.accent} flex items-center`}>
            <div className={`w-3 h-16 ${colorScheme.primary} rounded-full mr-4`}></div>
            {slide.title}
          </h2>
          <div className="grid grid-cols-2 gap-8">
            {slide.metrics.map((metric, idx) => (
              <div key={idx} className={`group p-10 ${colorScheme.secondary} rounded-2xl text-center hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-current ${colorScheme.accent}`}>
                <div className={`text-6xl font-black mb-4 ${colorScheme.accent} group-hover:scale-110 transition-transform`}>{metric.value}</div>
                <p className="text-xl text-gray-600 font-medium">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case 'team':
      return (
        <div className="h-full bg-gradient-to-br from-white to-gray-50 p-12">
          <h2 className={`text-6xl font-black mb-12 ${colorScheme.accent}`}>{slide.title}</h2>
          <div className="space-y-6">
            {slide.members.map((member, idx) => (
              <div key={idx} className={`group p-8 bg-white rounded-2xl flex items-center shadow-md hover:shadow-xl transition-all duration-300 hover:translate-x-2`}>
                <div className={`w-24 h-24 rounded-2xl ${colorScheme.primary} flex items-center justify-center text-white text-3xl font-black mr-8 flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg`}>
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-3xl font-black text-gray-800 mb-1">{member.name}</h3>
                  <p className={`text-xl font-bold ${colorScheme.accent} mb-2`}>{member.role}</p>
                  <p className="text-gray-600 text-lg">{member.background}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'ask':
      return (
        <div className={`h-full ${colorScheme.primary} text-white p-12 flex flex-col justify-center relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white opacity-5 rounded-full -translate-y-1/4 translate-x-1/4"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white opacity-5 rounded-full translate-y-1/4 -translate-x-1/4"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-center mb-6">
              <Sparkles className="w-16 h-16 opacity-80" />
            </div>
            <h2 className="text-6xl font-bold mb-12 text-center opacity-95">{slide.title}</h2>
            <div className="text-center">
              <div className="text-8xl font-black mb-10 tracking-tight drop-shadow-2xl">{slide.amount}</div>
              <div className="bg-white bg-opacity-20 rounded-2xl p-8 backdrop-blur-md border border-white border-opacity-30 mb-8 max-w-3xl mx-auto">
                <p className="text-2xl font-light mb-6">{slide.usage}</p>
                <div className="w-16 h-1 bg-white opacity-50 mx-auto mb-6"></div>
                <p className="text-xl font-medium">{slide.goal}</p>
              </div>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
}
