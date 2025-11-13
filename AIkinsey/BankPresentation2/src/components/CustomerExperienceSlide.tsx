import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Star } from 'lucide-react';

export function CustomerExperienceSlide() {
  return (
    <div className="w-full h-full flex items-center bg-slate-950 px-24 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute left-0 top-0 w-1/2 h-full bg-gradient-to-r from-purple-950/30 to-transparent" />

      <div className="w-full grid grid-cols-2 gap-20 items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative h-[600px] rounded-3xl overflow-hidden shadow-2xl border border-slate-800"
        >
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1681826291722-70bd7e9e6fc3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBiYW5raW5nJTIwYXBwfGVufDF8fHx8MTc2MTEzNTc0Mnww&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Customer experience"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full mb-8">
            <span className="text-sm text-purple-400 uppercase tracking-wide">Customer Centric</span>
          </div>
          <h2 className="text-5xl font-semibold text-white mb-8 tracking-tight leading-tight">
            Exceptional Customer
            <br />
            Experience
          </h2>
          <p className="text-xl text-slate-400 mb-10 leading-relaxed">
            Our customers are at the heart of everything we do. With an industry-leading satisfaction score, 
            we're setting new standards for banking excellence.
          </p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gradient-to-br from-amber-950/30 to-slate-900/80 backdrop-blur-sm border border-amber-900/20 rounded-3xl p-8 mb-6"
          >
            <div className="flex items-center gap-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-7 h-7 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <div className="text-5xl font-semibold text-white mb-2 tracking-tight">4.8/5.0</div>
            <div className="text-slate-400">Average Customer Rating</div>
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-2xl p-6"
            >
              <div className="text-4xl font-semibold text-white mb-2 tracking-tight">98%</div>
              <div className="text-sm text-slate-500 uppercase tracking-wide">Customer Retention</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-2xl p-6"
            >
              <div className="text-4xl font-semibold text-white mb-2 tracking-tight">{'<'}2min</div>
              <div className="text-sm text-slate-500 uppercase tracking-wide">Avg Response Time</div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
