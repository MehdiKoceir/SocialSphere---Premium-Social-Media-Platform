import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Post } from '../types';
import { BookOpen, Bookmark, Users, Grid, Settings, Heart, MessageSquare, Trash2, Calendar, FileText } from 'lucide-react';
import { inkPressAudio } from '../utils/audio';

interface ProfilePageProps {
  user: User;
  currentUser: User;
  posts: Post[];
  onFollowToggle: (userId: string) => void;
  onLikePost: (postId: string) => void;
  onDeletePost: (postId: string) => void;
  onOpenSettings: () => void;
  onViewPost: (postId: string) => void;
  users: User[]; // To render profiles of followers
}

export default function ProfilePage({
  user,
  currentUser,
  posts,
  onFollowToggle,
  onLikePost,
  onDeletePost,
  onOpenSettings,
  onViewPost,
  users
}: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState<'posts' | 'saved' | 'network'>('posts');
  const [networkSubTab, setNetworkSubTab] = useState<'followers' | 'following'>('followers');

  const isOwnProfile = user.id === currentUser.id;
  const isFollowing = currentUser.following.includes(user.id);

  // Filter posts made by this user
  const userPosts = posts.filter(p => p.userId === user.id);

  // Filter posts saved by this user
  const savedPosts = posts.filter(p => p.saves?.includes(user.id));

  // Retrieve user profiles for followers/following
  const followersList = users.filter(u => user.followers.includes(u.id));
  const followingList = users.filter(u => user.following.includes(u.id));

  const handleTabChange = (tab: 'posts' | 'saved' | 'network') => {
    inkPressAudio.playClack();
    setActiveTab(tab);
  };

  const handleFollowClick = () => {
    inkPressAudio.playBell();
    onFollowToggle(user.id);
  };

  return (
    <div className="flex-1 flex flex-col gap-6">
      {/* Premium Profile Banner Header Card */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-zinc-800/80 relative">
        {/* Cover Background */}
        <div className="h-44 relative bg-zinc-950">
          {user.background ? (
            <img
              src={user.background}
              alt="cover"
              className="w-full h-full object-cover opacity-45"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-zinc-950 via-purple-950/20 to-zinc-950" />
          )}
          {/* Subtle overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />
        </div>

        {/* Profile Stats Metagrid */}
        <div className="px-6 pb-6 pt-0 relative flex flex-col sm:flex-row sm:items-end justify-between gap-6 -mt-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            {/* Avatar Frame */}
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.displayName}
                className="w-24 h-24 rounded-2xl object-cover border-4 border-black shadow-xl"
              />
              {user.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-cyber-green border-4 border-black rounded-full animate-pulse" />
              )}
            </div>

            {/* Profile Identifiers */}
            <div className="flex flex-col text-left">
              <h2 className="font-sans font-extrabold text-2xl tracking-tight text-zinc-100 flex items-center gap-2">
                {user.displayName}
                {isOwnProfile && (
                  <span className="font-mono text-[9px] bg-cyber-blue/10 text-cyber-blue border border-cyber-blue/20 px-1.5 py-0.5 rounded-md uppercase tracking-widest">
                    OWNER
                  </span>
                )}
              </h2>
              <span className="font-mono text-xs text-zinc-500">
                @{user.username}
              </span>
              {user.statusText && (
                <span className="font-sans text-xs text-zinc-400 mt-1 italic">
                  {user.statusText}
                </span>
              )}
            </div>
          </div>

          {/* Quick Action button */}
          <div className="flex items-center gap-3">
            {isOwnProfile ? (
              <button
                onClick={() => {
                  inkPressAudio.playClack();
                  onOpenSettings();
                }}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-xl font-mono text-[10px] uppercase font-bold tracking-widest text-zinc-300 transition-all cursor-pointer flex items-center gap-2"
              >
                <Settings size={13} />
                Modify Node
              </button>
            ) : (
              <button
                onClick={handleFollowClick}
                className={`px-5 py-2 rounded-xl font-mono text-[10px] uppercase font-bold tracking-widest transition-all cursor-pointer ${
                  isFollowing
                    ? 'border border-zinc-800 text-zinc-400 hover:border-red-600 hover:text-red-600'
                    : 'bg-zinc-100 hover:bg-zinc-200 text-black'
                }`}
              >
                {isFollowing ? 'Disconnect' : 'Connect Node'}
              </button>
            )}
          </div>
        </div>

        {/* Stats Blocks & Metadata Footer */}
        <div className="border-t border-zinc-900 bg-zinc-950/20 px-6 py-4 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="flex flex-col text-left">
              <span className="font-sans font-extrabold text-sm text-zinc-100">{userPosts.length}</span>
              <span className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest">Monographs</span>
            </div>
            <div className="flex flex-col text-left">
              <span className="font-sans font-extrabold text-sm text-zinc-100">{user.followers.length}</span>
              <span className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest">Followers</span>
            </div>
            <div className="flex flex-col text-left">
              <span className="font-sans font-extrabold text-sm text-zinc-100">{user.following.length}</span>
              <span className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest">Following</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-zinc-600 font-mono text-[9px]">
            <Calendar size={12} />
            <span>JOINED {user.joinedDate ? user.joinedDate.toUpperCase() : 'MAY 2025'}</span>
          </div>
        </div>

        {/* Bio Text section */}
        {user.bio && (
          <div className="px-6 pb-6 text-left">
            <p className="font-sans text-xs text-zinc-400 leading-relaxed max-w-2xl font-light">
              {user.bio}
            </p>
          </div>
        )}
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-zinc-900 gap-6">
        <button
          onClick={() => handleTabChange('posts')}
          className={`pb-3.5 text-xs font-mono font-bold tracking-widest uppercase flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'posts'
              ? 'border-cyber-blue text-cyber-blue'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Grid size={13} />
          Monographs
        </button>

        <button
          onClick={() => handleTabChange('saved')}
          className={`pb-3.5 text-xs font-mono font-bold tracking-widest uppercase flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'saved'
              ? 'border-cyber-purple text-cyber-purple'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Bookmark size={13} />
          Saves
        </button>

        <button
          onClick={() => handleTabChange('network')}
          className={`pb-3.5 text-xs font-mono font-bold tracking-widest uppercase flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'network'
              ? 'border-cyber-pink text-cyber-pink'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Users size={13} />
          Nodes Connected
        </button>
      </div>

      {/* Tabs panels render */}
      <div className="flex flex-col gap-4">
        {activeTab === 'posts' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userPosts.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-zinc-950/20 border border-zinc-900 col-span-2">
                <p className="font-mono text-xs text-zinc-500">No active monographs posted yet.</p>
              </div>
            ) : (
              userPosts.map(post => (
                <div
                  key={post.id}
                  onClick={() => onViewPost(post.id)}
                  className="glass-card hover:border-zinc-800 p-5 rounded-2xl flex flex-col justify-between gap-4 cursor-pointer transition-all hover:-translate-y-0.5"
                >
                  <p className="font-sans text-xs text-zinc-300 leading-relaxed text-left line-clamp-3">
                    {post.content}
                  </p>

                  <div className="flex items-center justify-between border-t border-zinc-900 pt-3 text-zinc-500 font-mono text-[9px]">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Heart size={10} />
                        {post.likes.length}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare size={10} />
                        {post.comments?.length || 0}
                      </span>
                    </div>

                    <span className="text-zinc-600">
                      {new Date(post.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedPosts.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-zinc-950/20 border border-zinc-900 col-span-2">
                <p className="font-mono text-xs text-zinc-500">No saved telemetries indexed.</p>
              </div>
            ) : (
              savedPosts.map(post => (
                <div
                  key={post.id}
                  onClick={() => onViewPost(post.id)}
                  className="glass-card hover:border-zinc-800 p-5 rounded-2xl flex flex-col justify-between gap-4 cursor-pointer transition-all hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-2 text-left mb-1">
                    <img
                      src={post.userAvatar}
                      alt={post.userDisplayName}
                      className="w-5 h-5 rounded-md object-cover border border-zinc-900"
                    />
                    <span className="font-sans font-bold text-[10px] text-zinc-400">@{post.username}</span>
                  </div>

                  <p className="font-sans text-xs text-zinc-300 leading-relaxed text-left line-clamp-3">
                    {post.content}
                  </p>

                  <div className="flex items-center justify-between border-t border-zinc-900 pt-3 text-zinc-500 font-mono text-[9px]">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Heart size={10} />
                        {post.likes.length}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare size={10} />
                        {post.comments?.length || 0}
                      </span>
                    </div>

                    <span className="text-zinc-600">
                      {new Date(post.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'network' && (
          <div className="glass-panel p-6 rounded-2xl border border-zinc-800/80 flex flex-col gap-6">
            <div className="flex items-center gap-4 border-b border-zinc-900 pb-4">
              <button
                onClick={() => {
                  inkPressAudio.playClack();
                  setNetworkSubTab('followers');
                }}
                className={`font-mono text-[10px] font-bold uppercase tracking-widest ${
                  networkSubTab === 'followers' ? 'text-cyber-pink underline decoration-2 underline-offset-4' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Followers ({followersList.length})
              </button>
              <button
                onClick={() => {
                  inkPressAudio.playClack();
                  setNetworkSubTab('following');
                }}
                className={`font-mono text-[10px] font-bold uppercase tracking-widest ${
                  networkSubTab === 'following' ? 'text-cyber-pink underline decoration-2 underline-offset-4' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Following ({followingList.length})
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(networkSubTab === 'followers' ? followersList : followingList).length === 0 ? (
                <p className="font-mono text-xs text-zinc-500 col-span-2 py-4">
                  No registered nodes connected here.
                </p>
              ) : (
                (networkSubTab === 'followers' ? followersList : followingList).map(u => {
                  const isFollowingThisUser = currentUser.following.includes(u.id);
                  return (
                    <div
                      key={u.id}
                      className="flex items-center justify-between p-3 bg-zinc-950/80 border border-zinc-900 hover:border-zinc-800 transition-all rounded-xl text-left"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar}
                          alt={u.displayName}
                          className="w-8 h-8 rounded-lg object-cover border border-zinc-800"
                        />
                        <div className="flex flex-col">
                          <span className="font-sans font-bold text-xs text-zinc-200">
                            {u.displayName}
                          </span>
                          <span className="font-mono text-[8px] text-zinc-500">
                            @{u.username}
                          </span>
                        </div>
                      </div>

                      {u.id !== currentUser.id && (
                        <button
                          onClick={() => {
                            inkPressAudio.playBell();
                            onFollowToggle(u.id);
                          }}
                          className={`px-2.5 py-1 font-mono text-[8px] font-bold uppercase tracking-widest rounded-md cursor-pointer transition-all ${
                            isFollowingThisUser
                              ? 'border border-zinc-800 text-zinc-500'
                              : 'bg-zinc-100 text-black hover:bg-zinc-200'
                          }`}
                        >
                          {isFollowingThisUser ? 'Disconnect' : 'Connect'}
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
