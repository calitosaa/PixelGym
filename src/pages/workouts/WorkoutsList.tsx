import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import Icon from '../../components/ui/Icon';
import PillChip from '../../components/ui/PillChip';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Sheet from '../../components/ui/Sheet';
import { LoadingWave } from '../../components/ui/Loading';
import { useAppState, store } from '../../data/store';
import { generateRoutineAI } from '../../lib/gemini';
import { useToast } from '../../components/ui/Toast';
import { Routine } from '../../types';

const FILTERS = [
  { key: 'all', label: 'All', icon: 'tune' },
  { key: 'strength', label: 'Strength', icon: 'fitness_center' },
  { key: 'hypertrophy', label: 'Hypertrophy', icon: 'exercise' },
  { key: 'cardio', label: 'Cardio', icon: 'directions_run' },
  { key: 'ai', label: 'AI', icon: 'auto_awesome' },
];

export default function WorkoutsList() {
  const state = useAppState();
  const [filter, setFilter] = useState<string>('all');
  const [aiOpen, setAiOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [genLoading, setGenLoading] = useState(false);
  const toast = useToast();

  const filtered = useMemo(() => {
    if (filter === 'all') return state.routines;
    if (filter === 'ai') return state.routines.filter((r) => r.isAIGenerated);
    return state.routines.filter((r) =>
      r.target.toLowerCase().includes(filter) || r.muscles.includes(filter as any),
    );
  }, [state.routines, filter]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setGenLoading(true);
    try {
      const routine = await generateRoutineAI(prompt, state.profile);
      store.addRoutine(routine);
      setAiOpen(false);
      setPrompt('');
      toast.show('AI routine created', 'auto_awesome');
    } catch (e) {
      console.error(e);
      toast.show('AI generation failed', 'error');
    } finally {
      setGenLoading(false);
    }
  };

  return (
    <motion.div
      className="page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <PageHeader title="Train" subtitle={`${state.routines.length} routines ready to go`} />

      <div className="chip-row mt-1 mb-3">
        {FILTERS.map((f) => (
          <PillChip
            key={f.key}
            active={filter === f.key}
            onClick={() => setFilter(f.key)}
            icon={f.icon}
            variant={f.key === 'ai' ? 'tertiary' : 'primary'}
          >
            {f.label}
          </PillChip>
        ))}
      </div>

      <main className="px-4 mt-2 space-y-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <button
            onClick={() => setAiOpen(true)}
            className="expressive-card hero-tertiary hero-blob w-full text-left"
            style={{ padding: 22, borderRadius: 32 }}
          >
            <div className="flex items-center gap-4">
              <div
                className="flex items-center justify-center rounded-3xl"
                style={{
                  width: 64,
                  height: 64,
                  background: 'rgba(255,255,255,0.2)',
                }}
              >
                <Icon name="auto_awesome" filled size={32} />
              </div>
              <div className="flex-1">
                <h3 className="headline" style={{ letterSpacing: '-0.025em' }}>
                  AI Routine Builder
                </h3>
                <p className="text-sm opacity-80 font-medium mt-1">
                  Describe your goal, we build the plan.
                </p>
              </div>
              <Icon name="arrow_forward" size={24} />
            </div>
          </button>
        </motion.div>

        <AnimatePresence mode="popLayout">
          {filtered.map((r, idx) => (
            <RoutineCard key={r.id} routine={r} index={idx} />
          ))}
          {filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center opacity-50 py-12"
            >
              No routines match this filter.
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Sheet open={aiOpen} onClose={() => setAiOpen(false)} title="AI Routine Builder">
        <p className="opacity-70 text-sm mb-3 px-2">
          Tell the coach what you want — muscle groups, duration, difficulty, equipment, etc.
        </p>
        <textarea
          className="m3-input m3-textarea"
          placeholder="Example: 45-min push day with barbell and dumbbells, focus on chest hypertrophy, intermediate level."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={5}
        />
        <div className="flex items-center gap-2 mt-4 px-1">
          <Button variant="outlined" className="flex-1" onClick={() => setAiOpen(false)}>
            Cancel
          </Button>
          <Button
            icon={genLoading ? undefined : 'auto_awesome'}
            className="flex-1"
            variant="tertiary-tonal"
            onClick={handleGenerate}
            disabled={genLoading || !prompt.trim()}
          >
            {genLoading ? <LoadingWave /> : 'Generate'}
          </Button>
        </div>
      </Sheet>
    </motion.div>
  );
}

function RoutineCard({ routine, index }: { routine: Routine; index: number }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 18, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{
        type: 'spring',
        damping: 24,
        stiffness: 240,
        delay: 0.1 + index * 0.04,
      }}
    >
      <Link to={`/workouts/${routine.id}`} className="block">
        <article
          className={`expressive-card hero-${routine.color}`}
          style={{
            padding: 20,
            borderRadius: 32,
            color:
              routine.color === 'primary'
                ? 'var(--on-primary-container)'
                : routine.color === 'tertiary'
                ? 'var(--on-tertiary-container)'
                : routine.color === 'secondary'
                ? 'var(--on-secondary-container)'
                : 'var(--on-error-container)',
          }}
        >
          <div className="flex items-start gap-4">
            <div
              className="flex items-center justify-center rounded-[24px]"
              style={{
                width: 68,
                height: 68,
                background: 'rgba(255,255,255,0.2)',
              }}
            >
              <Icon name={routine.icon} filled size={32} />
            </div>
            <div className="flex-1 min-w-0">
              {routine.isAIGenerated && (
                <div
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full mb-1"
                  style={{ background: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 800 }}
                >
                  <Icon name="auto_awesome" filled size={12} /> AI
                </div>
              )}
              <h3 className="headline" style={{ letterSpacing: '-0.025em' }}>
                {routine.name}
              </h3>
              <p className="text-sm opacity-80 font-medium mt-1">
                {routine.durationMin} min • {routine.exercises.length} exercises • {routine.target}
              </p>
            </div>
            <Icon name="arrow_forward" size={22} />
          </div>
        </article>
      </Link>
    </motion.div>
  );
}
