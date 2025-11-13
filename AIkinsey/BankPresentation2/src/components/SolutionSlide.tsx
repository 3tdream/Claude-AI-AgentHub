import { motion } from 'motion/react';
import { Users, Network, Brain } from 'lucide-react';

const features = [
  {
    icon: Users,
    title: 'Personal AI Employees',
    description: 'Every human worker gets their own AI assistant—trained on company processes, integrated with all systems.',
    gradient: 'from-purple-500 via-pink-500 to-rose-500',
  },
  {
    icon: Network,
    title: 'AI-to-AI Collaboration',
    description: 'AI employees work together autonomously—passing tasks, sharing context, and coordinating workflows.',
    gradient: 'from-blue-500 via-indigo-500 to-purple-500',
  },
  {
    icon: Brain,
    title: 'Chief AI Officer',
    description: 'System-wide intelligence that optimizes org-wide operations and learns from every interaction.',
    gradient: 'from-cyan-500 via-blue-500 to-indigo-500',
  },
];

export function SolutionSlide() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-950 px-6 md:px-24 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(168,85,247,0.5),transparent_50%)]" />
      </div>

      <div className="max-w-7xl w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 md:mb-20"
        >
          <div className="inline-block px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full mb-6">
            <span className="text-sm text-purple-400 uppercase tracking-wide">The Solution</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-semibold text-white mb-6 tracking-tight">
            Autonomous AI Workforce
          </h2>
          <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Not a tool you manage—an AI workforce that operates alongside your team,
            learning and improving every day.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
                className="relative group"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-3xl blur-xl`} />
                <div className="relative bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-3xl p-6 md:p-8 hover:border-slate-700 transition-all h-full">
                  <div className={`inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl mb-6 shadow-lg`}>
                    <Icon className="w-7 h-7 md:w-8 md:h-8 text-white" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-semibold text-white mb-4 tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-sm md:text-base text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-10 md:mt-16 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-full">
            <span className="text-sm md:text-base text-purple-300 font-medium">
              22-35% productivity gain in Week 1
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
