import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import chatService from '../../services/chatService';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

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
  const [search, setSearch] = useState('');

  // Fetch rooms
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const data = await chatService.getChatRooms();
        const list = Array.isArray(data) ? data : data?.results || [];
        setRooms(list);
        if (initialRoom) {
          const room = list.find((r) => r.id === Number(initialRoom));
          if (room) selectRoom(room.id);
        }
      } catch { /* silent */ }
      setLoading(false);
    };
    fetchRooms();
  }, []);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectRoom = async (roomId) => {
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
  };

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

  const filteredRooms = rooms.filter(r => {
    const term = search.toLowerCase();
    const name = (r.chat_user?.title ? `${r.chat_user.title} ` : '') + (r.chat_user?.full_name || 'Kullanıcı');
    return name.toLowerCase().includes(term);
  });

  if (loading) return <LoadingSpinner size="lg" className="min-h-[50vh]" />;

  return (
    <div className="animate-fade-in h-[calc(100vh-6rem)] md:h-[calc(100vh-2.5rem)] flex gap-4 max-w-[1400px] mx-auto pb-6">
      
      {/* Sidebar List */}
      <div className={`${selectedRoom ? 'hidden lg:flex' : 'flex'} flex-col w-full lg:w-[380px] shrink-0 bg-surface-container-lowest rounded-[2.5rem] shadow-[0px_12px_32px_rgba(23,29,27,0.06)] ghost-border overflow-hidden`}>
        <div className="p-8 border-b border-outline-variant/30">
          <h2 className="font-headline text-3xl font-extrabold text-on-surface mb-6 tracking-tight">İletişim</h2>
          
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
            <input 
              type="text" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              placeholder="Odalarda ara..." 
              className="w-full pl-12 pr-4 py-3.5 bg-surface-container-low border-none rounded-xl text-on-surface placeholder:text-outline-variant font-medium focus:ring-2 focus:ring-primary shadow-inner transition-all text-sm" 
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto no-scrollbar pb-4 p-4 space-y-2">
          {filteredRooms.length === 0 ? (
             <div className="text-center py-12">
               <span className="material-symbols-outlined text-outline-variant text-4xl mb-3">speaker_notes_off</span>
               <p className="text-on-surface-variant font-semibold text-sm">Mesaj kutunuz boş.</p>
             </div>
          ) : (
            filteredRooms.map((room) => {
              const isActive = selectedRoom === room.id;
              const titleName = room.chat_user?.title ? `${room.chat_user.title} ` : '';
              const fullName = room.chat_user?.full_name || 'Kullanıcı';
              const initial = fullName[0]?.toUpperCase() || '?';

              return (
                <button
                  key={room.id}
                  onClick={() => selectRoom(room.id)}
                  className={`w-full p-4 rounded-2xl text-left transition-all flex items-start gap-4 ${isActive ? 'bg-primary shadow-[0px_8px_16px_rgba(0,104,86,0.2)] text-white scale-[1.02]' : 'bg-transparent text-on-surface hover:bg-surface-container-high'}`}
                >
                  <div className={`relative w-12 h-12 rounded-[1rem] flex items-center justify-center font-headline font-bold text-lg shadow-sm shrink-0 ${isActive ? 'bg-white/20 text-white' : 'bg-primary-container/20 text-primary'}`}>
                    {initial}
                    {room.unread_message_count > 0 && !isActive && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-error border-2 border-surface-container-lowest rounded-full"></span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center justify-between mb-1">
                      <p className={`font-headline font-bold text-sm truncate pr-2 ${isActive ? 'text-white' : 'text-on-surface'}`}>
                        {titleName}{fullName}
                      </p>
                      {/* Optional Date placeholder */}
                      <span className={`text-[10px] font-bold uppercase tracking-widest shrink-0 ${isActive ? 'text-white/70' : 'text-outline'}`}>12:30</span>
                    </div>
                    <p className={`text-xs truncate ${isActive ? 'text-white/90 font-medium' : 'text-on-surface-variant'}`}>
                      {room.last_message?.content || 'Son mesaj eklenecek...'}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`${selectedRoom ? 'flex' : 'hidden lg:flex'} flex-1 flex-col bg-surface-container-lowest border border-outline-variant/30 lg:border-none rounded-[2.5rem] lg:shadow-[0px_12px_32px_rgba(23,29,27,0.06)] ghost-border overflow-hidden relative`}>
        {selectedRoom ? (
          <>
            {/* Chat Topbar */}
            <div className="px-6 py-5 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-lowest/80 backdrop-blur-md z-10">
              <div className="flex items-center gap-4">
                <button onClick={() => setSelectedRoom(null)} className="lg:hidden w-10 h-10 bg-surface-container-low rounded-xl flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white font-headline text-lg font-bold shadow-md">
                    {chatUser?.full_name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <h3 className="font-headline font-bold text-on-surface">
                      {chatUser?.title ? `${chatUser.title} ` : ''}{chatUser?.full_name || 'Kullanıcı'}
                    </h3>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-primary flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span> Çevrimiçi
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="w-10 h-10 bg-surface-container-low rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-colors flex items-center justify-center">
                   <span className="material-symbols-outlined text-[20px]">more_vert</span>
                </button>
              </div>
            </div>

            {/* Messages Flow */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-surface-container/20">
              <div className="text-center pb-4">
                <span className="bg-surface-container-high/50 text-on-surface-variant text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full backdrop-blur-sm">Sohbet Başlangıcı</span>
              </div>
              
              {messages.map((msg, index) => {
                const isMine = msg.is_mine;
                const showAvatar = index === messages.length - 1 || messages[index + 1]?.is_mine !== isMine;
                
                return (
                  <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} group`}>
                    <div className={`flex gap-3 max-w-[85%] sm:max-w-[70%] md:max-w-[60%] ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                      
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-lg shrink-0 mt-auto flex items-center justify-center font-bold text-xs ${isMine ? (showAvatar ? 'bg-primary text-white shadow-sm' : 'invisible') : (showAvatar ? 'bg-surface-container-high text-on-surface-variant shadow-sm' : 'invisible')}`}>
                        {isMine ? (user?.first_name?.[0] || 'U') : (chatUser?.full_name?.[0] || 'C')}
                      </div>

                      {/* Bubble */}
                      <div className={`relative px-5 py-3.5 shadow-sm text-[15px] leading-relaxed
                        ${isMine 
                          ? 'bg-primary text-white rounded-2xl rounded-br-sm' 
                          : 'bg-surface-container-lowest text-on-surface rounded-2xl rounded-bl-sm border border-outline-variant/20'
                        }`}
                      >
                        <p>{msg.content}</p>
                        <div className={`text-[9px] font-bold uppercase tracking-widest mt-2 text-right ${isMine ? 'text-white/60' : 'text-outline'}`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Composer */}
            <div className="p-4 sm:p-6 bg-surface-container-lowest border-t border-outline-variant/30">
              <div className="flex gap-3 items-end bg-surface-container-low p-2 rounded-3xl ghost-border overflow-hidden focus-within:ring-2 focus-within:ring-primary transition-all">
                <button className="w-12 h-12 shrink-0 flex items-center justify-center text-outline hover:text-primary transition-colors">
                  <span className="material-symbols-outlined">attach_file</span>
                </button>
                <textarea
                  id="chat-input"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Klinik mesajınızı yazın..."
                  rows={1}
                  className="flex-1 max-h-32 bg-transparent border-none text-on-surface placeholder:text-outline-variant focus:ring-0 resize-none py-3.5 my-auto text-[15px]" 
                  style={{ minHeight: '52px' }}
                />
                <button 
                  onClick={sendMessage} 
                  disabled={!newMessage.trim()} 
                  className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center transition-all ${newMessage.trim() ? 'bg-primary text-white shadow-[0px_4px_12px_rgba(0,104,86,0.2)] scale-100 hover:scale-95' : 'bg-surface-container-highest text-outline scale-90'}`}
                >
                  <span className="material-symbols-outlined text-[20px]" style={newMessage.trim() ? { fontVariationSettings: "'FILL' 1" } : {}}>send</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-32 h-32 bg-primary/5 rounded-full flex items-center justify-center mb-6">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                 <span className="material-symbols-outlined text-5xl text-primary/50">forum</span>
              </div>
            </div>
            <h2 className="font-headline text-2xl font-bold text-on-surface mb-2">Sohbet Merkezi</h2>
            <p className="text-on-surface-variant max-w-sm">
              Danışanlarınız veya diyetisyeninizle olan eşzamanlı klinik iletişiminiz için sol panelden bir oturum açın.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
