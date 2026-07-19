export interface User {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatar: string;
  background?: string;
  followers: string[]; // User IDs
  following: string[]; // User IDs
  joinedDate: string;
  isOnline?: boolean;
  statusText?: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  username: string;
  userDisplayName: string;
  userAvatar: string;
  content: string;
  timestamp: string;
}

export interface Reaction {
  emoji: string;
  userIds: string[];
}

export interface Post {
  id: string;
  userId: string;
  username: string;
  userDisplayName: string;
  userAvatar: string;
  content: string;
  mediaUrls?: string[]; // Multiple images supported
  videoUrl?: string; // Video URLs supported
  timestamp: string;
  likes: string[]; // User IDs who liked this post
  comments: Comment[];
  saves: string[]; // User IDs who saved this post
  reactions?: Record<string, string[]>; // e.g. { "🔥": ["alice"], "🚀": ["bob"] }
  tags?: string[];
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isSeen: boolean;
  isVoiceNote?: boolean;
  voiceDuration?: string;
  voiceWaveform?: number[];
}

export interface Notification {
  id: string;
  userId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'reaction' | 'message';
  postId?: string;
  timestamp: string;
  isRead: boolean;
  detailText?: string;
}

export interface Story {
  id: string;
  userId: string;
  username: string;
  userDisplayName: string;
  userAvatar: string;
  mediaUrl: string;
  timestamp: string;
  isSeen?: boolean;
}
