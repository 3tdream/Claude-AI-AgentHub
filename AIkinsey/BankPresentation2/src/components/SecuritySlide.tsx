import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Shield, Lock, Eye, FileCheck } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Multi-layer Protection',
    description: 'Advanced threat detection and prevention systems',
  },
  {
    icon: Lock,
    title: 'Biometric Security',
    description: 'Fingerprint and facial recognition authentication',
  },
  {
    icon: Eye,
    title: '24/7 Monitoring',
    description: 'Real-time fraud detection and prevention',
  },
  {
    icon: FileCheck,
    title: 'Compliance',
    description: 'Full regulatory compliance across all EU markets',
  },
];

export function SecuritySlide() {
  return (
    <div className="w-full h-full flex items-center bg-slate-950 px-24 relative overflow-hidden">
      {/* Blue gradient background */}
      <div className="absolute left-0 top-0 w-1/2 h-full bg-gradient-to-r from-blue-950/20 to-transparent" />

      <div className="w-full grid grid-cols-2 gap-20 items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative h-[600px] rounded-3xl overflow-hidden shadow-2xl border border-slate-800"
        >
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1691435828932-911a7801adfb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjeWJlcnNlY3VyaXR5JTIwbmV0d29ya3xlbnwxfHx8fDE3NjExMzg0MDJ8MA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Security"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-8">
            <span className="text-sm text-blue-400 uppercase tracking-wide">Security & Trust</span>
          </div>
          <h2 className="text-5xl font-semibold text-white mb-8 tracking-tight leading-tight">
            Bank-Grade
            <br />
            Security
          </h2>
          <p className="text-xl text-slate-400 mb-10 leading-relaxed">
            Your security is our top priority. We employ military-grade encryption and cutting-edge 
            cybersecurity measures to protect your assets.
          </p>

          <div className="space-y-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
                  className="flex items-start gap-5 bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 hover:border-blue-900/50 transition-colors group"
                >
                  <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-white mb-2 tracking-tight">{feature.title}</h4>
                    <p className="text-slate-400 leading-relaxed">{feature.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
