import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import Icon from '../components/ui/Icon';
import ProgressRing from '../components/ui/ProgressRing';
import {
  useAppState,
  mealsToday,
  waterToday,
  sessionsThisWeek,
  calculateStreak,
} from '../data/store';
import { useMemo } from 'react';

export default function Dashboard() {
  const state = useAppState();
  const today = mealsToday(state);
  const water = waterToday(state);
  const weekSessions = sessionsThisWeek(state);
  const streak = calculateStreak(state);

  const totals = useMemo(() => {
    return today.reduce(
      (acc, m) => ({
        calories: acc.calories + m.calories,
        protein: acc.protein + m.protein,
        carbs: acc.carbs + m.carbs,
        fat: acc.fat + m.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );
  }, [today]);

  const caloriePct = Math.min(1, totals.calories / state.profile.dailyCalorieTarget);
  const waterPct = Math.min(1, water / state.profile.dailyWaterMl);

  const weekStats = useMemo(() => {
    const days: { key: string; label: string; volume: number; hasSession: boolean }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(d.getDate() + 1);
      const s = state.sessions.filter(
        (x) => x.startedAt >= d.getTime() && x.startedAt < next.getTime(),
      );
      const volume = s.reduce((acc, x) => acc + x.totalVolume, 0);
      days.push({
        key: d.toISOString(),
        label: d.toLocaleDateString('en', { weekday: 'short' })[0],
        volume,
        hasSession: s.length > 0,
      });
    }
    return days;
  }, [state.sessions]);

  const maxVol = Math.max(1, ...weekStats.map((d) => d.volume));

  const featured = state.routines[0];

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 5) return 'Late night grind';
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <motion.div
      className="page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <header className="pt-8 px-5 pb-2">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <p className="label">{greeting}</p>
            <h2 className="title mt-1">{state.profile.name}</h2>
          </div>
          <Link
            to="/profile"
            className="m3-iconbtn"
            style={{
              width: 48,
              height: 48,
              background:
                'linear-gradient(135deg, var(--primary-container), var(--tertiary-container))',
              color: 'var(--on-primary-container)',
            }}
          >
            <Icon name="person" filled size={22} />
          </Link>
        </motion.div>

        <motion.h1
          className="display-xxl gradient-text"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Let's move.
        </motion.h1>
      </header>

      <main className="px-5 mt-4">
        {/* Hero of the day */}
        {featured && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 230, delay: 0.15 }}
          >
            <Link to={`/workouts/${featured.id}`} className="block">
              <article
                className={`expressive-hero hero-blob hero-${featured.color}`}
                style={{ aspectRatio: '1 / 1', display: 'flex', flexDirection: 'column' }}
              >
                <div className="flex items-start justify-between">
                  <div className="pill-chip" style={{ background: 'rgba(255,255,255,0.18)', color: 'inherit', border: 'none', fontSize: 12 }}>
                    <span className="pulse-dot" style={{ width: 8, height: 8, borderRadius: 999, background: '#fff', display: 'inline-block' }} />
                    <span>TODAY'S SESSION</span>
                  </div>
                  <Icon name={featured.icon} filled size={28} />
                </div>

                <div className="flex-1" />

                <h2 className="display-lg" style={{ letterSpacing: '-0.04em' }}>
                  {featured.name}
                </h2>
                <p className="opacity-80 mt-1 font-medium">
                  {featured.durationMin} min • {featured.exercises.length} exercises
                </p>

                <div className="flex items-center gap-3 mt-5">
                  <button
                    className="m3-fab-lg m3-fab"
                    style={{
                      background: 'rgba(255,255,255,0.95)',
                      color: '#000',
                    }}
                  >
                    <Icon name="play_arrow" filled size={34} />
                  </button>
                  <div className="flex-1" />
                  <div
                    className="px-3 py-2 rounded-full text-sm font-bold"
                    style={{ background: 'rgba(255,255,255,0.15)' }}
                  >
                    {featured.target}
                  </div>
                </div>
              </article>
            </Link>
          </motion.div>
        )}

        {/* Stats grid */}
        <motion.div
          className="grid grid-cols-2 gap-3 mt-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <div className="expressive-card" style={{ padding: 18 }}>
            <div className="flex items-center gap-2 mb-2">
              <Icon name="local_fire_department" filled size={18} style={{ color: 'var(--error)' }} />
              <span className="label" style={{ fontSize: 10 }}>STREAK</span>
            </div>
            <div className="display-lg" style={{ letterSpacing: '-0.04em' }}>
              {streak}
              <span className="text-base font-bold opacity-60 ml-1">days</span>
            </div>
          </div>
          <div className="expressive-card" style={{ padding: 18 }}>
            <div className="flex items-center gap-2 mb-2">
              <Icon name="fitness_center" filled size={18} style={{ color: 'var(--primary)' }} />
              <span className="label" style={{ fontSize: 10 }}>THIS WEEK</span>
            </div>
            <div className="display-lg" style={{ letterSpacing: '-0.04em' }}>
              {weekSessions.length}
              <span className="text-base font-bold opacity-60 ml-1">sessions</span>
            </div>
          </div>
        </motion.div>

        {/* Week chart */}
        <motion.div
          className="expressive-card mt-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="title">Weekly volume</h3>
            <span className="label">KG LIFTED</span>
          </div>
          <div className="flex items-end gap-2 h-28">
            {weekStats.map((d, i) => {
              const h = d.volume ? Math.max(12, (d.volume / maxVol) * 100) : 8;
              return (
                <motion.div
                  key={d.key}
                  className="flex-1 flex flex-col items-center gap-2"
                  initial={{ scaleY: 0, opacity: 0 }}
                  animate={{ scaleY: 1, opacity: 1 }}
                  transition={{
                    duration: 0.6,
                    delay: 0.3 + i * 0.05,
                    type: 'spring',
                    damping: 20,
                    stiffness: 220,
                  }}
                  style={{ transformOrigin: 'bottom', height: '100%' }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: `${h}%`,
                      background: d.hasSession
                        ? 'linear-gradient(180deg, var(--primary) 0%, var(--tertiary) 100%)'
                        : 'color-mix(in srgb, var(--on-surface) 10%, transparent)',
                      borderRadius: 10,
                      transition: 'height 0.8s var(--spring-default-spatial)',
                    }}
                  />
                  <span className="text-[10px] font-bold opacity-60">{d.label}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Nutrition quick */}
        <motion.div
          className="expressive-card mt-3 flex items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <ProgressRing value={caloriePct} size={96} color="var(--tertiary)">
            <div className="text-center">
              <div className="font-extrabold text-lg" style={{ letterSpacing: '-0.03em' }}>
                {totals.calories}
              </div>
              <div className="text-[10px] opacity-60 font-bold">
                / {state.profile.dailyCalorieTarget}
              </div>
            </div>
          </ProgressRing>
          <div className="flex-1">
            <span className="label">NUTRITION</span>
            <h3 className="title mt-1">Fuel today</h3>
            <div className="mt-2 space-y-2">
              <MacroBar label="Protein" value={totals.protein} target={state.profile.dailyProteinTarget} color="var(--primary)" />
              <MacroBar label="Carbs" value={totals.carbs} target={state.profile.dailyCarbsTarget} color="var(--tertiary)" />
              <MacroBar label="Fat" value={totals.fat} target={state.profile.dailyFatTarget} color="var(--secondary)" />
            </div>
          </div>
        </motion.div>

        {/* Water quick */}
        <motion.div
          className="expressive-card mt-3 flex items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div
            className="flex items-center justify-center rounded-[24px]"
            style={{
              width: 72,
              height: 72,
              background: 'var(--secondary-container)',
              color: 'var(--on-secondary-container)',
            }}
          >
            <Icon name="water_drop" filled size={34} />
          </div>
          <div className="flex-1">
            <span className="label">HYDRATION</span>
            <div className="flex items-baseline gap-1 mt-1">
              <h3 className="title">{(water / 1000).toFixed(1)}L</h3>
              <span className="opacity-60 font-bold">/ {(state.profile.dailyWaterMl / 1000).toFixed(1)}L</span>
            </div>
            <div className="bar-gauge mt-2">
              <div
                className="fill"
                style={{
                  width: `${waterPct * 100}%`,
                  background: 'linear-gradient(90deg, var(--secondary), var(--primary))',
                }}
              />
            </div>
          </div>
          <Link to="/diet" className="m3-iconbtn">
            <Icon name="arrow_forward" size={22} />
          </Link>
        </motion.div>

        {/* Recent sessions */}
        <motion.section
          className="mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
        >
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="title">Recent Sessions</h3>
            <Link to="/workouts" className="text-sm font-bold opacity-70">
              See all
            </Link>
          </div>
          {state.sessions.slice(0, 4).map((s) => (
            <div key={s.id} className="track-item">
              <div className="track-icon primary">
                <Icon name="fitness_center" filled size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold truncate" style={{ letterSpacing: '-0.01em' }}>
                  {s.routineName}
                </div>
                <div className="text-xs opacity-60 font-medium">
                  {new Date(s.startedAt).toLocaleDateString('en', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  })}{' '}
                  • {Math.round(s.durationSec / 60)} min
                </div>
              </div>
              <div className="text-right">
                <div className="font-extrabold text-primary" style={{ color: 'var(--primary)' }}>
                  {s.totalVolume.toLocaleString()}
                </div>
                <div className="text-[10px] opacity-60 font-bold">KG</div>
              </div>
            </div>
          ))}
          {state.sessions.length === 0 && (
            <div className="text-center opacity-50 py-6">
              No sessions yet. Start your first workout!
            </div>
          )}
        </motion.section>
      </main>
    </motion.div>
  );
}

function MacroBar({
  label,
  value,
  target,
  color,
}: {
  label: string;
  value: number;
  target: number;
  color: string;
}) {
  const pct = target ? Math.min(1, value / target) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1 text-xs font-bold">
        <span className="opacity-70">{label}</span>
        <span>
          <span>{Math.round(value)}</span>
          <span className="opacity-50"> / {target}g</span>
        </span>
      </div>
      <div className="bar-gauge" style={{ height: 6 }}>
        <div className="fill" style={{ width: `${pct * 100}%`, background: color }} />
      </div>
    </div>
  );
}
