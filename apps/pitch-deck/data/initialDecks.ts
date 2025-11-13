import { Deck } from '@/types/deck';

export const initialDecks: Deck[] = [
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
