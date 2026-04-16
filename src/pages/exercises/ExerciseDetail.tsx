import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import Icon from '../../components/ui/Icon';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import IconButton from '../../components/ui/IconButton';
import { LoadingWave } from '../../components/ui/Loading';
import { getExercise } from '../../data/exercises';
import { useAppState, store } from '../../data/store';
import { generateExerciseVideo } from '../../lib/gemini';
import { useToast } from '../../components/ui/Toast';

export default function ExerciseDetail() {
  const { id } = useParams();
  const state = useAppState();
  const toast = useToast();
  const ex = id ? getExercise(id) : undefined;
  const [tab, setTab] = useState<'how' | 'tips' | 'ai'>('how');
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  if (!ex) {
    return (
      <div className="p-8 text-center">
        <p className="opacity-60">Exercise not found.</p>
        <Link to="/exercises" className="text-primary font-bold">
          Back to library
        </Link>
      </div>
    );
  }

  const isFav = state.favoriteExercises.includes(ex.id);
  const cached = state.generatedVideos.find((v) => v.exerciseId === ex.id);

  const handleGenerate = async () => {
    setGenLoading(true);
    setGenError(null);
    try {
      const url = await generateExerciseVideo(ex.name, ex.muscle);
      store.saveGeneratedVideo(ex.id, url, ex.name);
      toast.show('Video ready!', 'movie');
    } catch (e: any) {
      console.error(e);
      setGenError(e?.message || 'Generation failed');
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
      <PageHeader
        title={ex.name}
        subtitle={`${ex.muscle} • ${ex.equipment} • ${ex.difficulty}`}
        back
        right={
          <IconButton
            name="favorite"
            filled={isFav}
            iconSize={22}
            size={44}
            onClick={() => {
              store.toggleFavorite(ex.id);
              toast.show(isFav ? 'Removed from favorites' : 'Added to favorites', 'favorite');
            }}
            style={{ color: isFav ? 'var(--error)' : undefined }}
          />
        }
        size="lg"
      />

      <main className="px-4">
        {/* Hero illustration */}
        <motion.div
          initial={{ scale: 0.94, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 22, stiffness: 220 }}
          className={`expressive-hero hero-${ex.color} hero-blob flex items-center justify-center`}
          style={{ aspectRatio: '16/10', padding: 24 }}
        >
          <Icon name={ex.icon} filled size={120} style={{ opacity: 0.85 }} />
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mt-4 overflow-x-auto scrollbar-hide">
          {(
            [
              { key: 'how', label: 'How to', icon: 'menu_book' },
              { key: 'tips', label: 'Tips', icon: 'lightbulb' },
              { key: 'ai', label: 'AI Video', icon: 'auto_awesome' },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`pill-chip ${tab === t.key ? 'active ' + (t.key === 'ai' ? 'tertiary' : '') : ''}`}
            >
              <Icon name={t.icon} size={16} filled={tab === t.key} />
              {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === 'how' && (
            <motion.div
              key="how"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="expressive-card mt-4"
            >
              <h3 className="title mb-2">Step-by-step</h3>
              <ol className="space-y-3 list-none pl-0">
                {ex.instructions.map((s, i) => (
                  <li key={i} className="flex gap-3">
                    <div
                      className="flex items-center justify-center rounded-full font-extrabold flex-shrink-0"
                      style={{
                        width: 28,
                        height: 28,
                        background: 'var(--primary-container)',
                        color: 'var(--on-primary-container)',
                        fontSize: 13,
                      }}
                    >
                      {i + 1}
                    </div>
                    <p className="flex-1 text-sm font-medium opacity-90">{s}</p>
                  </li>
                ))}
              </ol>
              <div className="mt-4 pt-3 border-t border-white/5">
                <span className="label">TARGETS</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-extrabold capitalize"
                    style={{
                      background: 'var(--primary-container)',
                      color: 'var(--on-primary-container)',
                    }}
                  >
                    {ex.muscle}
                  </span>
                  {ex.secondaryMuscles?.map((m) => (
                    <span
                      key={m}
                      className="px-3 py-1 rounded-full text-xs font-bold capitalize"
                      style={{
                        background: 'color-mix(in srgb, var(--on-surface) 8%, transparent)',
                      }}
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {tab === 'tips' && (
            <motion.div
              key="tips"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="expressive-card mt-4"
            >
              <h3 className="title mb-2">Pro tips</h3>
              <ul className="space-y-3">
                {ex.tips.map((t, i) => (
                  <li key={i} className="flex gap-3">
                    <Icon
                      name="tips_and_updates"
                      filled
                      size={18}
                      style={{ color: 'var(--tertiary)', flexShrink: 0, marginTop: 2 }}
                    />
                    <p className="flex-1 text-sm font-medium opacity-90">{t}</p>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {tab === 'ai' && (
            <motion.div
              key="ai"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4"
            >
              {cached ? (
                <div className="expressive-card">
                  <video
                    src={cached.url}
                    controls
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full rounded-2xl"
                    style={{ aspectRatio: '16/9', background: '#000' }}
                  />
                  <p className="text-xs opacity-60 mt-2">
                    Generated{' '}
                    {new Date(cached.at).toLocaleDateString('en', {
                      day: 'numeric',
                      month: 'short',
                    })}{' '}
                    via Veo 3.1
                  </p>
                  <Button
                    className="w-full mt-3"
                    variant="tonal"
                    icon="refresh"
                    onClick={handleGenerate}
                    disabled={genLoading}
                  >
                    {genLoading ? <LoadingWave /> : 'Regenerate video'}
                  </Button>
                </div>
              ) : (
                <div className={`expressive-hero hero-tertiary hero-blob`} style={{ padding: 24 }}>
                  <div className="flex items-center justify-between mb-2">
                    <Icon name="auto_awesome" filled size={28} />
                    <div
                      className="px-2 py-1 rounded-full text-[10px] font-extrabold"
                      style={{ background: 'rgba(255,255,255,0.2)' }}
                    >
                      VEO 3.1
                    </div>
                  </div>
                  <h3 className="display-lg" style={{ letterSpacing: '-0.04em' }}>
                    Generate a form demo
                  </h3>
                  <p className="text-sm opacity-85 font-medium mt-2">
                    Our AI will create a short cinematic video showing perfect technique for{' '}
                    <strong>{ex.name}</strong>.
                  </p>
                  <Button
                    xl
                    className="w-full mt-5"
                    variant="filled"
                    icon={genLoading ? undefined : 'movie'}
                    onClick={handleGenerate}
                    disabled={genLoading}
                    style={{ background: 'rgba(255,255,255,0.95)', color: '#000' }}
                  >
                    {genLoading ? (
                      <>
                        <LoadingWave /> Synthesizing...
                      </>
                    ) : (
                      'Generate video'
                    )}
                  </Button>
                  {genError && (
                    <p className="text-xs mt-3 font-semibold" style={{ color: '#fff', opacity: 0.9 }}>
                      {genError}
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </motion.div>
  );
}
