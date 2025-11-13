import { motion } from 'motion/react';
import { TrendingUp, DollarSign, Award, Target } from 'lucide-react';

const metrics = [
  {
    icon: DollarSign,
    label: 'Revenue Growth',
    value: '+42%',
    period: 'YoY 2024',
    gradient: 'from-emerald-500 to-green-500',
  },
  {
    icon: TrendingUp,
    label: 'Market Share',
    value: '18.5%',
    period: 'European Market',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Award,
    label: 'Customer Satisfaction',
    value: '4.8/5',
    period: 'Industry Leading',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    icon: Target,
    label: 'Digital Adoption',
    value: '87%',
    period: 'Active Users',
    gradient: 'from-purple-500 to-pink-500',
  },
];

const achievements = [
  'Named "Most Innovative Bank" by European Banking Awards 2024',
  'Achieved carbon neutrality across all operations',
  'Processed over 2 billion transactions in 2024',
  'Launched services in 5 new European markets',
];

export function ResultsSlide() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-950 px-24 relative overflow-hidden">
      {/* Radial background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-950/20 via-slate-950 to-slate-950" />

      <div className="max-w-7xl w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-block px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full mb-6">
            <span className="text-sm text-purple-400 uppercase tracking-wide">Results</span>
          </div>
          <h2 className="text-5xl font-semibold text-white mb-6 tracking-tight">
            2024 Results & Achievements
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Our commitment to innovation delivers exceptional results
          </p>
        </motion.div>

        <div className="grid grid-cols-4 gap-6 mb-12">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
                className="relative group"
              >
                <div className={`absolute -inset-0.5 bg-gradient-to-br ${metric.gradient} rounded-3xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
                
                <div className="relative bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-3xl p-8 text-center hover:border-slate-700 transition-all">
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${metric.gradient} rounded-2xl mb-6 shadow-lg`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-5xl font-semibold text-white mb-3 tracking-tight">{metric.value}</div>
                  <div className="text-white font-medium mb-2">{metric.label}</div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider">{metric.period}</div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-3xl p-10"
        >
          <h3 className="text-2xl font-semibold text-white mb-8 tracking-tight">Key Achievements</h3>
          <div className="grid grid-cols-2 gap-6">
            {achievements.map((achievement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.4 + index * 0.05 }}
                className="flex items-start gap-4"
              >
                <div className="flex-shrink-0 w-2 h-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mt-2.5" />
                <p className="text-lg text-slate-300 leading-relaxed">{achievement}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
