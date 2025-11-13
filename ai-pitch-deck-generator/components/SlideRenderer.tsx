/**
 * Slide Renderer - Updated to use new slide components
 * Clean routing to individual slide components
 */

import React from 'react';
import { Slide, ColorScheme } from '@/types/deck';

// Import new slide components
import { TitleSlide } from './slides/TitleSlide';
import { ProblemSlide } from './slides/ProblemSlide';
import { SolutionSlide } from './slides/SolutionSlide';
import { MarketSlide } from './slides/MarketSlide';
import { BusinessSlide } from './slides/BusinessSlide';
import { TractionSlide } from './slides/TractionSlide';
import { TeamSlide } from './slides/TeamSlide';
import { AskSlide } from './slides/AskSlide';

interface SlideRendererProps {
  slide: Slide;
  colorScheme: ColorScheme;
}

export function SlideRenderer({ slide, colorScheme }: SlideRendererProps) {
  switch (slide.type) {
    case 'title':
      return (
        <TitleSlide
          title={slide.title}
          subtitle={slide.subtitle}
          content={slide.content}
          colorScheme={colorScheme}
          customBackground={slide.customBackground}
          slideImage={slide.slideImage}
          imageStyle={slide.imageStyle}
        />
      );

    case 'problem':
      return (
        <ProblemSlide
          title={slide.title}
          points={slide.points}
          colorScheme={colorScheme}
          customBackground={slide.customBackground}
          slideImage={slide.slideImage}
          imageStyle={slide.imageStyle}
        />
      );

    case 'solution':
      return (
        <SolutionSlide
          title={slide.title}
          description={slide.description}
          features={slide.features}
          colorScheme={colorScheme}
          customBackground={slide.customBackground}
          slideImage={slide.slideImage}
          imageStyle={slide.imageStyle}
        />
      );

    case 'market':
      return (
        <MarketSlide
          title={slide.title}
          stat={slide.stat}
          description={slide.description}
          details={slide.details}
          colorScheme={colorScheme}
          customBackground={slide.customBackground}
          slideImage={slide.slideImage}
          imageStyle={slide.imageStyle}
        />
      );

    case 'business':
      return (
        <BusinessSlide
          title={slide.title}
          tiers={slide.tiers}
          colorScheme={colorScheme}
          customBackground={slide.customBackground}
          slideImage={slide.slideImage}
          imageStyle={slide.imageStyle}
        />
      );

    case 'traction':
      return (
        <TractionSlide
          title={slide.title}
          metrics={slide.metrics}
          colorScheme={colorScheme}
          customBackground={slide.customBackground}
          slideImage={slide.slideImage}
          imageStyle={slide.imageStyle}
        />
      );

    case 'team':
      return (
        <TeamSlide
          title={slide.title}
          members={slide.members}
          colorScheme={colorScheme}
          customBackground={slide.customBackground}
          slideImage={slide.slideImage}
          imageStyle={slide.imageStyle}
        />
      );

    case 'ask':
      return (
        <AskSlide
          title={slide.title}
          amount={slide.amount}
          usage={slide.usage}
          goal={slide.goal}
          colorScheme={colorScheme}
          customBackground={slide.customBackground}
          slideImage={slide.slideImage}
          imageStyle={slide.imageStyle}
        />
      );

    default:
      return (
        <div className="h-full flex items-center justify-center bg-gray-100 p-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Unknown Slide Type
            </h2>
            <p className="text-gray-600">
              The slide type &quot;{slide.type}&quot; is not supported.
            </p>
          </div>
        </div>
      );
  }
}
