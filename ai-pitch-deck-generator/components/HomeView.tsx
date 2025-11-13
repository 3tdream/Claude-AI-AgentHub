import React from 'react';
import { Plus, Wand2, Sparkles } from 'lucide-react';
import { Deck } from '@/types/deck';

interface HomeViewProps {
  allDecks: Deck[];
  onOpenDeck: (deck: Deck) => void;
  onShowNewDeckModal: () => void;
}

export function HomeView({ allDecks, onOpenDeck, onShowNewDeckModal }: HomeViewProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600 rounded-full mix-blend-multiply filter blur-[100px] opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-blue-600 rounded-full mix-blend-multiply filter blur-[100px] opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-[500px] h-[500px] bg-pink-600 rounded-full mix-blend-multiply filter blur-[100px] opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-8 py-12">
        {/* Hero Header */}
        <div className="text-center mb-16">
          <h1 className="text-7xl font-black text-white mb-6 tracking-tight leading-tight">
            Create Stunning
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 text-transparent bg-clip-text">
              Pitch Decks
            </span>
          </h1>

          <p className="text-xl text-gray-300 mb-10 max-w-5xl mx-auto leading-loose text-center">
            Transform your ideas into professional presentations<br />
            in seconds with AI-powered design
          </p>

          <button
            onClick={onShowNewDeckModal}
            className="group inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white px-10 py-5 rounded-2xl hover:shadow-2xl hover:shadow-purple-500/50 transition-all transform hover:scale-105 font-bold text-lg relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative flex items-center gap-3">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-xl flex items-center justify-center group-hover:rotate-90 transition-transform duration-300">
                <Plus className="w-6 h-6" />
              </div>
              <span>Create New Pitch Deck</span>
              <Wand2 className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            </div>
          </button>
        </div>

        {/* Decks Section */}
        {allDecks.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-black text-white">Your Pitch Decks</h2>
              <div className="text-gray-400 text-sm bg-white bg-opacity-5 px-4 py-2 rounded-full border border-white border-opacity-10">
                {allDecks.length} {allDecks.length === 1 ? 'deck' : 'decks'}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allDecks.map((deck) => (
            <div
              key={deck.id}
              onClick={() => onOpenDeck(deck)}
              className="group relative bg-white bg-opacity-5 backdrop-blur-xl rounded-3xl shadow-xl hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 cursor-pointer transform hover:scale-[1.02] hover:-translate-y-2 overflow-hidden border border-white border-opacity-10"
            >
              {/* Deck Preview */}
              <div className={`h-56 ${deck.colorScheme.primary} flex items-center justify-center relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                <Sparkles className="w-20 h-20 text-white opacity-70 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 relative z-10" />
                <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-white opacity-5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
              </div>

              {/* Deck Info */}
              <div className="p-6 bg-gradient-to-b from-slate-900/90 to-slate-900/95 backdrop-blur-xl">
                <h3 className="text-2xl font-black text-white mb-3 group-hover:text-purple-400 transition-colors leading-tight">{deck.title}</h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed">{deck.description}</p>

                <div className="flex items-center justify-between pt-4 border-t border-white border-opacity-10">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    <span className="text-gray-300 text-sm font-semibold">{deck.slideCount} slides</span>
                  </div>
                  <span className="text-xs text-gray-500 bg-white bg-opacity-5 px-3 py-1.5 rounded-full">{deck.date}</span>
                </div>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-purple-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            </div>
          ))}
        </div>

        {allDecks.length === 0 && (
          <div className="text-center py-24 bg-white bg-opacity-5 backdrop-blur-xl rounded-3xl border border-white border-opacity-10">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-600 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-2xl">
              <Sparkles className="w-12 h-12 text-white animate-pulse" />
            </div>
            <h3 className="text-3xl font-black text-white mb-4">Ready to create magic?</h3>
            <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
              Create your first AI-powered pitch deck and bring your ideas to life in minutes
            </p>
            <button
              onClick={onShowNewDeckModal}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl hover:shadow-xl hover:shadow-purple-500/50 transition-all font-bold transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Create Your First Deck
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
