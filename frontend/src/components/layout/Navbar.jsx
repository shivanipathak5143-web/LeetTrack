import { useLocation } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const titles = {
  '/dashboard': { title: 'Dashboard', sub: 'Your coding overview' },
  '/log': { title: 'Log Problem', sub: 'Track a solved problem' },
  '/history': { title: 'Problem History', sub: 'All your solved problems' },
  '/stats': { title: 'Analytics', sub: 'Performance breakdown' },
  '/chat': { title: 'AI Mentor', sub: 'Personalized DSA guidance' },
  '/profile': { title: 'Profile', sub: 'Your account settings' },
};

export default function Navbar() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const info = titles[pathname] || { title: 'LeetTrack', sub: '' };

  return (
    <header style={{
      height: 64, background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center',
      padding: '0 40px', gap: 16,
      position: 'sticky', top: 0, zIndex: 50,
    }}>
      <div style={{ flex: 1 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, letterSpacing: '-0.01em' }}>
          {info.title}
        </h1>
        {info.sub && (
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
            {info.sub}
          </p>
        )}
      </div>
      <button style={{
        width: 38, height: 38, borderRadius: 8,
        background: 'var(--bg-elevated)', border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', color: 'var(--text-secondary)', transition: 'all 0.15s'
      }}
        onMouseOver={e => e.currentTarget.style.borderColor = 'var(--accent)'}
        onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}
      >
        <Bell size={15} />
      </button>
    </header>
  );
}