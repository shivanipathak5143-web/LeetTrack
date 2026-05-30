import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatsCard({ title, value, subtitle, icon: Icon, color = 'accent', trend, trendValue }) {
  const colorMap = {
    accent: { bg: 'var(--accent-glow)', color: 'var(--accent)' },
    green: { bg: 'var(--green-dim)', color: 'var(--green)' },
    yellow: { bg: 'var(--yellow-dim)', color: 'var(--yellow)' },
    red: { bg: 'var(--red-dim)', color: 'var(--red)' },
    orange: { bg: 'rgba(251, 146, 60, 0.1)', color: 'var(--orange)' },
  };
  const c = colorMap[color] || colorMap.accent;

  return (
    <div className="card animate-in" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Background gradient blob */}
      <div style={{
        position: 'absolute', top: -20, right: -20,
        width: 80, height: 80, borderRadius: '50%',
        background: c.bg, filter: 'blur(20px)', opacity: 0.6
      }} />

      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: c.bg, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            border: `1px solid ${c.color}33`
          }}>
            {Icon && <Icon size={18} color={c.color} />}
          </div>
          {trendValue !== undefined && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4,
              fontFamily: 'var(--font-mono)', fontSize: 12,
              color: trend === 'up' ? 'var(--green)' : 'var(--red)',
            }}>
              {trend === 'up' ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              {trendValue}
            </div>
          )}
        </div>

        <div style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: 32, letterSpacing: '-0.03em', color: c.color,
          lineHeight: 1, marginBottom: 6
        }}>
          {value ?? '—'}
        </div>

        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
          {title}
        </div>
        {subtitle && (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}