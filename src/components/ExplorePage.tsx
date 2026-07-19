import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Post, User } from '../types';
import { Search, TrendingUp, Users, Compass, Sliders, ChevronRight, MessageSquare, Heart } from 'lucide-react';
import { inkPressAudio } from '../utils/audio';

interface ExplorePageProps {
  posts: Post[];
  users: User[];
  currentUser: User;
  onFollowToggle: (userId: string) => void;
  onOpenUserProfile: (user: User) => void;
  onViewPost: (postId: string) => void;
}

export default function ExplorePage({
  posts,
  users,
  currentUser,
  onFollowToggle,
  onOpenUserProfile,
  onViewPost
}: ExplorePageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const handleSearchChange = (val: string) => {
    inkPressAudio.playClack();
    setSearchQuery(val);
    setSelectedTag(null);
  };

  // Static high-fidelity trend list
  const trends = [
    { tag: 'design', postsCount: 142, category: 'UI/UX' },
    { tag: 'vite', postsCount: 98, category: 'Front End' },
    { tag: 'coding', postsCount: 231, category: 'Engineering' },
    { tag: 'cyberpunk', postsCount: 74, category: 'Photography' },
    { tag: 'uiux', postsCount: 110, category: 'Design Systems' },
    { tag: 'startup', postsCount: 165, category: 'Business' }
  ];

  // Recommendations (not current user and not already followed)
  const suggestedUsers = users.filter(
    u => u.id !== currentUser.id && !currentUser.following.includes(u.id)
  );

  // Filtered posts based on search or tag
  const filteredPosts = posts.filter(post => {
    if (selectedTag) {
      return post.tags?.includes(selectedTag) || post.content.toLowerCase().includes(`#${selectedTag}`);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        post.content.toLowerCase().includes(q) ||
        post.userDisplayName.toLowerCase().includes(q) ||
        post.username.toLowerCase().includes(q) ||
        post.tags?.some(t => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-8">
      {/* Left side: Search and posts timeline */}
      <div className="flex-1 flex flex-col gap-6">
        {/* Search Header */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500 pointer-events-none">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search telemetry databases, monograph tags, or developer nodes..."
            value={searchQuery}
            onChange={e => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3.5 bg-zinc-900/60 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-cyber-blue font-mono placeholder-zinc-500 transition-all shadow-md"
          />
        </div>

        {/* Selected Tag Indicator */}
        {selectedTag && (
          <div className="flex items-center justify-between p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
            <span className="font-mono text-xs text-zinc-300">
              Filtering by tag: <strong className="text-cyber-blue font-bold">#{selectedTag}</strong>
            </span>
            <button
              onClick={() => {
                inkPressAudio.playClack();
                setSelectedTag(null);
              }}
              className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300 uppercase tracking-widest cursor-pointer"
            >
              Clear Filter
            </button>
          </div>
        )}

        {/* Explore feed results */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="font-sans font-extrabold text-sm tracking-tight text-zinc-100 flex items-center gap-2">
              <Compass size={15} className="text-cyber-blue" />
              {searchQuery || selectedTag ? 'Telemetry Discovery' : 'Curated Monograph Index'}
            </h3>
            <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest">
              {filteredPosts.length} matches indexed
            </span>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-zinc-900/30 border border-zinc-800/50">
              <p className="font-mono text-xs text-zinc-500">No telemetry entries found for the criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPosts.map(post => (
                <div
                  key={post.id}
                  onClick={() => onViewPost(post.id)}
                  className="glass-card hover:border-zinc-700 rounded-xl p-5 flex flex-col justify-between gap-4 transition-all hover:-translate-y-0.5 cursor-pointer"
                >
                  <div className="flex flex-col gap-2">
                    {/* Header */}
                    <div className="flex items-center gap-2.5">
                      <img
                        src={post.userAvatar}
                        alt={post.userDisplayName}
                        className="w-6 h-6 rounded-md object-cover border border-zinc-800"
                      />
                      <div className="flex flex-col">
                        <span className="font-sans font-bold text-xs text-zinc-200">
                          {post.userDisplayName}
                        </span>
                        <span className="font-mono text-[9px] text-zinc-500">
                          @{post.username}
                        </span>
                      </div>
                    </div>

                    {/* Content preview */}
                    <p className="font-sans text-xs text-zinc-300 leading-relaxed line-clamp-3">
                      {post.content}
                    </p>
                  </div>

                  {/* Thumbnail / tags preview */}
                  <div className="flex flex-col gap-3">
                    {post.mediaUrls && post.mediaUrls.length > 0 && (
                      <div className="w-full h-24 rounded-lg overflow-hidden border border-zinc-800 relative">
                        <img
                          src={post.mediaUrls[0]}
                          alt="preview"
                          className="w-full h-full object-cover grayscale opacity-60"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-2">
                          <span className="font-mono text-[8px] text-zinc-400">
                            {post.mediaUrls.length} image index
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Footer Metrics */}
                    <div className="flex items-center justify-between border-t border-zinc-800/60 pt-2.5">
                      <div className="flex items-center gap-3 text-zinc-500 font-mono text-[9px]">
                        <span className="flex items-center gap-1">
                          <Heart size={10} className="text-zinc-600" />
                          {post.likes.length}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare size={10} className="text-zinc-600" />
                          {post.comments.length}
                        </span>
                      </div>

                      <span className="font-mono text-[8px] text-zinc-600">
                        {new Date(post.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right side: Trends & Recommendations (Bento Panel) */}
      <div className="w-full lg:w-80 flex flex-col gap-6">
        {/* Recommended Node Grid */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col gap-4 border border-zinc-800/80">
          <div className="flex items-center justify-between">
            <h4 className="font-sans font-extrabold text-xs tracking-tight text-zinc-100 flex items-center gap-1.5">
              <Users size={14} className="text-cyber-purple" />
              Suggested Nodes
            </h4>
            <span className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest">
              Recommended
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {suggestedUsers.length === 0 ? (
              <p className="font-mono text-[10px] text-zinc-500 italic py-2">
                All nodes fully mapped.
              </p>
            ) : (
              suggestedUsers.map(user => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-zinc-950/40 border border-zinc-900 hover:border-zinc-800 transition-all"
                >
                  <div
                    onClick={() => {
                      inkPressAudio.playClack();
                      onOpenUserProfile(user);
                    }}
                    className="flex items-center gap-2.5 cursor-pointer group"
                  >
                    <img
                      src={user.avatar}
                      alt={user.displayName}
                      className="w-7 h-7 rounded-lg object-cover border border-zinc-800 group-hover:border-zinc-700 transition-all"
                    />
                    <div className="flex flex-col">
                      <span className="font-sans font-bold text-[11px] text-zinc-200 group-hover:text-cyber-purple transition-all">
                        {user.displayName.split(' ')[0]}
                      </span>
                      <span className="font-mono text-[8px] text-zinc-500">
                        @{user.username}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      inkPressAudio.playBell();
                      onFollowToggle(user.id);
                    }}
                    className="px-2.5 py-1 font-mono text-[8px] font-bold uppercase tracking-widest bg-zinc-100 text-black hover:bg-zinc-200 transition-all rounded-md cursor-pointer"
                  >
                    Connect
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Trending Categories */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col gap-4 border border-zinc-800/80">
          <div className="flex items-center justify-between">
            <h4 className="font-sans font-extrabold text-xs tracking-tight text-zinc-100 flex items-center gap-1.5">
              <TrendingUp size={14} className="text-cyber-pink" />
              Hot Indexes
            </h4>
            <span className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest">
              Engagement
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {trends.map((tr, idx) => (
              <button
                key={idx}
                onClick={() => {
                  inkPressAudio.playBell();
                  setSelectedTag(tr.tag);
                }}
                className="flex items-center justify-between p-2 rounded-xl border border-transparent hover:border-zinc-800 hover:bg-zinc-950/50 text-left transition-all group cursor-pointer"
              >
                <div className="flex flex-col">
                  <span className="font-mono text-xs font-bold text-zinc-300 group-hover:text-cyber-pink transition-all">
                    #{tr.tag}
                  </span>
                  <span className="font-sans text-[9px] text-zinc-500">
                    {tr.category}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-mono text-[9px] text-zinc-500">
                    {tr.postsCount} posts
                  </span>
                  <ChevronRight size={12} className="text-zinc-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
