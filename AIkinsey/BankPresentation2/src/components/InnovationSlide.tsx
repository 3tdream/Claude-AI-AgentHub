import { motion } from 'motion/react';
import { Sparkles, Rocket, Zap, Brain } from 'lucide-react';

const innovations = [
  {
    icon: Brain,
    title: 'AI Banking Assistant',
    description: '24/7 intelligent support powered by advanced machine learning',
    color: 'from-blue-500 via-blue-600 to-cyan-500',
    stat: '10M+ interactions',
  },
  {
    icon: Zap,
    title: 'Instant Payments',
    description: 'Cross-border transfers in under 10 seconds',
    color: 'from-purple-500 via-violet-600 to-pink-500',
    stat: '<10s average',
  },
  {
    icon: Rocket,
    title: 'Innovation Lab',
    description: 'Partnering with 200+ fintech startups',
    color: 'from-orange-500 via-red-600 to-rose-500',
    stat: '200+ partners',
  },
  {
    icon: Sparkles,
    title: 'Smart Savings',
    description: 'Automated wealth building with AI optimization',
    color: 'from-emerald-500 via-green-600 to-teal-500',
    stat: '€2.5B managed',
  },
];

export function InnovationSlide() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-950 px-24 relative overflow-hidden">
      {/* Radial background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-950/30 via-slate-950 to-slate-950" />

      <div className="max-w-7xl w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-block px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full mb-6">
            <span className="text-sm text-purple-400 uppercase tracking-wide">Innovation</span>
          </div>
          <h2 className="text-5xl font-semibold text-white mb-6 tracking-tight">
            Innovation Initiatives
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Pioneering breakthrough solutions that reshape the banking experience
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-6">
          {innovations.map((innovation, index) => {
            const Icon = innovation.icon;
            return (
              <motion.div
                key={innovation.title}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
                className="relative group"
              >
                {/* Gradient glow */}
                <div className={`absolute -inset-0.5 bg-gradient-to-br ${innovation.color} rounded-3xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />
                
                <div className="relative bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-3xl p-8 hover:border-slate-700 transition-all">
                  <div className="flex items-start justify-between mb-6">
                    <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${innovation.color} rounded-2xl shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="px-3 py-1.5 bg-slate-800/50 border border-slate-700 rounded-full">
                      <span className="text-xs text-slate-400">{innovation.stat}</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-3 tracking-tight">{innovation.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{innovation.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
