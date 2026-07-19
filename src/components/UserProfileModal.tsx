import React from 'react';
import { User, Post } from '../types';
import { X, Calendar, Users, UserPlus, UserMinus, Heart, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';
import { inkPressAudio } from '../utils/audio';

interface UserProfileModalProps {
  user: User;
  currentUser: User;
  userPosts: Post[];
  isOpen: boolean;
  onClose: () => void;
  onFollowToggle: (userId: string) => void;
  onLikePost: (postId: string) => void;
}

export default function UserProfileModal({
  user,
  currentUser,
  userPosts,
  isOpen,
  onClose,
  onFollowToggle,
  onLikePost,
}: UserProfileModalProps) {
  if (!isOpen) return null;

  const isSelf = currentUser.id === user.id;
  const isFollowing = currentUser.following.includes(user.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg glass-panel glow-purple rounded-2xl overflow-hidden border border-zinc-800 flex flex-col max-h-[85vh]"
      >
        {/* Cover Art header */}
        <div className="h-32 bg-zinc-950 relative flex-shrink-0">
          {user.background ? (
            <img
              src={user.background}
              alt="cover"
              className="w-full h-full object-cover opacity-40"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-zinc-950 via-purple-950/20 to-zinc-950" />
          )}
          <button
            onClick={() => {
              inkPressAudio.playClack();
              onClose();
            }}
            className="absolute top-4 right-4 p-2 bg-black/60 border border-zinc-800 text-zinc-300 hover:text-white rounded-xl transition-all cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>

        {/* Content body */}
        <div className="px-6 pb-6 relative flex-1 overflow-y-auto">
          {/* Avatar floating */}
          <div className="absolute -top-12 left-6">
            <img
              src={user.avatar}
              alt={user.displayName}
              className="w-20 h-20 rounded-xl object-cover border-4 border-black shadow-lg"
            />
            {user.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-cyber-green border-4 border-black rounded-full animate-pulse" />
            )}
          </div>

          {/* Quick Action bar */}
          <div className="flex justify-end pt-4 h-14">
            {!isSelf && (
              <button
                onClick={() => {
                  inkPressAudio.playBell();
                  onFollowToggle(user.id);
                }}
                className={`px-4 py-1.5 font-mono text-[9px] font-bold uppercase tracking-widest rounded-lg transition-all cursor-pointer ${
                  isFollowing
                    ? 'border border-zinc-800 text-zinc-400 hover:border-red-600 hover:text-red-600'
                    : 'bg-zinc-100 hover:bg-zinc-200 text-black'
                }`}
              >
                {isFollowing ? 'Disconnect' : 'Connect Node'}
              </button>
            )}
          </div>

          {/* User descriptions */}
          <div className="mt-3 text-left">
            <h2 className="font-sans font-extrabold text-xl text-zinc-100 tracking-tight leading-none">
              {user.displayName}
            </h2>
            <p className="font-mono text-xs text-zinc-500 mt-1">@{user.username}</p>
          </div>

          {user.bio ? (
            <p className="mt-4 text-zinc-300 text-xs leading-relaxed font-sans text-left font-light">
              {user.bio}
            </p>
          ) : (
            <p className="mt-4 text-zinc-600 text-xs italic font-sans text-left">This node is still writing their manifesto...</p>
          )}

          {/* Stats count */}
          <div className="flex gap-5 mt-5 text-[9px] font-mono tracking-widest uppercase text-zinc-500 border-t border-b border-zinc-900 py-3">
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              JOINED {user.joinedDate ? user.joinedDate.toUpperCase() : 'MAY 2025'}
            </span>
            <span>
              <strong className="text-zinc-300 font-extrabold">{user.followers.length}</strong> FOLLOWERS
            </span>
            <span>
              <strong className="text-zinc-300 font-extrabold">{user.following.length}</strong> FOLLOWING
            </span>
          </div>

          {/* Publications overview */}
          <div className="mt-6 text-left">
            <h4 className="font-mono text-[9px] font-bold uppercase tracking-widest text-zinc-400 border-b border-zinc-900 pb-2 mb-3">
              TELEMETRY LOGS ({userPosts.length})
            </h4>

            {userPosts.length === 0 ? (
              <p className="font-sans text-[11px] text-zinc-600 italic py-4">No recent monograph broadcasts detected.</p>
            ) : (
              <div className="flex flex-col gap-3.5">
                {userPosts.map(post => {
                  const hasLiked = post.likes.includes(currentUser.id);
                  return (
                    <div
                      key={post.id}
                      className="p-4 bg-zinc-950/40 rounded-xl border border-zinc-900 hover:border-zinc-800 transition-all flex flex-col gap-3"
                    >
                      <p className="font-sans text-xs text-zinc-300 leading-relaxed line-clamp-3">
                        {post.content}
                      </p>

                      <div className="flex items-center justify-between text-[8px] font-mono text-zinc-600 border-t border-zinc-900/40 pt-2">
                        <span>{new Date(post.timestamp).toLocaleDateString()}</span>
                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              inkPressAudio.playClack();
                              onLikePost(post.id);
                            }}
                            className={`flex items-center gap-1 ${hasLiked ? 'text-cyber-pink font-bold' : ''}`}
                          >
                            <Heart size={11} className={hasLiked ? 'fill-current' : ''} />
                            {post.likes.length}
                          </button>
                          <span className="flex items-center gap-1">
                            <MessageSquare size={11} />
                            {post.comments?.length || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
