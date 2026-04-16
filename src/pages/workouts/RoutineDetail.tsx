import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import Icon from '../../components/ui/Icon';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import { useAppState, store } from '../../data/store';
import { getExercise } from '../../data/exercises';
import { useToast } from '../../components/ui/Toast';
import IconButton from '../../components/ui/IconButton';

export default function RoutineDetail() {
  const { id } = useParams();
  const state = useAppState();
  const navigate = useNavigate();
  const toast = useToast();
  const routine = state.routines.find((r) => r.id === id);

  if (!routine) {
    return (
      <div className="page p-8 text-center">
        <p className="opacity-60">Routine not found.</p>
        <Link to="/workouts" className="text-primary font-bold">
          Back to workouts
        </Link>
      </div>
    );
  }

  const totalSets = routine.exercises.reduce((acc, b) => acc + b.targetSets, 0);

  const handleDelete = () => {
    if (confirm(`Delete "${routine.name}"?`)) {
      store.deleteRoutine(routine.id);
      toast.show('Routine deleted', 'delete');
      navigate('/workouts');
    }
  };

  return (
    <motion.div
      className="page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <PageHeader
        title={routine.name}
        subtitle={`${routine.exercises.length} exercises • ${totalSets} total sets • ${routine.durationMin} min`}
        back
        right={<IconButton name="delete" size={44} iconSize={20} onClick={handleDelete} />}
        size="lg"
      />

      <main className="px-4">
        {/* Hero summary */}
        <motion.article
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 22, stiffness: 220 }}
          className={`expressive-hero hero-${routine.color} hero-blob`}
          style={{ padding: 24 }}
        >
          <div className="flex items-start justify-between mb-3">
            <Icon name={routine.icon} filled size={40} />
            <div
              className="px-3 py-1 rounded-full text-xs font-extrabold uppercase"
              style={{ background: 'rgba(255,255,255,0.18)' }}
            >
              {routine.difficulty}
            </div>
          </div>
          <p className="text-sm opacity-90 font-medium">{routine.description}</p>
          <div className="flex gap-2 mt-4 flex-wrap">
            {routine.muscles.map((m) => (
              <span
                key={m}
                className="px-3 py-1 rounded-full text-xs font-bold"
                style={{ background: 'rgba(255,255,255,0.18)' }}
              >
                {m}
              </span>
            ))}
          </div>
        </motion.article>

        {/* Start button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-5"
        >
          <Button
            xl
            icon="play_arrow"
            className="w-full"
            glow
            onClick={() => navigate(`/workouts/${routine.id}/active`)}
          >
            Start Workout
          </Button>
        </motion.div>

        {/* Exercise blocks */}
        <section className="mt-6">
          <h3 className="title mb-3 px-1">Exercises</h3>
          <div className="space-y-2">
            {routine.exercises.map((block, i) => {
              const ex = getExercise(block.exerciseId);
              if (!ex) return null;
              return (
                <motion.div
                  key={block.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i + 0.1 }}
                >
                  <Link to={`/exercises/${ex.id}`} className="block">
                    <div className="track-item">
                      <div
                        className="track-icon lg"
                        style={{
                          background: `var(--${ex.color}-container)`,
                          color: `var(--on-${ex.color}-container)`,
                        }}
                      >
                        <Icon name={ex.icon} filled size={28} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className="font-extrabold truncate"
                          style={{ letterSpacing: '-0.01em', fontSize: '1.05rem' }}
                        >
                          {ex.name}
                        </div>
                        <div className="text-xs opacity-70 font-semibold mt-1">
                          {block.targetSets} × {block.targetReps} • {block.restSeconds}s rest
                        </div>
                      </div>
                      <Icon name="chevron_right" size={22} style={{ opacity: 0.5 }} />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>
      </main>
    </motion.div>
  );
}
