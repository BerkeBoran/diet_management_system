import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import chatService from '../../services/chatService';
import { motion } from 'framer-motion';

export default function ClientChat() {
  return <ChatPage />;
}

export function ChatPage() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [roomDetail, setRoomDetail] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [roomLoading, setRoomLoading] = useState(false);
  const wsRef = useRef(null);
  const bottomRef = useRef(null);

  const isReadOnly = localStorage.getItem('clientMode') === 'free';

  useEffect(() => {
    chatService.getRooms().then(r => setRooms(r.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const openRoom = async (room) => {
    if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }
    setActiveRoom(room);
    setRoomLoading(true);
    try {
      const r = await chatService.getRoomDetail(room.id);
      setRoomDetail(r.data);
      setMessages(r.data.messages || []);
    } catch (_) {}
    setRoomLoading(false);

    if (!isReadOnly) {
      const ws = chatService.createWebSocket(room.id);
      ws.onmessage = (e) => {
        const data = JSON.parse(e.data);
        if (data.message !== undefined) {
          setMessages(prev => [...prev, {
            id: data.message_id,
            sender_id: data.sender_id,
            sender_name: data.sender_name,
            content: data.message,
            timestamp: new Date(data.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
            is_read: data.is_read,
            is_mine: data.sender_id === user?.id,
          }]);
        }
      };
      wsRef.current = ws;
    }
  };

  useEffect(() => () => { wsRef.current?.close(); }, []);

  const sendMessage = () => {
    const text = input.trim();
    if (!text || !wsRef.current || wsRef.current.readyState !== 1) return;
    wsRef.current.send(JSON.stringify({ message: text }));
    setInput('');
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div className="spinner" />
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 30, color: 'var(--forest)', marginBottom: 4 }}>Mesajlar</h1>
        <p style={{ fontSize: 14, color: 'var(--ink-light)' }}>Diyetisyeninizle anlık iletişim</p>
      </div>

      {isReadOnly && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 18px', borderRadius: 12, marginBottom: 16,
          background: '#FFF7ED', border: '1px solid #FDE68A',
          fontSize: 13, color: '#92400E', gap: 12, flexWrap: 'wrap',
        }}>
          <span>
            <strong>Salt okunur mod</strong> — Eski mesajlarını görüntüleyebilirsin, yeni mesaj gönderemezsin.
          </span>
          <Link
            to="/client/choose-plan"
            style={{
              padding: '6px 14px', borderRadius: 999,
              background: '#1A1A1A', color: '#FBFAF5',
              fontSize: 12, fontWeight: 600, textDecoration: 'none', flexShrink: 0,
            }}
          >
            Plan Seç →
          </Link>
        </div>
      )}

      <div style={{
        background: 'white', border: '1px solid var(--parchment-dark)',
        borderRadius: 20, overflow: 'hidden',
        display: 'grid', gridTemplateColumns: '280px 1fr',
        height: isReadOnly ? '65vh' : '70vh',
      }}>
        {/* Room list */}
        <div style={{ borderRight: '1px solid var(--parchment-dark)', overflowY: 'auto' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--parchment-dark)', fontSize: 12, fontWeight: 700, color: 'var(--ink-light)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Sohbetler
          </div>
          {rooms.length === 0 && (
            <div style={{ padding: '24px 16px', textAlign: 'center', fontSize: 13, color: 'var(--ink-light)' }}>
              Henüz sohbet yok
            </div>
          )}
          {rooms.map(room => (
            <div
              key={room.id}
              onClick={() => openRoom(room)}
              style={{
                padding: '14px 16px', cursor: 'pointer',
                background: activeRoom?.id === room.id ? 'var(--parchment)' : 'white',
                borderBottom: '1px solid var(--parchment-dark)', transition: 'background 0.15s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 3 }}>
                  {room.chat_user?.full_name}
                </div>
                {room.unread_message_count > 0 && (
                  <div style={{ background: 'var(--forest)', color: 'var(--parchment)', borderRadius: 99, fontSize: 11, fontWeight: 700, minWidth: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>
                    {room.unread_message_count}
                  </div>
                )}
              </div>
              {room.last_message && (
                <div style={{ fontSize: 12, color: 'var(--ink-light)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {room.last_message.content}
                </div>
              )}
              {room.chat_user?.title && (
                <div style={{ fontSize: 11, color: 'var(--sage)', fontWeight: 600, marginTop: 2 }}>
                  {room.chat_user.title}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Chat panel */}
        {activeRoom ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--parchment-dark)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--forest)', color: 'var(--parchment)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-serif)', fontSize: 14, flexShrink: 0 }}>
                {activeRoom.chat_user?.full_name?.[0] || '?'}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{activeRoom.chat_user?.full_name}</div>
                {activeRoom.chat_user?.title && <div style={{ fontSize: 12, color: 'var(--sage)' }}>{activeRoom.chat_user.title}</div>}
              </div>
              {isReadOnly && (
                <span style={{ marginLeft: 'auto', fontSize: 11, fontFamily: 'var(--mono)', color: '#D97706', background: '#FEF3C7', padding: '3px 10px', borderRadius: 999, border: '1px solid #FDE68A' }}>
                  SALT OKUNUR
                </span>
              )}
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {roomLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center' }}><div className="spinner" /></div>
              ) : messages.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--ink-light)', fontSize: 13, marginTop: 40 }}>
                  {isReadOnly ? 'Geçmiş mesaj bulunmuyor.' : 'Henüz mesaj yok. İlk mesajı gönder!'}
                </div>
              ) : (
                messages.map((msg, i) => (
                  <motion.div
                    key={msg.id || i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: msg.is_mine ? 'flex-end' : 'flex-start' }}
                  >
                    {!msg.is_mine && <div style={{ fontSize: 11, color: 'var(--ink-light)', marginBottom: 3, paddingLeft: 4 }}>{msg.sender_name}</div>}
                    <div className={`chat-bubble ${msg.is_mine ? 'mine' : 'theirs'}`}>{msg.content}</div>
                    <div style={{ fontSize: 10, color: 'var(--ink-light)', marginTop: 3, paddingLeft: 4, paddingRight: 4 }}>{msg.timestamp}</div>
                  </motion.div>
                ))
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input — gizli free modda */}
            {!isReadOnly ? (
              <div style={{ padding: '12px 16px', borderTop: '1px solid var(--parchment-dark)', display: 'flex', gap: 10 }}>
                <input
                  className="form-input"
                  placeholder="Mesaj yazın..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  style={{ flex: 1 }}
                />
                <button className="btn-primary" onClick={sendMessage} style={{ padding: '10px 20px' }}>Gönder</button>
              </div>
            ) : (
              <div style={{ padding: '12px 16px', borderTop: '1px solid var(--parchment-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: '#FAFAFA' }}>
                <span style={{ fontSize: 13, color: '#9CA3AF' }}>Mesaj göndermek için</span>
                <Link
                  to="/client/choose-plan"
                  style={{ fontSize: 13, fontWeight: 600, color: '#65A30D', textDecoration: 'none', borderBottom: '1px solid currentColor' }}
                >
                  bir plan seç
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: 'var(--ink-light)' }}>
            <div style={{ fontSize: 48 }}>💬</div>
            <p style={{ fontSize: 14 }}>Bir sohbet seçin</p>
          </div>
        )}
      </div>
    </div>
  );
}
