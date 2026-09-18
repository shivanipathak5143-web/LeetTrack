import { NavLink, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  LayoutDashboard, PlusCircle, History,
  BarChart2, MessageSquare, User, LogOut,
  Code2, Zap, Star, Sun, Moon, X
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/log', label: 'Log Problem', icon: PlusCircle },
  { path: '/history', label: 'History', icon: History },
  { path: '/revise', label: 'Revise', icon: Star },
  { path: '/stats', label: 'Analytics', icon: BarChart2 },
  { path: '/chat', label: 'AI Mentor', icon: MessageSquare },
];

export default function Sidebar({ isOpen = false, onClose = () => {} }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="sidebar-backdrop is-open"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>

      <aside
        style={{
          position: 'fixed', left: 0, top: 0, bottom: 0,
          width: 240, background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column',
          zIndex: 100, padding: '0 0 16px 0'
        }}
        className={`app-sidebar${isOpen ? ' app-sidebar-open' : ''}`}
      >
        {/* Logo */}
        <div style={{
          padding: '24px 20px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 6,
              background: 'transparent', border: '1px solid var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'transform 0.3s var(--ease-out)',
            }}>
              <Code2 size={17} color="var(--accent)" />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, letterSpacing: '-0.01em' }}>
                LeetTrack
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
                practice tracker
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="sidebar-close-btn"
            style={{
              display: 'none', width: 30, height: 30, borderRadius: 6,
              alignItems: 'center', justifyContent: 'center',
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              color: 'var(--text-secondary)', cursor: 'pointer', flexShrink: 0,
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto' }}>
          {navItems.map(({ path, label, icon: Icon }, i) => (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 8,
                fontFamily: 'var(--font-display)', fontWeight: 600,
                fontSize: 14, transition: 'all 0.18s var(--ease-out)',
                color: isActive ? 'var(--accent-ink)' : 'var(--text-secondary)',
                background: isActive ? 'var(--accent)' : 'transparent',
                textDecoration: 'none',
                animation: `fadeIn 0.35s var(--ease-out) both`,
                animationDelay: `${i * 35}ms`,
              })}
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom section */}
        <div style={{ padding: '12px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* Streak badge + theme toggle */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, flex: 1,
              background: 'var(--yellow-dim)', border: '1px solid rgba(160, 106, 12, 0.25)',
              borderRadius: 6, padding: '8px 12px', minWidth: 0,
            }}>
              <Zap size={14} color="var(--yellow)" fill="var(--yellow)" style={{ flexShrink: 0 }} className="pulse-flame" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--yellow)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Keep your streak!
              </span>
            </div>
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              style={{
                width: 36, flexShrink: 0, borderRadius: 6,
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-secondary)', cursor: 'pointer', transition: 'transform 0.3s var(--ease-out)',
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'rotate(20deg)'}
              onMouseOut={e => e.currentTarget.style.transform = 'rotate(0deg)'}
            >
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>

          <NavLink to="/profile" onClick={onClose} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 6,
            color: isActive ? 'var(--accent-ink)' : 'var(--text-secondary)',
            fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14,
            textDecoration: 'none', background: isActive ? 'var(--accent)' : 'transparent',
            transition: 'all 0.15s'
          })}>
            <User size={16} />
            Profile
          </NavLink>

          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 8,
              color: 'var(--text-muted)', fontFamily: 'var(--font-display)',
              fontWeight: 600, fontSize: 14, transition: 'all 0.15s',
              cursor: 'pointer', background: 'none', border: 'none'
            }}
            onMouseOver={e => { e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.background = 'var(--red-dim)'; }}
            onMouseOut={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'none'; }}
          >
            <LogOut size={16} />
            Sign Out
          </button>

          {/* User info */}
          <div style={{
            marginTop: 4, padding: '10px 12px',
            borderRadius: 6, background: 'var(--bg-elevated)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: 10
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: 6,
              background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--accent-ink)',
              flexShrink: 0
            }}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || 'User'}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email}
              </div>
            </div>
          </div>
        </div>
      </aside>

      <style>{`
        @media (max-width: 768px) {
          .app-sidebar {
            transform: translateX(-100%);
            transition: transform 0.28s var(--ease-out);
            box-shadow: none;
          }
          .app-sidebar-open {
            transform: translateX(0);
            box-shadow: 12px 0 32px rgba(0,0,0,0.25);
          }
          .sidebar-close-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}
