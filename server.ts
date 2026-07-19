import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { User, Post, Comment, Message, Notification, Story } from './src/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'db.json');

// Initialize Express app
const app = express();
app.use(express.json());

// Helper to get raw data
const getInitialData = () => {
  const initialUsers: User[] = [
    {
      id: 'alice',
      username: 'alice_vance',
      displayName: 'Alice Vance',
      bio: 'Lead UI/UX Designer @Linear. crafting pixel-perfect micro-interactions, dark mode systems, and responsive layouts. Let’s build the future together. 🚀⚡',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
      background: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
      followers: ['bob', 'clara', 'devon'],
      following: ['bob', 'devon'],
      joinedDate: 'May 2025',
      isOnline: true,
      statusText: 'Designing layout grids 📐'
    },
    {
      id: 'bob',
      username: 'bob_miller',
      displayName: 'Bob Miller',
      bio: 'Senior Full Stack Architect. Optimized distributed servers, WebSockets, and database indexing. React, NodeJS, and TypeScript enthusiast. Powered by single-origin espresso. ☕💻',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      background: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&auto=format&fit=crop&q=80',
      followers: ['alice', 'devon'],
      following: ['alice', 'clara'],
      joinedDate: 'Jan 2025',
      isOnline: true,
      statusText: 'Reviewing pull requests 🔍'
    },
    {
      id: 'clara',
      username: 'clara_smith',
      displayName: 'Clara Smith',
      bio: 'Travel Photographer & Creative Director. Documenting natural wonders, architecture, and moody cyberpunk cityscapes. Adventure is out there! 🗻📸🌌',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop&q=80',
      background: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
      followers: ['bob'],
      following: ['alice', 'bob'],
      joinedDate: 'Mar 2026',
      isOnline: false,
      statusText: 'In transit ✈️'
    },
    {
      id: 'devon',
      username: 'devon_creates',
      displayName: 'Devon Jones',
      bio: '3D Procedural Artist & Indie Game Developer. Shader code enthusiast, WebGL experiments, and immersive physics-based animations. 🎮🎨🌀',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80',
      background: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&auto=format&fit=crop&q=80',
      followers: ['alice'],
      following: ['alice', 'bob'],
      joinedDate: 'Oct 2025',
      isOnline: true,
      statusText: 'Compiling shaders... 🔥'
    }
  ];

  const initialPosts: Post[] = [
    {
      id: 'post-1',
      userId: 'bob',
      username: 'bob_miller',
      userDisplayName: 'Bob Miller',
      userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      content: 'Just deployed the new Vite 6 server module to staging. The hot reload performance is outstanding and compile sizes dropped by 18% with smart tree-shaking configurations. Highly recommend checking out the new rollup-plugin pipeline! ⚡🔥',
      mediaUrls: [
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=800&auto=format&fit=crop&q=80'
      ],
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
      likes: ['alice', 'clara'],
      saves: ['alice'],
      reactions: {
        "🚀": ["alice", "devon"],
        "🔥": ["clara"]
      },
      tags: ['coding', 'vite', 'developer'],
      comments: [
        {
          id: 'comment-11',
          postId: 'post-1',
          userId: 'alice',
          username: 'alice_vance',
          userDisplayName: 'Alice Vance',
          userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
          content: 'This is incredible speed! Did you configure custom chunk splits for heavy dependencies?',
          timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString()
        }
      ]
    },
    {
      id: 'post-2',
      userId: 'clara',
      username: 'clara_smith',
      userDisplayName: 'Clara Smith',
      userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop&q=80',
      content: 'Chasing the perfect blue hour in Neo-Tokyo. The neon reflections off the asphalt after a light autumn rain create the ultimate cyberpunk mood. 🌃🇯🇵✨',
      mediaUrls: [
        'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=80'
      ],
      timestamp: new Date(Date.now() - 3600000 * 8).toISOString(), // 8 hours ago
      likes: ['bob', 'alice', 'devon'],
      saves: ['bob'],
      reactions: {
        "😍": ["alice", "bob"],
        "📸": ["devon"]
      },
      tags: ['photography', 'tokyo', 'cyberpunk'],
      comments: [
        {
          id: 'comment-21',
          postId: 'post-2',
          userId: 'devon',
          username: 'devon_creates',
          userDisplayName: 'Devon Jones',
          userAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80',
          content: 'The depth of field is flawless here Clara! What focal length did you use for this shot?',
          timestamp: new Date(Date.now() - 3600000 * 7).toISOString()
        }
      ]
    },
    {
      id: 'post-3',
      userId: 'alice',
      username: 'alice_vance',
      userDisplayName: 'Alice Vance',
      userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
      content: 'Quick note on premium dark theme interfaces: A true premium UI shouldn\'t be pure black. Use depth mapping with subtle indigo and slate shifts (e.g. #09090b to #18181b), layer glassmorphism with radial borders, and use high-contrast emerald or royal blue for core telemetry alerts. Precision is the ultimate differentiator! 🎨🖤✨',
      timestamp: new Date(Date.now() - 3600000 * 16).toISOString(),
      likes: ['bob', 'devon'],
      saves: [],
      reactions: {
        "📐": ["bob"],
        "🚀": ["devon"]
      },
      tags: ['design', 'uiux', 'startup'],
      comments: []
    }
  ];

  const initialMessages: Message[] = [
    {
      id: 'msg-1',
      senderId: 'bob',
      receiverId: 'alice',
      content: 'Hey Alice! Did you have a chance to look at the dashboard mockups I pushed to GitHub?',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      isSeen: true
    },
    {
      id: 'msg-2',
      senderId: 'alice',
      receiverId: 'bob',
      content: 'Yes Bob! They look extremely polished. I love the glassmorphic analytics widgets. I think we should add a small sparkline chart for daily views as well.',
      timestamp: new Date(Date.now() - 5400000).toISOString(),
      isSeen: true
    },
    {
      id: 'msg-3',
      senderId: 'bob',
      receiverId: 'alice',
      content: 'That is a fantastic idea. Let me code a custom SVG Sparkline that pulls from our database metrics. Check out this draft voice note of how we can pitch it!',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      isSeen: true,
      isVoiceNote: true,
      voiceDuration: '0:12',
      voiceWaveform: [20, 45, 12, 80, 50, 34, 90, 44, 23, 76, 12, 45, 87, 54, 10, 32, 65, 87, 23, 11]
    }
  ];

  const initialNotifications: Notification[] = [
    {
      id: 'notif-1',
      userId: 'alice',
      senderId: 'bob',
      senderName: 'Bob Miller',
      senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      type: 'like',
      postId: 'post-3',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      isRead: false,
      detailText: 'liked your monograph on premium dark themes.'
    },
    {
      id: 'notif-2',
      userId: 'alice',
      senderId: 'clara',
      senderName: 'Clara Smith',
      senderAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop&q=80',
      type: 'comment',
      postId: 'post-3',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      isRead: true,
      detailText: 'commented: "Exactly what we needed! Incorporating this into the print catalog layout."'
    },
    {
      id: 'notif-3',
      userId: 'alice',
      senderId: 'devon',
      senderName: 'Devon Jones',
      senderAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80',
      type: 'follow',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      isRead: true,
      detailText: 'started following your architectural designs.'
    }
  ];

  const initialStories: Story[] = [
    {
      id: 'story-1',
      userId: 'alice',
      username: 'alice_vance',
      userDisplayName: 'Alice Vance',
      userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
      mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
      timestamp: new Date(Date.now() - 3600000 * 3).toISOString()
    },
    {
      id: 'story-2',
      userId: 'clara',
      username: 'clara_smith',
      userDisplayName: 'Clara Smith',
      userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop&q=80',
      mediaUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
      timestamp: new Date(Date.now() - 3600000 * 1).toISOString()
    },
    {
      id: 'story-3',
      userId: 'devon',
      username: 'devon_creates',
      userDisplayName: 'Devon Jones',
      userAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80',
      mediaUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&auto=format&fit=crop&q=80',
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString()
    }
  ];

  return { 
    users: initialUsers, 
    posts: initialPosts, 
    messages: initialMessages, 
    notifications: initialNotifications,
    stories: initialStories
  };
};

// Database persistence helpers
const loadDB = () => {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading database file:', err);
  }
  const defaultData = getInitialData();
  saveDB(defaultData);
  return defaultData;
};

const saveDB = (data: any) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing database file:', err);
  }
};

// GET all users
app.get('/api/users', (req, res) => {
  const db = loadDB();
  res.json(db.users || []);
});

// GET single user profile
app.get('/api/users/:id', (req, res) => {
  const db = loadDB();
  const user = (db.users || []).find((u: User) => u.id === req.params.id);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// POST to create or update a user profile
app.post('/api/users', (req, res) => {
  const db = loadDB();
  const { id, username, displayName, bio, avatar, background, statusText } = req.body;

  if (!username || !displayName) {
    return res.status(400).json({ error: 'Username and display name are required' });
  }

  const existingIndex = (db.users || []).findIndex((u: User) => u.id === id);

  if (existingIndex !== -1) {
    // Update
    db.users[existingIndex] = {
      ...db.users[existingIndex],
      username,
      displayName,
      bio: bio ?? db.users[existingIndex].bio,
      avatar: avatar ?? db.users[existingIndex].avatar,
      background: background ?? db.users[existingIndex].background,
      statusText: statusText ?? db.users[existingIndex].statusText,
    };
    
    // Update user details in posts, comments, stories, etc. made by this user
    (db.posts || []).forEach((p: Post) => {
      if (p.userId === id) {
        p.username = username;
        p.userDisplayName = displayName;
        if (avatar) p.userAvatar = avatar;
      }
      (p.comments || []).forEach((c: Comment) => {
        if (c.userId === id) {
          c.username = username;
          c.userDisplayName = displayName;
          if (avatar) c.userAvatar = avatar;
        }
      });
    });

    (db.stories || []).forEach((s: Story) => {
      if (s.userId === id) {
        s.username = username;
        s.userDisplayName = displayName;
        if (avatar) s.userAvatar = avatar;
      }
    });

    saveDB(db);
    res.json(db.users[existingIndex]);
  } else {
    // Create new
    const newUser: User = {
      id: id || username.toLowerCase().replace(/\s+/g, '_'),
      username,
      displayName,
      bio: bio || '',
      avatar: avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80`,
      background: background || 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&auto=format&fit=crop&q=80',
      followers: [],
      following: [],
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      isOnline: true,
      statusText: 'New User 👋'
    };
    db.users.push(newUser);
    saveDB(db);
    res.status(201).json(newUser);
  }
});

// GET all posts
app.get('/api/posts', (req, res) => {
  const db = loadDB();
  const sortedPosts = [...(db.posts || [])].sort((a: Post, b: Post) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  res.json(sortedPosts);
});

// POST to create a new post
app.post('/api/posts', (req, res) => {
  const db = loadDB();
  const { userId, content, mediaUrls, videoUrl, tags } = req.body;

  if (!userId || !content) {
    return res.status(400).json({ error: 'User ID and content are required' });
  }

  const user = (db.users || []).find((u: User) => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const newPost: Post = {
    id: `post-${Date.now()}`,
    userId: user.id,
    username: user.username,
    userDisplayName: user.displayName,
    userAvatar: user.avatar,
    content,
    mediaUrls: mediaUrls || [],
    videoUrl: videoUrl || undefined,
    timestamp: new Date().toISOString(),
    likes: [],
    saves: [],
    reactions: {},
    tags: tags || [],
    comments: []
  };

  db.posts.push(newPost);
  saveDB(db);
  res.status(201).json(newPost);
});

// POST to toggle like on a post
app.post('/api/posts/:id/like', (req, res) => {
  const db = loadDB();
  const { userId } = req.body;
  const postId = req.params.id;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const post = (db.posts || []).find((p: Post) => p.id === postId);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  const likeIndex = post.likes.indexOf(userId);
  if (likeIndex !== -1) {
    post.likes.splice(likeIndex, 1);
  } else {
    post.likes.push(userId);

    // Create notification if target is someone else
    if (post.userId !== userId) {
      const user = (db.users || []).find((u: User) => u.id === userId);
      const newNotif: Notification = {
        id: `notif-${Date.now()}`,
        userId: post.userId,
        senderId: userId,
        senderName: user ? user.displayName : 'Someone',
        senderAvatar: user ? user.avatar : '',
        type: 'like',
        postId: postId,
        timestamp: new Date().toISOString(),
        isRead: false,
        detailText: 'liked your premium post.'
      };
      db.notifications = db.notifications || [];
      db.notifications.push(newNotif);
    }
  }

  saveDB(db);
  res.json(post);
});

// POST to toggle save on a post
app.post('/api/posts/:id/save', (req, res) => {
  const db = loadDB();
  const { userId } = req.body;
  const postId = req.params.id;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const post = (db.posts || []).find((p: Post) => p.id === postId);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  post.saves = post.saves || [];
  const saveIndex = post.saves.indexOf(userId);
  if (saveIndex !== -1) {
    post.saves.splice(saveIndex, 1);
  } else {
    post.saves.push(userId);
  }

  saveDB(db);
  res.json(post);
});

// POST to add emoji reaction
app.post('/api/posts/:id/react', (req, res) => {
  const db = loadDB();
  const { userId, emoji } = req.body;
  const postId = req.params.id;

  if (!userId || !emoji) {
    return res.status(400).json({ error: 'User ID and emoji are required' });
  }

  const post = (db.posts || []).find((p: Post) => p.id === postId);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  post.reactions = post.reactions || {};
  
  // Remove user's previous reaction in any emoji if they exist
  Object.keys(post.reactions).forEach(emo => {
    post.reactions![emo] = (post.reactions![emo] || []).filter(uid => uid !== userId);
    if (post.reactions![emo].length === 0) {
      delete post.reactions![emo];
    }
  });

  // Add new reaction
  if (!post.reactions[emoji]) {
    post.reactions[emoji] = [];
  }
  post.reactions[emoji].push(userId);

  // Send reaction notification
  if (post.userId !== userId) {
    const user = (db.users || []).find((u: User) => u.id === userId);
    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      userId: post.userId,
      senderId: userId,
      senderName: user ? user.displayName : 'Someone',
      senderAvatar: user ? user.avatar : '',
      type: 'reaction',
      postId: postId,
      timestamp: new Date().toISOString(),
      isRead: false,
      detailText: `reacted ${emoji} to your post.`
    };
    db.notifications = db.notifications || [];
    db.notifications.push(newNotif);
  }

  saveDB(db);
  res.json(post);
});

// POST to comment on a post
app.post('/api/posts/:id/comments', (req, res) => {
  const db = loadDB();
  const { userId, content } = req.body;
  const postId = req.params.id;

  if (!userId || !content) {
    return res.status(400).json({ error: 'User ID and content are required' });
  }

  const user = (db.users || []).find((u: User) => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const post = (db.posts || []).find((p: Post) => p.id === postId);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  const newComment: Comment = {
    id: `comment-${Date.now()}`,
    postId,
    userId: user.id,
    username: user.username,
    userDisplayName: user.displayName,
    userAvatar: user.avatar,
    content,
    timestamp: new Date().toISOString()
  };

  post.comments = post.comments || [];
  post.comments.push(newComment);

  // Create notification if comment is by someone else
  if (post.userId !== userId) {
    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      userId: post.userId,
      senderId: userId,
      senderName: user.displayName,
      senderAvatar: user.avatar,
      type: 'comment',
      postId: postId,
      timestamp: new Date().toISOString(),
      isRead: false,
      detailText: `commented: "${content.substring(0, 40)}${content.length > 40 ? '...' : ''}"`
    };
    db.notifications = db.notifications || [];
    db.notifications.push(newNotif);
  }

  saveDB(db);
  res.status(201).json(post);
});

// POST to follow/unfollow a user
app.post('/api/users/:id/follow', (req, res) => {
  const db = loadDB();
  const { currentUserId } = req.body;
  const targetUserId = req.params.id;

  if (!currentUserId) {
    return res.status(400).json({ error: 'Current User ID is required' });
  }

  if (currentUserId === targetUserId) {
    return res.status(400).json({ error: 'You cannot follow yourself' });
  }

  const currentUser = (db.users || []).find((u: User) => u.id === currentUserId);
  const targetUser = (db.users || []).find((u: User) => u.id === targetUserId);

  if (!currentUser || !targetUser) {
    return res.status(404).json({ error: 'User not found' });
  }

  currentUser.following = currentUser.following || [];
  targetUser.followers = targetUser.followers || [];

  const followingIndex = currentUser.following.indexOf(targetUserId);
  const followerIndex = targetUser.followers.indexOf(currentUserId);

  let isFollowed = false;
  if (followingIndex !== -1) {
    // Unfollow
    currentUser.following.splice(followingIndex, 1);
    if (followerIndex !== -1) {
      targetUser.followers.splice(followerIndex, 1);
    }
  } else {
    // Follow
    currentUser.following.push(targetUserId);
    targetUser.followers.push(currentUserId);
    isFollowed = true;

    // Create follow notification
    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      userId: targetUserId,
      senderId: currentUserId,
      senderName: currentUser.displayName,
      senderAvatar: currentUser.avatar,
      type: 'follow',
      timestamp: new Date().toISOString(),
      isRead: false,
      detailText: 'started following you.'
    };
    db.notifications = db.notifications || [];
    db.notifications.push(newNotif);
  }

  saveDB(db);
  res.json({ currentUser, targetUser });
});

// DELETE a post
app.delete('/api/posts/:id', (req, res) => {
  const db = loadDB();
  const postId = req.params.id;
  const { userId } = req.body;

  const postIndex = (db.posts || []).findIndex((p: Post) => p.id === postId);
  if (postIndex === -1) {
    return res.status(404).json({ error: 'Post not found' });
  }

  const post = db.posts[postIndex];
  if (post.userId !== userId) {
    return res.status(403).json({ error: 'You can only delete your own posts' });
  }

  db.posts.splice(postIndex, 1);
  saveDB(db);
  res.json({ success: true, message: 'Post deleted' });
});

// --- MESSAGES API ---
// GET direct messages
app.get('/api/messages', (req, res) => {
  const db = loadDB();
  const { user1, user2 } = req.query;

  if (!user1 || !user2) {
    return res.status(400).json({ error: 'User1 and User2 IDs are required' });
  }

  const chatMessages = (db.messages || []).filter((m: Message) => 
    (m.senderId === user1 && m.receiverId === user2) ||
    (m.senderId === user2 && m.receiverId === user1)
  ).sort((a: Message, b: Message) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  res.json(chatMessages);
});

// POST to send message
app.post('/api/messages', (req, res) => {
  const db = loadDB();
  const { senderId, receiverId, content, isVoiceNote, voiceDuration, voiceWaveform } = req.body;

  if (!senderId || !receiverId || !content) {
    return res.status(400).json({ error: 'Sender, Receiver, and Content are required' });
  }

  const sender = (db.users || []).find((u: User) => u.id === senderId);
  if (!sender) return res.status(404).json({ error: 'Sender not found' });

  const newMessage: Message = {
    id: `msg-${Date.now()}`,
    senderId,
    receiverId,
    content,
    timestamp: new Date().toISOString(),
    isSeen: false,
    isVoiceNote: !!isVoiceNote,
    voiceDuration: voiceDuration || undefined,
    voiceWaveform: voiceWaveform || undefined
  };

  db.messages = db.messages || [];
  db.messages.push(newMessage);

  // Send real-time notification
  const newNotif: Notification = {
    id: `notif-${Date.now()}`,
    userId: receiverId,
    senderId: senderId,
    senderName: sender.displayName,
    senderAvatar: sender.avatar,
    type: 'message',
    timestamp: new Date().toISOString(),
    isRead: false,
    detailText: isVoiceNote ? 'sent you a voice note.' : `sent you a message: "${content.substring(0, 30)}${content.length > 30 ? '...' : ''}"`
  };
  db.notifications = db.notifications || [];
  db.notifications.push(newNotif);

  saveDB(db);
  res.status(201).json(newMessage);
});

// POST mark messages as seen
app.post('/api/messages/seen', (req, res) => {
  const db = loadDB();
  const { senderId, receiverId } = req.body;

  if (!senderId || !receiverId) {
    return res.status(400).json({ error: 'Sender and Receiver IDs are required' });
  }

  let updated = false;
  (db.messages || []).forEach((m: Message) => {
    if (m.senderId === senderId && m.receiverId === receiverId && !m.isSeen) {
      m.isSeen = true;
      updated = true;
    }
  });

  if (updated) {
    saveDB(db);
  }
  res.json({ success: true });
});

// --- STORIES API ---
// GET active stories
app.get('/api/stories', (req, res) => {
  const db = loadDB();
  // Filter stories younger than 24 hours
  const oneDayAgo = Date.now() - 3600000 * 24;
  const activeStories = (db.stories || []).filter((s: Story) => 
    new Date(s.timestamp).getTime() > oneDayAgo
  ).sort((a: Story, b: Story) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  res.json(activeStories);
});

// POST to create a story
app.post('/api/stories', (req, res) => {
  const db = loadDB();
  const { userId, mediaUrl } = req.body;

  if (!userId || !mediaUrl) {
    return res.status(400).json({ error: 'User ID and mediaUrl are required' });
  }

  const user = (db.users || []).find((u: User) => u.id === userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const newStory: Story = {
    id: `story-${Date.now()}`,
    userId: user.id,
    username: user.username,
    userDisplayName: user.displayName,
    userAvatar: user.avatar,
    mediaUrl,
    timestamp: new Date().toISOString()
  };

  db.stories = db.stories || [];
  db.stories.push(newStory);
  saveDB(db);
  res.status(201).json(newStory);
});

// --- NOTIFICATIONS API ---
// GET notifications
app.get('/api/notifications', (req, res) => {
  const db = loadDB();
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const userNotifs = (db.notifications || []).filter((n: Notification) => 
    n.userId === userId
  ).sort((a: Notification, b: Notification) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  res.json(userNotifs);
});

// POST to reset database to factory seeds
app.post('/api/db/reset', (req, res) => {
  const defaultData = getInitialData();
  saveDB(defaultData);
  res.json({ success: true, message: "Database reseeded successfully." });
});

// POST to mark notifications as read
app.post('/api/notifications/read', (req, res) => {
  const db = loadDB();
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  let updated = false;
  (db.notifications || []).forEach((n: Notification) => {
    if (n.userId === userId && !n.isRead) {
      n.isRead = true;
      updated = true;
    }
  });

  if (updated) {
    saveDB(db);
  }
  res.json({ success: true });
});


// Configure Vite development server / production static asset routing
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
