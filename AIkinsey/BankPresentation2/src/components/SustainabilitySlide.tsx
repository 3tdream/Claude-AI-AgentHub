import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Leaf, Sun, Droplet, Recycle } from 'lucide-react';

const initiatives = [
  { icon: Leaf, label: 'Carbon Neutral', value: '2023', gradient: 'from-emerald-500 to-green-500' },
  { icon: Sun, label: 'Renewable Energy', value: '100%', gradient: 'from-amber-500 to-orange-500' },
  { icon: Droplet, label: 'Water Saved', value: '2M L', gradient: 'from-blue-500 to-cyan-500' },
  { icon: Recycle, label: 'Green Loans', value: '€5B', gradient: 'from-teal-500 to-emerald-500' },
];

export function SustainabilitySlide() {
  return (
    <div className="w-full h-full flex items-center bg-slate-950 px-24 relative overflow-hidden">
      {/* Green gradient background */}
      <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-emerald-950/20 to-transparent" />

      <div className="w-full grid grid-cols-2 gap-20 items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-8">
            <span className="text-sm text-emerald-400 uppercase tracking-wide">Sustainability</span>
          </div>
          <h2 className="text-5xl font-semibold text-white mb-8 tracking-tight leading-tight">
            Committed to a
            <br />
            Greener Future
          </h2>
          <p className="text-xl text-slate-400 mb-12 leading-relaxed">
            We're leading the financial sector's transition to sustainability, with ambitious targets 
            and concrete actions to protect our planet.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-10">
            {initiatives.map((initiative, index) => {
              const Icon = initiative.icon;
              return (
                <motion.div
                  key={initiative.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
                  className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 hover:border-emerald-900/50 transition-colors"
                >
                  <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${initiative.gradient} rounded-xl mb-4 shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl font-semibold text-white mb-2 tracking-tight">{initiative.value}</div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider">{initiative.label}</div>
                </motion.div>
              );
            })}
          </div>

          <p className="text-slate-500 leading-relaxed">
            Our ESG framework guides <span className="text-emerald-400 font-semibold">€5 billion</span> in sustainable investments, 
            supporting renewable energy, green infrastructure, and sustainable businesses across Europe.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative h-[600px] rounded-3xl overflow-hidden shadow-2xl border border-slate-800"
        >
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1758524054106-06b11aec385c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXN0YWluYWJsZSUyMGJ1c2luZXNzJTIwZ3JlZW58ZW58MXx8fHwxNzYxMTE0MDE0fDA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Sustainability"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
        </motion.div>
      </div>
    </div>
  );
}
