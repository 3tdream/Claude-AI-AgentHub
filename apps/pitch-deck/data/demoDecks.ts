import { Deck } from '@/types/deck';
import { colorSchemes } from './colorSchemes';

export const demoDecks: Deck[] = [
  {
    id: 1,
    title: "NeuralFlow AI",
    description: "Enterprise AI automation platform transforming business operations",
    date: "Oct 29, 2025",
    slideCount: 9,
    colorScheme: colorSchemes[4], // Blue-Purple - Professional
    slides: [
      {
        type: "title",
        title: "NeuralFlow AI",
        subtitle: "The Future of Enterprise Automation",
        content: "Transforming business operations with intelligent AI agents"
      },
      {
        type: "problem",
        title: "The Enterprise Challenge",
        points: [
          "Companies waste 40% of employee time on repetitive tasks",
          "Manual processes cost businesses $1.8T annually",
          "Existing automation tools require extensive technical expertise",
          "Integration complexity prevents widespread AI adoption"
        ]
      },
      {
        type: "solution",
        title: "Our Solution",
        description: "NeuralFlow provides no-code AI agents that automate complex business workflows across any platform",
        features: [
          "Natural language workflow creation",
          "Cross-platform integration (2000+ apps)",
          "Self-learning AI optimization",
          "Enterprise-grade security & compliance"
        ]
      },
      {
        type: "market",
        title: "Market Opportunity",
        stat: "$87B",
        description: "Global Business Process Automation Market",
        details: "Growing at 14% CAGR, reaching $152B by 2030"
      },
      {
        type: "traction",
        title: "Traction & Growth",
        metrics: [
          { label: "Enterprise Customers", value: "127" },
          { label: "ARR", value: "$8.2M" },
          { label: "Growth Rate", value: "35% MoM" },
          { label: "NRR", value: "145%" }
        ]
      },
      {
        type: "business",
        title: "Revenue Model",
        tiers: [
          { name: "Starter", price: "$299/mo", users: "Up to 10 agents" },
          { name: "Professional", price: "$999/mo", users: "Up to 50 agents" },
          { name: "Enterprise", price: "Custom", users: "Unlimited agents + SLA" }
        ]
      },
      {
        type: "team",
        title: "Leadership Team",
        members: [
          { name: "Sarah Chen", role: "CEO & Co-founder", background: "Ex-Google AI, Stanford CS PhD" },
          { name: "Marcus Rodriguez", role: "CTO & Co-founder", background: "Built automation at Stripe, MIT" },
          { name: "Priya Patel", role: "VP Product", background: "Product Lead at Salesforce" }
        ]
      },
      {
        type: "ask",
        title: "Series A Raise",
        amount: "$12M",
        usage: "Product Development (40%) • Sales & Marketing (35%) • Team Expansion (25%)",
        goal: "Achieve $50M ARR and expand to European market by Q4 2026"
      }
    ]
  },
  {
    id: 2,
    title: "GreenTech Solutions",
    description: "Revolutionary carbon capture technology for industrial facilities",
    date: "Oct 29, 2025",
    slideCount: 8,
    colorScheme: colorSchemes[5], // Green-Teal
    slides: [
      {
        type: "title",
        title: "GreenTech Solutions",
        subtitle: "Reversing Climate Change at Scale",
        content: "Next-generation carbon capture for heavy industry"
      },
      {
        type: "problem",
        title: "The Climate Crisis",
        points: [
          "Industrial facilities produce 45% of global CO2 emissions",
          "Traditional carbon capture is 10x too expensive to deploy",
          "Net-zero targets require immediate technological breakthroughs",
          "Current solutions can't retrofit existing infrastructure"
        ]
      },
      {
        type: "solution",
        title: "Our Technology",
        description: "Proprietary nanofilter system that captures 99% of CO2 at 1/10th the cost of existing solutions",
        features: [
          "Modular retrofit design for any facility",
          "90% lower operational costs",
          "Captured CO2 converted to marketable products",
          "Payback period under 3 years"
        ]
      },
      {
        type: "market",
        title: "Total Addressable Market",
        stat: "$250B",
        description: "Carbon Capture & Storage Market by 2030",
        details: "Regulatory tailwinds with carbon pricing in 67 countries"
      },
      {
        type: "traction",
        title: "Validation & Pilots",
        metrics: [
          { label: "Pilot Installations", value: "12" },
          { label: "CO2 Captured (tons)", value: "45,000" },
          { label: "LOIs Signed", value: "$89M" },
          { label: "Patents Filed", value: "8" }
        ]
      },
      {
        type: "business",
        title: "Business Model",
        tiers: [
          { name: "Equipment Sale", price: "$2-5M", users: "One-time installation" },
          { name: "Service Contract", price: "$500K/year", users: "Maintenance & optimization" },
          { name: "CO2 Revenue Share", price: "30% of sales", users: "Captured carbon products" }
        ]
      },
      {
        type: "team",
        title: "World-Class Team",
        members: [
          { name: "Dr. James Liu", role: "CEO", background: "Former Tesla Energy VP, MIT Professor" },
          { name: "Elena Volkov", role: "Chief Scientist", background: "Nobel Prize nominee in Chemistry" },
          { name: "Tom Anderson", role: "COO", background: "Scaled Siemens Industrial Division" }
        ]
      },
      {
        type: "ask",
        title: "Series B Funding",
        amount: "$45M",
        usage: "Manufacturing Scale-up (50%) • Commercial Deployments (30%) • R&D (20%)",
        goal: "Deploy 100+ installations and achieve profitability by 2026"
      }
    ]
  },
  {
    id: 3,
    title: "HealthLink Pro",
    description: "AI-powered platform connecting patients with specialized care instantly",
    date: "Oct 29, 2025",
    slideCount: 8,
    colorScheme: colorSchemes[3], // Violet-Fuchsia - Creative
    slides: [
      {
        type: "title",
        title: "HealthLink Pro",
        subtitle: "Healthcare Access Reimagined",
        content: "Connecting 50M patients to specialists in under 24 hours"
      },
      {
        type: "problem",
        title: "Healthcare Access Crisis",
        points: [
          "Average wait time for specialists: 24 days in US",
          "60% of rural areas lack access to specialized care",
          "Patients see wrong specialists 40% of the time",
          "$250B wasted annually on inefficient care navigation"
        ]
      },
      {
        type: "solution",
        title: "How HealthLink Works",
        description: "AI-driven platform that matches patients with the right specialists and enables instant virtual consultations",
        features: [
          "AI symptom analyzer with 96% accuracy",
          "Network of 50,000+ verified specialists",
          "24-hour guaranteed appointment",
          "Integrated with major insurance providers"
        ]
      },
      {
        type: "market",
        title: "Market Size",
        stat: "$145B",
        description: "Digital Health Market in US",
        details: "Telehealth adoption grew 38x since 2020, now permanent shift"
      },
      {
        type: "traction",
        title: "Growth Metrics",
        metrics: [
          { label: "Active Patients", value: "2.3M" },
          { label: "Monthly Consultations", value: "185K" },
          { label: "Specialist Network", value: "52,000" },
          { label: "Insurance Partners", value: "340" }
        ]
      },
      {
        type: "business",
        title: "Revenue Streams",
        tiers: [
          { name: "Patient Subscription", price: "$29/mo", users: "Unlimited AI matching" },
          { name: "Per Consultation", price: "$79", users: "Specialist video visit" },
          { name: "Enterprise B2B", price: "$12/employee/mo", users: "Corporate health benefits" }
        ]
      },
      {
        type: "team",
        title: "Expert Leadership",
        members: [
          { name: "Dr. Rachel Kim", role: "CEO & Co-founder", background: "Former Chief Medical Officer, Kaiser" },
          { name: "David Park", role: "CTO & Co-founder", background: "Engineering Director at Amazon Health" },
          { name: "Lisa Wong", role: "Chief Medical Advisor", background: "Harvard Medical School, 20yr clinician" }
        ]
      },
      {
        type: "ask",
        title: "Series C Round",
        amount: "$65M",
        usage: "Geographic Expansion (40%) • AI Development (25%) • B2B Sales Team (35%)",
        goal: "Reach 10M patients and expand internationally by 2027"
      }
    ]
  },
  {
    id: 4,
    title: "QuantumLeap Fintech",
    description: "Next-gen payment infrastructure for emerging markets",
    date: "Oct 29, 2025",
    slideCount: 8,
    colorScheme: colorSchemes[0], // Indigo-Purple-Pink - Vibrant
    slides: [
      {
        type: "title",
        title: "QuantumLeap Fintech",
        subtitle: "Banking the Unbanked",
        content: "Modern payment infrastructure for 1.7 billion people"
      },
      {
        type: "problem",
        title: "Global Financial Exclusion",
        points: [
          "1.7B adults globally lack bank accounts",
          "Remittance fees average 6-7% in emerging markets",
          "Small businesses lose 20% revenue to payment friction",
          "Traditional banking infrastructure too expensive to deploy"
        ]
      },
      {
        type: "solution",
        title: "Our Platform",
        description: "Mobile-first digital wallet with blockchain rails enabling instant, near-zero-cost transactions",
        features: [
          "Works offline with SMS backup",
          "0.1% transaction fees",
          "Instant cross-border transfers",
          "Integrated microloan marketplace"
        ]
      },
      {
        type: "market",
        title: "Massive Opportunity",
        stat: "$2.1T",
        description: "Digital Payments in Emerging Markets",
        details: "Growing 25% annually, 650M new digital wallet users by 2025"
      },
      {
        type: "traction",
        title: "Explosive Growth",
        metrics: [
          { label: "Active Wallets", value: "8.5M" },
          { label: "Transaction Volume", value: "$420M/mo" },
          { label: "Countries Live", value: "12" },
          { label: "YoY Growth", value: "340%" }
        ]
      },
      {
        type: "business",
        title: "Monetization Strategy",
        tiers: [
          { name: "Transaction Fees", price: "0.1%", users: "Per transaction" },
          { name: "Currency Exchange", price: "0.5%", users: "FX spread" },
          { name: "Premium Services", price: "$3/mo", users: "Insurance, savings, credit" }
        ]
      },
      {
        type: "team",
        title: "Proven Founders",
        members: [
          { name: "Amara Okonkwo", role: "CEO", background: "Built payments at Stripe, Nigerian fintech expert" },
          { name: "Wei Zhang", role: "CTO", background: "Blockchain architect from Coinbase" },
          { name: "Carlos Mendez", role: "CFO", background: "Former Goldman Sachs emerging markets" }
        ]
      },
      {
        type: "ask",
        title: "Series B Raise",
        amount: "$35M",
        usage: "Market Expansion (50%) • Regulatory & Compliance (25%) • Product Development (25%)",
        goal: "Reach 50M users across 30 countries by 2026"
      }
    ]
  },
  {
    id: 5,
    title: "EduFlow Academy",
    description: "Personalized AI tutoring making elite education accessible to all",
    date: "Oct 29, 2025",
    slideCount: 8,
    colorScheme: colorSchemes[6], // Rose-Orange - Vibrant & Friendly
    slides: [
      {
        type: "title",
        title: "EduFlow Academy",
        subtitle: "Elite Education for Everyone",
        content: "AI tutors that adapt to every student's unique learning style"
      },
      {
        type: "problem",
        title: "Education Inequality Crisis",
        points: [
          "Top 1% students have access to $200/hr tutors",
          "Average student-teacher ratio is 24:1 globally",
          "70% of students learn differently than how they're taught",
          "Education outcomes correlate strongly with family income"
        ]
      },
      {
        type: "solution",
        title: "AI-Powered Learning",
        description: "Personalized AI tutors that understand each student's learning style, pace, and knowledge gaps",
        features: [
          "Adaptive curriculum for every student",
          "Real-time progress tracking for parents",
          "Available 24/7 in 40+ languages",
          "Costs 95% less than human tutors"
        ]
      },
      {
        type: "market",
        title: "Market Potential",
        stat: "$350B",
        description: "Global EdTech Market",
        details: "Online learning growing 200% faster than traditional education"
      },
      {
        type: "traction",
        title: "Impact & Growth",
        metrics: [
          { label: "Active Students", value: "1.2M" },
          { label: "Learning Hours", value: "45M" },
          { label: "Avg Grade Improvement", value: "+28%" },
          { label: "Countries", value: "45" }
        ]
      },
      {
        type: "business",
        title: "Affordable Pricing",
        tiers: [
          { name: "Free Tier", price: "$0", users: "Basic subjects, 5 hrs/mo" },
          { name: "Premium", price: "$19/mo", users: "All subjects, unlimited" },
          { name: "School License", price: "$8/student/yr", users: "Bulk institutional pricing" }
        ]
      },
      {
        type: "team",
        title: "Education Innovators",
        members: [
          { name: "Dr. Maya Sharma", role: "CEO & Founder", background: "Former Dean at Stanford Education School" },
          { name: "Alex Chen", role: "Chief Learning Officer", background: "Created curriculum for Khan Academy" },
          { name: "Jordan Taylor", role: "CTO", background: "AI researcher from DeepMind" }
        ]
      },
      {
        type: "ask",
        title: "Growth Round",
        amount: "$25M",
        usage: "Content Development (40%) • AI Enhancement (30%) • Global Expansion (30%)",
        goal: "Reach 10M students and launch corporate training division by 2026"
      }
    ]
  }
];
