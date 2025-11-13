import React, { useState } from 'react';
import { Plus, ChevronLeft, ChevronRight, Home, Sparkles, X, Wand2, Zap, TrendingUp } from 'lucide-react';

const PitchDeckApp = () => {
  const [currentView, setCurrentView] = useState('home'); // 'home', 'deck', or 'edit'
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showNewDeckModal, setShowNewDeckModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newDeckTitle, setNewDeckTitle] = useState('');
  const [newDeckDescription, setNewDeckDescription] = useState('');
  const [allDecks, setAllDecks] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);

  // Initialize decks on mount
  React.useEffect(() => {
    if (allDecks.length === 0) {
      setAllDecks(initialDecks);
    }
  }, []);

  // Mock pitch decks with different color schemes
  const initialDecks = [
    {
      id: 1,
      title: "TechVenture AI Platform",
      description: "Revolutionary AI-powered analytics platform",
      date: "Oct 28, 2025",
      slideCount: 8,
      colorScheme: {
        primary: "bg-gradient-to-br from-blue-600 to-purple-700",
        secondary: "bg-blue-50",
        accent: "text-blue-600",
        button: "bg-blue-600 hover:bg-blue-700"
      },
      slides: [
        {
          type: "title",
          title: "TechVenture AI",
          subtitle: "Transforming Data into Intelligence",
          content: "The Future of Business Analytics"
        },
        {
          type: "problem",
          title: "The Problem",
          points: [
            "Companies struggle with data overload",
            "Traditional analytics tools are complex",
            "Insights take weeks to generate",
            "Teams lack AI expertise"
          ]
        },
        {
          type: "solution",
          title: "Our Solution",
          description: "AI-powered platform that turns raw data into actionable insights in minutes",
          features: ["Natural Language Queries", "Real-time Analytics", "Predictive Models", "Automated Reporting"]
        },
        {
          type: "market",
          title: "Market Opportunity",
          stat: "$50B",
          description: "Total Addressable Market",
          details: "Growing at 25% CAGR through 2030"
        },
        {
          type: "business",
          title: "Business Model",
          tiers: [
            { name: "Starter", price: "$99/mo", users: "Up to 10 users" },
            { name: "Professional", price: "$499/mo", users: "Up to 50 users" },
            { name: "Enterprise", price: "Custom", users: "Unlimited users" }
          ]
        },
        {
          type: "traction",
          title: "Traction",
          metrics: [
            { label: "Active Users", value: "10K+" },
            { label: "Revenue", value: "$2M ARR" },
            { label: "Growth", value: "40% MoM" },
            { label: "Retention", value: "95%" }
          ]
        },
        {
          type: "team",
          title: "Team",
          members: [
            { name: "Sarah Chen", role: "CEO", background: "Ex-Google AI Lead" },
            { name: "Marcus Davis", role: "CTO", background: "Stanford PhD, ML" },
            { name: "Elena Rodriguez", role: "CPO", background: "Ex-Microsoft PM" }
          ]
        },
        {
          type: "ask",
          title: "The Ask",
          amount: "$5M Series A",
          usage: "Product Development • Sales & Marketing • Team Growth",
          goal: "Scale to 100K users by Q4 2026"
        }
      ]
    },
    {
      id: 2,
      title: "EcoFlow Sustainability",
      description: "Carbon footprint tracking for enterprises",
      date: "Oct 25, 2025",
      slideCount: 7,
      colorScheme: {
        primary: "bg-gradient-to-br from-green-600 to-teal-600",
        secondary: "bg-green-50",
        accent: "text-green-600",
        button: "bg-green-600 hover:bg-green-700"
      },
      slides: [
        {
          type: "title",
          title: "EcoFlow",
          subtitle: "Sustainable Business Operations",
          content: "Track, Reduce, Thrive"
        },
        {
          type: "problem",
          title: "The Challenge",
          points: [
            "Companies face increasing ESG requirements",
            "Carbon tracking is manual and expensive",
            "No real-time sustainability metrics",
            "Compliance reporting is complex"
          ]
        },
        {
          type: "solution",
          title: "EcoFlow Platform",
          description: "Automated carbon tracking and ESG reporting for modern enterprises",
          features: ["Real-time Monitoring", "Automated Reporting", "Supply Chain Tracking", "AI Recommendations"]
        },
        {
          type: "market",
          title: "Market Size",
          stat: "$15B",
          description: "ESG Software Market",
          details: "Expected to reach $40B by 2028"
        },
        {
          type: "traction",
          title: "Early Success",
          metrics: [
            { label: "Enterprise Clients", value: "45" },
            { label: "Carbon Tracked", value: "500K tons" },
            { label: "Revenue", value: "$1.2M ARR" },
            { label: "Team Size", value: "18" }
          ]
        },
        {
          type: "business",
          title: "Revenue Model",
          tiers: [
            { name: "SMB", price: "$299/mo", users: "Single facility" },
            { name: "Enterprise", price: "$2K+/mo", users: "Multiple locations" },
            { name: "Custom", price: "Custom", users: "Global operations" }
          ]
        },
        {
          type: "ask",
          title: "Investment",
          amount: "$3M Seed Round",
          usage: "Engineering • Customer Success • Market Expansion",
          goal: "100 enterprise customers by 2026"
        }
      ]
    },
    {
      id: 3,
      title: "HealthPro Telemedicine",
      description: "Next-generation virtual healthcare platform",
      date: "Oct 20, 2025",
      slideCount: 6,
      colorScheme: {
        primary: "bg-gradient-to-br from-rose-600 to-orange-600",
        secondary: "bg-rose-50",
        accent: "text-rose-600",
        button: "bg-rose-600 hover:bg-rose-700"
      },
      slides: [
        {
          type: "title",
          title: "HealthPro",
          subtitle: "Healthcare Without Boundaries",
          content: "Connecting Patients and Providers"
        },
        {
          type: "problem",
          title: "Healthcare Access Gap",
          points: [
            "Rural areas lack specialist access",
            "Wait times exceed 3 weeks average",
            "Emergency care is overutilized",
            "Chronic care management is inefficient"
          ]
        },
        {
          type: "solution",
          title: "HealthPro Solution",
          description: "24/7 access to board-certified physicians via video, chat, and phone",
          features: ["Instant Consultations", "Prescription Services", "Health Records", "Specialist Network"]
        },
        {
          type: "market",
          title: "Market Dynamics",
          stat: "$85B",
          description: "Telemedicine Market 2025",
          details: "Growing 30% annually post-pandemic"
        },
        {
          type: "traction",
          title: "Growth Metrics",
          metrics: [
            { label: "Consultations", value: "50K+" },
            { label: "Physicians", value: "500+" },
            { label: "Satisfaction", value: "4.8/5" },
            { label: "Revenue", value: "$3M ARR" }
          ]
        },
        {
          type: "ask",
          title: "Series A Round",
          amount: "$8M",
          usage: "Provider Network • Technology • Geographic Expansion",
          goal: "Serve 500K patients by end of 2026"
        }
      ]
    }
  ];

  const colorSchemes = [
    {
      primary: "bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600",
      secondary: "bg-indigo-50",
      accent: "text-indigo-600",
      button: "bg-indigo-600 hover:bg-indigo-700"
    },
    {
      primary: "bg-gradient-to-br from-emerald-600 to-cyan-600",
      secondary: "bg-emerald-50",
      accent: "text-emerald-600",
      button: "bg-emerald-600 hover:bg-emerald-700"
    },
    {
      primary: "bg-gradient-to-br from-amber-600 to-red-600",
      secondary: "bg-amber-50",
      accent: "text-amber-600",
      button: "bg-amber-600 hover:bg-amber-700"
    },
    {
      primary: "bg-gradient-to-br from-violet-600 to-fuchsia-600",
      secondary: "bg-violet-50",
      accent: "text-violet-600",
      button: "bg-violet-600 hover:bg-violet-700"
    }
  ];

  const generateNewDeck = () => {
    setIsGenerating(true);
    
    // Simulate AI generation with a delay
    setTimeout(() => {
      const randomColorScheme = colorSchemes[Math.floor(Math.random() * colorSchemes.length)];
      
      const newDeck = {
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
            subtitle: "Powered by Advanced AI",
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

  const openDeck = (deck) => {
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
    setCurrentView('edit');
    setChatMessages([{
      role: 'assistant',
      content: `Hi! I'm your AI assistant. I can help you edit "${selectedDeck.title}". You can ask me to:\n\n• Change slide content\n• Adjust colors and styling\n• Add or remove slides\n• Modify text and data\n\nWhat would you like to change?`
    }]);
  };

  const closeEditMode = () => {
    setCurrentView('deck');
    setChatMessages([]);
    setChatInput('');
  };

  const sendChatMessage = () => {
    if (!chatInput.trim() || isAiTyping) return;

    const userMessage = chatInput.trim();
    setChatMessages([...chatMessages, { role: 'user', content: userMessage }]);
    setChatInput('');
    setIsAiTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "I've updated the slide content as requested. The changes are now visible in the preview.",
        "Great idea! I've made those adjustments to the color scheme and typography.",
        "I've modified the data on that slide. Check out the updated metrics on the left.",
        "Done! The new slide has been added with the information you provided.",
        "I've refined the content to make it more impactful. What do you think?",
        "Perfect! I've applied those changes. Would you like me to adjust anything else?"
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setChatMessages(prev => [...prev, { role: 'assistant', content: randomResponse }]);
      setIsAiTyping(false);
    }, 1500);
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

  const renderSlide = (slide, colorScheme) => {
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
  };

  if (currentView === 'home') {
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
            <div className="inline-flex items-center gap-3 mb-6 bg-white bg-opacity-5 backdrop-blur-xl px-6 py-3 rounded-full border border-white border-opacity-10">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg flex items-center justify-center shadow-lg animate-pulse">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-purple-300 font-semibold text-sm">Powered by Advanced AI</span>
            </div>
            
            <h1 className="text-7xl font-black text-white mb-6 tracking-tight leading-tight">
              Create Stunning
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 text-transparent bg-clip-text">
                Pitch Decks
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              Transform your ideas into professional presentations in seconds with AI-powered design and content generation
            </p>
            
            <button 
              onClick={() => setShowNewDeckModal(true)}
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
                onClick={() => openDeck(deck)}
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
                onClick={() => setShowNewDeckModal(true)}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl hover:shadow-xl hover:shadow-purple-500/50 transition-all font-bold transform hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                Create Your First Deck
              </button>
            </div>
          )}
        </div>

        {/* New Deck Modal */}
        {showNewDeckModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 transform transition-all animate-scale-up">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Wand2 className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-black text-gray-800">Create New Pitch Deck</h2>
                </div>
                <button
                  onClick={() => setShowNewDeckModal(false)}
                  className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                  disabled={isGenerating}
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {isGenerating ? (
                <div className="py-12 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl mx-auto mb-6 flex items-center justify-center animate-bounce">
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">AI is Generating Your Deck...</h3>
                  <p className="text-gray-600 mb-6">Creating slides, designing layouts, and applying styles</p>
                  <div className="max-w-md mx-auto">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-blue-600 rounded-full animate-progress"></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Pitch Deck Title *</label>
                    <input
                      type="text"
                      value={newDeckTitle}
                      onChange={(e) => setNewDeckTitle(e.target.value)}
                      placeholder="e.g., TechVenture AI Platform"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors text-gray-800 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                    <textarea
                      value={newDeckDescription}
                      onChange={(e) => setNewDeckDescription(e.target.value)}
                      placeholder="Briefly describe your pitch deck..."
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors text-gray-800 resize-none"
                    />
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-200">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-bold text-gray-800 mb-1">AI-Powered Generation</h4>
                        <p className="text-sm text-gray-600">Our AI will create a professional 7-slide pitch deck with problem, solution, market, traction, pricing, and investment slides.</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setShowNewDeckModal(false)}
                      className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={generateNewDeck}
                      disabled={!newDeckTitle.trim()}
                      className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:shadow-xl transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Wand2 className="w-5 h-5" />
                      Generate Pitch Deck
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (currentView === 'deck' && selectedDeck) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col">
        {/* Top Navigation Bar */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-5 flex items-center justify-between border-b border-slate-700 backdrop-blur-lg">
          <button
            onClick={closeDeck}
            className="group flex items-center gap-3 text-white hover:text-purple-400 transition-colors px-4 py-2 rounded-xl hover:bg-white hover:bg-opacity-10"
          >
            <Home className="w-5 h-5" />
            <span className="font-semibold">Back to Home</span>
          </button>
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span className="text-white font-bold text-lg">{selectedDeck.title}</span>
          </div>
          <button
            onClick={openEditMode}
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
            <div className="bg-white rounded-3xl shadow-2xl aspect-video overflow-hidden border-4 border-slate-700 transform transition-all duration-300">
              {renderSlide(selectedDeck.slides[currentSlide], selectedDeck.colorScheme)}
            </div>

            {/* Navigation Controls - Below Slide */}
            <div className="flex items-center justify-center gap-6 mt-8">
              <button
                onClick={prevSlide}
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
                <span className="text-gray-400">{selectedDeck.slides.length}</span>
              </div>

              <button
                onClick={nextSlide}
                disabled={currentSlide === selectedDeck.slides.length - 1}
                className={`group flex items-center gap-2 bg-white px-6 py-3 rounded-xl shadow-lg transition-all ${
                  currentSlide === selectedDeck.slides.length - 1 
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
              {selectedDeck.slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
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

  if (currentView === 'edit' && selectedDeck) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-5 flex items-center justify-between border-b border-slate-700 backdrop-blur-lg flex-shrink-0">
          <button
            onClick={closeEditMode}
            className="group flex items-center gap-3 text-white hover:text-purple-400 transition-colors px-4 py-2 rounded-xl hover:bg-white hover:bg-opacity-10"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="font-semibold">Back to Presentation</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-white font-bold text-lg">AI Edit Mode</span>
          </div>
          <button
            onClick={closeDeck}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors px-4 py-2 rounded-xl hover:bg-white hover:bg-opacity-10"
          >
            <Home className="w-5 h-5" />
            <span className="font-semibold">Home</span>
          </button>
        </div>

        {/* Main Content Area - Split View */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Side - Slide Preview (2/3) */}
          <div className="w-2/3 p-8 flex flex-col border-r border-slate-700">
            <div className="flex-1 flex flex-col items-center justify-center">
              {/* Slide Container */}
              <div className="w-full max-w-4xl">
                <div className="bg-white rounded-2xl shadow-2xl aspect-video overflow-hidden border-2 border-slate-700">
                  {renderSlide(selectedDeck.slides[currentSlide], selectedDeck.colorScheme)}
                </div>

                {/* Navigation Controls */}
                <div className="flex items-center justify-center gap-4 mt-6">
                  <button
                    onClick={prevSlide}
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
                    <span className="text-gray-400">{selectedDeck.slides.length}</span>
                  </div>

                  <button
                    onClick={nextSlide}
                    disabled={currentSlide === selectedDeck.slides.length - 1}
                    className={`flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg transition-all ${
                      currentSlide === selectedDeck.slides.length - 1 
                        ? 'opacity-30 cursor-not-allowed' 
                        : 'hover:bg-slate-700'
                    }`}
                  >
                    <span className="text-sm font-semibold">Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Slide Dots */}
                <div className="flex gap-1.5 justify-center mt-4">
                  {selectedDeck.slides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-1.5 rounded-full transition-all ${
                        idx === currentSlide 
                          ? 'bg-purple-500 w-6' 
                          : 'bg-gray-700 w-1.5 hover:bg-gray-600'
                      }`}
                    />
                  ))}
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
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                  placeholder="Ask me to edit something..."
                  className="flex-1 bg-slate-800 text-white px-4 py-3 rounded-xl border border-slate-700 focus:border-purple-500 focus:outline-none transition-colors placeholder-gray-500"
                  disabled={isAiTyping}
                />
                <button
                  onClick={sendChatMessage}
                  disabled={!chatInput.trim() || isAiTyping}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  <span>Send</span>
                </button>
              </div>
              <p className="text-gray-500 text-xs mt-3 text-center">
                Try: "Change the title color" or "Make slide 2 more impactful"
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// Add custom CSS for animations
const style = document.createElement('style');
style.textContent = `
  @keyframes gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  @keyframes progress {
    0% { width: 0%; }
    100% { width: 100%; }
  }

  @keyframes scale-up {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .animate-gradient {
    background-size: 200% 200%;
    animation: gradient 3s ease infinite;
  }

  .animation-delay-2000 {
    animation-delay: 2s;
  }

  .animation-delay-4000 {
    animation-delay: 4s;
  }

  .animation-delay-200 {
    animation-delay: 0.2s;
  }

  .animation-delay-400 {
    animation-delay: 0.4s;
  }

  .bg-size-200 {
    background-size: 200% auto;
  }

  .bg-pos-0 {
    background-position: 0% center;
  }

  .bg-pos-100 {
    background-position: 100% center;
  }

  .animate-progress {
    animation: progress 3s ease-in-out;
  }

  .animate-scale-up {
    animation: scale-up 0.2s ease-out;
  }

  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;
document.head.appendChild(style);

export default PitchDeckApp;