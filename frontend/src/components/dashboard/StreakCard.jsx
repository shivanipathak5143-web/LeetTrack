import { Zap, Flame, Trophy } from 'lucide-react';

export default function StreakCard({ current = 0, longest = 0, lastSolved }) {
  return (
    <div className="card" style={{
      background: 'linear-gradient(135deg, rgba(245,197,66,0.08) 0%, var(--bg-card) 60%)',
      border: '1px solid rgba(245,197,66,0.2)',
      position: 'relative', overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute', top: -10, right: -10,
        width: 80, height: 80, borderRadius: '50%',
        background: 'rgba(245,197,66,0.1)', filter: 'blur(20px)'
      }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>Streak</span>
        <Flame size={18} color="var(--yellow)" />
      </div>

      <div style={{ display: 'flex', gap: 20 }}>
        <div style={{ flex: 1, textAlign: 'center', padding: '12px', background: 'rgba(245,197,66,0.06)', borderRadius: 10, border: '1px solid rgba(245,197,66,0.15)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 36, color: 'var(--yellow)', letterSpacing: '-0.03em', lineHeight: 1 }}>
            {current}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>CURRENT</div>
        </div>
        <div style={{ flex: 1, textAlign: 'center', padding: '12px', background: 'rgba(245,197,66,0.06)', borderRadius: 10, border: '1px solid rgba(245,197,66,0.15)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 36, color: 'var(--yellow)', letterSpacing: '-0.03em', lineHeight: 1 }}>
            {longest}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>LONGEST</div>
        </div>
      </div>

      {lastSolved && (
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
          <Trophy size={12} color="var(--yellow)" />
          Last solved: {lastSolved}
        </div>
      )}
    </div>
  );
}