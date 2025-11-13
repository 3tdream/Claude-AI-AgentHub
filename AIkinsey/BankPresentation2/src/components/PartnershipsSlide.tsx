import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Handshake, Building2, Rocket, Users } from 'lucide-react';

const partnerships = [
  {
    icon: Building2,
    title: 'Traditional Banks',
    count: '45+',
    description: 'Strategic partnerships',
    gradient: 'from-blue-500 to-indigo-500',
  },
  {
    icon: Rocket,
    title: 'FinTech Startups',
    count: '200+',
    description: 'Innovation ecosystem',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: Users,
    title: 'Tech Giants',
    count: '15',
    description: 'Technology partners',
    gradient: 'from-cyan-500 to-blue-500',
  },
  {
    icon: Handshake,
    title: 'Universities',
    count: '30+',
    description: 'Research collaborations',
    gradient: 'from-violet-500 to-purple-500',
  },
];

export function PartnershipsSlide() {
  return (
    <div className="w-full h-full flex items-center bg-slate-950 px-24 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-indigo-950/20 to-transparent" />

      <div className="w-full grid grid-cols-2 gap-20 items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-8">
            <span className="text-sm text-indigo-400 uppercase tracking-wide">Partnerships</span>
          </div>
          <h2 className="text-5xl font-semibold text-white mb-8 tracking-tight leading-tight">
            Strategic
            <br />
            Partnerships
          </h2>
          <p className="text-xl text-slate-400 mb-12 leading-relaxed">
            Collaboration drives innovation. We've built a powerful ecosystem of partners to deliver 
            exceptional value to our customers.
          </p>

          <div className="grid grid-cols-2 gap-4">
            {partnerships.map((partnership, index) => {
              const Icon = partnership.icon;
              return (
                <motion.div
                  key={partnership.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
                  className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 hover:border-indigo-900/50 transition-colors"
                >
                  <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${partnership.gradient} rounded-xl mb-4 shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-4xl font-semibold text-white mb-2 tracking-tight">{partnership.count}</div>
                  <div className="text-white mb-1 font-medium">{partnership.title}</div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider">{partnership.description}</div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative h-[600px] rounded-3xl overflow-hidden shadow-2xl border border-slate-800"
        >
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1716703742287-2b06c3c6d81a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwY29sbGFib3JhdGlvbiUyMG9mZmljZXxlbnwxfHx8fDE3NjExMTEyMTB8MA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Partnerships and collaboration"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
        </motion.div>
      </div>
    </div>
  );
}
