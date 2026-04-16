import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import Icon from '../../components/ui/Icon';
import PillChip from '../../components/ui/PillChip';
import PageHeader from '../../components/ui/PageHeader';
import { EXERCISES } from '../../data/exercises';
import { MuscleGroup } from '../../types';
import { useAppState } from '../../data/store';

const MUSCLES: { key: MuscleGroup | 'all' | 'favorites'; label: string; icon: string }[] = [
  { key: 'all', label: 'All', icon: 'apps' },
  { key: 'favorites', label: 'Favorites', icon: 'favorite' },
  { key: 'chest', label: 'Chest', icon: 'fitness_center' },
  { key: 'back', label: 'Back', icon: 'fitness_center' },
  { key: 'legs', label: 'Legs', icon: 'directions_run' },
  { key: 'shoulders', label: 'Shoulders', icon: 'fitness_center' },
  { key: 'biceps', label: 'Biceps', icon: 'fitness_center' },
  { key: 'triceps', label: 'Triceps', icon: 'fitness_center' },
  { key: 'core', label: 'Core', icon: 'self_improvement' },
  { key: 'glutes', label: 'Glutes', icon: 'fitness_center' },
  { key: 'cardio', label: 'Cardio', icon: 'favorite' },
];

export default function ExercisesList() {
  const [filter, setFilter] = useState<MuscleGroup | 'all' | 'favorites'>('all');
  const [query, setQuery] = useState('');
  const state = useAppState();

  const filtered = useMemo(() => {
    let list = EXERCISES;
    if (filter === 'favorites') {
      list = list.filter((e) => state.favoriteExercises.includes(e.id));
    } else if (filter !== 'all') {
      list = list.filter(
        (e) => e.muscle === filter || e.secondaryMuscles?.includes(filter as MuscleGroup),
      );
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((e) => e.name.toLowerCase().includes(q));
    }
    return list;
  }, [filter, query, state.favoriteExercises]);

  return (
    <motion.div
      className="page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <PageHeader title="Moves" subtitle={`${EXERCISES.length} exercises with AI-powered demos`} />

      <div className="px-4 mb-3">
        <div
          className="flex items-center gap-2 rounded-[999px] px-4 py-3"
          style={{ background: 'color-mix(in srgb, var(--surface-container) 85%, transparent)', border: '1px solid color-mix(in srgb, var(--on-surface) 8%, transparent)' }}
        >
          <Icon name="search" size={20} className="opacity-60" />
          <input
            className="bg-transparent border-0 outline-none flex-1 text-[0.95rem] font-medium"
            placeholder="Search exercise..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button className="m3-iconbtn" onClick={() => setQuery('')} style={{ width: 32, height: 32 }}>
              <Icon name="close" size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="chip-row">
        {MUSCLES.map((m) => (
          <PillChip
            key={m.key}
            active={filter === m.key}
            onClick={() => setFilter(m.key)}
            icon={m.icon}
            variant={m.key === 'favorites' ? 'tertiary' : 'primary'}
          >
            {m.label}
          </PillChip>
        ))}
      </div>

      <main className="px-4 mt-4 space-y-2">
        {filtered.map((ex, i) => (
          <motion.div
            key={ex.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.02 }}
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
                  <Icon name={ex.icon} filled size={26} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-extrabold truncate" style={{ letterSpacing: '-0.01em' }}>
                    {ex.name}
                  </div>
                  <div className="text-xs opacity-60 font-semibold capitalize mt-0.5">
                    {ex.muscle} • {ex.equipment} • {ex.difficulty}
                  </div>
                </div>
                {state.favoriteExercises.includes(ex.id) && (
                  <Icon name="favorite" filled size={20} style={{ color: 'var(--tertiary)' }} />
                )}
              </div>
            </Link>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center opacity-50 py-12">No exercises found.</div>
        )}
      </main>
    </motion.div>
  );
}
