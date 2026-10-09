import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Hash, Users, Sparkles, RefreshCw, User, ShieldCheck, Crown } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';

export default function ChatRoom({ currentUser, teams = [] }) {
  const [selectedChannel, setSelectedChannel] = useState('general'); // 'general' or team_id
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  // Poll for live chat updates every 3 seconds
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [selectedChannel]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/chat?team_id=${selectedChannel}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error('Failed to load chat messages', err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setSending(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: currentUser.id,
          sender_name: currentUser.name,
          sender_role: currentUser.role,
          sender_avatar: currentUser.avatar_color,
          team_id: selectedChannel,
          message: text.trim()
        })
      });

      if (res.ok) {
        setText('');
        await fetchMessages();
      }
    } catch (err) {
      console.error('Failed to send message', err);
    } finally {
      setSending(false);
    }
  };

  const activeChannelName = selectedChannel === 'general'
    ? 'General Company Lounge'
    : teams.find(t => t.id === selectedChannel)?.name || 'Team Channel';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row h-[75vh]">
      
      {/* Sidebar: Channel List */}
      <div className="w-full md:w-64 bg-slate-950/80 border-b md:border-b-0 md:border-r border-slate-800 p-4 flex flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-4 px-2">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-white text-sm">Aruvixa Chat Channels</h3>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => setSelectedChannel('general')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                selectedChannel === 'general'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-indigo-300" />
                <span>General Lounge</span>
              </div>
              <span className="text-[10px] bg-slate-900/60 px-2 py-0.5 rounded text-indigo-300">All</span>
            </button>

            {teams.length > 0 && (
              <div className="pt-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 block mb-2">
                  Team Channels
                </span>
                {teams.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedChannel(t.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                      selectedChannel === t.id
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Hash className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span className="truncate">{t.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* User Status Bar */}
        <div className="pt-4 border-t border-slate-800/80 flex items-center gap-2 px-2 text-xs">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-white"
            style={{ backgroundColor: currentUser.avatar_color || '#4F46E5' }}
          >
            {currentUser.name.charAt(0)}
          </div>
          <div className="truncate">
            <span className="font-semibold text-white block truncate">{currentUser.name}</span>
            <span className="text-[10px] text-slate-400 block font-mono">{currentUser.access_code}</span>
          </div>
        </div>
      </div>

      {/* Main Chat Box */}
      <div className="flex-1 flex flex-col bg-slate-900/50 justify-between overflow-hidden">
        
        {/* Chat Header */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hash className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="font-bold text-white text-sm">{activeChannelName}</h2>
              <p className="text-[11px] text-slate-400">Live team chat channel • Polling active</p>
            </div>
          </div>
          <button
            onClick={fetchMessages}
            title="Refresh Messages"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              <p className="text-xs">No messages in this channel yet. Be the first to start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender_id === currentUser.id;
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isMe ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-md"
                    style={{ backgroundColor: msg.sender_avatar || '#4F46E5' }}
                  >
                    {msg.sender_name.charAt(0)}
                  </div>

                  <div className={`max-w-[75%] ${isMe ? 'items-end text-right' : 'items-start'}`}>
                    <div className="flex items-center gap-2 mb-1 text-[11px]">
                      <span className="font-bold text-slate-200">{msg.sender_name}</span>
                      {msg.sender_code && (
                        <span className="font-mono text-[10px] text-amber-400/80 bg-amber-500/10 px-1 rounded">
                          {msg.sender_code}
                        </span>
                      )}
                      <span className="text-slate-500 text-[10px]">
                        {formatDistanceToNow(parseISO(msg.created_at))} ago
                      </span>
                    </div>

                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed inline-block ${
                        isMe
                          ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
                          : 'bg-slate-950 border border-slate-800 text-slate-200'
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Bar */}
        <form onSubmit={handleSend} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Message #${activeChannelName}...`}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={sending || !text.trim()}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-xs font-semibold shadow-md transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>

      </div>

    </div>
  );
}
