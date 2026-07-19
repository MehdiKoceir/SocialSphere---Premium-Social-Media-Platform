import React, { useState, useEffect } from 'react';
import { Post, User, Comment, Story } from '../types';
import { Heart, MessageCircle, Send, Trash2, Image, Compass, Sparkles, AlertCircle, Bookmark, Share2, ChevronLeft, ChevronRight, Play, Pause, Flame, Trophy, Smile, BookOpen, Minus, Plus, X, Type } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { inkPressAudio } from '../utils/audio';

interface FeedProps {
  posts: Post[];
  currentUser: User;
  onLikePost: (postId: string) => void;
  onSavePost: (postId: string) => void;
  onReactPost: (postId: string, emoji: string) => void;
  onAddComment: (postId: string, content: string) => void;
  onAddPost: (content: string, mediaUrls?: string[], videoUrl?: string, tags?: string[]) => void;
  onDeletePost: (postId: string) => void;
  onOpenUserProfile: (userOrId: User | string) => void;
}

export default function Feed({
  posts,
  currentUser,
  onLikePost,
  onSavePost,
  onReactPost,
  onAddComment,
  onAddPost,
  onDeletePost,
  onOpenUserProfile
}: FeedProps) {
  const [newPostContent, setNewPostContent] = useState('');
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [mediaUrlsList, setMediaUrlsList] = useState<string[]>([]);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newTagsInput, setNewTagsInput] = useState('');
  
  const [showComposerInputs, setShowComposerInputs] = useState(false);
  const [feedTab, setFeedTab] = useState<'all' | 'following'>('all');
  const [isDraftSaved, setIsDraftSaved] = useState(false);

  // Stories
  const [stories, setStories] = useState<Story[]>([]);
  const [activeStoryIdx, setActiveStoryIdx] = useState<number | null>(null);
  const [storyProgress, setStoryProgress] = useState(0);

  // Carousel image active indexes
  const [activeImageIdxs, setActiveImageIdxs] = useState<Record<string, number>>({});
  
  // Custom video state simulation
  const [playingVideoIds, setPlayingVideoIds] = useState<Record<string, boolean>>({});

  // Comment inputs
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

  // Share link animation trigger
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);

  // Focus Reading Mode
  const [focusedPostId, setFocusedPostId] = useState<string | null>(null);
  const [readingFontSize, setReadingFontSize] = useState<'text-sm' | 'text-base' | 'text-lg' | 'text-xl' | 'text-2xl'>('text-lg');
  const [readingLineHeight, setReadingLineHeight] = useState<'leading-relaxed' | 'leading-loose' | 'leading-[2.2]'>('leading-relaxed');
  const [readingFont, setReadingFont] = useState<'font-sans' | 'font-serif' | 'font-mono'>('font-serif');
  const [readingTheme, setReadingTheme] = useState<'obsidian' | 'cyber' | 'sepia'>('cyber');
  const [focusedScrollPercent, setFocusedScrollPercent] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setFocusedPostId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch stories
  const fetchStories = async () => {
    try {
      const res = await fetch('/api/stories');
      if (res.ok) {
        const data = await res.json();
        setStories(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStories();
    // Load local draft on start
    const saved = localStorage.getItem(`sociably_draft_${currentUser.id}`);
    if (saved) {
      setNewPostContent(saved);
      setIsDraftSaved(true);
    }
  }, [currentUser.id]);

  // Handle draft savings
  const handleContentChange = (content: string) => {
    setNewPostContent(content);
    inkPressAudio.playClack();
    if (content.trim()) {
      localStorage.setItem(`sociably_draft_${currentUser.id}`, content);
      setIsDraftSaved(true);
    } else {
      localStorage.removeItem(`sociably_draft_${currentUser.id}`);
      setIsDraftSaved(false);
    }
  };

  const handleAddPostMedia = () => {
    if (newMediaUrl.trim()) {
      inkPressAudio.playClack();
      setMediaUrlsList(prev => [...prev, newMediaUrl.trim()]);
      setNewMediaUrl('');
    }
  };

  const handlePublishPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    // Split tags
    const tags = newTagsInput.trim()
      ? newTagsInput.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)
      : [];

    onAddPost(
      newPostContent,
      mediaUrlsList.length > 0 ? mediaUrlsList : undefined,
      newVideoUrl.trim() || undefined,
      tags
    );

    // Reset composer
    setNewPostContent('');
    setMediaUrlsList([]);
    setNewVideoUrl('');
    setNewTagsInput('');
    setShowComposerInputs(false);
    localStorage.removeItem(`sociably_draft_${currentUser.id}`);
    setIsDraftSaved(false);

    // Play carriage bell
    inkPressAudio.playBell();
  };

  const handleCreateComment = (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    const commentContent = commentInputs[postId];
    if (!commentContent || !commentContent.trim()) return;
    onAddComment(postId, commentContent);
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    inkPressAudio.playBell();
  };

  const handleCommentInputChange = (postId: string, val: string) => {
    inkPressAudio.playClack();
    setCommentInputs(prev => ({ ...prev, [postId]: val }));
  };

  // Story playback timer
  useEffect(() => {
    if (activeStoryIdx === null) return;
    setStoryProgress(0);

    const interval = setInterval(() => {
      setStoryProgress(prev => {
        if (prev >= 100) {
          // Transition to next story
          if (activeStoryIdx < stories.length - 1) {
            setActiveStoryIdx(activeStoryIdx + 1);
            return 0;
          } else {
            setActiveStoryIdx(null);
            return 0;
          }
        }
        return prev + 1;
      });
    }, 45); // Story lasts ~4.5 seconds

    return () => clearInterval(interval);
  }, [activeStoryIdx, stories]);

  // Image slider transitions
  const handleNextImage = (postId: string, maxLen: number) => {
    inkPressAudio.playClack();
    const current = activeImageIdxs[postId] || 0;
    setActiveImageIdxs(prev => ({
      ...prev,
      [postId]: (current + 1) % maxLen
    }));
  };

  const handlePrevImage = (postId: string, maxLen: number) => {
    inkPressAudio.playClack();
    const current = activeImageIdxs[postId] || 0;
    setActiveImageIdxs(prev => ({
      ...prev,
      [postId]: (current - 1 + maxLen) % maxLen
    }));
  };

  // Play simulated video
  const togglePlayVideo = (postId: string) => {
    inkPressAudio.playClack();
    setPlayingVideoIds(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  // Save/Unsave bookmark
  const handleSaveClick = (postId: string) => {
    inkPressAudio.playClack();
    onSavePost(postId);
  };

  // Emoji reactions clicks
  const handleReactClick = (postId: string, emoji: string) => {
    inkPressAudio.playClack();
    onReactPost(postId, emoji);
  };

  // Share copies link
  const handleSharePost = (postId: string) => {
    inkPressAudio.playBell();
    setCopiedPostId(postId);
    navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`);
    setTimeout(() => setCopiedPostId(null), 3000);
  };

  // Filter posts based on timeline tab selection
  const filteredPosts = posts.filter(post => {
    if (feedTab === 'following') {
      return currentUser.following.includes(post.userId) || post.userId === currentUser.id;
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col gap-6">
      {/* 1. Stories tray */}
      <div className="glass-panel p-4 rounded-2xl flex items-center gap-4 overflow-x-auto border border-zinc-800/80 relative">
        {/* Dynamic add story node */}
        <div className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer">
          <div 
            onClick={async () => {
              inkPressAudio.playBell();
              const url = prompt('Enter a direct image URL to publish to your active Story:');
              if (url) {
                const res = await fetch('/api/stories', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ userId: currentUser.id, mediaUrl: url })
                });
                if (res.ok) {
                  fetchStories();
                }
              }
            }}
            className="w-14 h-14 rounded-full border border-dashed border-zinc-600 hover:border-cyber-blue flex items-center justify-center transition-all bg-zinc-950/40"
          >
            <span className="text-xl font-bold text-zinc-400 hover:text-cyber-blue">+</span>
          </div>
          <span className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest">Add Story</span>
        </div>

        {/* Existing Stories bubble lists */}
        {stories.map((story, index) => (
          <div 
            key={story.id}
            onClick={() => {
              inkPressAudio.playBell();
              setActiveStoryIdx(index);
            }}
            className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group"
          >
            <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-cyber-blue via-cyber-purple to-cyber-pink group-hover:scale-105 transition-all">
              <img
                src={story.userAvatar}
                alt={story.userDisplayName}
                className="w-full h-full rounded-full object-cover border-2 border-black"
              />
            </div>
            <span className="font-sans text-[9px] text-zinc-400 group-hover:text-zinc-100 transition-all truncate max-w-[64px]">
              {story.userDisplayName.split(' ')[0]}
            </span>
          </div>
        ))}
      </div>

      {/* 2. Premium Post Composer */}
      <form onSubmit={handlePublishPost} className="glass-panel p-5 rounded-2xl border border-zinc-800/80 flex flex-col gap-4">
        <div className="flex gap-4">
          <img
            src={currentUser.avatar}
            alt={currentUser.displayName}
            className="w-10 h-10 rounded-xl object-cover border border-zinc-800 flex-shrink-0"
          />
          <div className="flex-1 flex flex-col gap-3">
            <textarea
              placeholder={`Translate thoughts to cyber-monographs, ${currentUser.displayName.split(' ')[0]}...`}
              value={newPostContent}
              onChange={e => handleContentChange(e.target.value)}
              rows={3}
              maxLength={280}
              className="w-full bg-zinc-950/60 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 text-xs font-sans focus:outline-none focus:border-cyber-purple transition-all resize-none placeholder-zinc-600 leading-relaxed"
            />

            {/* Inputs Tray drawer expand */}
            <AnimatePresence>
              {showComposerInputs && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-col gap-2.5 overflow-hidden"
                >
                  {/* Media uploads input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Paste Image URL..."
                      value={newMediaUrl}
                      onChange={e => {
                        inkPressAudio.playClack();
                        setNewMediaUrl(e.target.value);
                      }}
                      className="flex-1 px-3 py-2 bg-zinc-950/90 border border-zinc-800 focus:border-cyber-blue rounded-lg text-[10px] text-zinc-300 focus:outline-none font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleAddPostMedia}
                      className="px-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 rounded-lg text-[10px] font-mono cursor-pointer uppercase font-bold tracking-wider"
                    >
                      Add Image
                    </button>
                  </div>

                  {/* Multiple media indicator nodes */}
                  {mediaUrlsList.length > 0 && (
                    <div className="flex gap-2 py-1 flex-wrap">
                      {mediaUrlsList.map((url, i) => (
                        <div key={i} className="relative group rounded-md overflow-hidden w-12 h-12 border border-zinc-800">
                          <img src={url} alt="thumbnail" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => {
                              inkPressAudio.playClack();
                              setMediaUrlsList(prev => prev.filter((_, idx) => idx !== i));
                            }}
                            className="absolute inset-0 bg-red-950/80 text-red-200 opacity-0 group-hover:opacity-100 transition-all text-[8px] font-mono font-bold"
                          >
                            REMOVE
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Video URL input */}
                  <input
                    type="text"
                    placeholder="Video Link (supports mp4 / generic streamers)..."
                    value={newVideoUrl}
                    onChange={e => {
                      inkPressAudio.playClack();
                      setNewVideoUrl(e.target.value);
                    }}
                    className="w-full px-3 py-2 bg-zinc-950/90 border border-zinc-800 focus:border-cyber-blue rounded-lg text-[10px] text-zinc-300 focus:outline-none font-mono"
                  />

                  {/* Hashtags comma lists */}
                  <input
                    type="text"
                    placeholder="Monograph tags (separated by commas: e.g. coding, design, tech)..."
                    value={newTagsInput}
                    onChange={e => {
                      inkPressAudio.playClack();
                      setNewTagsInput(e.target.value);
                    }}
                    className="w-full px-3 py-2 bg-zinc-950/90 border border-zinc-800 focus:border-cyber-blue rounded-lg text-[10px] text-zinc-300 focus:outline-none font-mono"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Composer Toolbar Footer */}
        <div className="flex items-center justify-between border-t border-zinc-900 pt-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                inkPressAudio.playClack();
                setShowComposerInputs(!showComposerInputs);
              }}
              className="p-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-cyber-blue rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Image size={14} />
              <span className="font-mono text-[9px] uppercase tracking-wider">Multimedia Relays</span>
            </button>
          </div>

          <div className="flex items-center gap-4">
            {isDraftSaved && (
              <span className="font-mono text-[8px] text-cyber-green uppercase tracking-widest flex items-center gap-1 animate-pulse">
                • Draft Persisted
              </span>
            )}
            <span className="font-mono text-[9px] text-zinc-600">
              {newPostContent.length}/280 char
            </span>
            <button
              type="submit"
              disabled={!newPostContent.trim()}
              className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 disabled:opacity-40 text-black font-semibold rounded-lg text-xs uppercase tracking-widest font-mono transition-all disabled:pointer-events-none cursor-pointer"
            >
              Broadcast
            </button>
          </div>
        </div>
      </form>

      {/* 3. Timeline feed tabs */}
      <div className="flex border-b border-zinc-900 gap-8">
        <button
          onClick={() => {
            inkPressAudio.playClack();
            setFeedTab('all');
          }}
          className={`pb-3.5 text-xs font-mono font-bold tracking-widest uppercase flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
            feedTab === 'all'
              ? 'border-cyber-blue text-cyber-blue'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Curated Universe
        </button>
        <button
          onClick={() => {
            inkPressAudio.playClack();
            setFeedTab('following');
          }}
          className={`pb-3.5 text-xs font-mono font-bold tracking-widest uppercase flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
            feedTab === 'following'
              ? 'border-cyber-purple text-cyber-purple'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          My Channels
        </button>
      </div>

      {/* 4. Timeline Post list */}
      <div className="flex flex-col gap-6">
        {filteredPosts.length === 0 ? (
          <div className="p-16 text-center bg-zinc-950/20 border border-zinc-900 rounded-2xl flex flex-col items-center justify-center gap-2">
            <AlertCircle className="text-zinc-700" size={32} />
            <p className="font-mono text-xs text-zinc-500">No active telemetries received in this sequence.</p>
          </div>
        ) : (
          filteredPosts.map(post => {
            const hasLiked = post.likes.includes(currentUser.id);
            const hasSaved = post.saves?.includes(currentUser.id);
            const isCommentsOpen = !!expandedComments[post.id];

            // Image slider index
            const currentImgIdx = activeImageIdxs[post.id] || 0;
            const mediaList = post.mediaUrls || [];

            // Video playing simulated state
            const isPlayingVideo = !!playingVideoIds[post.id];

            return (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-6 rounded-2xl border border-zinc-800/80 flex flex-col gap-4 relative"
              >
                {/* Header Controls (Focus Reading Mode & Delete) */}
                <div className="absolute top-6 right-6 flex items-center gap-2 z-10">
                  <button
                    onClick={() => {
                      inkPressAudio.playBell();
                      setFocusedPostId(post.id);
                      setFocusedScrollPercent(0);
                    }}
                    className="p-1.5 text-zinc-400 hover:text-cyber-blue transition-all rounded-lg hover:bg-zinc-900/60 border border-zinc-800 bg-zinc-950/40 cursor-pointer flex items-center gap-1.5"
                    title="Focus Reading Mode"
                  >
                    <BookOpen size={13} />
                    <span className="font-mono text-[9px] uppercase tracking-wider hidden sm:inline">Focus</span>
                  </button>

                  {post.userId === currentUser.id && (
                    <button
                      onClick={() => {
                        inkPressAudio.playBell();
                        onDeletePost(post.id);
                      }}
                      className="p-1.5 text-zinc-600 hover:text-red-500 transition-all rounded-lg hover:bg-zinc-900/60 border border-zinc-800 bg-zinc-950/40 cursor-pointer"
                      title="Purge Monograph"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>

                {/* Profile row */}
                <div className="flex items-center gap-3.5">
                  <img
                    src={post.userAvatar}
                    alt={post.userDisplayName}
                    className="w-10 h-10 rounded-xl object-cover border border-zinc-800 cursor-pointer"
                    onClick={() => onOpenUserProfile(post.userId)}
                  />
                  <div className="flex flex-col text-left">
                    <span 
                      onClick={() => onOpenUserProfile(post.userId)}
                      className="font-sans font-extrabold text-xs text-zinc-100 hover:text-cyber-blue transition-all cursor-pointer"
                    >
                      {post.userDisplayName}
                    </span>
                    <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest mt-0.5">
                      @{post.username} • {new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="flex flex-col gap-3.5 text-left pl-0 md:pl-1">
                  <p className="font-sans text-xs md:text-sm text-zinc-200 leading-relaxed font-light whitespace-pre-wrap">
                    {post.content}
                  </p>

                  {/* Hash Tags elements list */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {post.tags.map((tg, idx) => (
                        <span key={idx} className="font-mono text-[9px] text-cyber-blue bg-cyber-blue/5 border border-cyber-blue/10 px-2 py-0.5 rounded-md">
                          #{tg}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Multiple Media Slider layout */}
                  {mediaList.length > 0 && (
                    <div className="relative rounded-2xl overflow-hidden border border-zinc-900 bg-black max-h-[380px] flex items-center justify-center">
                      <img
                        src={mediaList[currentImgIdx]}
                        alt="monograph media"
                        className="w-full h-auto object-contain max-h-[380px]"
                      />

                      {/* Left-Right Slider triggers */}
                      {mediaList.length > 1 && (
                        <>
                          <button
                            onClick={() => handlePrevImage(post.id, mediaList.length)}
                            className="absolute left-3 p-2 bg-black/60 border border-zinc-800 rounded-full text-zinc-300 hover:text-white transition-all cursor-pointer"
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <button
                            onClick={() => handleNextImage(post.id, mediaList.length)}
                            className="absolute right-3 p-2 bg-black/60 border border-zinc-800 rounded-full text-zinc-300 hover:text-white transition-all cursor-pointer"
                          >
                            <ChevronRight size={16} />
                          </button>

                          {/* Index indicators */}
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1 bg-black/40 px-2.5 py-1 rounded-full border border-zinc-800">
                            {mediaList.map((_, i) => (
                              <div
                                key={i}
                                className={`w-1.5 h-1.5 rounded-full transition-all ${
                                  currentImgIdx === i ? 'bg-cyber-blue w-3' : 'bg-zinc-600'
                                }`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Custom Simulated Video player */}
                  {post.videoUrl && (
                    <div className="relative rounded-2xl overflow-hidden border border-zinc-900 bg-zinc-950 flex flex-col justify-end min-h-[220px]">
                      {/* Interactive placeholder scene */}
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-tr from-zinc-950 via-zinc-900 to-zinc-950">
                        {isPlayingVideo ? (
                          <div className="flex items-center gap-1">
                            <span className="w-1.5 h-6 bg-cyber-purple animate-pulse" />
                            <span className="w-1.5 h-10 bg-cyber-purple animate-pulse [animation-delay:0.2s]" />
                            <span className="w-1.5 h-8 bg-cyber-purple animate-pulse [animation-delay:0.4s]" />
                            <span className="w-1.5 h-4 bg-cyber-purple animate-pulse [animation-delay:0.1s]" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-black/70 border border-zinc-800 rounded-full flex items-center justify-center text-cyber-purple">
                            <Play size={18} className="fill-current ml-0.5" />
                          </div>
                        )}
                      </div>

                      {/* Video Dashboard bar controls */}
                      <div className="z-10 bg-black/80 border-t border-zinc-900 p-3 flex items-center justify-between">
                        <button
                          onClick={() => togglePlayVideo(post.id)}
                          className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-wider text-zinc-300 hover:text-cyber-purple transition-all cursor-pointer"
                        >
                          {isPlayingVideo ? <Pause size={12} /> : <Play size={12} />}
                          {isPlayingVideo ? 'FEED ACTIVE' : 'INITIALIZE'}
                        </button>
                        <span className="font-mono text-[8px] text-zinc-500 uppercase">TELEMETRY_LINK: {post.videoUrl}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Interactive Reactions list rendering */}
                {post.reactions && Object.keys(post.reactions).length > 0 && (
                  <div className="flex gap-2 flex-wrap pl-1">
                    {Object.entries(post.reactions).map(([emoji, uids]) => {
                      if (uids.length === 0) return null;
                      const hasReacted = uids.includes(currentUser.id);
                      return (
                        <button
                          key={emoji}
                          onClick={() => handleReactClick(post.id, emoji)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900 border hover:border-zinc-700 transition-all rounded-md cursor-pointer ${
                            hasReacted ? 'border-cyber-purple/50 bg-cyber-purple/5 text-zinc-200' : 'border-zinc-800/80 text-zinc-400'
                          }`}
                        >
                          <span className="text-xs">{emoji}</span>
                          <span className="font-mono text-[9px]">{uids.length}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Toolbar actions bar */}
                <div className="px-4 py-2 bg-zinc-950/20 border-t border-b border-zinc-900/60 flex items-center justify-between text-zinc-400 font-mono text-[9px] tracking-wider uppercase">
                  <div className="flex items-center gap-5">
                    <button
                      onClick={() => {
                        inkPressAudio.playClack();
                        onLikePost(post.id);
                      }}
                      className={`flex items-center gap-1.5 transition-all cursor-pointer ${
                        hasLiked ? 'text-cyber-pink font-bold' : 'hover:text-zinc-200'
                      }`}
                    >
                      <Heart size={13} className={hasLiked ? 'fill-cyber-pink stroke-cyber-pink' : ''} />
                      {post.likes.length} Likes
                    </button>

                    <button
                      onClick={() => {
                        inkPressAudio.playClack();
                        setExpandedComments(prev => ({ ...prev, [post.id]: !isCommentsOpen }));
                      }}
                      className={`flex items-center gap-1.5 transition-all cursor-pointer ${
                        isCommentsOpen ? 'text-cyber-blue font-bold' : 'hover:text-zinc-200'
                      }`}
                    >
                      <MessageCircle size={13} />
                      {post.comments?.length || 0} Comments
                    </button>

                    {/* Reactions expand flyout menu */}
                    <div className="relative group/react">
                      <button className="flex items-center gap-1.5 transition-all hover:text-amber-400 cursor-pointer">
                        <Smile size={13} />
                        React
                      </button>

                      {/* Floating menu */}
                      <div className="absolute bottom-5 left-0 p-1.5 bg-zinc-900 border border-zinc-800 rounded-lg flex gap-1.5 opacity-0 pointer-events-none group-hover/react:opacity-100 group-hover/react:pointer-events-auto transition-all shadow-xl z-30">
                        {['🔥', '🚀', '😍', '📸', '💡'].map(emo => (
                          <button
                            key={emo}
                            onClick={() => handleReactClick(post.id, emo)}
                            className="p-1 hover:scale-125 transition-all text-sm cursor-pointer"
                          >
                            {emo}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleSaveClick(post.id)}
                      className={`flex items-center gap-1 cursor-pointer transition-all ${
                        hasSaved ? 'text-cyber-purple font-bold' : 'hover:text-zinc-300'
                      }`}
                    >
                      <Bookmark size={13} className={hasSaved ? 'fill-cyber-purple stroke-cyber-purple' : ''} />
                      {hasSaved ? 'INDEXED' : 'SAVE'}
                    </button>

                    <button
                      onClick={() => handleSharePost(post.id)}
                      className="flex items-center gap-1 hover:text-zinc-300 cursor-pointer transition-all"
                    >
                      <Share2 size={13} />
                      {copiedPostId === post.id ? 'COPIED' : 'SHARE'}
                    </button>
                  </div>
                </div>

                {/* Comment Section container drawer */}
                <AnimatePresence>
                  {isCommentsOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden flex flex-col gap-4 pl-0 md:pl-2"
                    >
                      {/* Comments List */}
                      {post.comments && post.comments.length > 0 && (
                        <div className="flex flex-col gap-3 py-1 border-l border-zinc-900 pl-4">
                          {post.comments.map(comm => (
                            <div key={comm.id} className="flex gap-2.5 items-start text-left">
                              <img
                                src={comm.userAvatar}
                                alt={comm.userDisplayName}
                                className="w-5 h-5 rounded-md object-cover border border-zinc-900"
                              />
                              <div className="flex-1 flex flex-col">
                                <p className="font-sans text-[11px] text-zinc-300">
                                  <strong className="text-zinc-100 font-extrabold mr-1">
                                    {comm.userDisplayName}
                                  </strong>
                                  {comm.content}
                                </p>
                                <span className="font-mono text-[8px] text-zinc-600 mt-1">
                                  {new Date(comm.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Comment Input form */}
                      <form onSubmit={e => handleCreateComment(post.id, e)} className="flex gap-3">
                        <input
                          type="text"
                          placeholder="Submit interactive annotation..."
                          value={commentInputs[post.id] || ''}
                          onChange={e => handleCommentInputChange(post.id, e.target.value)}
                          className="flex-1 px-3 py-2 bg-zinc-950/90 border border-zinc-900 focus:border-cyber-blue rounded-lg text-[10px] text-zinc-300 focus:outline-none transition-all placeholder-zinc-700"
                        />
                        <button
                          type="submit"
                          disabled={!(commentInputs[post.id] || '').trim()}
                          className="px-4 bg-zinc-100 hover:bg-zinc-200 disabled:opacity-40 disabled:pointer-events-none text-black rounded-lg text-[10px] font-mono uppercase font-bold tracking-wider cursor-pointer"
                        >
                          Post
                        </button>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.article>
            );
          })
        )}
      </div>

      {/* 5. Full Screen Interactive Story Reader Modal Overlay */}
      <AnimatePresence>
        {activeStoryIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-4 backdrop-blur-md"
          >
            {/* Story Card Container */}
            <div className="w-full max-w-md flex flex-col gap-4 relative">
              {/* Progress Bar Header */}
              <div className="flex gap-1 absolute top-4 left-4 right-4 z-10">
                {stories.map((_, i) => {
                  let width = '0%';
                  if (i < activeStoryIdx) width = '100%';
                  if (i === activeStoryIdx) width = `${storyProgress}%`;

                  return (
                    <div key={i} className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        style={{ width }}
                        className="h-full bg-cyber-blue transition-all duration-75"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Creator details absolute overlay */}
              <div className="absolute top-8 left-4 right-4 z-10 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent p-2 rounded-lg">
                <div className="flex items-center gap-2.5">
                  <img
                    src={stories[activeStoryIdx].userAvatar}
                    alt={stories[activeStoryIdx].userDisplayName}
                    className="w-7 h-7 rounded-full object-cover border border-zinc-800"
                  />
                  <span className="font-sans font-bold text-xs text-white">
                    {stories[activeStoryIdx].userDisplayName}
                  </span>
                </div>

                <button
                  onClick={() => {
                    inkPressAudio.playClack();
                    setActiveStoryIdx(null);
                  }}
                  className="p-1.5 text-zinc-400 hover:text-white font-mono text-xs uppercase"
                >
                  [CLOSE]
                </button>
              </div>

              {/* Core Image Display Area */}
              <div className="rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 aspect-[9/16] w-full flex items-center justify-center relative shadow-2xl">
                <img
                  src={stories[activeStoryIdx].mediaUrl}
                  alt="story detail"
                  className="w-full h-full object-cover grayscale opacity-70"
                />
              </div>

              {/* Navigation overlays */}
              <div className="absolute inset-y-0 left-0 w-1/4 cursor-pointer" onClick={() => {
                if (activeStoryIdx > 0) {
                  inkPressAudio.playClack();
                  setActiveStoryIdx(activeStoryIdx - 1);
                }
              }} />
              <div className="absolute inset-y-0 right-0 w-1/4 cursor-pointer" onClick={() => {
                if (activeStoryIdx < stories.length - 1) {
                  inkPressAudio.playClack();
                  setActiveStoryIdx(activeStoryIdx + 1);
                } else {
                  setActiveStoryIdx(null);
                }
              }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. Focus Reading Mode Overlay */}
      <AnimatePresence>
        {focusedPostId !== null && (() => {
          const focusedPost = posts.find(p => p.id === focusedPostId);
          if (!focusedPost) return null;

          const wordCount = focusedPost.content.split(/\s+/).filter(Boolean).length;
          const readingTime = Math.max(1, Math.ceil(wordCount / 200));

          const hasLikedInFocus = focusedPost.likes.includes(currentUser.id);
          const hasSavedInFocus = focusedPost.saves?.includes(currentUser.id);
          
          // Theme configurations
          const themeClasses = {
            obsidian: 'bg-zinc-950 text-zinc-100 selection:bg-zinc-800 selection:text-white',
            cyber: 'bg-zinc-900 text-zinc-200 selection:bg-cyber-blue/30 selection:text-white',
            sepia: 'bg-[#12100e] text-[#f2e9df] selection:bg-amber-900/40 selection:text-amber-100'
          };

          const cardThemeClasses = {
            obsidian: 'bg-black/40 border-zinc-900',
            cyber: 'bg-zinc-950/60 border-zinc-800/80',
            sepia: 'bg-[#1a1612]/70 border-amber-900/30'
          };

          const panelThemeClasses = {
            obsidian: 'bg-zinc-900/90 border-zinc-800 text-zinc-300',
            cyber: 'bg-zinc-950/90 border-zinc-800/80 text-zinc-300',
            sepia: 'bg-[#16120e]/95 border-amber-900/30 text-[#e4d7c5]'
          };

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/98 z-50 flex flex-col backdrop-blur-md overflow-hidden"
            >
              {/* Reading Progress Indicator */}
              <div className="h-1 w-full bg-zinc-900/50 absolute top-0 left-0 right-0 z-50">
                <div
                  style={{ width: `${focusedScrollPercent}%` }}
                  className="h-full bg-gradient-to-r from-cyber-blue via-cyber-purple to-cyber-pink transition-all duration-75"
                />
              </div>

              {/* Focus Reading Toolbar */}
              <header className="z-20 flex flex-wrap items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-black/90 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyber-blue/10 border border-cyber-blue/20 rounded-xl text-cyber-blue">
                    <BookOpen size={16} />
                  </div>
                  <div className="text-left">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">Monograph Reading Room</span>
                    <h3 className="font-sans font-bold text-xs text-white truncate max-w-[200px] sm:max-w-xs">
                      Focus: @{focusedPost.username}
                    </h3>
                  </div>
                </div>

                {/* Reader Customizer Options */}
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-3 sm:mt-0">
                  {/* Typography Selector */}
                  <div className="flex items-center gap-1.5 bg-zinc-900/80 p-1 rounded-lg border border-zinc-800">
                    <button
                      onClick={() => { inkPressAudio.playClack(); setReadingFont('font-sans'); }}
                      className={`px-2 py-1 text-[10px] font-mono rounded transition-all cursor-pointer ${
                        readingFont === 'font-sans' ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      Sans
                    </button>
                    <button
                      onClick={() => { inkPressAudio.playClack(); setReadingFont('font-serif'); }}
                      className={`px-2 py-1 text-[10px] font-mono rounded transition-all cursor-pointer ${
                        readingFont === 'font-serif' ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      Serif
                    </button>
                    <button
                      onClick={() => { inkPressAudio.playClack(); setReadingFont('font-mono'); }}
                      className={`px-2 py-1 text-[10px] font-mono rounded transition-all cursor-pointer ${
                        readingFont === 'font-mono' ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      Mono
                    </button>
                  </div>

                  {/* Font Size Adjusters */}
                  <div className="flex items-center gap-1 bg-zinc-900/80 p-1 rounded-lg border border-zinc-800">
                    <button
                      type="button"
                      onClick={() => {
                        inkPressAudio.playClack();
                        if (readingFontSize === 'text-2xl') setReadingFontSize('text-xl');
                        else if (readingFontSize === 'text-xl') setReadingFontSize('text-lg');
                        else if (readingFontSize === 'text-lg') setReadingFontSize('text-base');
                        else if (readingFontSize === 'text-base') setReadingFontSize('text-sm');
                      }}
                      disabled={readingFontSize === 'text-sm'}
                      className="p-1 hover:text-white disabled:opacity-30 text-zinc-400 cursor-pointer"
                      title="Decrease text size"
                    >
                      <Minus size={12} />
                    </button>
                    <div className="px-1.5 text-center min-w-[28px]">
                      <Type size={12} className="inline mr-1 text-zinc-500" />
                      <span className="font-mono text-[9px] text-zinc-300 font-bold">
                        {readingFontSize === 'text-sm' && '85%'}
                        {readingFontSize === 'text-base' && '100%'}
                        {readingFontSize === 'text-lg' && '115%'}
                        {readingFontSize === 'text-xl' && '130%'}
                        {readingFontSize === 'text-2xl' && '150%'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        inkPressAudio.playClack();
                        if (readingFontSize === 'text-sm') setReadingFontSize('text-base');
                        else if (readingFontSize === 'text-base') setReadingFontSize('text-lg');
                        else if (readingFontSize === 'text-lg') setReadingFontSize('text-xl');
                        else if (readingFontSize === 'text-xl') setReadingFontSize('text-2xl');
                      }}
                      disabled={readingFontSize === 'text-2xl'}
                      className="p-1 hover:text-white disabled:opacity-30 text-zinc-400 cursor-pointer"
                      title="Increase text size"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  {/* Line Height Selector */}
                  <div className="flex items-center gap-1.5 bg-zinc-900/80 p-1 rounded-lg border border-zinc-800">
                    <button
                      onClick={() => { inkPressAudio.playClack(); setReadingLineHeight('leading-relaxed'); }}
                      className={`px-2 py-1 text-[10px] font-mono rounded transition-all cursor-pointer ${
                        readingLineHeight === 'leading-relaxed' ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                      title="Relaxed spacing"
                    >
                      Relaxed
                    </button>
                    <button
                      onClick={() => { inkPressAudio.playClack(); setReadingLineHeight('leading-loose'); }}
                      className={`px-2 py-1 text-[10px] font-mono rounded transition-all cursor-pointer ${
                        readingLineHeight === 'leading-loose' ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                      title="Loose spacing"
                    >
                      Loose
                    </button>
                    <button
                      onClick={() => { inkPressAudio.playClack(); setReadingLineHeight('leading-[2.2]'); }}
                      className={`px-2 py-1 text-[10px] font-mono rounded transition-all cursor-pointer ${
                        readingLineHeight === 'leading-[2.2]' ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                      title="Deep spacing"
                    >
                      Deep
                    </button>
                  </div>

                  {/* Color Theme Selector */}
                  <div className="flex items-center gap-2 bg-zinc-900/80 px-2.5 py-1.5 rounded-lg border border-zinc-800">
                    <button
                      onClick={() => { inkPressAudio.playClack(); setReadingTheme('obsidian'); }}
                      className={`w-4 h-4 rounded-full bg-black border transition-all cursor-pointer ${
                        readingTheme === 'obsidian' ? 'ring-2 ring-cyber-purple scale-110 border-white' : 'border-zinc-700 hover:scale-105'
                      }`}
                      title="Obsidian Dark"
                    />
                    <button
                      onClick={() => { inkPressAudio.playClack(); setReadingTheme('cyber'); }}
                      className={`w-4 h-4 rounded-full bg-zinc-900 border transition-all cursor-pointer ${
                        readingTheme === 'cyber' ? 'ring-2 ring-cyber-blue scale-110 border-white' : 'border-zinc-700 hover:scale-105'
                      }`}
                      title="Cyber Gray"
                    />
                    <button
                      onClick={() => { inkPressAudio.playClack(); setReadingTheme('sepia'); }}
                      className={`w-4 h-4 rounded-full bg-[#18120c] border transition-all cursor-pointer ${
                        readingTheme === 'sepia' ? 'ring-2 ring-amber-500 scale-110 border-[#e4d7c5]' : 'border-amber-900/40 hover:scale-105'
                      }`}
                      title="Eye-safe Sepia"
                    />
                  </div>

                  {/* Exit Reader Button */}
                  <button
                    onClick={() => {
                      inkPressAudio.playBell();
                      setFocusedPostId(null);
                    }}
                    className="p-2 bg-red-950/50 border border-red-900/60 hover:bg-red-900/50 text-red-200 hover:text-white transition-all rounded-xl cursor-pointer flex items-center gap-1"
                    title="Exit Focus Mode (Esc)"
                  >
                    <X size={14} />
                    <span className="font-mono text-[9px] uppercase tracking-widest hidden md:inline">Exit</span>
                  </button>
                </div>
              </header>

              {/* Scrollable Container */}
              <div 
                onScroll={(e) => {
                  const target = e.currentTarget;
                  const totalHeight = target.scrollHeight - target.clientHeight;
                  if (totalHeight > 0) {
                    const pct = Math.round((target.scrollTop / totalHeight) * 100);
                    setFocusedScrollPercent(pct);
                  }
                }}
                className={`flex-1 overflow-y-auto px-4 md:px-8 py-10 transition-all duration-300 ${themeClasses[readingTheme]}`}
              >
                <div className="max-w-3xl mx-auto flex flex-col gap-12 pb-32">
                  
                  {/* Article Header Details */}
                  <div className="flex flex-col gap-6 text-left border-b border-zinc-800/40 pb-8">
                    <div className="flex items-center gap-4">
                      <img
                        src={focusedPost.userAvatar}
                        alt={focusedPost.userDisplayName}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-zinc-800/80 shadow-lg cursor-pointer"
                        onClick={() => {
                          setFocusedPostId(null);
                          onOpenUserProfile(focusedPost.userId);
                        }}
                      />
                      <div>
                        <h2 
                          onClick={() => {
                            setFocusedPostId(null);
                            onOpenUserProfile(focusedPost.userId);
                          }}
                          className="font-sans font-extrabold text-base md:text-lg hover:text-cyber-blue transition-all cursor-pointer"
                        >
                          {focusedPost.userDisplayName}
                        </h2>
                        <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider mt-1">
                          @{focusedPost.username} • Published {new Date(focusedPost.timestamp).toLocaleDateString()} at {new Date(focusedPost.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>

                    {/* Metadata Stats */}
                    <div className="flex items-center gap-4 font-mono text-[10px] text-zinc-500 uppercase tracking-wider bg-zinc-950/30 p-3 rounded-xl border border-zinc-800/30">
                      <span>{wordCount} words</span>
                      <span className="text-zinc-700">•</span>
                      <span className="text-cyber-purple font-semibold">{readingTime} min read</span>
                      <span className="text-zinc-700">•</span>
                      <span className="text-cyber-blue flex items-center gap-1">
                        <Sparkles size={11} className="inline animate-pulse" /> Read Stream Stable
                      </span>
                    </div>
                  </div>

                  {/* Body Content typeset for ultimate reading comfort */}
                  <main className="text-left">
                    <article className={`${readingFont} ${readingFontSize} ${readingLineHeight} tracking-normal text-justify whitespace-pre-wrap ${
                      readingFont === 'font-serif' ? 'first-letter:text-6xl first-letter:font-serif first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-cyber-purple' : ''
                    }`}>
                      {focusedPost.content}
                    </article>

                    {/* Hash Tags elements list */}
                    {focusedPost.tags && focusedPost.tags.length > 0 && (
                      <div className="flex gap-2.5 flex-wrap mt-8">
                        {focusedPost.tags.map((tg, idx) => (
                          <span key={idx} className="font-mono text-[10px] text-cyber-blue bg-cyber-blue/5 border border-cyber-blue/10 px-3 py-1 rounded-lg">
                            #{tg}
                          </span>
                        ))}
                      </div>
                    )}
                  </main>

                  {/* Inline Media content if present */}
                  {focusedPost.mediaUrls && focusedPost.mediaUrls.length > 0 && (
                    <div className="flex flex-col gap-4 my-6">
                      <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 text-left">Relayed Visual Attachments:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {focusedPost.mediaUrls.map((url, idx) => (
                          <div key={idx} className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-black shadow-xl group">
                            <img
                              src={url}
                              alt="Visual Attachment"
                              className="w-full h-auto object-contain max-h-[300px] mx-auto group-hover:scale-[1.02] transition-all duration-500"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute bottom-2 right-2 bg-black/70 px-2.5 py-1 rounded-md text-[8px] font-mono border border-zinc-800 text-zinc-400">
                              REF_ATTACHMENT_{idx + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {focusedPost.videoUrl && (
                    <div className="flex flex-col gap-4 my-4">
                      <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 text-left">Relayed Telemetry Video stream:</p>
                      <div className="rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 p-6 flex flex-col justify-center min-h-[220px] shadow-xl">
                        <div className="flex flex-col items-center gap-3">
                          <Play size={36} className="text-cyber-purple animate-pulse" />
                          <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest">Active Stream Channel: {focusedPost.videoUrl}</span>
                          <span className="font-sans text-[11px] text-zinc-600">Simulated video active in background</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Interactive floating / bottom engagement controls */}
                  <div className={`mt-8 p-5 rounded-2xl border flex flex-wrap items-center justify-between ${cardThemeClasses[readingTheme]} transition-all duration-300`}>
                    <div className="flex items-center gap-6 font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                      <button
                        onClick={() => {
                          inkPressAudio.playClack();
                          onLikePost(focusedPost.id);
                        }}
                        className={`flex items-center gap-2 transition-all cursor-pointer ${
                          hasLikedInFocus ? 'text-cyber-pink font-bold' : 'hover:text-zinc-200'
                        }`}
                      >
                        <Heart size={14} className={hasLikedInFocus ? 'fill-cyber-pink stroke-cyber-pink' : ''} />
                        {focusedPost.likes.length} Likes
                      </button>

                      {/* Emojis floating menu triggers right inside focus view */}
                      <div className="relative group/react-focus">
                        <button className="flex items-center gap-2 transition-all hover:text-amber-400 cursor-pointer">
                          <Smile size={14} />
                          React
                        </button>
                        <div className="absolute bottom-6 left-0 p-1.5 bg-zinc-950 border border-zinc-800 rounded-xl flex gap-2 opacity-0 pointer-events-none group-hover/react-focus:opacity-100 group-hover/react-focus:pointer-events-auto transition-all shadow-2xl z-30">
                          {['🔥', '🚀', '😍', '📸', '💡'].map(emo => (
                            <button
                              key={emo}
                              onClick={() => {
                                inkPressAudio.playClack();
                                onReactPost(focusedPost.id, emo);
                              }}
                              className="p-1 hover:scale-125 transition-all text-base cursor-pointer"
                            >
                              {emo}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 font-mono text-[10px] uppercase tracking-wider text-zinc-400 mt-2 sm:mt-0">
                      <button
                        onClick={() => {
                          inkPressAudio.playClack();
                          onSavePost(focusedPost.id);
                        }}
                        className={`flex items-center gap-2 cursor-pointer transition-all ${
                          hasSavedInFocus ? 'text-cyber-purple font-bold' : 'hover:text-zinc-300'
                        }`}
                      >
                        <Bookmark size={14} className={hasSavedInFocus ? 'fill-cyber-purple stroke-cyber-purple' : ''} />
                        {hasSavedInFocus ? 'INDEXED' : 'SAVE TO INDEX'}
                      </button>

                      <button
                        onClick={() => handleSharePost(focusedPost.id)}
                        className="flex items-center gap-2 hover:text-zinc-300 cursor-pointer transition-all"
                      >
                        <Share2 size={14} />
                        {copiedPostId === focusedPost.id ? 'COPIED LINK' : 'SHARE RELAY'}
                      </button>
                    </div>
                  </div>

                  {/* Comments annotations inline in Focus mode */}
                  <div className={`p-6 rounded-2xl border text-left flex flex-col gap-6 ${cardThemeClasses[readingTheme]} transition-all duration-300`}>
                    <h4 className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 border-b border-zinc-800/30 pb-3">
                      Annotations Log ({focusedPost.comments?.length || 0} Entries)
                    </h4>

                    {focusedPost.comments && focusedPost.comments.length > 0 ? (
                      <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto pr-2">
                        {focusedPost.comments.map(comm => (
                          <div key={comm.id} className="flex gap-3 items-start text-left bg-black/10 p-3 rounded-xl border border-zinc-800/10">
                            <img
                              src={comm.userAvatar}
                              alt={comm.userDisplayName}
                              className="w-7 h-7 rounded-lg object-cover border border-zinc-900"
                            />
                            <div className="flex-1 flex flex-col">
                              <p className={`font-sans text-xs ${readingTheme === 'sepia' ? 'text-[#decbb4]' : 'text-zinc-300'}`}>
                                <strong className={`font-extrabold mr-1 ${readingTheme === 'sepia' ? 'text-[#f2e9df]' : 'text-white'}`}>
                                  {comm.userDisplayName}
                                </strong>
                                {comm.content}
                              </p>
                              <span className="font-mono text-[8px] text-zinc-600 mt-1.5">
                                {new Date(comm.timestamp).toLocaleDateString()} {new Date(comm.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="font-mono text-[10px] text-zinc-600 py-3 text-center">No annotations registered. Begin transcription below.</p>
                    )}

                    {/* Annotation write form */}
                    <form 
                      onSubmit={e => {
                        e.preventDefault();
                        const val = commentInputs[focusedPost.id];
                        if (!val || !val.trim()) return;
                        onAddComment(focusedPost.id, val);
                        setCommentInputs(prev => ({ ...prev, [focusedPost.id]: '' }));
                        inkPressAudio.playBell();
                      }}
                      className="flex gap-3 mt-2"
                    >
                      <input
                        type="text"
                        placeholder="Transcribe active thoughts or annotation..."
                        value={commentInputs[focusedPost.id] || ''}
                        onChange={e => handleCommentInputChange(focusedPost.id, e.target.value)}
                        className={`flex-1 px-4 py-2.5 rounded-xl text-xs focus:outline-none transition-all placeholder-zinc-600 ${panelThemeClasses[readingTheme]}`}
                      />
                      <button
                        type="submit"
                        disabled={!(commentInputs[focusedPost.id] || '').trim()}
                        className="px-5 bg-zinc-100 hover:bg-zinc-200 disabled:opacity-40 disabled:pointer-events-none text-black rounded-xl text-xs font-mono uppercase font-extrabold tracking-wider cursor-pointer"
                      >
                        Commit
                      </button>
                    </form>
                  </div>

                </div>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
