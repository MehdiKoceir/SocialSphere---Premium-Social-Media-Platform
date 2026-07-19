import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User } from '../types';
import { Sliders, Volume2, Shield, RefreshCw, Layout, User as UserIcon, Check } from 'lucide-react';
import { inkPressAudio } from '../utils/audio';

interface SettingsPageProps {
  currentUser: User;
  onUpdateProfile: (updated: {
    displayName: string;
    username: string;
    bio: string;
    avatar: string;
    background: string;
  }) => void;
  onResetDB: () => void;
}

export default function SettingsPage({
  currentUser,
  onUpdateProfile,
  onResetDB
}: SettingsPageProps) {
  const [displayName, setDisplayName] = useState(currentUser.displayName);
  const [username, setUsername] = useState(currentUser.username);
  const [bio, setBio] = useState(currentUser.bio || '');
  const [avatar, setAvatar] = useState(currentUser.avatar || '');
  const [background, setBackground] = useState(currentUser.background || '');

  const [soundFeedback, setSoundFeedback] = useState('full'); // full, muted
  const [gridPreset, setGridPreset] = useState('neon-slate'); // neon-slate, minimalist
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    inkPressAudio.playBell();
    
    onUpdateProfile({
      displayName,
      username,
      bio,
      avatar,
      background
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleToggleMuted = () => {
    inkPressAudio.playClack();
    const isMuted = soundFeedback === 'full';
    setSoundFeedback(isMuted ? 'muted' : 'full');
    inkPressAudio.setMuted(isMuted);
  };

  const handleResetData = () => {
    inkPressAudio.playBell();
    if (confirm('Are you sure you want to reset the neural database to factory-seed specs? This will wipe recent posts, saves, and messages.')) {
      onResetDB();
    }
  };

  return (
    <div className="flex-1 max-w-2xl mx-auto w-full flex flex-col gap-6">
      {/* Profile node form */}
      <div className="glass-panel p-6 rounded-2xl border border-zinc-800/80 flex flex-col gap-6">
        <h3 className="font-sans font-extrabold text-sm text-zinc-100 tracking-tight flex items-center gap-2">
          <UserIcon size={15} className="text-cyber-blue" />
          Neural Profile Node Settings
        </h3>

        <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest font-bold">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={e => {
                  setDisplayName(e.target.value);
                  inkPressAudio.playClack();
                }}
                className="px-4 py-2.5 bg-zinc-950/90 border border-zinc-800 focus:border-cyber-blue rounded-lg text-xs text-zinc-200 focus:outline-none transition-all font-sans"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest font-bold">
                Node ID (Username)
              </label>
              <input
                type="text"
                value={username}
                onChange={e => {
                  setUsername(e.target.value);
                  inkPressAudio.playClack();
                }}
                className="px-4 py-2.5 bg-zinc-950/90 border border-zinc-800 focus:border-cyber-blue rounded-lg text-xs text-zinc-200 focus:outline-none transition-all font-mono"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest font-bold">
              Biography Monograph
            </label>
            <textarea
              value={bio}
              onChange={e => {
                setBio(e.target.value);
                inkPressAudio.playClack();
              }}
              rows={3}
              maxLength={160}
              className="px-4 py-2.5 bg-zinc-950/90 border border-zinc-800 focus:border-cyber-blue rounded-lg text-xs text-zinc-200 focus:outline-none transition-all font-sans resize-none leading-relaxed"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest font-bold">
              Avatar Image URL
            </label>
            <input
              type="text"
              value={avatar}
              onChange={e => {
                setAvatar(e.target.value);
                inkPressAudio.playClack();
              }}
              className="px-4 py-2.5 bg-zinc-950/90 border border-zinc-800 focus:border-cyber-blue rounded-lg text-xs text-zinc-200 focus:outline-none transition-all font-mono"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest font-bold">
              Background Cover URL
            </label>
            <input
              type="text"
              value={background}
              onChange={e => {
                setBackground(e.target.value);
                inkPressAudio.playClack();
              }}
              className="px-4 py-2.5 bg-zinc-950/90 border border-zinc-800 focus:border-cyber-blue rounded-lg text-xs text-zinc-200 focus:outline-none transition-all font-mono"
            />
          </div>

          {saveSuccess && (
            <div className="flex items-center gap-2 p-3 bg-emerald-950/20 border border-emerald-900/30 text-cyber-green font-mono text-[9px] uppercase tracking-wider rounded-lg animate-fade-in">
              <Check size={13} className="stroke-[3]" />
              <span>Node configuration written successfully.</span>
            </div>
          )}

          <button
            type="submit"
            className="px-5 py-3 bg-zinc-100 hover:bg-zinc-200 text-black font-mono text-[10px] uppercase font-bold tracking-widest rounded-lg transition-all text-center cursor-pointer"
          >
            Save Neural Node Config
          </button>
        </form>
      </div>

      {/* Preferences Section */}
      <div className="glass-panel p-6 rounded-2xl border border-zinc-800/80 flex flex-col gap-6">
        <h3 className="font-sans font-extrabold text-sm text-zinc-100 tracking-tight flex items-center gap-2">
          <Sliders size={15} className="text-cyber-purple" />
          Interactive Telemetry Prefs
        </h3>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-900 rounded-xl">
            <div className="flex flex-col text-left">
              <span className="font-sans font-bold text-xs text-zinc-200">Typewriter Audio Clicks</span>
              <span className="font-sans text-[10px] text-zinc-500">Enable tactile cybernetic keyboard feedback.</span>
            </div>
            <button
              onClick={handleToggleMuted}
              className={`px-3 py-1.5 font-mono text-[9px] font-bold uppercase tracking-widest transition-all rounded-lg cursor-pointer ${
                soundFeedback === 'full'
                  ? 'bg-cyber-blue/10 text-cyber-blue border border-cyber-blue/30'
                  : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
              }`}
            >
              {soundFeedback === 'full' ? 'HAPTIC ACTIVE' : 'SILENT'}
            </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-900 rounded-xl">
            <div className="flex flex-col text-left">
              <span className="font-sans font-bold text-xs text-zinc-200">Neural Grid Preset</span>
              <span className="font-sans text-[10px] text-zinc-500">Configure visual layout and theme boundaries.</span>
            </div>
            <div className="flex gap-2 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
              <button
                onClick={() => {
                  inkPressAudio.playClack();
                  setGridPreset('neon-slate');
                }}
                className={`px-2.5 py-1 font-mono text-[8px] font-bold uppercase tracking-widest rounded-md ${
                  gridPreset === 'neon-slate' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500'
                }`}
              >
                Space Space
              </button>
              <button
                onClick={() => {
                  inkPressAudio.playClack();
                  setGridPreset('minimalist');
                }}
                className={`px-2.5 py-1 font-mono text-[8px] font-bold uppercase tracking-widest rounded-md ${
                  gridPreset === 'minimalist' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500'
                }`}
              >
                Slate Clean
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Database Maintenance */}
      <div className="glass-panel p-6 rounded-2xl border border-red-950/25 flex flex-col gap-4 bg-red-950/5">
        <h3 className="font-sans font-extrabold text-sm text-red-400 tracking-tight flex items-center gap-2">
          <Shield size={15} className="text-red-500" />
          Maintenance Protocols
        </h3>
        <p className="font-sans text-xs text-zinc-500 leading-relaxed text-left">
          Resetting database indexes will purge local edits, comment logs, saved profiles, and message relays, returning the application to standard mockup telemetry nodes.
        </p>
        <button
          onClick={handleResetData}
          className="px-4 py-2.5 bg-red-950/30 border border-red-900/40 hover:border-red-600 hover:bg-red-900/20 text-red-400 font-mono text-[9px] uppercase font-bold tracking-widest rounded-lg transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
        >
          <RefreshCw size={13} />
          Reset Telemetry Database
        </button>
      </div>
    </div>
  );
}
