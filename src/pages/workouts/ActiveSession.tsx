import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Icon from '../../components/ui/Icon';
import IconButton from '../../components/ui/IconButton';
import Button from '../../components/ui/Button';
import Stepper from '../../components/ui/Stepper';
import { useAppState, store } from '../../data/store';
import { getExercise } from '../../data/exercises';
import { useToast } from '../../components/ui/Toast';
import ProgressRing from '../../components/ui/ProgressRing';
import { SetEntry, WorkoutSession } from '../../types';

interface WorkingSet extends SetEntry {
  reps: number;
  weight: number;
  completed: boolean;
}

interface WorkingBlock {
  blockId: string;
  exerciseId: string;
  targetReps: string;
  restSeconds: number;
  sets: WorkingSet[];
}

function parseTargetReps(target: string): number {
  const m = target.match(/\d+/);
  return m ? parseInt(m[0], 10) : 10;
}

export default function ActiveSession() {
  const { id } = useParams();
  const navigate = useNavigate();
  const state = useAppState();
  const toast = useToast();
  const routine = state.routines.find((r) => r.id === id);

  const [startedAt] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [restRemaining, setRestRemaining] = useState<number | null>(null);
  const restRef = useRef<number | null>(null);

  // Initialize working state (all sets as templates)
  const [blocks, setBlocks] = useState<WorkingBlock[]>(() => {
    if (!routine) return [];
    return routine.exercises.map((b) => ({
      blockId: b.id,
      exerciseId: b.exerciseId,
      targetReps: b.targetReps,
      restSeconds: b.restSeconds,
      sets: Array.from({ length: b.targetSets }).map((_, i) => ({
        id: `${b.id}-s${i}`,
        reps: parseTargetReps(b.targetReps),
        weight: 0,
        completed: false,
      })),
    }));
  });

  useEffect(() => {
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 500);
    return () => clearInterval(t);
  }, [startedAt]);

  // Rest timer
  useEffect(() => {
    if (restRemaining === null) return;
    if (restRemaining <= 0) {
      setRestRemaining(null);
      if (restRef.current !== null) window.clearInterval(restRef.current);
      toast.show("Rest's over — let's go!", 'bolt');
      try {
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate?.(200);
        }
      } catch {}
      return;
    }
    restRef.current = window.setTimeout(() => {
      setRestRemaining((r) => (r === null ? null : r - 1));
    }, 1000);
    return () => {
      if (restRef.current !== null) window.clearTimeout(restRef.current);
    };
  }, [restRemaining, toast]);

  const block = blocks[currentIdx];
  const exercise = block ? getExercise(block.exerciseId) : null;

  const totalVolume = useMemo(
    () =>
      blocks.reduce(
        (acc, b) =>
          acc + b.sets.reduce((s, st) => s + (st.completed ? st.weight * st.reps : 0), 0),
        0,
      ),
    [blocks],
  );

  const allCompletedInBlock = block ? block.sets.every((s) => s.completed) : false;
  const totalSets = blocks.reduce((acc, b) => acc + b.sets.length, 0);
  const completedSets = blocks.reduce(
    (acc, b) => acc + b.sets.filter((s) => s.completed).length,
    0,
  );
  const progressPct = totalSets ? completedSets / totalSets : 0;

  const updateSet = (setIdx: number, patch: Partial<WorkingSet>) => {
    setBlocks((prev) =>
      prev.map((b, i) =>
        i !== currentIdx
          ? b
          : {
              ...b,
              sets: b.sets.map((s, j) => (j === setIdx ? { ...s, ...patch } : s)),
            },
      ),
    );
  };

  const completeSet = (setIdx: number) => {
    const set = block.sets[setIdx];
    const completing = !set.completed;
    updateSet(setIdx, { completed: completing });
    if (completing) {
      setRestRemaining(block.restSeconds);
      toast.show(`Set ${setIdx + 1} logged`, 'check_circle');
    }
  };

  const addSet = () => {
    setBlocks((prev) =>
      prev.map((b, i) =>
        i !== currentIdx
          ? b
          : {
              ...b,
              sets: [
                ...b.sets,
                {
                  id: `${b.blockId}-s${b.sets.length}`,
                  reps: parseTargetReps(b.targetReps),
                  weight: b.sets[b.sets.length - 1]?.weight || 0,
                  completed: false,
                },
              ],
            },
      ),
    );
  };

  const goNext = () => {
    if (currentIdx < blocks.length - 1) {
      setCurrentIdx((i) => i + 1);
      setRestRemaining(null);
    }
  };

  const goPrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((i) => i - 1);
      setRestRemaining(null);
    }
  };

  const finish = () => {
    if (!routine) return;
    const session: WorkoutSession = {
      id: `s-${Date.now()}`,
      routineId: routine.id,
      routineName: routine.name,
      startedAt,
      endedAt: Date.now(),
      durationSec: elapsed,
      totalVolume,
      caloriesEst: Math.round(elapsed * 0.13 + totalVolume * 0.02),
      exercises: blocks.map((b) => ({
        exerciseId: b.exerciseId,
        exerciseName: getExercise(b.exerciseId)?.name || '',
        sets: b.sets,
      })),
    };
    store.addSession(session);
    toast.show('Workout saved!', 'emoji_events');
    navigate('/workouts');
  };

  const abort = () => {
    if (confirm('Discard this session?')) navigate(-1);
  };

  if (!routine || !block || !exercise) {
    return (
      <div className="p-8 text-center">
        <p>Loading session...</p>
      </div>
    );
  }

  const mmss = (secs: number) =>
    `${Math.floor(secs / 60)
      .toString()
      .padStart(2, '0')}:${(secs % 60).toString().padStart(2, '0')}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-dvh flex flex-col"
      style={{
        background:
          'radial-gradient(circle at 50% 0%, rgba(var(--glow), 0.2) 0%, var(--background) 50%)',
      }}
    >
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 pt-5 pb-3">
        <IconButton name="close" onClick={abort} />
        <div className="flex flex-col items-center">
          <span className="label" style={{ fontSize: 10 }}>ELAPSED</span>
          <span className="font-extrabold text-lg" style={{ letterSpacing: '-0.02em' }}>
            {mmss(elapsed)}
          </span>
        </div>
        <IconButton name="check" filled onClick={finish} />
      </header>

      {/* Progress bar */}
      <div className="px-4">
        <div className="bar-gauge" style={{ height: 6 }}>
          <div
            className="fill"
            style={{
              width: `${progressPct * 100}%`,
              background: 'linear-gradient(90deg, var(--primary), var(--tertiary))',
            }}
          />
        </div>
      </div>

      {/* Rest overlay */}
      <AnimatePresence>
        {restRemaining !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{
              background:
                'radial-gradient(circle at 50% 50%, rgba(var(--glow), 0.4) 0%, rgba(0,0,0,0.85) 80%)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 20, stiffness: 260 }}
              className="flex flex-col items-center text-center"
            >
              <span className="label mb-2">RECOVERING</span>
              <ProgressRing
                value={1 - restRemaining / (block.restSeconds || 60)}
                size={220}
                stroke={14}
                color="var(--primary)"
              >
                <div className="display-xl" style={{ letterSpacing: '-0.05em' }}>
                  {restRemaining}
                </div>
                <span className="text-xs opacity-60 font-bold mt-1">SECONDS</span>
              </ProgressRing>
              <div className="flex gap-2 mt-6">
                <Button
                  variant="outlined"
                  onClick={() =>
                    setRestRemaining((r) => (r !== null ? Math.max(0, r - 10) : null))
                  }
                >
                  -10s
                </Button>
                <Button
                  variant="tonal"
                  onClick={() => setRestRemaining((r) => (r !== null ? r + 10 : null))}
                >
                  +10s
                </Button>
                <Button variant="filled" icon="skip_next" onClick={() => setRestRemaining(0)}>
                  Skip
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exercise content */}
      <main className="flex-1 px-4 pb-[120px] mt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="label">
                EXERCISE {currentIdx + 1} / {blocks.length}
              </span>
              {allCompletedInBlock && (
                <span
                  className="flex items-center gap-1 text-xs font-extrabold"
                  style={{ color: 'var(--primary)' }}
                >
                  <Icon name="task_alt" filled size={16} />
                  DONE
                </span>
              )}
            </div>
            <h1 className="display-lg mb-2" style={{ letterSpacing: '-0.04em' }}>
              {exercise.name}
            </h1>
            <p className="opacity-70 text-sm font-medium">
              Target: {block.sets.length} sets × {block.targetReps}
            </p>

            {/* Exercise hero icon */}
            <motion.div
              className="expressive-card my-4 flex items-center gap-3"
              layout
              style={{
                background: `var(--${exercise.color}-container)`,
                color: `var(--on-${exercise.color}-container)`,
                borderRadius: 28,
                padding: 16,
              }}
            >
              <div
                className="flex items-center justify-center rounded-3xl"
                style={{
                  width: 60,
                  height: 60,
                  background: 'rgba(255,255,255,0.2)',
                }}
              >
                <Icon name={exercise.icon} filled size={28} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-extrabold capitalize">{exercise.muscle}</div>
                <div className="text-xs opacity-80 capitalize">
                  {exercise.equipment} • {exercise.difficulty}
                </div>
              </div>
              <IconButton
                name="info"
                onClick={() => navigate(`/exercises/${exercise.id}`)}
                style={{ color: 'inherit' }}
              />
            </motion.div>

            {/* Sets list */}
            <div className="space-y-2">
              {block.sets.map((s, i) => (
                <motion.div
                  layout
                  key={s.id}
                  className="expressive-card flex items-center gap-2"
                  style={{
                    padding: 12,
                    borderRadius: 24,
                    background: s.completed
                      ? 'color-mix(in srgb, var(--primary) 18%, var(--surface-container))'
                      : undefined,
                  }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                >
                  <div
                    className="flex items-center justify-center rounded-2xl font-extrabold"
                    style={{
                      width: 40,
                      height: 40,
                      background: s.completed ? 'var(--primary)' : 'var(--surface-container-highest)',
                      color: s.completed ? 'var(--on-primary)' : 'var(--on-surface)',
                    }}
                  >
                    {i + 1}
                  </div>

                  <div className="flex flex-col gap-1 flex-1">
                    <span className="text-[10px] font-bold opacity-60">WEIGHT · KG</span>
                    <Stepper
                      value={s.weight}
                      step={2.5}
                      min={0}
                      max={500}
                      onChange={(v) => updateSet(i, { weight: v })}
                    />
                  </div>

                  <div className="flex flex-col gap-1 flex-1">
                    <span className="text-[10px] font-bold opacity-60">REPS</span>
                    <Stepper
                      value={s.reps}
                      step={1}
                      min={0}
                      max={200}
                      onChange={(v) => updateSet(i, { reps: v })}
                    />
                  </div>

                  <button
                    onClick={() => completeSet(i)}
                    className="m3-iconbtn"
                    style={{
                      width: 48,
                      height: 48,
                      background: s.completed ? 'var(--primary)' : 'transparent',
                      color: s.completed ? 'var(--on-primary)' : 'var(--on-surface-variant)',
                      border: !s.completed ? '1.5px solid var(--outline)' : 'none',
                    }}
                    aria-label="complete"
                  >
                    <Icon name={s.completed ? 'check' : 'radio_button_unchecked'} filled size={22} />
                  </button>
                </motion.div>
              ))}
            </div>

            <div className="mt-3">
              <Button variant="outlined" icon="add" className="w-full" onClick={addSet}>
                Add Set
              </Button>
            </div>

            {/* Navigation between exercises */}
            <div className="flex items-center gap-2 mt-6">
              <Button
                variant="tonal"
                icon="arrow_back"
                onClick={goPrev}
                disabled={currentIdx === 0}
                className="flex-1"
              >
                Prev
              </Button>
              {currentIdx < blocks.length - 1 ? (
                <Button
                  variant="filled"
                  trailingIcon="arrow_forward"
                  onClick={goNext}
                  className="flex-1"
                >
                  Next exercise
                </Button>
              ) : (
                <Button
                  variant="tertiary-tonal"
                  icon="emoji_events"
                  onClick={finish}
                  className="flex-1"
                >
                  Finish
                </Button>
              )}
            </div>

            {/* Live stats */}
            <div className="expressive-card mt-5 grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="label">VOLUME</div>
                <div className="font-extrabold text-lg mt-1" style={{ letterSpacing: '-0.02em' }}>
                  {totalVolume.toLocaleString()}
                  <span className="text-xs opacity-60 ml-1">kg</span>
                </div>
              </div>
              <div>
                <div className="label">SETS</div>
                <div className="font-extrabold text-lg mt-1" style={{ letterSpacing: '-0.02em' }}>
                  {completedSets}/{totalSets}
                </div>
              </div>
              <div>
                <div className="label">TIME</div>
                <div className="font-extrabold text-lg mt-1" style={{ letterSpacing: '-0.02em' }}>
                  {mmss(elapsed)}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    </motion.div>
  );
}
