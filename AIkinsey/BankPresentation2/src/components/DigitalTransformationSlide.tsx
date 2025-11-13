import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Check } from 'lucide-react';

const features = [
  '100% cloud-native infrastructure',
  'AI-powered customer insights',
  'Real-time transaction processing',
  'Open banking API platform',
];

export function DigitalTransformationSlide() {
  return (
    <div className="w-full h-full flex items-center bg-slate-950 px-24 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-950/30 to-transparent" />

      <div className="w-full grid grid-cols-2 gap-20 items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-8">
            <span className="text-sm text-blue-400 uppercase tracking-wide">Digital First</span>
          </div>
          <h2 className="text-5xl font-semibold text-white mb-8 tracking-tight leading-tight">
            Digital Transformation
            <br />
            Journey
          </h2>
          <p className="text-xl text-slate-400 mb-12 leading-relaxed">
            We've invested over <span className="text-white font-semibold">€2.5 billion</span> in digital infrastructure, 
            transforming every aspect of our banking operations to deliver seamless, innovative experiences.
          </p>
          
          <div className="space-y-4">
            {features.map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + index * 0.05 }}
                className="flex items-center gap-4 bg-slate-900/50 border border-slate-800 rounded-2xl p-5 hover:border-blue-900 transition-colors"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg text-slate-200">{item}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative h-[600px] rounded-3xl overflow-hidden shadow-2xl border border-slate-800"
        >
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1758874385215-c86fe62b446f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBiYW5raW5nJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NjExNTQxMzl8MA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Digital transformation"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
        </motion.div>
      </div>
    </div>
  );
}
