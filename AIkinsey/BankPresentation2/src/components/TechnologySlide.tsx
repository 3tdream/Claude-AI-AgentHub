import { motion } from 'motion/react';
import { Cloud, Database, Lock, Cpu } from 'lucide-react';

const techStack = [
  {
    icon: Cloud,
    title: 'Cloud Infrastructure',
    items: ['Multi-cloud strategy', 'Kubernetes orchestration', '99.99% uptime'],
    gradient: 'from-sky-500 to-blue-500',
  },
  {
    icon: Database,
    title: 'Data & Analytics',
    items: ['Real-time processing', 'Big data platform', 'Advanced ML models'],
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    icon: Cpu,
    title: 'Microservices',
    items: ['300+ services', 'Event-driven architecture', 'Auto-scaling'],
    gradient: 'from-cyan-500 to-teal-500',
  },
  {
    icon: Lock,
    title: 'Security First',
    items: ['Zero-trust model', 'End-to-end encryption', 'ISO 27001 certified'],
    gradient: 'from-emerald-500 to-green-500',
  },
];

export function TechnologySlide() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-950 px-24 relative overflow-hidden">
      {/* Tech grid background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f6_1px,transparent_1px),linear-gradient(to_bottom,#3b82f6_1px,transparent_1px)] bg-[size:3rem_3rem]" />
      </div>

      <div className="max-w-7xl w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-block px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-6">
            <span className="text-sm text-cyan-400 uppercase tracking-wide">Technology</span>
          </div>
          <h2 className="text-5xl font-semibold text-white mb-6 tracking-tight">
            Technology Stack
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Built on cutting-edge technology for performance, security, and scalability
          </p>
        </motion.div>

        <div className="grid grid-cols-4 gap-6">
          {techStack.map((tech, index) => {
            const Icon = tech.icon;
            return (
              <motion.div
                key={tech.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
                className="relative group"
              >
                <div className="relative bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-3xl p-7 hover:border-slate-700 transition-all h-full">
                  <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${tech.gradient} rounded-2xl mb-5 shadow-lg`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-5 tracking-tight">{tech.title}</h3>
                  <ul className="space-y-3">
                    {tech.items.map((item, i) => (
                      <motion.li
                        key={item}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 + index * 0.05 + i * 0.05 }}
                        className="flex items-start text-sm text-slate-400"
                      >
                        <div className={`w-1.5 h-1.5 bg-gradient-to-br ${tech.gradient} rounded-full mr-3 mt-1.5 flex-shrink-0`} />
                        {item}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
