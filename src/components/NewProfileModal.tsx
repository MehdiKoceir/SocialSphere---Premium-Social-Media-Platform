import React, { useState } from 'react';
import { X, Sparkles, User, Image as ImageIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { inkPressAudio } from '../utils/audio';

interface NewProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProfile: (profile: { username: string; displayName: string; bio: string; avatar: string; background: string }) => void;
}

export default function NewProfileModal({ isOpen, onClose, onCreateProfile }: NewProfileModalProps) {
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80');
  const [background, setBackground] = useState('https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=600&auto=format&fit=crop&q=80');

  if (!isOpen) return null;

  const handleRandomizeAvatar = () => {
    inkPressAudio.playBell();
    const ids = [1535713875002, 1494790108377, 1438761681033, 1570295999919, 1500648767791, 1507003211169];
    const rand = ids[Math.floor(Math.random() * ids.length)];
    setAvatar(`https://images.unsplash.com/photo-${rand}?w=150&auto=format&fit=crop&q=80`);
  };

  const handleRandomizeBg = () => {
    inkPressAudio.playBell();
    const ids = [1557683316, 1618005182, 1464822759, 1550684848, 1507525428, 1506905925];
    const rand = ids[Math.floor(Math.random() * ids.length)];
    setBackground(`https://images.unsplash.com/photo-${rand}?w=600&auto=format&fit=crop&q=80`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || !username.trim()) return;

    onCreateProfile({
      username: username.toLowerCase().replace(/\s+/g, ''),
      displayName,
      bio,
      avatar,
      background,
    });
    
    inkPressAudio.playBell();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md glass-panel glow-purple rounded-2xl overflow-hidden border border-zinc-800 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-950/40">
          <h3 className="font-sans font-extrabold text-zinc-100 text-base tracking-tight flex items-center gap-2">
            <Sparkles className="text-cyber-purple animate-pulse" size={16} />
            Register New Persona Node
          </h3>
          <button
            onClick={() => {
              inkPressAudio.playClack();
              onClose();
            }}
            className="p-1.5 text-zinc-500 hover:text-zinc-300 rounded-lg hover:bg-zinc-900 border border-transparent transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest font-bold">
              Display Moniker Name
            </label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                inkPressAudio.playClack();
              }}
              className="w-full px-4 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-lg text-zinc-100 text-xs font-sans placeholder-zinc-700 focus:outline-none focus:border-cyber-purple transition-all"
              placeholder="E.g. Sarah Connor"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest font-bold">
              Alias Address (@username)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-xs text-zinc-600">@</span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  inkPressAudio.playClack();
                }}
                className="w-full pl-7 pr-4 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-lg text-zinc-100 text-xs font-mono focus:outline-none focus:border-cyber-purple transition-all placeholder-zinc-700"
                placeholder="sarah_c"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest font-bold">
              Biography Monograph
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => {
                setBio(e.target.value);
                inkPressAudio.playClack();
              }}
              className="w-full px-4 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-lg text-zinc-200 text-xs font-sans focus:outline-none focus:border-cyber-purple transition-all resize-none placeholder-zinc-700 leading-relaxed"
              placeholder="Outline this node’s focus profile..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest font-bold">
                Avatar Image URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={avatar}
                  onChange={(e) => {
                    setAvatar(e.target.value);
                    inkPressAudio.playClack();
                  }}
                  className="flex-1 px-3 py-2 bg-zinc-950/80 border border-zinc-800 rounded-lg text-zinc-300 text-[10px] font-mono focus:outline-none focus:border-cyber-blue transition-all"
                />
                <button
                  type="button"
                  onClick={handleRandomizeAvatar}
                  className="px-3 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-cyber-blue text-[9px] font-mono font-bold uppercase tracking-widest transition-all cursor-pointer rounded-lg"
                >
                  ROLL
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest font-bold">
                Cover Art URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={background}
                  onChange={(e) => {
                    setBackground(e.target.value);
                    inkPressAudio.playClack();
                  }}
                  className="flex-1 px-3 py-2 bg-zinc-950/80 border border-zinc-800 rounded-lg text-zinc-300 text-[10px] font-mono focus:outline-none focus:border-cyber-blue transition-all"
                />
                <button
                  type="button"
                  onClick={handleRandomizeBg}
                  className="px-3 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-cyber-blue text-[9px] font-mono font-bold uppercase tracking-widest transition-all cursor-pointer rounded-lg"
                >
                  ROLL
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-zinc-900 mt-6">
            <button
              type="button"
              onClick={() => {
                inkPressAudio.playClack();
                onClose();
              }}
              className="px-4 py-2 border border-zinc-800 text-zinc-400 font-mono text-[9px] font-bold uppercase tracking-widest rounded-lg hover:bg-zinc-900 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-zinc-100 hover:bg-zinc-200 text-black font-mono text-[9px] font-bold uppercase tracking-widest rounded-lg transition-all cursor-pointer"
            >
              Register Persona
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
