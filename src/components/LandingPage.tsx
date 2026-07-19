import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Terminal, Shield, Zap, Globe, MessageSquare, BarChart2, Radio, Compass } from 'lucide-react';
import { inkPressAudio } from '../utils/audio';

interface LandingPageProps {
  onEnterApp: () => void;
}

export default function LandingPage({ onEnterApp }: LandingPageProps) {
  const handleLaunch = () => {
    inkPressAudio.playBell();
    onEnterApp();
  };

  const features = [
    {
      icon: <Zap className="text-cyber-purple" size={20} />,
      title: "Neural Engine",
      desc: "Instant data synchronization over glassmorphic client-server RPC relays."
    },
    {
      icon: <Radio className="text-cyber-blue" size={20} />,
      title: "Direct Waveforms",
      desc: "Send high-fidelity voice notes integrated with visual waveform playbacks."
    },
    {
      icon: <BarChart2 className="text-cyber-pink" size={20} />,
      title: "Real-time Metrics",
      desc: "Analyse social impact and follower reach on fully interactive executive dashboards."
    },
    {
      icon: <Shield className="text-cyber-green" size={20} />,
      title: "Encrypted Storage",
      desc: "Your monographs, saves, and credentials remain private and persisted."
    }
  ];

  return (
    <div className="min-h-screen bg-[#030303] text-zinc-100 neural-grid flex flex-col items-center justify-center relative overflow-hidden px-4 py-12">
      {/* Absolute Ambient Glow Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-900/10 rounded-full filter blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-cyan-900/10 rounded-full filter blur-[120px] pointer-events-none animate-pulse" />

      {/* Header Badge */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="z-10 flex items-center gap-1.5 px-3 py-1 bg-zinc-900/80 border border-zinc-800 rounded-full text-xs text-cyber-blue font-mono mb-6"
      >
        <Sparkles size={12} className="animate-spin" />
        <span>SOCIABLY PROTOCOL V2.0 • LIVE</span>
      </motion.div>

      {/* Glowing Hero Typography */}
      <div className="z-10 text-center max-w-4xl mx-auto flex flex-col items-center gap-6">
        <motion.h1 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.1 }}
          className="font-sans font-extrabold text-5xl md:text-7xl lg:text-8xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-500 leading-none"
        >
          The Premium Social <br />
          <span className="bg-clip-text bg-gradient-to-r from-cyber-blue via-cyber-purple to-cyber-pink">
            Workspace
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-zinc-400 font-sans text-lg md:text-xl max-w-2xl leading-relaxed font-light"
        >
          A highly interactive, beautiful, and futuristic workspace inspired by Linear, Discord, and Threads. Engineered with glassmorphic cards, custom audio-haptic feedback, and neural metrics.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center gap-4 mt-4"
        >
          <button
            onClick={handleLaunch}
            className="px-8 py-4 bg-gradient-to-r from-cyber-blue to-cyber-purple text-black font-semibold rounded-lg shadow-lg hover:shadow-cyan-500/20 active:scale-95 transition-all duration-300 cursor-pointer flex items-center gap-2 text-sm uppercase tracking-widest"
          >
            <Terminal size={16} />
            Initialize Workspace
          </button>
          
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="px-6 py-4 bg-zinc-900/60 border border-zinc-800 text-zinc-300 font-semibold rounded-lg hover:bg-zinc-800/80 transition-all cursor-pointer flex items-center gap-2 text-sm uppercase tracking-widest"
          >
            <Globe size={15} />
            Documentation
          </a>
        </motion.div>
      </div>

      {/* Feature Bento Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.7 }}
        className="z-10 w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20"
      >
        {features.map((feat, idx) => (
          <div 
            key={idx}
            className="glass-card hover:border-zinc-700/80 p-6 rounded-xl flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group"
          >
            {/* Corner Light Glow */}
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-full filter blur-xl group-hover:bg-white/10 transition-all pointer-events-none" />
            
            <div className="p-3 bg-zinc-900/90 border border-zinc-800 rounded-lg w-fit">
              {feat.icon}
            </div>
            
            <h3 className="font-sans font-bold text-base text-zinc-100 tracking-tight">
              {feat.title}
            </h3>
            
            <p className="font-sans text-xs text-zinc-400 leading-relaxed">
              {feat.desc}
            </p>
          </div>
        ))}
      </motion.div>

      {/* Footer Branding */}
      <div className="z-10 mt-20 font-mono text-[10px] text-zinc-600 uppercase tracking-widest flex items-center gap-2 select-none">
        <span>SOCIABLY CO. INC.</span>
        <span>•</span>
        <span>ALL TELEMETRY NOMINAL</span>
      </div>
    </div>
  );
}
