import React, { useState } from 'react';
import { User } from '../types';
import { Search, Plus, RefreshCw, Compass, Users, Check, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { inkPressAudio } from '../utils/audio';

interface SidebarProps {
  users: User[];
  currentUser: User;
  onSwitchUser: (userId: string) => void;
  onOpenNewProfileModal: () => void;
  onOpenUserProfile: (user: User) => void;
  onFollowToggle: (userId: string) => void;
}

export default function Sidebar({
  users,
  currentUser,
  onSwitchUser,
  onOpenNewProfileModal,
  onOpenUserProfile,
  onFollowToggle,
}: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Exclude current user from suggestions or list
  const filteredUsers = users.filter(
    (user) =>
      user.id !== currentUser.id &&
      (user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="w-full lg:w-80 flex flex-col gap-6 flex-shrink-0">
      {/* Current Active User Profile Card */}
      <div className="glass-panel p-5 rounded-2xl border border-zinc-800/80 flex flex-col gap-4 relative">
        <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
          <span className="font-mono text-[9px] tracking-widest uppercase text-zinc-500">Active Identity</span>
          <span className="font-mono text-[9px] tracking-widest uppercase text-cyber-blue font-bold">NODE_0{currentUser.id.charCodeAt(0) % 9 || 7}</span>
        </div>
        
        <div className="flex items-center gap-3.5 text-left">
          <img 
            src={currentUser.avatar} 
            alt={currentUser.displayName} 
            onClick={() => onOpenUserProfile(currentUser)}
            className="w-12 h-12 rounded-xl object-cover border border-zinc-800 cursor-pointer hover:border-zinc-700 transition-all" 
          />
          <div className="min-w-0">
            <h3
              onClick={() => onOpenUserProfile(currentUser)}
              className="font-sans font-extrabold text-zinc-100 hover:text-cyber-blue transition-all cursor-pointer text-sm truncate"
            >
              {currentUser.displayName}
            </h3>
            <p className="font-mono text-[9px] text-zinc-500 mt-0.5">@{currentUser.username}</p>
          </div>
        </div>

        {currentUser.bio && (
          <p className="text-xs text-zinc-400 leading-relaxed font-light text-left italic">
            "{currentUser.bio.substring(0, 80)}{currentUser.bio.length > 80 ? '...' : ''}"
          </p>
        )}

        <div className="grid grid-cols-2 gap-3 border-t border-zinc-900 pt-3">
          <div className="bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-900 text-center">
            <div className="text-sm font-bold text-zinc-200">{currentUser.followers.length}</div>
            <div className="text-[8px] font-mono uppercase tracking-widest text-zinc-500 mt-0.5">Followers</div>
          </div>
          <div className="bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-900 text-center">
            <div className="text-sm font-bold text-zinc-200">{currentUser.following.length}</div>
            <div className="text-[8px] font-mono uppercase tracking-widest text-zinc-500 mt-0.5">Following</div>
          </div>
        </div>

        <button
          onClick={() => onOpenUserProfile(currentUser)}
          className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 rounded-xl font-mono text-[9px] font-bold uppercase tracking-widest transition-all cursor-pointer"
        >
          Inspect Node Profile
        </button>
      </div>

      {/* Switch Actor Playground Controller */}
      <div className="glass-panel p-5 rounded-2xl border border-zinc-800/80 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
          <h4 className="font-mono text-[10px] font-bold tracking-widest uppercase text-zinc-300 flex items-center gap-2">
            <RefreshCw size={12} className="text-cyber-purple" />
            Switch Active Node
          </h4>
          <button
            onClick={onOpenNewProfileModal}
            className="p-1.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white rounded-lg transition-all cursor-pointer"
            title="Register new identity node"
          >
            <Plus size={13} />
          </button>
        </div>

        <div className="flex flex-col gap-1.5 max-h-44 overflow-y-auto pr-1">
          {users.map((user) => {
            const isActive = user.id === currentUser.id;
            return (
              <button
                key={user.id}
                onClick={() => {
                  if (!isActive) {
                    inkPressAudio.playBell();
                    onSwitchUser(user.id);
                  }
                }}
                className={`flex items-center justify-between p-2 rounded-xl text-left transition-all text-xs cursor-pointer ${
                  isActive
                    ? 'bg-zinc-900 border border-zinc-800 text-cyber-blue font-bold'
                    : 'hover:bg-zinc-900/30 border border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <img src={user.avatar} alt={user.displayName} className="w-5 h-5 rounded-md object-cover border border-zinc-800" />
                  <span className="truncate max-w-[120px]">{user.displayName}</span>
                </div>
                {isActive && <span className="font-mono text-[8px] tracking-widest uppercase text-cyber-blue">Active</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Discover & Follow recommendations */}
      <div className="glass-panel p-5 rounded-2xl border border-zinc-800/80 flex flex-col gap-4">
        <div className="border-b border-zinc-900 pb-2.5">
          <h4 className="font-mono text-[10px] font-bold tracking-widest uppercase text-zinc-300 flex items-center gap-2 mb-3">
            <Compass size={12} className="text-cyber-pink" />
            Node Directory
          </h4>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={13} />
            <input
              type="text"
              placeholder="Filter addresses..."
              value={searchTerm}
              onChange={(e) => {
                inkPressAudio.playClack();
                setSearchTerm(e.target.value);
              }}
              className="w-full pl-8 pr-3 py-2 bg-zinc-950/60 border border-zinc-900 focus:border-cyber-pink rounded-xl text-xs text-zinc-200 focus:outline-none transition-all placeholder-zinc-700 font-mono"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 overflow-y-auto max-h-56 pr-1">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-6">
              <p className="font-sans text-xs italic text-zinc-600">No other addresses found.</p>
            </div>
          ) : (
            filteredUsers.map((user) => {
              const isFollowing = currentUser.following.includes(user.id);
              return (
                <div
                  key={user.id}
                  className="flex items-center justify-between gap-3 pb-3 border-b border-zinc-900 last:border-0 last:pb-0"
                >
                  <div
                    className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0 text-left"
                    onClick={() => onOpenUserProfile(user)}
                  >
                    <img
                      src={user.avatar}
                      alt={user.displayName}
                      className="w-7 h-7 rounded-lg object-cover border border-zinc-800 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-sans font-bold text-zinc-200 text-xs truncate hover:text-cyber-pink transition-all">
                        {user.displayName}
                      </div>
                      <div className="font-mono text-[8px] text-zinc-500">@{user.username}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      inkPressAudio.playClack();
                      onFollowToggle(user.id);
                    }}
                    className={`px-2 py-1 font-mono text-[8px] font-bold uppercase tracking-widest transition-all cursor-pointer rounded-md ${
                      isFollowing
                        ? 'border border-zinc-800 text-zinc-500 hover:border-red-600 hover:text-red-600'
                        : 'bg-zinc-100 text-black hover:bg-zinc-200'
                    }`}
                  >
                    {isFollowing ? 'SYNCED' : 'SYNC'}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
