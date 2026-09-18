import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatWindow from '../components/chat/ChatWindow';

export default function Chat() {
  const [activeSession, setActiveSession] = useState(null);
  const [sidebarKey, setSidebarKey] = useState(0);
  const [mobileListOpen, setMobileListOpen] = useState(false);

  const handleNewChat = () => { setActiveSession(null); setMobileListOpen(false); };
  const handleSessionCreate = (id) => {
    setActiveSession(id);
    setSidebarKey(k => k + 1);
  };
  const handleSelect = (id) => { setActiveSession(id); setMobileListOpen(false); };

  return (
    <div className="chat-page" style={{ display: 'flex', height: 'calc(100vh - 64px)', position: 'relative' }}>
      {/* Mobile backdrop for chat list */}
      <AnimatePresence>
        {mobileListOpen && (
          <motion.div
            className="chat-list-backdrop"
            onClick={() => setMobileListOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      <div className={`chat-sidebar-wrap${mobileListOpen ? ' is-open' : ''}`}>
        <ChatSidebar
          key={sidebarKey}
          activeSession={activeSession}
          onSelect={handleSelect}
          onNew={handleNewChat}
        />
      </div>

      <ChatWindow
        sessionId={activeSession}
        onSessionCreate={handleSessionCreate}
        onOpenChatList={() => setMobileListOpen(true)}
      />

      <style>{`
        .chat-sidebar-wrap { flex-shrink: 0; }
        .chat-list-backdrop {
          display: none;
        }
        @media (max-width: 768px) {
          .chat-sidebar-wrap {
            position: fixed;
            top: 64px; bottom: 0; left: 0;
            transform: translateX(-100%);
            transition: transform 0.28s var(--ease-out);
            z-index: 95;
          }
          .chat-sidebar-wrap.is-open { transform: translateX(0); }
          .chat-list-backdrop {
            display: block;
            position: fixed; inset: 64px 0 0 0;
            background: rgba(10,10,8,0.45);
            z-index: 94;
          }
        }
      `}</style>
    </div>
  );
}
