import React from 'react';
import { ChevronLeft, ChevronRight, Home, Sparkles, Wand2 } from 'lucide-react';
import { Deck } from '@/types/deck';
import { SlideRenderer } from './SlideRenderer';

interface DeckViewProps {
  deck: Deck;
  currentSlide: number;
  onPrevSlide: () => void;
  onNextSlide: () => void;
  onSetSlide: (index: number) => void;
  onClose: () => void;
  onOpenEditMode: () => void;
}

export function DeckView({
  deck,
  currentSlide,
  onPrevSlide,
  onNextSlide,
  onSetSlide,
  onClose,
  onOpenEditMode
}: DeckViewProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col">
      {/* Top Navigation Bar */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-5 flex items-center justify-between border-b border-slate-700 backdrop-blur-lg">
        <button
          onClick={onClose}
          className="group flex items-center gap-3 text-white hover:text-purple-400 transition-colors px-4 py-2 rounded-xl hover:bg-white hover:bg-opacity-10"
        >
          <Home className="w-5 h-5" />
          <span className="font-semibold">Back to Home</span>
        </button>
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <span className="text-white font-bold text-lg">{deck.title}</span>
        </div>
        <button
          onClick={onOpenEditMode}
          className="group flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:shadow-xl hover:shadow-purple-500/50 transition-all font-bold transform hover:scale-105"
        >
          <Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span>Edit with AI</span>
        </button>
      </div>

      {/* Main Slide Area */}
      <div className="flex-1 flex items-center justify-center p-12 relative">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse animation-delay-2000"></div>
        </div>

        <div className="relative w-full max-w-6xl">
          {/* Slide Container */}
          <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-slate-700 transform transition-all duration-300" style={{ paddingBottom: '56.25%' }}>
            <div className="absolute inset-0 w-full h-full">
              <SlideRenderer slide={deck.slides[currentSlide]} colorScheme={deck.colorScheme} />
            </div>
          </div>

          {/* Navigation Controls - Below Slide */}
          <div className="flex items-center justify-center gap-6 mt-8">
            <button
              onClick={onPrevSlide}
              disabled={currentSlide === 0}
              className={`group flex items-center gap-2 bg-white px-6 py-3 rounded-xl shadow-lg transition-all ${
                currentSlide === 0
                  ? 'opacity-30 cursor-not-allowed'
                  : 'hover:shadow-2xl hover:shadow-purple-500/30 hover:scale-105'
              }`}
            >
              <ChevronLeft className="w-5 h-5 text-gray-800" />
              <span className="font-bold text-gray-800">Previous</span>
            </button>

            <div className="flex items-center gap-3 bg-white bg-opacity-10 backdrop-blur-lg px-6 py-3 rounded-xl border border-white border-opacity-20">
              <span className="text-white font-bold text-lg">{currentSlide + 1}</span>
              <span className="text-gray-400">/</span>
              <span className="text-gray-400">{deck.slides.length}</span>
            </div>

            <button
              onClick={onNextSlide}
              disabled={currentSlide === deck.slides.length - 1}
              className={`group flex items-center gap-2 bg-white px-6 py-3 rounded-xl shadow-lg transition-all ${
                currentSlide === deck.slides.length - 1
                  ? 'opacity-30 cursor-not-allowed'
                  : 'hover:shadow-2xl hover:shadow-purple-500/30 hover:scale-105'
              }`}
            >
              <span className="font-bold text-gray-800">Next</span>
              <ChevronRight className="w-5 h-5 text-gray-800" />
            </button>
          </div>

          {/* Slide Dots Indicator */}
          <div className="flex gap-2 justify-center mt-6">
            {deck.slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => onSetSlide(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentSlide
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 w-8 shadow-lg shadow-purple-500/50'
                    : 'bg-gray-600 w-2 hover:bg-gray-500 hover:w-4'
                }`}
                title={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
