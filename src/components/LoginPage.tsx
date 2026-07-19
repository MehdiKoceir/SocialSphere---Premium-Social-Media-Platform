import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User } from '../types';
import { Key, UserPlus, Fingerprint, ShieldAlert, Sparkles } from 'lucide-react';
import { inkPressAudio } from '../utils/audio';

interface LoginPageProps {
  users: User[];
  onSelectUser: (userId: string) => void;
  onOpenNewProfile: () => void;
}

export default function LoginPage({ users, onSelectUser, onOpenNewProfile }: LoginPageProps) {
  const [usernameInput, setUsernameInput] = useState('');
  const [secretKeyInput, setSecretKeyInput] = useState('•••••••••••••');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSelectUser = (id: string) => {
    inkPressAudio.playBell();
    onSelectUser(id);
  };

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    inkPressAudio.playClack();
    
    const normalized = usernameInput.trim().toLowerCase();
    const found = users.find(u => u.username.toLowerCase() === normalized || u.id.toLowerCase() === normalized);
    
    if (found) {
      inkPressAudio.playBell();
      onSelectUser(found.id);
    } else {
      setErrorMsg('neural signature match not detected in core database.');
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] text-zinc-100 neural-grid flex items-center justify-center p-6 relative">
      <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-cyan-900/10 rounded-full filter blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-pink-900/10 rounded-full filter blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-lg glass-panel glow-purple p-8 rounded-2xl flex flex-col gap-8 border border-zinc-800"
      >
        {/* Portal Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyber-blue to-cyber-purple flex items-center justify-center text-black font-extrabold text-xl font-mono shadow-md shadow-purple-500/10">
            S
          </div>
          <h2 className="font-sans font-extrabold text-2xl tracking-tight text-zinc-100 mt-2">
            Authorize Neural Identity
          </h2>
          <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
            Select an active node or initiate credentials check
          </p>
        </div>

        {/* User Nodes List */}
        <div className="flex flex-col gap-3">
          <label className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest font-bold">
            Authorized Seed Profiles
          </label>
          <div className="grid grid-cols-2 gap-3">
            {users.map(user => (
              <button
                key={user.id}
                onClick={() => handleSelectUser(user.id)}
                className="flex items-center gap-3 p-3 bg-zinc-950/80 border border-zinc-800 hover:border-cyber-purple/50 rounded-xl text-left transition-all group cursor-pointer relative overflow-hidden"
              >
                {/* Active Light Dot */}
                {user.isOnline && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyber-green animate-pulse" />
                )}

                <img 
                  src={user.avatar} 
                  alt={user.displayName}
                  className="w-8 h-8 rounded-lg object-cover grayscale group-hover:grayscale-0 transition-all border border-zinc-800"
                />
                <div className="flex flex-col">
                  <span className="font-sans font-bold text-xs text-zinc-200 group-hover:text-cyber-purple transition-all">
                    {user.displayName.split(' ')[0]}
                  </span>
                  <span className="font-mono text-[9px] text-zinc-500">
                    @{user.username}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-zinc-800/80"></div>
          <span className="flex-shrink mx-4 font-mono text-[8px] text-zinc-600 uppercase tracking-wider">OR MANUAL COMPLIANCE</span>
          <div className="flex-grow border-t border-zinc-800/80"></div>
        </div>

        {/* Manual input form */}
        <form onSubmit={handleManualLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest font-bold">
              Profile Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                @
              </span>
              <input
                type="text"
                placeholder="bob_miller"
                value={usernameInput}
                onChange={e => {
                  inkPressAudio.playClack();
                  setUsernameInput(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                className="w-full pl-8 pr-4 py-3 bg-zinc-950/90 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-cyber-blue font-mono placeholder-zinc-700 transition-all"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest font-bold">
              Neural Crypt-Key
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                <Key size={13} />
              </span>
              <input
                type="password"
                placeholder="neural keys loaded"
                value={secretKeyInput}
                onChange={e => {
                  inkPressAudio.playClack();
                  setSecretKeyInput(e.target.value);
                }}
                className="w-full pl-8 pr-4 py-3 bg-zinc-950/90 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-cyber-blue font-mono placeholder-zinc-700 transition-all"
                disabled
              />
            </div>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-pink-950/20 border border-pink-900/30 text-pink-400 font-mono text-[9px] uppercase tracking-wider rounded-lg">
              <ShieldAlert size={14} />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-zinc-100 hover:bg-zinc-200 text-black font-mono text-[10px] uppercase font-bold tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Fingerprint size={14} />
            Authorize Node Access
          </button>
        </form>

        {/* Create Profile */}
        <div className="border-t border-zinc-800/80 pt-4 flex justify-between items-center">
          <span className="font-sans text-xs text-zinc-400">
            No profile index?
          </span>
          <button
            onClick={() => {
              inkPressAudio.playBell();
              onOpenNewProfile();
            }}
            className="flex items-center gap-1.5 font-mono text-[9px] font-bold uppercase tracking-wider text-cyber-blue hover:text-cyber-purple transition-all cursor-pointer"
          >
            <UserPlus size={13} />
            Create Neural Node
          </button>
        </div>
      </motion.div>
    </div>
  );
}
