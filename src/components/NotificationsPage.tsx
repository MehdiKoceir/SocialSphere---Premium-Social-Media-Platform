import React from 'react';
import { motion } from 'motion/react';
import { Notification, User } from '../types';
import { Heart, MessageSquare, UserPlus, Check, Flame, MessageCircle, AlertCircle } from 'lucide-react';
import { inkPressAudio } from '../utils/audio';

interface NotificationsPageProps {
  notifications: Notification[];
  currentUser: User;
  onFollowBack: (userId: string) => void;
  onMarkAllRead: () => void;
  onViewPost: (postId: string) => void;
}

export default function NotificationsPage({
  notifications,
  currentUser,
  onFollowBack,
  onMarkAllRead,
  onViewPost
}: NotificationsPageProps) {

  const handleMarkRead = () => {
    inkPressAudio.playBell();
    onMarkAllRead();
  };

  const handleAction = (notif: Notification) => {
    inkPressAudio.playClack();
    if (notif.postId) {
      onViewPost(notif.postId);
    } else if (notif.type === 'follow') {
      onFollowBack(notif.senderId);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="text-cyber-pink fill-cyber-pink/20" size={13} />;
      case 'comment':
        return <MessageSquare className="text-cyber-blue" size={13} />;
      case 'follow':
        return <UserPlus className="text-cyber-purple" size={13} />;
      case 'reaction':
        return <Flame className="text-amber-500 fill-amber-500/20" size={13} />;
      case 'message':
        return <MessageCircle className="text-cyber-green" size={13} />;
      default:
        return <AlertCircle className="text-zinc-400" size={13} />;
    }
  };

  return (
    <div className="flex-1 max-w-2xl mx-auto w-full flex flex-col gap-6">
      {/* Header telemetry control */}
      <div className="flex justify-between items-center bg-zinc-950/40 p-4 border border-zinc-800/80 rounded-2xl backdrop-blur-sm">
        <div className="flex flex-col">
          <h3 className="font-sans font-extrabold text-sm text-zinc-100 tracking-tight">
            Telemetry Center
          </h3>
          <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest">
            {notifications.filter(n => !n.isRead).length} unread signals detected
          </span>
        </div>

        {notifications.some(n => !n.isRead) && (
          <button
            onClick={handleMarkRead}
            className="px-3 py-1.5 font-mono text-[9px] font-bold uppercase tracking-widest bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all hover:bg-zinc-800"
          >
            <Check size={11} className="text-cyber-green stroke-[3]" />
            Clear Signals
          </button>
        )}
      </div>

      {/* Notifications timeline list */}
      <div className="flex flex-col gap-3">
        {notifications.length === 0 ? (
          <div className="p-16 text-center bg-zinc-950/20 border border-zinc-900 rounded-2xl flex flex-col items-center justify-center gap-2">
            <AlertCircle className="text-zinc-700" size={32} />
            <p className="font-mono text-xs text-zinc-500">No telemetry notifications received.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {notifications.map((notif, idx) => {
              const isUnread = !notif.isRead;
              const isFollowingBack = currentUser.following.includes(notif.senderId);

              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`p-4 rounded-xl flex items-center justify-between gap-4 border transition-all ${
                    isUnread
                      ? 'bg-zinc-900/80 border-cyber-purple/40 shadow-sm shadow-purple-950/10'
                      : 'bg-zinc-950/40 border-zinc-900 hover:border-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    {/* Badge container with icon */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={notif.senderAvatar}
                        alt={notif.senderName}
                        className="w-10 h-10 rounded-lg object-cover border border-zinc-800"
                      />
                      <div className="absolute -bottom-1 -right-1 p-1 bg-black border border-zinc-800 rounded-md">
                        {getIcon(notif.type)}
                      </div>
                    </div>

                    {/* Meta details */}
                    <div className="flex flex-col min-w-0 text-left">
                      <p className="font-sans text-xs text-zinc-300 leading-normal">
                        <strong className="text-zinc-100 font-extrabold mr-1">
                          {notif.senderName}
                        </strong>
                        {notif.detailText || 'triggered an action.'}
                      </p>
                      <span className="font-mono text-[8px] text-zinc-600 mt-1">
                        {new Date(notif.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex-shrink-0">
                    {notif.type === 'follow' ? (
                      <button
                        onClick={() => handleAction(notif)}
                        className={`px-3 py-1.5 font-mono text-[8px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                          isFollowingBack
                            ? 'border border-zinc-800 text-zinc-500'
                            : 'bg-zinc-100 hover:bg-zinc-200 text-black'
                        }`}
                      >
                        {isFollowingBack ? 'Connected' : 'Sync Back'}
                      </button>
                    ) : notif.postId ? (
                      <button
                        onClick={() => handleAction(notif)}
                        className="px-3 py-1.5 font-mono text-[8px] font-bold uppercase tracking-wider bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 rounded-lg transition-all cursor-pointer"
                      >
                        Inspect
                      </button>
                    ) : null}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
