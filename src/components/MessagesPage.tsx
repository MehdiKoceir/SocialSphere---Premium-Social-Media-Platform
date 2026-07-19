import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Message } from '../types';
import { Send, Mic, Play, Pause, CheckCheck, Compass, MessageSquare, ShieldAlert } from 'lucide-react';
import { inkPressAudio } from '../utils/audio';

interface MessagesPageProps {
  currentUser: User;
  users: User[];
}

export default function MessagesPage({ currentUser, users }: MessagesPageProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(
    users.find(u => u.id !== currentUser.id) || null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isPlayingVoiceId, setIsPlayingVoiceId] = useState<string | null>(null);
  
  const bottomRef = useRef<HTMLDivElement>(null);

  // Filter out current user from sidebar threads
  const threads = users.filter(u => u.id !== currentUser.id);

  // Fetch messages between user1 and user2
  const fetchMessages = async () => {
    if (!selectedUser) return;
    try {
      const res = await fetch(`/api/messages?user1=${currentUser.id}&user2=${selectedUser.id}`);
      if (res.ok) {
        const fetched: Message[] = await res.json();
        setMessages(fetched);
        
        // Mark as seen
        await fetch('/api/messages/seen', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ senderId: selectedUser.id, receiverId: currentUser.id })
        });
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Poll messages
    return () => clearInterval(interval);
  }, [selectedUser]);

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedUser) return;
    
    const text = messageInput.trim();
    setMessageInput('');
    inkPressAudio.playBell();

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUser.id,
          receiverId: selectedUser.id,
          content: text
        })
      });

      if (res.ok) {
        const newMsg = await res.json();
        setMessages(prev => [...prev, newMsg]);

        // Trigger a cute simulated response from AI or user
        triggerSimulatedResponse();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendVoiceNote = async () => {
    if (!selectedUser) return;
    inkPressAudio.playBell();

    // Create seed waveform
    const waveform = Array.from({ length: 20 }, () => Math.floor(Math.random() * 80) + 10);
    const duration = `0:0${Math.floor(Math.random() * 6) + 4}`;

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUser.id,
          receiverId: selectedUser.id,
          content: 'Sent a voice monograph.',
          isVoiceNote: true,
          voiceDuration: duration,
          voiceWaveform: waveform
        })
      });

      if (res.ok) {
        const newMsg = await res.json();
        setMessages(prev => [...prev, newMsg]);
        triggerSimulatedResponse();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const triggerSimulatedResponse = () => {
    setIsTyping(true);
    setTimeout(async () => {
      setIsTyping(false);
      if (!selectedUser) return;

      const seedResponses = [
        "Core parameters received. I will commit these requirements to our next codebase revision.",
        "Understood! Let's integrate this design system and push to production on Monday.",
        "Excellent details, thank you. Pushing the shader compiling updates to the main channel.",
        "This sounds flawless. Let's schedule a brief sync to review the layout grids soon."
      ];
      const randomResponse = seedResponses[Math.floor(Math.random() * seedResponses.length)];

      try {
        const res = await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            senderId: selectedUser.id,
            receiverId: currentUser.id,
            content: randomResponse
          })
        });

        if (res.ok) {
          const incomingMsg = await res.json();
          setMessages(prev => [...prev, incomingMsg]);
          inkPressAudio.playBell();
        }
      } catch (err) {
        console.error(err);
      }
    }, 3000);
  };

  const toggleVoicePlayback = (id: string) => {
    inkPressAudio.playClack();
    if (isPlayingVoiceId === id) {
      setIsPlayingVoiceId(null);
    } else {
      setIsPlayingVoiceId(id);
      // Automatically stop after 3 seconds
      setTimeout(() => {
        setIsPlayingVoiceId(null);
      }, 3500);
    }
  };

  return (
    <div className="flex-1 glass-panel rounded-2xl border border-zinc-800/80 min-h-[550px] flex overflow-hidden">
      {/* Threads Sidebar */}
      <div className="w-64 border-r border-zinc-800/80 flex flex-col bg-zinc-950/30">
        <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between">
          <span className="font-sans font-extrabold text-xs tracking-tight text-zinc-100 flex items-center gap-1.5">
            <MessageSquare size={14} className="text-cyber-blue" />
            Direct Relays
          </span>
          <span className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest">
            Nodes
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
          {threads.map(user => {
            const isSelected = selectedUser?.id === user.id;
            return (
              <button
                key={user.id}
                onClick={() => {
                  inkPressAudio.playClack();
                  setSelectedUser(user);
                }}
                className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all cursor-pointer relative ${
                  isSelected 
                    ? 'bg-zinc-900 border border-zinc-800 text-zinc-100' 
                    : 'hover:bg-zinc-900/30 text-zinc-400 hover:text-zinc-200 border border-transparent'
                }`}
              >
                {/* Online Indicator */}
                {user.isOnline && (
                  <div className="absolute bottom-3 left-9 w-2 h-2 rounded-full bg-cyber-green border-2 border-black" />
                )}

                <img
                  src={user.avatar}
                  alt={user.displayName}
                  className="w-8 h-8 rounded-lg object-cover border border-zinc-800"
                />

                <div className="flex-1 flex flex-col overflow-hidden">
                  <span className="font-sans font-bold text-xs">
                    {user.displayName}
                  </span>
                  <span className="font-sans text-[10px] text-zinc-500 truncate">
                    {user.statusText || `@${user.username}`}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Messages Chat Timeline */}
      <div className="flex-1 flex flex-col bg-zinc-950/10">
        {selectedUser ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-950/20 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <img
                  src={selectedUser.avatar}
                  alt={selectedUser.displayName}
                  className="w-9 h-9 rounded-lg object-cover border border-zinc-800"
                />
                <div className="flex flex-col">
                  <span className="font-sans font-bold text-xs text-zinc-100">
                    {selectedUser.displayName}
                  </span>
                  <span className="font-mono text-[9px] text-cyber-green flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyber-green animate-pulse" />
                    {selectedUser.isOnline ? 'ONLINE' : 'OFFLINE'}
                    {selectedUser.statusText && <span className="text-zinc-500">• {selectedUser.statusText}</span>}
                  </span>
                </div>
              </div>
              <span className="font-mono text-[8px] text-zinc-500">
                THREAD_ID: {selectedUser.id.toUpperCase()}_RPC
              </span>
            </div>

            {/* Chat viewport */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
              {messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40 p-8">
                  <MessageSquare size={32} className="text-zinc-600 mb-2" />
                  <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">Initialize Encrypted Telemetry Thread</p>
                </div>
              ) : (
                messages.map(msg => {
                  const isMe = msg.senderId === currentUser.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col max-w-[70%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}
                    >
                      <div
                        className={`p-3.5 rounded-2xl relative ${
                          isMe
                            ? 'bg-gradient-to-tr from-cyber-blue to-cyan-700 text-black font-sans text-xs rounded-tr-none'
                            : 'bg-zinc-900 border border-zinc-800 text-zinc-200 font-sans text-xs rounded-tl-none'
                        }`}
                      >
                        {msg.isVoiceNote ? (
                          <div className="flex items-center gap-3 min-w-[180px]">
                            <button
                              onClick={() => toggleVoicePlayback(msg.id)}
                              className={`w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                                isMe ? 'bg-black text-cyber-blue' : 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700'
                              }`}
                            >
                              {isPlayingVoiceId === msg.id ? (
                                <Pause size={12} className="fill-current" />
                              ) : (
                                <Play size={12} className="fill-current ml-0.5" />
                              )}
                            </button>

                            {/* Custom Waves */}
                            <div className="flex-1 flex items-end gap-0.5 h-6">
                              {(msg.voiceWaveform || [20, 40, 60, 20, 80, 40, 10, 50, 20]).map((h, i) => (
                                <div
                                  key={i}
                                  style={{ height: `${h}%` }}
                                  className={`w-[2px] rounded-full ${
                                    isPlayingVoiceId === msg.id
                                      ? 'voice-bar bg-white'
                                      : isMe ? 'bg-zinc-950/80' : 'bg-zinc-700'
                                  }`}
                                />
                              ))}
                            </div>

                            <span className={`font-mono text-[9px] ${isMe ? 'text-zinc-950' : 'text-zinc-500'}`}>
                              {msg.voiceDuration || '0:05'}
                            </span>
                          </div>
                        ) : (
                          <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        )}
                      </div>

                      {/* Msg Details */}
                      <div className="flex items-center gap-1.5 mt-1 font-mono text-[8px] text-zinc-500">
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {isMe && (
                          <span className={msg.isSeen ? 'text-cyber-green' : 'text-zinc-600'}>
                            <CheckCheck size={11} />
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}

              {/* Typing simulation */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 self-start p-3 bg-zinc-900 border border-zinc-800 rounded-xl"
                  >
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyber-blue animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-cyber-blue animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-cyber-blue animate-bounce [animation-delay:0.4s]" />
                    </div>
                    <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest">Node is typing</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={bottomRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-zinc-800/80 bg-zinc-950/20 flex items-center gap-3">
              <button
                type="button"
                onClick={handleSendVoiceNote}
                className="p-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-xl text-zinc-300 hover:text-cyber-blue transition-all cursor-pointer"
                title="Send Voice Monograph"
              >
                <Mic size={16} />
              </button>

              <input
                type="text"
                placeholder={`Transmit message to ${selectedUser.displayName.split(' ')[0]}...`}
                value={messageInput}
                onChange={e => {
                  setMessageInput(e.target.value);
                  inkPressAudio.playClack();
                }}
                className="flex-1 px-4 py-3 bg-zinc-950/90 border border-zinc-800 focus:border-cyber-blue rounded-xl text-xs text-zinc-200 focus:outline-none transition-all placeholder-zinc-600 font-sans"
              />

              <button
                type="submit"
                className="p-3 bg-zinc-100 hover:bg-zinc-200 text-black rounded-xl transition-all cursor-pointer"
              >
                <Send size={15} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
            <MessageSquare size={40} className="text-zinc-600 mb-2" />
            <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest">Select an active node to establish sync</p>
          </div>
        )}
      </div>
    </div>
  );
}
