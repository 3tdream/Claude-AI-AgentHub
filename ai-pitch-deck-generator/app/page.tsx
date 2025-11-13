'use client';

import React, { useState, useEffect } from 'react';
import { ViewType, Deck, ChatMessage } from '@/types/deck';
import { initialDecks } from '@/data/initialDecks';
import { demoDecks } from '@/data/demoDecks';
import { colorSchemes } from '@/data/colorSchemes';
import { loadDecks } from '@/lib/deckLoader';
import { HomeView } from '@/components/HomeView';
import { DeckView } from '@/components/DeckView';
import { EditView } from '@/components/EditView';
import { NewDeckModal } from '@/components/NewDeckModal';

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showNewDeckModal, setShowNewDeckModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newDeckTitle, setNewDeckTitle] = useState('');
  const [newDeckDescription, setNewDeckDescription] = useState('');
  const [allDecks, setAllDecks] = useState<Deck[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // Undo/Redo history
  const [history, setHistory] = useState<Deck[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  // UI Panels
  const [showBackgroundPanel, setShowBackgroundPanel] = useState(false);
  const [showImagePanel, setShowImagePanel] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [aiImagePrompt, setAiImagePrompt] = useState('');

  // Initialize decks on mount - Load from localStorage first, then JSON files
  useEffect(() => {
    async function initializeDecks() {
      setIsLoading(true);
      try {
        // Try to load from localStorage first
        const savedDecks = localStorage.getItem('pitch-decks');
        if (savedDecks) {
          const parsedDecks = JSON.parse(savedDecks);
          console.log('Loaded decks from localStorage:', parsedDecks.length);
          setAllDecks(parsedDecks);
          setIsLoading(false);
          return;
        }

        // If no localStorage, load from demo decks
        console.log('Loading demo decks');
        setAllDecks(demoDecks);
      } catch (error) {
        console.error('Error loading decks:', error);
        setAllDecks(demoDecks);
      } finally {
        setIsLoading(false);
      }
    }

    if (allDecks.length === 0) {
      initializeDecks();
    }
  }, [allDecks.length]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentView !== 'edit') return;

      // Ctrl+Z for undo
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }

      // Ctrl+Y or Ctrl+Shift+Z for redo
      if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView, historyIndex, history]);

  const generateNewDeck = () => {
    setIsGenerating(true);

    // Simulate AI generation with a delay
    setTimeout(() => {
      const randomColorScheme = colorSchemes[Math.floor(Math.random() * colorSchemes.length)];

      const newDeck: Deck = {
        id: allDecks.length + 1,
        title: newDeckTitle || "New AI-Generated Deck",
        description: newDeckDescription || "Powered by artificial intelligence",
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        slideCount: 7,
        colorScheme: randomColorScheme,
        slides: [
          {
            type: "title",
            title: newDeckTitle || "New AI-Generated Deck",
            subtitle: "",
            content: newDeckDescription || "The future is here"
          },
          {
            type: "problem",
            title: "Key Challenges",
            points: [
              "Market inefficiencies need addressing",
              "Current solutions are inadequate",
              "Customer pain points remain unsolved",
              "Innovation gap in the industry"
            ]
          },
          {
            type: "solution",
            title: "Our Innovation",
            description: "A revolutionary approach to solving complex problems with AI-driven insights",
            features: ["Smart Automation", "Data Analytics", "Scalable Platform", "User-Centric Design"]
          },
          {
            type: "market",
            title: "Market Potential",
            stat: "$25B",
            description: "Total Addressable Market",
            details: "Projected 35% growth over next 5 years"
          },
          {
            type: "traction",
            title: "Key Metrics",
            metrics: [
              { label: "Users", value: "5K+" },
              { label: "Revenue", value: "$500K ARR" },
              { label: "Growth", value: "50% MoM" },
              { label: "NPS Score", value: "72" }
            ]
          },
          {
            type: "business",
            title: "Pricing Strategy",
            tiers: [
              { name: "Basic", price: "$49/mo", users: "Small teams" },
              { name: "Pro", price: "$199/mo", users: "Growing companies" },
              { name: "Enterprise", price: "Custom", users: "Large organizations" }
            ]
          },
          {
            type: "ask",
            title: "Investment Opportunity",
            amount: "$2M Seed",
            usage: "Product Development • Marketing • Hiring",
            goal: "Achieve profitability by Q4 2026"
          }
        ]
      };

      setAllDecks([newDeck, ...allDecks]);
      setIsGenerating(false);
      setShowNewDeckModal(false);
      setNewDeckTitle('');
      setNewDeckDescription('');
    }, 3000); // 3 second AI generation simulation
  };

  const openDeck = (deck: Deck) => {
    setSelectedDeck(deck);
    setCurrentSlide(0);
    setCurrentView('deck');
  };

  const closeDeck = () => {
    setCurrentView('home');
    setSelectedDeck(null);
    setCurrentSlide(0);
  };

  const openEditMode = () => {
    if (!selectedDeck) return;
    setCurrentView('edit');
    setChatMessages([]);
  };

  const closeEditMode = () => {
    setCurrentView('deck');
    setChatMessages([]);
    setChatInput('');
  };

  // Undo/Redo functionality
  const saveToHistory = () => {
    if (!selectedDeck) return;
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(selectedDeck)));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0 && selectedDeck) {
      const previousDeck = history[historyIndex - 1];
      setSelectedDeck(previousDeck);
      setAllDecks(allDecks.map(deck => deck.id === selectedDeck.id ? previousDeck : deck));
      setHistoryIndex(historyIndex - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1 && selectedDeck) {
      const nextDeck = history[historyIndex + 1];
      setSelectedDeck(nextDeck);
      setAllDecks(allDecks.map(deck => deck.id === selectedDeck.id ? nextDeck : deck));
      setHistoryIndex(historyIndex + 1);
    }
  };

  // Execute actions from AI
  const executeAction = async (action: any) => {
    if (!selectedDeck) return;

    switch (action.type) {
      case 'update_slide':
        updateSlideContent(action.slideIndex, action.updates);
        break;

      case 'change_color_scheme':
        const newColorScheme = colorSchemes.find(
          scheme => scheme.primary.includes(action.colorSchemeName.split('-')[0].toLowerCase())
        ) || colorSchemes[0];
        const updatedDeck = { ...selectedDeck, colorScheme: newColorScheme };
        setSelectedDeck(updatedDeck);
        setAllDecks(allDecks.map(deck => deck.id === selectedDeck.id ? updatedDeck : deck));
        break;

      case 'add_slide':
        addSlide(action.slideType, action.position, action.content);
        break;

      case 'remove_slide':
        removeSlide(action.slideIndex);
        break;

      case 'update_data':
        updateSlideData(action.slideIndex, action.dataType, action.data);
        break;

      case 'add_image':
        await addSlideImage(action.slideIndex, action.imageDescription, action.imageStyle, action.imageUrl);
        break;

      case 'reorder':
        reorderSlides(action.fromIndex, action.toIndex);
        break;
    }
  };

  // Add a new slide
  const addSlide = (slideType: string, position: number, content: any) => {
    if (!selectedDeck) return;

    const newSlide = {
      type: slideType,
      ...content,
    };

    const updatedSlides = [...selectedDeck.slides];
    const insertPosition = position === -1 ? updatedSlides.length : position;
    updatedSlides.splice(insertPosition, 0, newSlide);

    const updatedDeck = {
      ...selectedDeck,
      slides: updatedSlides,
      slideCount: updatedSlides.length,
    };

    setSelectedDeck(updatedDeck);
    setAllDecks(allDecks.map(deck => deck.id === selectedDeck.id ? updatedDeck : deck));
  };

  // Remove a slide
  const removeSlide = (slideIndex: number) => {
    if (!selectedDeck || selectedDeck.slides.length <= 1) return;

    const updatedSlides = selectedDeck.slides.filter((_, index) => index !== slideIndex);
    const updatedDeck = {
      ...selectedDeck,
      slides: updatedSlides,
      slideCount: updatedSlides.length,
    };

    setSelectedDeck(updatedDeck);
    setAllDecks(allDecks.map(deck => deck.id === selectedDeck.id ? updatedDeck : deck));

    // Adjust current slide if needed
    if (currentSlide >= updatedSlides.length) {
      setCurrentSlide(Math.max(0, updatedSlides.length - 1));
    }
  };

  // Update slide data (metrics, pricing, team)
  const updateSlideData = (slideIndex: number, dataType: string, data: any) => {
    if (!selectedDeck) return;

    const slide = selectedDeck.slides[slideIndex];
    let updates: any = {};

    switch (dataType) {
      case 'metrics':
        updates = { metrics: data };
        break;
      case 'pricing':
        updates = { tiers: data };
        break;
      case 'team':
        updates = { members: data };
        break;
    }

    updateSlideContent(slideIndex, updates);
  };

  // Add image to slide
  const addSlideImage = async (slideIndex: number, imageDescription?: string, imageStyle?: string, imageUrl?: string) => {
    if (!selectedDeck) return;

    let finalImageUrl = imageUrl;

    // If we have a description but no URL, generate the image
    if (imageDescription && !imageUrl) {
      // TODO: Implement image generation with FAL.ai or similar
      // For now, use a placeholder
      console.log('Image generation requested:', imageDescription);
      finalImageUrl = `https://placehold.co/1200x800/6366f1/ffffff?text=${encodeURIComponent(imageDescription)}`;
    }

    const updates = {
      slideImage: finalImageUrl,
      imageStyle: imageStyle || 'background',
    };

    updateSlideContent(slideIndex, updates);
  };

  // Reorder slides
  const reorderSlides = (fromIndex: number, toIndex: number) => {
    if (!selectedDeck) return;

    const updatedSlides = [...selectedDeck.slides];
    const [movedSlide] = updatedSlides.splice(fromIndex, 1);
    updatedSlides.splice(toIndex, 0, movedSlide);

    const updatedDeck = {
      ...selectedDeck,
      slides: updatedSlides,
    };

    setSelectedDeck(updatedDeck);
    setAllDecks(allDecks.map(deck => deck.id === selectedDeck.id ? updatedDeck : deck));
  };

  // Change slide background
  const changeSlideBackground = (bgStyle: string) => {
    updateSlideContent(currentSlide, { customBackground: bgStyle });
    setShowBackgroundPanel(false);
  };

  // Add image to current slide
  const addImageToSlide = (url: string, style: 'background' | 'corner' | 'center' = 'center') => {
    updateSlideContent(currentSlide, {
      slideImage: url,
      imageStyle: style
    });
    setShowImagePanel(false);
    setImageUrl('');
    setAiImagePrompt('');
  };

  // Generate AI image (using placeholders for demo)
  const generateAIImage = (prompt: string) => {
    setIsGeneratingImage(true);

    setTimeout(() => {
      const placeholderImages = [
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
        'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800',
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
        'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800'
      ];

      const randomImage = placeholderImages[Math.floor(Math.random() * placeholderImages.length)];
      addImageToSlide(randomImage, 'background');
      setIsGeneratingImage(false);
      setAiImagePrompt('');
    }, 2500);
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || isAiTyping || !selectedDeck) return;

    const userMessage = chatInput.trim();
    const newMessages: ChatMessage[] = [...chatMessages, { role: 'user' as const, content: userMessage }];
    setChatMessages(newMessages);
    setChatInput('');
    setIsAiTyping(true);

    try {
      // Call real AI API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          deck: selectedDeck,
          currentSlide: currentSlide,
          conversationHistory: chatMessages,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'API request failed');
      }

      const data = await response.json();

      // Add AI response to chat
      setChatMessages(prev => [
        ...prev,
        { role: 'assistant' as const, content: data.message }
      ]);

      // Save current state to history before making changes
      if (data.actions && data.actions.length > 0) {
        saveToHistory();
      }

      // Execute actions from AI
      if (data.actions && data.actions.length > 0) {
        for (const action of data.actions) {
          await executeAction(action);
        }
      }

    } catch (error: any) {
      console.error('Chat error:', error);
      setChatMessages(prev => [
        ...prev,
        {
          role: 'assistant' as const,
          content: `Sorry, I encountered an error: ${error.message}. Please make sure your Anthropic API key is configured in the .env.local file.`
        }
      ]);
    } finally {
      setIsAiTyping(false);
    }
  };

  const nextSlide = () => {
    if (selectedDeck && currentSlide < selectedDeck.slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const setSlide = (index: number) => {
    setCurrentSlide(index);
  };

  
  // Save decks to localStorage whenever they change
  useEffect(() => {
    if (allDecks.length > 0) {
      localStorage.setItem('pitch-decks', JSON.stringify(allDecks));
    }
  }, [allDecks]);

  // Update slide content
  const updateSlideContent = (slideIndex: number, updates: Partial<any>) => {
    if (!selectedDeck) return;

    const updatedSlides = [...selectedDeck.slides];
    updatedSlides[slideIndex] = { ...updatedSlides[slideIndex], ...updates };

    const updatedDeck: Deck = {
      ...selectedDeck,
      slides: updatedSlides
    };

    setSelectedDeck(updatedDeck);
    const newDecks = allDecks.map(deck => deck.id === selectedDeck.id ? updatedDeck : deck);
    setAllDecks(newDecks);
  };

  // Update entire deck from JSON editor
  const handleDeckUpdate = (updates: Partial<Deck>) => {
    if (!selectedDeck) return;

    const updatedDeck: Deck = {
      ...selectedDeck,
      ...updates
    };

    setSelectedDeck(updatedDeck);
    const newDecks = allDecks.map(deck => deck.id === selectedDeck.id ? updatedDeck : deck);
    setAllDecks(newDecks);

    // Reset history when updating from JSON
    addToHistory();
  };

  // Render appropriate view based on current state
  if (currentView === 'home') {
    return (
      <>
        <HomeView
          allDecks={allDecks}
          onOpenDeck={openDeck}
          onShowNewDeckModal={() => setShowNewDeckModal(true)}
        />
        <NewDeckModal
          isOpen={showNewDeckModal}
          isGenerating={isGenerating}
          title={newDeckTitle}
          description={newDeckDescription}
          onTitleChange={setNewDeckTitle}
          onDescriptionChange={setNewDeckDescription}
          onGenerate={generateNewDeck}
          onClose={() => setShowNewDeckModal(false)}
        />
      </>
    );
  }

  if (currentView === 'deck' && selectedDeck) {
    return (
      <DeckView
        deck={selectedDeck}
        currentSlide={currentSlide}
        onPrevSlide={prevSlide}
        onNextSlide={nextSlide}
        onSetSlide={setSlide}
        onClose={closeDeck}
        onOpenEditMode={openEditMode}
      />
    );
  }

  if (currentView === 'edit' && selectedDeck) {
    return (
      <>
        <EditView
          deck={selectedDeck}
          currentSlide={currentSlide}
          onPrevSlide={prevSlide}
          onNextSlide={nextSlide}
          onSetSlide={setSlide}
          onClose={closeDeck}
          onBackToDeck={closeEditMode}
          chatMessages={chatMessages}
          chatInput={chatInput}
          onChatInputChange={setChatInput}
          onSendMessage={sendChatMessage}
          isAiTyping={isAiTyping}
          onUpdateSlide={updateSlideContent}
          onShowBackgroundPanel={() => setShowBackgroundPanel(true)}
          onShowImagePanel={() => setShowImagePanel(true)}
          onDeckUpdate={handleDeckUpdate}
        />

        {/* Background Panel Modal */}
        {showBackgroundPanel && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-slate-900 rounded-2xl p-8 max-w-2xl w-full mx-4 border border-slate-700">
              <h3 className="text-white text-2xl font-bold mb-6">Change Background</h3>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => changeSlideBackground('bg-gradient-to-br from-purple-600 to-blue-600')}
                  className="h-24 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 hover:scale-105 transition-transform border-2 border-transparent hover:border-white"
                />
                <button
                  onClick={() => changeSlideBackground('bg-gradient-to-br from-pink-500 to-orange-500')}
                  className="h-24 rounded-xl bg-gradient-to-br from-pink-500 to-orange-500 hover:scale-105 transition-transform border-2 border-transparent hover:border-white"
                />
                <button
                  onClick={() => changeSlideBackground('bg-gradient-to-br from-green-500 to-teal-500')}
                  className="h-24 rounded-xl bg-gradient-to-br from-green-500 to-teal-500 hover:scale-105 transition-transform border-2 border-transparent hover:border-white"
                />
                <button
                  onClick={() => changeSlideBackground('bg-gradient-to-br from-indigo-600 to-purple-600')}
                  className="h-24 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 hover:scale-105 transition-transform border-2 border-transparent hover:border-white"
                />
                <button
                  onClick={() => changeSlideBackground('bg-gradient-to-br from-red-500 to-pink-500')}
                  className="h-24 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 hover:scale-105 transition-transform border-2 border-transparent hover:border-white"
                />
                <button
                  onClick={() => changeSlideBackground('bg-gradient-to-br from-slate-700 to-slate-900')}
                  className="h-24 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 hover:scale-105 transition-transform border-2 border-transparent hover:border-white"
                />
              </div>

              <button
                onClick={() => setShowBackgroundPanel(false)}
                className="w-full bg-slate-800 text-white py-3 rounded-lg hover:bg-slate-700 transition-colors font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Image Panel Modal */}
        {showImagePanel && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-slate-900 rounded-2xl p-8 max-w-2xl w-full mx-4 border border-slate-700">
              <h3 className="text-white text-2xl font-bold mb-6">Add Image to Slide</h3>

              <div className="space-y-6">
                {/* URL Input */}
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Image URL</label>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full bg-slate-800 text-white px-4 py-3 rounded-lg border border-slate-700 focus:border-purple-500 focus:outline-none"
                  />
                  <button
                    onClick={() => addImageToSlide(imageUrl)}
                    disabled={!imageUrl.trim()}
                    className="mt-3 w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Image from URL
                  </button>
                </div>

                <div className="border-t border-slate-700 pt-6">
                  <label className="text-gray-400 text-sm mb-2 block">AI Image Generation</label>
                  <input
                    type="text"
                    value={aiImagePrompt}
                    onChange={(e) => setAiImagePrompt(e.target.value)}
                    placeholder="Describe the image you want to generate..."
                    className="w-full bg-slate-800 text-white px-4 py-3 rounded-lg border border-slate-700 focus:border-purple-500 focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      generateAIImage(aiImagePrompt);
                      setAiImagePrompt('');
                    }}
                    disabled={!aiImagePrompt.trim() || isGeneratingImage}
                    className="mt-3 w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isGeneratingImage ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <span>✨</span>
                        Generate with AI
                      </>
                    )}
                  </button>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowImagePanel(false);
                  setImageUrl('');
                  setAiImagePrompt('');
                }}
                className="w-full bg-slate-800 text-white py-3 rounded-lg hover:bg-slate-700 transition-colors font-semibold mt-6"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
}
