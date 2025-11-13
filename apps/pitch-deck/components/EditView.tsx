import React, { useState } from 'react';
import { ChevronLeft, Home, Sparkles, Zap, Code2, Palette, PlusCircle, Trash2, Edit3, Image, ArrowUpDown } from 'lucide-react';
import { Deck, ChatMessage } from '@/types/deck';
import { SlideRenderer } from './SlideRenderer';

interface EditViewProps {
  deck: Deck;
  currentSlide: number;
  onPrevSlide: () => void;
  onNextSlide: () => void;
  onSetSlide: (index: number) => void;
  onClose: () => void;
  onBackToDeck: () => void;
  chatMessages: ChatMessage[];
  chatInput: string;
  onChatInputChange: (value: string) => void;
  onSendMessage: () => void;
  isAiTyping: boolean;
  onUpdateSlide: (slideIndex: number, updates: Partial<any>) => void;
  onShowBackgroundPanel: () => void;
  onShowImagePanel: () => void;
  onDeckUpdate: (updates: Partial<Deck>) => void;
}

export function EditView({
  deck,
  currentSlide,
  onPrevSlide,
  onNextSlide,
  onSetSlide,
  onClose,
  onBackToDeck,
  chatMessages,
  chatInput,
  onChatInputChange,
  onSendMessage,
  isAiTyping,
  onShowBackgroundPanel,
  onShowImagePanel,
  onDeckUpdate
}: EditViewProps) {
  const [showJsonEditor, setShowJsonEditor] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState('');

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isAiTyping) {
      onSendMessage();
    }
  };

  const handleCommandClick = (command: string) => {
    onChatInputChange(command);
  };

  const handleToggleJsonEditor = () => {
    if (!showJsonEditor) {
      setJsonInput(JSON.stringify(deck, null, 2));
      setJsonError('');
    }
    setShowJsonEditor(!showJsonEditor);
  };

  const handleApplyJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      onDeckUpdate(parsed);
      setJsonError('');
      setShowJsonEditor(false);
    } catch (error) {
      setJsonError('Invalid JSON: ' + (error as Error).message);
    }
  };

  const commands = [
    { icon: Edit3, text: "Change the title to 'New Title'", color: 'from-purple-500 to-blue-500' },
    { icon: Palette, text: 'Make the deck blue and purple', color: 'from-blue-500 to-purple-500' },
    { icon: PlusCircle, text: 'Add a new problem slide', color: 'from-emerald-500 to-teal-500' },
    { icon: Edit3, text: 'Add a bullet point about cost savings', color: 'from-cyan-500 to-blue-500' },
    { icon: Edit3, text: 'Update the revenue metric to $500K', color: 'from-amber-500 to-yellow-500' },
    { icon: Trash2, text: 'Remove slide 3', color: 'from-red-500 to-orange-500' },
  ];

  return (
    <div className="h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col overflow-hidden">
      {/* Top Navigation Bar */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-5 flex items-center justify-between border-b border-slate-700 backdrop-blur-lg flex-shrink-0">
        <button
          onClick={onBackToDeck}
          className="group flex items-center gap-3 text-white hover:text-purple-400 transition-colors px-4 py-2 rounded-xl hover:bg-white hover:bg-opacity-10"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="font-semibold">Back to Presentation</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-white font-bold text-lg">AI Edit Mode</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleJsonEditor}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              showJsonEditor
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white hover:bg-opacity-10'
            }`}
          >
            <Code2 className="w-5 h-5" />
            <span className="font-semibold">JSON</span>
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors px-4 py-2 rounded-xl hover:bg-white hover:bg-opacity-10"
          >
            <Home className="w-5 h-5" />
            <span className="font-semibold">Home</span>
          </button>
        </div>
      </div>

      {/* Main Content Area - Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side - Slide Preview (2/3) */}
        <div className="w-2/3 p-8 flex flex-col border-r border-slate-700">
          <div className="flex-1 flex flex-col items-center justify-center">
            {/* Slide Container */}
            <div className="w-full max-w-4xl">
              <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-slate-700" style={{ paddingBottom: '56.25%' }}>
                <div className="absolute inset-0 w-full h-full">
                  <SlideRenderer slide={deck.slides[currentSlide]} colorScheme={deck.colorScheme} />
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-center gap-4 mt-6">
                <button
                  onClick={onPrevSlide}
                  disabled={currentSlide === 0}
                  className={`flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg transition-all ${
                    currentSlide === 0
                      ? 'opacity-30 cursor-not-allowed'
                      : 'hover:bg-slate-700'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="text-sm font-semibold">Prev</span>
                </button>

                <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
                  <span className="text-white font-bold">{currentSlide + 1}</span>
                  <span className="text-gray-500">/</span>
                  <span className="text-gray-400">{deck.slides.length}</span>
                </div>

                <button
                  onClick={onNextSlide}
                  disabled={currentSlide === deck.slides.length - 1}
                  className={`flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg transition-all ${
                    currentSlide === deck.slides.length - 1
                      ? 'opacity-30 cursor-not-allowed'
                      : 'hover:bg-slate-700'
                  }`}
                >
                  <span className="text-sm font-semibold">Next</span>
                  <ChevronLeft className="w-4 h-4 rotate-180" />
                </button>
              </div>

              {/* Slide Dots */}
              <div className="flex gap-1.5 justify-center mt-4">
                {deck.slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSetSlide(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === currentSlide
                        ? 'bg-purple-500 w-6'
                        : 'bg-gray-700 w-1.5 hover:bg-gray-600'
                    }`}
                  />
                ))}
              </div>

              {/* Quick Edit Buttons */}
              <div className="flex gap-3 justify-center mt-6">
                <button
                  onClick={onShowBackgroundPanel}
                  className="flex items-center gap-2 bg-slate-800 text-white px-5 py-2.5 rounded-lg hover:bg-slate-700 transition-all border border-slate-700 hover:border-purple-500/50"
                >
                  <div className="w-4 h-4 rounded bg-gradient-to-br from-purple-500 to-blue-500"></div>
                  <span className="text-sm font-semibold">Background</span>
                </button>

                <button
                  onClick={onShowImagePanel}
                  className="flex items-center gap-2 bg-slate-800 text-white px-5 py-2.5 rounded-lg hover:bg-slate-700 transition-all border border-slate-700 hover:border-purple-500/50"
                >
                  <span className="text-lg">🖼️</span>
                  <span className="text-sm font-semibold">Add Image</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Chat UI (1/3) */}
        <div className="w-1/3 flex flex-col bg-slate-900">
          {/* Chat Header */}
          <div className="p-6 border-b border-slate-700 flex-shrink-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">AI Assistant</h3>
                <p className="text-gray-400 text-xs">Ready to help edit your deck</p>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Welcome Message - Only show when no chat history */}
            {chatMessages.length === 0 && !isAiTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-800 text-gray-100 border border-slate-700 rounded-2xl px-4 py-3 max-w-full">
                  <p className="text-sm leading-relaxed mb-3">
                    👋 Hi! I&apos;m your AI assistant. I can help you edit your pitch deck with natural language commands. Here are some things you can ask me to do:
                  </p>
                </div>
              </div>
            )}

            {/* Command Buttons - Always show */}
            <div className="space-y-2 pb-2 border-b border-slate-700/50">
              {commands.map((cmd, idx) => {
                const Icon = cmd.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleCommandClick(cmd.text)}
                    className="w-full flex items-center gap-3 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-purple-500/50 rounded-xl px-4 py-3 transition-all group text-left"
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${cmd.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm text-gray-300 group-hover:text-white transition-colors flex-1">
                      {cmd.text}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Tip - Only show when no chat history */}
            {chatMessages.length === 0 && !isAiTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-800/50 text-gray-400 border border-slate-700/50 rounded-2xl px-4 py-2 max-w-full">
                  <p className="text-xs leading-relaxed">
                    💡 Click any command above to use it, or type your own request!
                  </p>
                </div>
              </div>
            )}

            {chatMessages.map((message, idx) => (
              <div key={idx} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    : 'bg-slate-800 text-gray-100 border border-slate-700'
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
                </div>
              </div>
            ))}

            {isAiTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-800 text-gray-100 border border-slate-700 rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce animation-delay-200"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce animation-delay-400"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="p-6 border-t border-slate-700 flex-shrink-0">
            <div className="flex gap-3">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => onChatInputChange(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me to edit something..."
                className="flex-1 bg-slate-800 text-white px-4 py-3 rounded-xl border border-slate-700 focus:border-purple-500 focus:outline-none transition-colors placeholder-gray-500"
                disabled={isAiTyping}
              />
              <button
                onClick={onSendMessage}
                disabled={!chatInput.trim() || isAiTyping}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                <span>Send</span>
              </button>
            </div>
            <p className="text-gray-500 text-xs mt-3 text-center">
              Try: &quot;Change the title color&quot; or &quot;Make slide 2 more impactful&quot;
            </p>
          </div>
        </div>
      </div>

      {/* JSON Editor Overlay */}
      {showJsonEditor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-8">
          <div className="bg-slate-900 rounded-2xl border border-slate-700 w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Code2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">JSON Editor</h3>
                  <p className="text-gray-400 text-xs">Edit your deck structure directly</p>
                </div>
              </div>
              <button
                onClick={handleToggleJsonEditor}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            {/* Editor */}
            <div className="flex-1 overflow-hidden p-6">
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                className="w-full h-full bg-slate-950 text-gray-100 font-mono text-sm p-4 rounded-lg border border-slate-700 focus:border-purple-500 focus:outline-none resize-none"
                spellCheck={false}
              />
            </div>

            {/* Error Message */}
            {jsonError && (
              <div className="px-6 py-3 bg-red-900/20 border-t border-red-900/50">
                <p className="text-red-400 text-sm">{jsonError}</p>
              </div>
            )}

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-700 flex items-center justify-between">
              <button
                onClick={() => {
                  setJsonInput(JSON.stringify(deck, null, 2));
                  setJsonError('');
                }}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Reset
              </button>
              <div className="flex gap-3">
                <button
                  onClick={handleToggleJsonEditor}
                  className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyJson}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all font-bold"
                >
                  Apply Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
