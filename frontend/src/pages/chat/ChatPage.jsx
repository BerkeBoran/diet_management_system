import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import chatService from '../../services/chatService';
import { useAuth } from '../../contexts/useAuth.js';
import LoadingSpinner from '../../components/LoadingSpinner';
import { HiOutlinePaperAirplane, HiOutlineChatBubbleLeftRight } from 'react-icons/hi2';

export default function ChatPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialRoom = searchParams.get('room');

  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [chatUser, setChatUser] = useState(null);
  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);

  const selectRoom = useCallback(async (roomId) => {
    setSelectedRoom(roomId);
    try {
      const detail = await chatService.getChatRoomDetail(roomId);
      setMessages(detail.messages || []);
      setChatUser(detail.chat_user);
    } catch { /* silent */ }

    // Close existing WS
    if (wsRef.current) {
      wsRef.current.close();
    }

    // Open new WS
    const ws = chatService.connectWebSocket(roomId);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.message) {
        setMessages((prev) => [...prev, {
          id: data.message_id,
          content: data.message,
          sender_id: data.sender_id,
          sender_name: data.sender_name,
          timestamp: data.timestamp,
          is_read: data.is_read,
          is_mine: data.sender_id === Number(user?.id),
        }]);
      }
    };
    wsRef.current = ws;
  }, [user?.id]);

  // Fetch rooms
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const data = await chatService.getChatRooms();
        const list = Array.isArray(data) ? data : data?.results || [];
        setRooms(list);
        if (initialRoom) {
          const room = list.find((r) => r.id === Number(initialRoom));
          if (room) {
            await selectRoom(room.id);
          }
        }
      } catch { /* silent */ }
      setLoading(false);
    };
    fetchRooms();
  }, [initialRoom, selectRoom]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim() || !wsRef.current) return;
    wsRef.current.send(JSON.stringify({ message: newMessage }));
    setNewMessage('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Cleanup WS on unmount
  useEffect(() => {
    return () => wsRef.current?.close();
  }, []);

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="animate-fade-in h-[calc(100vh-2rem)] lg:h-[calc(100vh-2rem)] flex gap-4">
      {/* Room List */}
      <div className={`${selectedRoom ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 shrink-0 glass rounded-2xl overflow-hidden`}>
        <div className="p-4 border-b border-white/5">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <HiOutlineChatBubbleLeftRight className="w-5 h-5 text-emerald-400" /> Mesajlar
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {rooms.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-sm">Henüz mesajınız yok.</div>
          ) : (
            rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => selectRoom(room.id)}
                className={`w-full p-4 text-left transition-all hover:bg-white/5 border-b border-white/5 ${selectedRoom === room.id ? 'bg-emerald-500/10 border-l-2 border-l-emerald-500' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {room.chat_user?.full_name?.[0] || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-white text-sm truncate">
                        {room.chat_user?.title ? `${room.chat_user.title} ` : ''}{room.chat_user?.full_name || 'Kullanıcı'}
                      </p>
                      {room.unread_message_count > 0 && (
                        <span className="w-5 h-5 bg-emerald-500 text-white text-xs rounded-full flex items-center justify-center">{room.unread_message_count}</span>
                      )}
                    </div>
                    {room.last_message && (
                      <p className="text-xs text-slate-500 truncate mt-0.5">{room.last_message.content}</p>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`${selectedRoom ? 'flex' : 'hidden md:flex'} flex-1 flex-col glass rounded-2xl overflow-hidden`}>
        {selectedRoom ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-white/5 flex items-center gap-3">
              <button onClick={() => setSelectedRoom(null)} className="md:hidden text-slate-400 hover:text-white mr-1">←</button>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-bold text-sm">
                {chatUser?.full_name?.[0] || '?'}
              </div>
              <div>
                <p className="font-semibold text-white text-sm">
                  {chatUser?.title ? `${chatUser.title} ` : ''}{chatUser?.full_name || 'Kullanıcı'}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.is_mine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${msg.is_mine
                    ? 'bg-emerald-500 text-white rounded-br-md'
                    : 'bg-slate-800/80 text-slate-200 rounded-bl-md'
                  }`}>
                    {!msg.is_mine && <p className="text-xs font-medium text-emerald-400 mb-1">{msg.sender_name}</p>}
                    <p>{msg.content}</p>
                    <p className={`text-xs mt-1 ${msg.is_mine ? 'text-emerald-200/70' : 'text-slate-500'}`}>{msg.timestamp}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/5">
              <div className="flex gap-2">
                <input
                  id="chat-input"
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Mesajınızı yazın..."
                  className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500/50 transition-all"
                />
                <button onClick={sendMessage} disabled={!newMessage.trim()} className="px-4 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl transition-all disabled:opacity-50">
                  <HiOutlinePaperAirplane className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <HiOutlineChatBubbleLeftRight className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Bir sohbet seçin</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
