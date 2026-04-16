import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import Icon from '../../components/ui/Icon';
import PageHeader from '../../components/ui/PageHeader';
import ProgressRing from '../../components/ui/ProgressRing';
import Button from '../../components/ui/Button';
import PillChip from '../../components/ui/PillChip';
import Sheet from '../../components/ui/Sheet';
import { LoadingWave } from '../../components/ui/Loading';
import { store, useAppState, mealsToday, waterToday } from '../../data/store';
import { generateDietPlan } from '../../lib/gemini';
import { useToast } from '../../components/ui/Toast';

export default function DietDashboard() {
  const state = useAppState();
  const navigate = useNavigate();
  const toast = useToast();
  const [planOpen, setPlanOpen] = useState(false);
  const [planLoading, setPlanLoading] = useState(false);
  const [plan, setPlan] = useState<string>('');

  const today = mealsToday(state);
  const water = waterToday(state);

  const totals = useMemo(
    () =>
      today.reduce(
        (acc, m) => ({
          calories: acc.calories + m.calories,
          protein: acc.protein + m.protein,
          carbs: acc.carbs + m.carbs,
          fat: acc.fat + m.fat,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 },
      ),
    [today],
  );

  const remaining = Math.max(0, state.profile.dailyCalorieTarget - totals.calories);
  const caloriePct = Math.min(1, totals.calories / state.profile.dailyCalorieTarget);
  const proteinPct = Math.min(1, totals.protein / state.profile.dailyProteinTarget);
  const carbsPct = Math.min(1, totals.carbs / state.profile.dailyCarbsTarget);
  const fatPct = Math.min(1, totals.fat / state.profile.dailyFatTarget);
  const waterPct = Math.min(1, water / state.profile.dailyWaterMl);

  const openPlan = async () => {
    setPlanOpen(true);
    if (!plan) {
      setPlanLoading(true);
      try {
        const res = await generateDietPlan(state.profile);
        setPlan(res);
      } catch (e: any) {
        setPlan(`⚠️ Couldn't generate plan. ${e?.message || ''}`);
      } finally {
        setPlanLoading(false);
      }
    }
  };

  return (
    <motion.div
      className="page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <PageHeader
        title="Nutrition"
        subtitle="AI-powered macro tracking"
        right={
          <button
            onClick={openPlan}
            className="m3-iconbtn"
            style={{ background: 'var(--tertiary-container)', color: 'var(--on-tertiary-container)' }}
          >
            <Icon name="auto_awesome" filled size={22} />
          </button>
        }
      />

      {/* Hero ring */}
      <main className="px-4">
        <motion.article
          initial={{ scale: 0.94, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 22, stiffness: 220 }}
          className="expressive-hero hero-primary hero-blob"
          style={{ padding: 24 }}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <span className="label" style={{ color: 'inherit', opacity: 0.75 }}>
                CALORIES LEFT
              </span>
              <div className="display-xl" style={{ letterSpacing: '-0.05em' }}>
                {remaining}
              </div>
              <p className="opacity-80 text-sm font-bold mt-1">
                {totals.calories} / {state.profile.dailyCalorieTarget} kcal
              </p>
            </div>
            <ProgressRing
              value={caloriePct}
              size={120}
              stroke={12}
              color="rgba(255,255,255,0.95)"
            >
              <div className="font-extrabold text-2xl" style={{ letterSpacing: '-0.03em' }}>
                {Math.round(caloriePct * 100)}
                <span className="text-xs">%</span>
              </div>
            </ProgressRing>
          </div>
        </motion.article>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <motion.button
            onClick={() => navigate('/diet/scan')}
            className="expressive-card text-left"
            style={{ padding: 16, background: 'var(--primary-container)', color: 'var(--on-primary-container)' }}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Icon name="photo_camera" filled size={28} />
            <div className="font-extrabold mt-2" style={{ letterSpacing: '-0.01em' }}>
              Scan Meal
            </div>
            <div className="text-xs opacity-80 font-medium mt-0.5">Camera + AI</div>
          </motion.button>
          <motion.button
            onClick={() => store.addWater(250)}
            className="expressive-card text-left"
            style={{ padding: 16, background: 'var(--secondary-container)', color: 'var(--on-secondary-container)' }}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.12 }}
          >
            <Icon name="water_drop" filled size={28} />
            <div className="font-extrabold mt-2" style={{ letterSpacing: '-0.01em' }}>
              +250ml
            </div>
            <div className="text-xs opacity-80 font-medium mt-0.5">
              {(water / 1000).toFixed(1)}L today
            </div>
          </motion.button>
        </div>

        {/* Macros */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="expressive-card mt-4"
        >
          <h3 className="title mb-3">Macros</h3>
          <div className="grid grid-cols-3 gap-3">
            <MacroMini label="Protein" value={totals.protein} target={state.profile.dailyProteinTarget} pct={proteinPct} color="var(--primary)" />
            <MacroMini label="Carbs" value={totals.carbs} target={state.profile.dailyCarbsTarget} pct={carbsPct} color="var(--tertiary)" />
            <MacroMini label="Fat" value={totals.fat} target={state.profile.dailyFatTarget} pct={fatPct} color="var(--secondary)" />
          </div>
        </motion.section>

        {/* Water */}
        <motion.section
          className="expressive-card mt-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="title">Water</h3>
            <span className="text-xs opacity-60 font-bold">
              {(water / 1000).toFixed(1)}L / {(state.profile.dailyWaterMl / 1000).toFixed(1)}L
            </span>
          </div>
          <div className="bar-gauge">
            <div
              className="fill"
              style={{
                width: `${waterPct * 100}%`,
                background: 'linear-gradient(90deg, var(--secondary), var(--primary))',
              }}
            />
          </div>
          <div className="flex gap-2 mt-3 flex-wrap">
            <PillChip icon="add" onClick={() => store.addWater(100)}>100ml</PillChip>
            <PillChip icon="add" onClick={() => store.addWater(250)}>250ml</PillChip>
            <PillChip icon="add" onClick={() => store.addWater(500)}>500ml</PillChip>
            <PillChip icon="local_cafe" onClick={() => store.addWater(300)}>Cup</PillChip>
          </div>
        </motion.section>

        {/* Today's meals */}
        <section className="mt-5">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="title">Today's meals</h3>
            <Link to="/diet/scan" className="text-sm font-bold" style={{ color: 'var(--primary)' }}>
              + Add
            </Link>
          </div>
          {today.length === 0 ? (
            <div className="expressive-card text-center" style={{ padding: 24 }}>
              <Icon name="restaurant" size={40} className="opacity-30" />
              <p className="opacity-60 mt-2 font-medium">No meals logged yet.</p>
              <div className="mt-3">
                <Button icon="photo_camera" variant="tonal" onClick={() => navigate('/diet/scan')}>
                  Scan first meal
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {today.map((m) => (
                <motion.div
                  key={m.id}
                  className="track-item"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  layout
                >
                  <div
                    className="track-icon"
                    style={{
                      background: 'var(--tertiary-container)',
                      color: 'var(--on-tertiary-container)',
                    }}
                  >
                    <Icon name="restaurant" filled size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-extrabold truncate" style={{ letterSpacing: '-0.01em' }}>
                      {m.name}
                    </div>
                    <div className="text-xs opacity-60 font-semibold capitalize">
                      {m.type} • {new Date(m.at).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-extrabold" style={{ color: 'var(--primary)', letterSpacing: '-0.02em' }}>
                      {m.calories}
                    </div>
                    <div className="text-[10px] opacity-60 font-bold">KCAL</div>
                  </div>
                  <button
                    className="m3-iconbtn"
                    onClick={() => {
                      store.deleteMeal(m.id);
                      toast.show('Meal removed', 'delete');
                    }}
                    style={{ width: 36, height: 36 }}
                  >
                    <Icon name="close" size={18} />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </main>

      <Sheet open={planOpen} onClose={() => setPlanOpen(false)} title="AI Diet Plan">
        {planLoading ? (
          <div className="flex flex-col items-center gap-3 py-10">
            <LoadingWave />
            <p className="opacity-70 font-medium">Cooking your personalized plan...</p>
          </div>
        ) : (
          <div
            className="markdown-body px-2"
            dangerouslySetInnerHTML={{
              __html: plan
                .replace(/\n/g, '<br/>')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
            }}
          />
        )}
        <div className="mt-4 px-1">
          <Button
            variant="tonal"
            icon="refresh"
            className="w-full"
            disabled={planLoading}
            onClick={async () => {
              setPlan('');
              setPlanLoading(true);
              try {
                const res = await generateDietPlan(state.profile);
                setPlan(res);
              } finally {
                setPlanLoading(false);
              }
            }}
          >
            Regenerate
          </Button>
        </div>
      </Sheet>
    </motion.div>
  );
}

function MacroMini({
  label,
  value,
  target,
  pct,
  color,
}: {
  label: string;
  value: number;
  target: number;
  pct: number;
  color: string;
}) {
  return (
    <div className="text-center">
      <ProgressRing value={pct} size={80} stroke={8} color={color}>
        <div className="font-extrabold text-base" style={{ letterSpacing: '-0.02em' }}>
          {Math.round(value)}
        </div>
        <div className="text-[9px] opacity-60 font-bold">/ {target}g</div>
      </ProgressRing>
      <div className="label mt-2" style={{ fontSize: 10 }}>{label}</div>
    </div>
  );
}
