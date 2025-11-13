import { motion } from 'motion/react';
import { Mail, Phone, Globe, Linkedin } from 'lucide-react';

const contacts = [
  { icon: Mail, label: 'innovation@innovationbank.eu', gradient: 'from-blue-500 to-cyan-500' },
  { icon: Phone, label: '+32 2 123 4567', gradient: 'from-purple-500 to-pink-500' },
  { icon: Globe, label: 'www.innovationbank.eu', gradient: 'from-emerald-500 to-teal-500' },
  { icon: Linkedin, label: '/company/innovation-bank-europe', gradient: 'from-indigo-500 to-blue-500' },
];

export function ClosingSlide() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-950 relative overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
      
      {/* Gradient orbs */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0"
      >
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px]" />
      </motion.div>

      <div className="relative z-10 text-center max-w-5xl px-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h1 className="text-6xl font-semibold text-white mb-8 leading-tight tracking-tight">
            Let's Shape the
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Future Together
            </span>
          </h1>
          <p className="text-2xl text-slate-400 mb-16 leading-relaxed">
            Partner with Europe's most innovative banking institution
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-3xl p-12 mb-12"
        >
          <h3 className="text-2xl font-semibold text-white mb-10 tracking-tight">Contact Us</h3>
          <div className="grid grid-cols-2 gap-6">
            {contacts.map((contact, index) => {
              const Icon = contact.icon;
              return (
                <motion.div
                  key={contact.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.05 }}
                  className="flex items-center gap-5 bg-slate-800/50 border border-slate-700 rounded-2xl p-5 hover:border-slate-600 transition-colors group"
                >
                  <div className={`flex-shrink-0 w-14 h-14 bg-gradient-to-br ${contact.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-slate-200 text-left">{contact.label}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-slate-500"
        >
          <p className="text-lg mb-3 font-medium">Innovation Bank Europe</p>
          <p className="text-sm tracking-wider">Brussels • London • Frankfurt • Paris</p>
        </motion.div>
      </div>
    </div>
  );
}
