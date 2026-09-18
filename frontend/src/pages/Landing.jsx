import { Link, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Flame, MessageSquare, BarChart3, ArrowRight, Code2, Sun, Moon } from 'lucide-react';

const MotionLink = motion(Link);

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] },
  }),
};

const fadeDown = {
  hidden: { opacity: 0, y: -14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

const FEATURES = [
  {
    icon: Flame,
    title: 'Streaks that hold you accountable',
    body: "Log a problem the moment you solve it. A heatmap and streak counter make the pattern of your practice impossible to ignore — in a good way.",
  },
  {
    icon: MessageSquare,
    title: 'An AI mentor that knows your history',
    body: "Ask for a nudge on a stuck problem and get guidance shaped by what you've already solved — not a generic hint pulled from nowhere.",
  },
  {
    icon: BarChart3,
    title: 'Analytics that show the gaps',
    body: 'See which topics and difficulties you\u2019re actually strong in, and which ones you keep avoiding, broken down over any stretch of time.',
  },
];

const STEPS = [
  { label: 'Solve', body: 'Work a problem on LeetCode like you normally would.' },
  { label: 'Log it', body: 'Record the difficulty, topics, and how it went — in under ten seconds.' },
  { label: 'Revisit', body: 'Star the ones worth a second pass; they resurface on a spaced schedule.' },
];

export default function Landing() {
  const { user, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  if (!loading && user) return <Navigate to="/dashboard" replace />;

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <div className="landing-glow" style={{ top: -140, right: -140 }} />
      <div className="landing-glow landing-glow-alt" style={{ bottom: -180, left: -160 }} />

      {/* Top bar */}
      <motion.header
        className="landing-header"
        style={{ position: 'relative', zIndex: 1 }}
        initial="hidden"
        animate="show"
        variants={fadeDown}
      >
        <motion.div
          style={{ display: 'flex', alignItems: 'center', gap: 9 }}
          whileHover="hover"
          initial="rest"
        >
          <motion.div
            style={{
              width: 32, height: 32, borderRadius: 8, background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            variants={{ rest: { rotate: 0, scale: 1 }, hover: { rotate: -8, scale: 1.08 } }}
            transition={{ type: 'spring', stiffness: 300, damping: 12 }}
          >
            <Code2 size={16} color="var(--accent-ink)" />
          </motion.div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 19 }}>LeetTrack</span>
        </motion.div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={toggleTheme}
            aria-label="Toggle light or dark mode"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{
              width: 38, height: 38, borderRadius: 8, flexShrink: 0,
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-secondary)', cursor: 'pointer',
              transition: 'border-color 0.2s var(--ease-out)',
            }}
            onMouseOver={e => e.currentTarget.style.borderColor = 'var(--accent)'}
            onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={theme}
                initial={{ opacity: 0, rotate: -90, scale: 0.4 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 90, scale: 0.4 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                style={{ display: 'flex' }}
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </motion.span>
            </AnimatePresence>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <Link to="/login" style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>Sign in</Link>
            <MotionLink
              to="/register"
              className="btn btn-primary"
              style={{ fontSize: 14, padding: '9px 18px' }}
              whileHover={{ y: -2, boxShadow: '0 8px 18px var(--accent-glow-strong)' }}
              whileTap={{ scale: 0.96 }}
            >
              Get started
            </MotionLink>
          </div>
        </nav>
      </motion.header>

      {/* Hero */}
      <section className="landing-hero" style={{ position: 'relative', zIndex: 1 }}>
        <motion.div initial="hidden" animate="show" variants={fadeUp} custom={0}>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 52,
            lineHeight: 1.08, letterSpacing: '-0.015em', marginBottom: 22, maxWidth: 520,
          }}>
            Practice DSA like it's a habit, not a scramble before interviews.
          </h1>
          <p style={{ fontSize: 17, color: 'var(--text-secondary)', lineHeight: 1.65, maxWidth: 460, marginBottom: 32 }}>
            LeetTrack logs every problem you solve, keeps your streak visible, and brings in an AI mentor
            when you're stuck — so consistency does the work that cramming can't.
          </p>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
            <MotionLink
              to="/register"
              className="btn btn-primary"
              style={{ padding: '13px 24px', fontSize: 15 }}
              whileHover={{ y: -2, boxShadow: '0 10px 22px var(--accent-glow-strong)' }}
              whileTap={{ scale: 0.96 }}
            >
              Start tracking free <ArrowRight size={16} />
            </MotionLink>
            <Link to="/login" style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>
              I already have an account
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          custom={1}
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <HeroPanel />
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="landing-features" style={{ position: 'relative', zIndex: 1 }}>
        <div className="landing-features-grid">
          {FEATURES.map(({ icon: Icon, title, body }, i) => (
            <motion.div
              key={title}
              className="card"
              style={{ padding: 28 }}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-60px' }}
              variants={fadeUp}
              custom={i}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
            >
              <motion.div
                style={{
                  width: 38, height: 38, borderRadius: 8, border: '1px solid var(--accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18,
                }}
                whileHover={{ rotate: 10, scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 10 }}
              >
                <Icon size={18} color="var(--accent)" />
              </motion.div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 17, marginBottom: 8 }}>
                {title}
              </h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.65 }}>{body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '0 20px 96px' }}>
        <motion.h2
          style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 26, marginBottom: 32, textAlign: 'center' }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          Three steps, repeated daily
        </motion.h2>
        <div className="landing-steps-row">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.label}
              style={{ flex: 1, position: 'relative', padding: '0 20px', textAlign: 'center' }}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-40px' }}
              variants={fadeUp}
              custom={i}
            >
              {i < STEPS.length - 1 && (
                <motion.div
                  style={{
                    position: 'absolute', top: 20, left: '58%', right: '-42%',
                    height: 1, background: 'var(--border)', transformOrigin: 'left',
                  }}
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                />
              )}
              <motion.div
                style={{
                  width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-card)',
                  border: '1px solid var(--border-bright)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', margin: '0 auto 16px', position: 'relative', zIndex: 1,
                  fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--accent)',
                }}
                whileHover={{ scale: 1.15, borderColor: 'var(--accent)' }}
                transition={{ type: 'spring', stiffness: 300, damping: 12 }}
              >
                {i + 1}
              </motion.div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16, marginBottom: 6 }}>
                {s.label}
              </div>
              <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section style={{
        maxWidth: 1200, margin: '0 auto 88px', padding: '0 20px',
      }}>
        <motion.div
          className="card landing-cta-card"
          style={{ background: 'var(--accent)', border: 'none' }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.3 }}
        >
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 24, color: 'var(--accent-ink)', marginBottom: 6 }}>
              Your streak starts with today's problem.
            </h3>
            <p style={{ color: 'var(--accent-ink)', opacity: 0.85, fontSize: 14 }}>
              Free to use — no credit card, just consistency.
            </p>
          </div>
          <MotionLink
            to="/register"
            className="btn"
            style={{
              background: 'var(--accent-ink)', color: 'var(--accent)', padding: '13px 26px', fontSize: 15, whiteSpace: 'nowrap',
            }}
            whileHover={{ y: -2, scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
          >
            Create your account <ArrowRight size={16} />
          </MotionLink>
        </motion.div>
      </section>

      <footer style={{ textAlign: 'center', padding: '0 20px 40px', color: 'var(--text-muted)', fontSize: 13 }}>
        Built for people who'd rather solve one problem a day than fifty the night before an interview.
      </footer>

      <style>{`
        .landing-glow-alt {
          background: radial-gradient(circle, var(--green-dim) 0%, transparent 70%);
          animation-delay: -3s, -2s;
        }
      `}</style>
    </div>
  );
}

function HeroPanel() {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 7, padding: '12px 16px',
        borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)',
      }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--red)', opacity: 0.6 }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--yellow)', opacity: 0.6 }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--green)', opacity: 0.6 }} />
        <span style={{ marginLeft: 8, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>
          two-sum.js
        </span>
      </div>
      <div style={{ padding: '20px 22px', fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1.85 }}>
        <div><span style={{ color: 'var(--text-muted)' }}>// day 47 of the streak</span></div>
        <div><span style={{ color: 'var(--accent)' }}>function</span> twoSum(nums, target) {'{'}</div>
        <div style={{ paddingLeft: 18 }}>
          <span style={{ color: 'var(--accent)' }}>const</span> seen = <span style={{ color: 'var(--accent)' }}>new</span> Map();
        </div>
        <div style={{ paddingLeft: 18 }}>
          <span style={{ color: 'var(--accent)' }}>for</span> (<span style={{ color: 'var(--accent)' }}>let</span> i = 0; i {'<'} nums.length; i++) {'{'}
        </div>
        <div style={{ paddingLeft: 36, color: 'var(--text-secondary)' }}>
          <span style={{ color: 'var(--accent)' }}>const</span> rest = target - nums[i];
        </div>
        <div style={{ paddingLeft: 36, color: 'var(--text-secondary)' }}>
          <span style={{ color: 'var(--accent)' }}>if</span> (seen.has(rest)) <span style={{ color: 'var(--accent)' }}>return</span> [seen.get(rest), i];
        </div>
        <div style={{ paddingLeft: 18 }}>{'}'}</div>
        <div>{'}'}</div>
      </div>
      <div style={{
        display: 'flex', gap: 10, padding: '14px 22px', borderTop: '1px solid var(--border)',
        background: 'var(--bg-surface)',
      }}>
        <StatChip label="Solved" value="312" color="var(--accent)" />
        <StatChip label="Streak" value="47d" color="var(--yellow)" />
        <StatChip label="Topics" value="19" color="var(--green)" />
      </div>
    </div>
  );
}

function StatChip({ label, value, color }) {
  return (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{label}</div>
    </div>
  );
}