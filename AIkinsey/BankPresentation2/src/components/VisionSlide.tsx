import { motion } from 'motion/react';
import { Target, Lightbulb, Heart } from 'lucide-react';

const values = [
  {
    icon: Target,
    title: 'Our Mission',
    description: 'To democratize financial innovation and make advanced banking services accessible to everyone across Europe.',
    gradient: 'from-blue-500 via-cyan-500 to-teal-500',
  },
  {
    icon: Lightbulb,
    title: 'Our Vision',
    description: 'To be the most innovative and customer-centric banking institution in Europe by 2030.',
    gradient: 'from-purple-500 via-violet-500 to-indigo-500',
  },
  {
    icon: Heart,
    title: 'Our Values',
    description: 'Innovation, Trust, Sustainability, and Customer Excellence drive everything we do.',
    gradient: 'from-pink-500 via-rose-500 to-red-500',
  },
];

export function VisionSlide() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-950 px-24 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(59,130,246,0.5),transparent_50%)]" />
      </div>

      <div className="max-w-7xl w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
          <div className="inline-block px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-6">
            <span className="text-sm text-indigo-400 uppercase tracking-wide">Vision & Values</span>
          </div>
          <h2 className="text-5xl font-semibold text-white mb-4 tracking-tight">
            Guided by Purpose, Driven by Innovation
          </h2>
        </motion.div>

        <div className="grid grid-cols-3 gap-8">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
                className="relative group"
              >
                {/* Glow effect on hover */}
                <div className={`absolute -inset-1 bg-gradient-to-br ${value.gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
                
                <div className="relative bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-3xl p-10 hover:border-slate-700 transition-all h-full">
                  <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${value.gradient} rounded-2xl mb-8 shadow-2xl`}>
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-4 tracking-tight">{value.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{value.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
