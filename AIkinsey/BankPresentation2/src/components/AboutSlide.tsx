import { motion } from 'motion/react';
import { AlertCircle, DollarSign, Clock, TrendingDown } from 'lucide-react';

const problems = [
  { icon: TrendingDown, label: 'Lost Productivity', value: '40%', color: 'from-red-500 to-orange-500', desc: 'Manual processes' },
  { icon: DollarSign, label: 'Consultant Spend', value: '$500B', color: 'from-orange-500 to-yellow-500', desc: 'Annual global market' },
  { icon: Clock, label: 'Wasted Time', value: '20hrs/wk', color: 'from-yellow-500 to-red-500', desc: 'Per employee' },
  { icon: AlertCircle, label: 'SME Challenge', value: '85%', color: 'from-pink-500 to-red-500', desc: 'Lack AI strategy' },
];

export function AboutSlide() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-950 px-6 md:px-24 relative overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-950/20 via-slate-950 to-slate-950" />

      <div className="max-w-7xl w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 md:mb-20"
        >
          <div className="inline-block px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full mb-6">
            <span className="text-sm text-red-400 uppercase tracking-wide">The Problem</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-semibold text-white mb-6 tracking-tight">
            SMEs Are Drowning in Inefficiency
          </h2>
          <p className="text-lg md:text-xl text-slate-400 max-w-4xl leading-relaxed">
            Small and medium enterprises waste billions on manual processes and expensive consultants.
            They need operational leverage but can't afford traditional solutions.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {problems.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl blur-xl" 
                     style={{ background: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }} />
                <div className="relative bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-3xl p-6 md:p-8 text-center hover:border-slate-700 transition-all">
                  <div className={`inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br ${stat.color} rounded-2xl mb-4 md:mb-6 shadow-lg`}>
                    <Icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
                  </div>
                  <div className="text-3xl md:text-5xl font-semibold text-white mb-2 md:mb-3 tracking-tight">{stat.value}</div>
                  <div className="text-xs md:text-sm text-slate-500 uppercase tracking-wider mb-2">{stat.label}</div>
                  <div className="text-xs text-slate-600">{stat.desc}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
