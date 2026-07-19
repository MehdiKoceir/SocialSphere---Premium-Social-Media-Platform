import React, { useState, useEffect } from 'react';
import { User, Post, Comment, Notification, Message } from './types';
import Sidebar from './components/Sidebar';
import Feed from './components/Feed';
import ExplorePage from './components/ExplorePage';
import MessagesPage from './components/MessagesPage';
import NotificationsPage from './components/NotificationsPage';
import DashboardPage from './components/DashboardPage';
import SettingsPage from './components/SettingsPage';
import ProfilePage from './components/ProfilePage';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import UserProfileModal from './components/UserProfileModal';
import NewProfileModal from './components/NewProfileModal';

import { 
  Compass, Search, MessageSquare, Bell, BarChart2, User as UserIcon, 
  Settings, LogOut, RefreshCw, Volume2, VolumeX, Sparkles, AlertCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { inkPressAudio } from './utils/audio';

type ViewType = 'landing' | 'login' | 'feed' | 'explore' | 'messages' | 'notifications' | 'dashboard' | 'settings' | 'profile';

export default function App() {
  const [activeView, setActiveView] = useState<ViewType>('landing');
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unseenMessagesCount, setUnseenMessagesCount] = useState(0);

  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [selectedUserProfileId, setSelectedUserProfileId] = useState<string | null>(null);
  const [isNewProfileOpen, setIsNewProfileOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  // Sync state with audio engine
  useEffect(() => {
    inkPressAudio.setMuted(isAudioMuted);
  }, [isAudioMuted]);

  // Active User object derivation
  const currentUser = users.find((u) => u.id === currentUserId) || users[0];

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    const maxAttempts = 5;
    let success = false;
    let lastError = '';

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const [usersRes, postsRes] = await Promise.all([
          fetch('/api/users'),
          fetch('/api/posts'),
        ]);

        if (!usersRes.ok || !postsRes.ok) {
          throw new Error(`Failed to load initial workspace data (users: ${usersRes.status}, posts: ${postsRes.status}).`);
        }

        const usersContentType = usersRes.headers.get('content-type');
        const postsContentType = postsRes.headers.get('content-type');
        
        if (!usersContentType?.includes('application/json') || !postsContentType?.includes('application/json')) {
          throw new Error('Server returned non-JSON response (possibly html 502/503 during restart).');
        }

        const usersData: User[] = await usersRes.json();
        const postsData: Post[] = await postsRes.json();

        setUsers(usersData);
        setPosts(postsData);
        
        // Default to the first user if not set
        if (!currentUserId && usersData.length > 0) {
          setCurrentUserId(usersData[0].id);
        }
        setError(null);
        success = true;
        break; // Break the retry loop on success
      } catch (err: any) {
        console.error(`Fetch attempt ${attempt} failed:`, err);
        lastError = err.message || 'Unable to connect to the backend server.';
        
        if (attempt < maxAttempts) {
          setError(`Sync connection interrupted. Re-synchronizing neural stream (Attempt ${attempt}/${maxAttempts})...`);
          await new Promise((resolve) => setTimeout(resolve, 1000 + attempt * 500));
        }
      }
    }

    if (!success) {
      setError(lastError || 'Unable to connect to the backend server.');
    }
    setIsLoading(false);
  };

  // Fetch active notifications for current actor
  const fetchNotifications = async () => {
    if (!currentUserId) return;
    try {
      const res = await fetch(`/api/notifications?userId=${currentUserId}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Poll notifications & DM unseen indicator counters in real-time
  const fetchUnseenRelays = async () => {
    if (!currentUserId) return;
    try {
      // Look through other users to fetch lists
      let count = 0;
      for (const other of users) {
        if (other.id === currentUserId) continue;
        const res = await fetch(`/api/messages?user1=${currentUserId}&user2=${other.id}`);
        if (res.ok) {
          const messages: Message[] = await res.json();
          count += messages.filter(m => m.receiverId === currentUserId && !m.isSeen).length;
        }
      }
      setUnseenMessagesCount(count);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      fetchNotifications();
      fetchUnseenRelays();
      const interval = setInterval(() => {
        fetchNotifications();
        fetchUnseenRelays();
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [currentUserId, users]);

  const handleSwitchUser = (userId: string) => {
    setCurrentUserId(userId);
    fetchNotifications();
  };

  const handleFollowToggle = async (userId: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/users/${userId}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentUserId: currentUser.id }),
      });

      if (!res.ok) throw new Error('Failed to follow user.');

      const { currentUser: updatedMe, targetUser: updatedTarget } = await res.json();
      
      // Update local users array
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id === currentUser.id) return updatedMe;
          if (u.id === userId) return updatedTarget;
          return u;
        })
      );
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id }),
      });

      if (!res.ok) throw new Error('Failed to like post.');

      const updatedPost = await res.json();
      setPosts((prev) => prev.map((p) => (p.id === postId ? updatedPost : p)));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSavePost = async (postId: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/posts/${postId}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id }),
      });

      if (!res.ok) throw new Error('Failed to save post.');

      const updatedPost = await res.json();
      setPosts((prev) => prev.map((p) => (p.id === postId ? updatedPost : p)));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleReactPost = async (postId: string, emoji: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/posts/${postId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, emoji }),
      });

      if (!res.ok) throw new Error('Failed to react post.');

      const updatedPost = await res.json();
      setPosts((prev) => prev.map((p) => (p.id === postId ? updatedPost : p)));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddComment = async (postId: string, content: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, content }),
      });

      if (!res.ok) throw new Error('Failed to post comment.');

      const updatedPost = await res.json();
      setPosts((prev) => prev.map((p) => (p.id === postId ? updatedPost : p)));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddPost = async (content: string, mediaUrls?: string[], videoUrl?: string, tags?: string[]) => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: currentUser.id, 
          content, 
          mediaUrls, 
          videoUrl, 
          tags 
        }),
      });

      if (!res.ok) throw new Error('Failed to create post.');

      const newPost = await res.json();
      setPosts((prev) => [newPost, ...prev]);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id }),
      });

      if (!res.ok) throw new Error('Failed to delete post.');

      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateProfile = async (updatedData: {
    displayName: string;
    username: string;
    bio: string;
    avatar: string;
    background: string;
  }) => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: currentUser.id, ...updatedData }),
      });

      if (!res.ok) throw new Error('Failed to update profile.');

      const updatedUser = await res.json();
      setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));
      
      // Refresh posts to update avatar mappings
      const postsRes = await fetch('/api/posts');
      if (postsRes.ok) {
        const postsData = await postsRes.json();
        setPosts(postsData);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateProfile = async (newProfile: {
    username: string;
    displayName: string;
    bio: string;
    avatar: string;
    background: string;
  }) => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProfile),
      });

      if (!res.ok) throw new Error('Failed to register user.');

      const newUser = await res.json();
      setUsers((prev) => [...prev, newUser]);
      setCurrentUserId(newUser.id); // auto switch
      setActiveView('feed');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id })
      });
      if (res.ok) {
        fetchNotifications();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetWorkspaceDB = async () => {
    try {
      const res = await fetch('/api/db/reset', { method: 'POST' });
      if (res.ok) {
        alert('Telemetry Database reseeded successfully.');
        fetchData();
        setActiveView('feed');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenUserProfile = (userOrId: User | string) => {
    const id = typeof userOrId === 'string' ? userOrId : userOrId.id;
    setSelectedUserProfileId(id);
  };

  // Render gate for Landing view
  if (activeView === 'landing') {
    return <LandingPage onEnterApp={() => setActiveView('login')} />;
  }

  // Render gate for Login User node switcher
  if (activeView === 'login') {
    return (
      <>
        <LoginPage 
          users={users} 
          onSelectUser={(id) => {
            setCurrentUserId(id);
            setActiveView('feed');
          }} 
          onOpenNewProfile={() => setIsNewProfileOpen(true)}
        />
        <AnimatePresence>
          {isNewProfileOpen && (
            <NewProfileModal
              isOpen={true}
              onClose={() => setIsNewProfileOpen(false)}
              onCreateProfile={handleCreateProfile}
            />
          )}
        </AnimatePresence>
      </>
    );
  }

  const selectedUserForProfile = users.find((u) => u.id === selectedUserProfileId);
  const selectedUserPosts = posts.filter((p) => p.userId === selectedUserProfileId);

  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-[#030303] text-zinc-100 font-sans antialiased flex flex-col relative neural-grid">
      
      {/* 1. Header Control bar */}
      <header className="sticky top-0 z-40 bg-black/70 backdrop-blur-md border-b border-zinc-900 px-6 py-4 flex items-center justify-between">
        <div 
          onClick={() => {
            inkPressAudio.playBell();
            setActiveView('landing');
          }}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyber-blue to-cyber-purple flex items-center justify-center text-black font-extrabold text-lg font-mono select-none">
            S
          </div>
          <span className="font-sans font-extrabold text-zinc-100 tracking-tighter text-xl group-hover:text-cyber-blue transition-all">
            Sociably
          </span>
        </div>

        {/* Global haptic volume buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              const nextMuted = !isAudioMuted;
              setIsAudioMuted(nextMuted);
              inkPressAudio.setMuted(nextMuted);
              if (!nextMuted) {
                setTimeout(() => inkPressAudio.playClack(), 50);
              }
            }}
            className="p-2 text-zinc-400 hover:text-zinc-200 bg-zinc-900/60 border border-zinc-800 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            title={isAudioMuted ? "Unmute sounds" : "Mute sounds"}
          >
            {isAudioMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            <span className="font-mono text-[9px] uppercase tracking-wider hidden sm:inline">
              {isAudioMuted ? "SILENT" : "HAPTICS ACTIVE"}
            </span>
          </button>

          <button
            onClick={() => {
              inkPressAudio.playClack();
              fetchData();
            }}
            className="p-2 text-zinc-400 hover:text-zinc-200 bg-zinc-900/60 border border-zinc-800 rounded-xl transition-all cursor-pointer"
            title="Reload telemetry indexes"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </header>

      {/* 2. Primary layout grid */}
      {isLoading ? (
        <div className="flex-grow flex flex-col items-center justify-center py-32 gap-3">
          <div className="w-8 h-8 border-2 border-cyber-blue border-t-transparent rounded-full animate-spin" />
          <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Synchronizing neural packet channels...</p>
        </div>
      ) : error ? (
        <div className="flex-grow flex flex-col items-center justify-center py-32 px-6 text-center">
          <div className="p-5 border border-zinc-800 bg-zinc-950 rounded-2xl max-w-sm">
            <h3 className="font-sans font-bold text-lg text-zinc-200">Synchrony Interrupted</h3>
            <p className="font-sans text-xs text-zinc-500 mt-2 leading-relaxed">{error}</p>
          </div>
          <button
            onClick={() => fetchData()}
            className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-black font-mono text-xs uppercase tracking-widest font-bold rounded-xl mt-4 cursor-pointer"
          >
            Retry Synchrony
          </button>
        </div>
      ) : (
        <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
          
          {/* Left Navigation Rail (Linear style) */}
          <nav className="w-full md:w-16 flex md:flex-col items-center gap-4 py-3 md:py-6 bg-zinc-950/60 border border-zinc-900 md:h-[620px] rounded-2xl backdrop-blur-md justify-between px-4 md:px-0 flex-shrink-0">
            {/* Top Navigation Group */}
            <div className="flex md:flex-col items-center gap-4 w-full justify-center">
              
              {/* Universe / Feed */}
              <button
                onClick={() => {
                  inkPressAudio.playClack();
                  setActiveView('feed');
                }}
                className={`p-3 rounded-xl transition-all relative cursor-pointer ${
                  activeView === 'feed'
                    ? 'bg-zinc-900 text-cyber-blue border border-zinc-800'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="Universe Chronicle"
              >
                <Compass size={18} />
              </button>

              {/* Discovery / Explore */}
              <button
                onClick={() => {
                  inkPressAudio.playClack();
                  setActiveView('explore');
                }}
                className={`p-3 rounded-xl transition-all cursor-pointer ${
                  activeView === 'explore'
                    ? 'bg-zinc-900 text-cyber-blue border border-zinc-800'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="Telemetry Discovery"
              >
                <Search size={18} />
              </button>

              {/* Direct relays / DM */}
              <button
                onClick={() => {
                  inkPressAudio.playClack();
                  setActiveView('messages');
                }}
                className={`p-3 rounded-xl transition-all relative cursor-pointer ${
                  activeView === 'messages'
                    ? 'bg-zinc-900 text-cyber-blue border border-zinc-800'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="Direct Relays"
              >
                <MessageSquare size={18} />
                {unseenMessagesCount > 0 && (
                  <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-cyber-blue text-black font-mono font-bold text-[8px] flex items-center justify-center rounded-full border-2 border-black animate-pulse">
                    {unseenMessagesCount}
                  </div>
                )}
              </button>

              {/* Notifications / Alerts */}
              <button
                onClick={() => {
                  inkPressAudio.playClack();
                  setActiveView('notifications');
                }}
                className={`p-3 rounded-xl transition-all relative cursor-pointer ${
                  activeView === 'notifications'
                    ? 'bg-zinc-900 text-cyber-blue border border-zinc-800'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="Alert Log"
              >
                <Bell size={18} />
                {unreadNotificationsCount > 0 && (
                  <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyber-pink rounded-full border border-black animate-ping" />
                )}
              </button>

              {/* Dashboard metrics */}
              <button
                onClick={() => {
                  inkPressAudio.playClack();
                  setActiveView('dashboard');
                }}
                className={`p-3 rounded-xl transition-all cursor-pointer ${
                  activeView === 'dashboard'
                    ? 'bg-zinc-900 text-cyber-blue border border-zinc-800'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="Executive Dashboard"
              >
                <BarChart2 size={18} />
              </button>

              {/* Profile Node */}
              <button
                onClick={() => {
                  inkPressAudio.playClack();
                  setActiveView('profile');
                }}
                className={`p-3 rounded-xl transition-all cursor-pointer ${
                  activeView === 'profile'
                    ? 'bg-zinc-900 text-cyber-blue border border-zinc-800'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="Profile Node"
              >
                <UserIcon size={18} />
              </button>
            </div>

            {/* Bottom Actions group */}
            <div className="flex md:flex-col items-center gap-4 w-full justify-center">
              {/* Settings */}
              <button
                onClick={() => {
                  inkPressAudio.playClack();
                  setActiveView('settings');
                }}
                className={`p-3 rounded-xl transition-all cursor-pointer ${
                  activeView === 'settings'
                    ? 'bg-zinc-900 text-cyber-blue border border-zinc-800'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="System Settings"
              >
                <Settings size={18} />
              </button>

              {/* De-authorize switcher */}
              <button
                onClick={() => {
                  inkPressAudio.playBell();
                  setActiveView('login');
                }}
                className="p-3 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-950/20 transition-all cursor-pointer"
                title="Disconnect identity"
              >
                <LogOut size={18} />
              </button>
            </div>
          </nav>

          {/* Central Active View column */}
          <div className="flex-1 flex flex-col gap-6">
            {activeView === 'feed' && (
              <Feed
                posts={posts}
                currentUser={currentUser}
                onLikePost={handleLikePost}
                onSavePost={handleSavePost}
                onReactPost={handleReactPost}
                onAddComment={handleAddComment}
                onAddPost={handleAddPost}
                onDeletePost={handleDeletePost}
                onOpenUserProfile={handleOpenUserProfile}
              />
            )}

            {activeView === 'explore' && (
              <ExplorePage
                posts={posts}
                users={users}
                currentUser={currentUser}
                onFollowToggle={handleFollowToggle}
                onOpenUserProfile={handleOpenUserProfile}
                onViewPost={(id) => {
                  setActiveView('feed');
                }}
              />
            )}

            {activeView === 'messages' && (
              <MessagesPage
                currentUser={currentUser}
                users={users}
              />
            )}

            {activeView === 'notifications' && (
              <NotificationsPage
                notifications={notifications}
                currentUser={currentUser}
                onFollowBack={handleFollowToggle}
                onMarkAllRead={handleMarkAllNotificationsRead}
                onViewPost={(id) => {
                  setActiveView('feed');
                }}
              />
            )}

            {activeView === 'dashboard' && (
              <DashboardPage />
            )}

            {activeView === 'settings' && (
              <SettingsPage
                currentUser={currentUser}
                onUpdateProfile={handleUpdateProfile}
                onResetDB={handleResetWorkspaceDB}
              />
            )}

            {activeView === 'profile' && (
              <ProfilePage
                user={currentUser}
                currentUser={currentUser}
                posts={posts}
                onFollowToggle={handleFollowToggle}
                onLikePost={handleLikePost}
                onDeletePost={handleDeletePost}
                onOpenSettings={() => setActiveView('settings')}
                onViewPost={(id) => {
                  setActiveView('feed');
                }}
                users={users}
              />
            )}
          </div>

          {/* Right column (Suggestions Sidebar index panel - ONLY visible on Feed page) */}
          {(activeView === 'feed' || activeView === 'explore') && (
            <Sidebar
              users={users}
              currentUser={currentUser}
              onSwitchUser={handleSwitchUser}
              onOpenNewProfileModal={() => setIsNewProfileOpen(true)}
              onOpenUserProfile={(u) => handleOpenUserProfile(u)}
              onFollowToggle={handleFollowToggle}
            />
          )}

        </div>
      )}

      {/* 3. Popup User Card Details Overlays */}
      <AnimatePresence>
        {selectedUserForProfile && (
          <UserProfileModal
            isOpen={true}
            user={selectedUserForProfile}
            currentUser={currentUser}
            userPosts={selectedUserPosts}
            onClose={() => setSelectedUserProfileId(null)}
            onFollowToggle={handleFollowToggle}
            onLikePost={handleLikePost}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isNewProfileOpen && (
          <NewProfileModal
            isOpen={true}
            onClose={() => setIsNewProfileOpen(false)}
            onCreateProfile={handleCreateProfile}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
