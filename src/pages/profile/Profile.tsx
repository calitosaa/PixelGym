import { useState } from 'react';
import { motion } from 'motion/react';
import PageHeader from '../../components/ui/PageHeader';
import Icon from '../../components/ui/Icon';
import Stepper from '../../components/ui/Stepper';
import PillChip from '../../components/ui/PillChip';
import SegmentedControl from '../../components/ui/SegmentedControl';
import Button from '../../components/ui/Button';
import { store, useAppState } from '../../data/store';
import { UserProfile } from '../../types';
import { calculateTargets } from '../../lib/nutrition';
import { useToast } from '../../components/ui/Toast';

const THEMES: { key: UserProfile['theme']; label: string; color: string }[] = [
  { key: 'dynamic-blue', label: 'Blue', color: '#AEC6FF' },
  { key: 'dynamic-violet', label: 'Violet', color: '#D3BBFF' },
  { key: 'dynamic-green', label: 'Green', color: '#9CD67C' },
  { key: 'dynamic-coral', label: 'Coral', color: '#FFB59B' },
];

export default function Profile() {
  const state = useAppState();
  const toast = useToast();
  const p = state.profile;

  const [name, setName] = useState(p.name);
  const [age, setAge] = useState(p.age);
  const [height, setHeight] = useState(p.heightCm);
  const [weight, setWeight] = useState(p.weightKg);

  const update = (patch: Partial<UserProfile>) => {
    store.updateProfile(patch);
  };

  const recalcTargets = () => {
    const t = calculateTargets({ ...p, age, heightCm: height, weightKg: weight });
    store.updateProfile(t);
    toast.show('Targets recalculated', 'calculate');
  };

  return (
    <motion.div
      className="page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <PageHeader title="Profile" back size="lg" />

      <main className="px-4 space-y-4">
        {/* Avatar hero */}
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 22, stiffness: 220 }}
          className="expressive-hero hero-primary hero-blob text-center"
          style={{ padding: 28 }}
        >
          <div
            className="rounded-full flex items-center justify-center mx-auto mb-3"
            style={{
              width: 96,
              height: 96,
              background: 'rgba(255,255,255,0.2)',
            }}
          >
            <Icon name="person" filled size={56} />
          </div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => update({ name })}
            className="text-center font-extrabold text-2xl bg-transparent border-none outline-none w-full"
            style={{ color: 'inherit', letterSpacing: '-0.02em' }}
          />
          <p className="opacity-80 mt-1 font-medium text-sm capitalize">
            {p.goal} • {p.experience}
          </p>
        </motion.div>

        {/* Body */}
        <SectionCard title="Body">
          <Row label="Age">
            <Stepper
              value={age}
              onChange={(v) => {
                setAge(v);
                update({ age: v });
              }}
              min={14}
              max={100}
            />
          </Row>
          <Row label="Height">
            <Stepper
              value={height}
              onChange={(v) => {
                setHeight(v);
                update({ heightCm: v });
              }}
              min={120}
              max={240}
              unit="cm"
            />
          </Row>
          <Row label="Weight">
            <Stepper
              value={weight}
              onChange={(v) => {
                setWeight(v);
                update({ weightKg: v });
              }}
              min={30}
              max={250}
              step={0.5}
              unit="kg"
            />
          </Row>
          <Row label="Sex">
            <SegmentedControl
              value={p.sex}
              onChange={(v) => update({ sex: v })}
              options={[
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'other', label: 'Other' },
              ]}
            />
          </Row>
        </SectionCard>

        {/* Goal & Activity */}
        <SectionCard title="Goal & Activity">
          <div className="flex gap-2 flex-wrap mb-3">
            {(['cut', 'maintain', 'bulk', 'recomp'] as const).map((g) => (
              <PillChip key={g} active={p.goal === g} onClick={() => update({ goal: g })}>
                {g}
              </PillChip>
            ))}
          </div>
          <Row label="Activity">
            <SegmentedControl
              value={p.activity}
              onChange={(v) => update({ activity: v })}
              options={[
                { value: 'sedentary', label: 'Low' },
                { value: 'moderate', label: 'Med' },
                { value: 'intense', label: 'High' },
              ]}
            />
          </Row>
          <Row label="Level">
            <SegmentedControl
              value={p.experience}
              onChange={(v) => update({ experience: v })}
              options={[
                { value: 'beginner', label: 'Beginner' },
                { value: 'intermediate', label: 'Intermed.' },
                { value: 'advanced', label: 'Advanced' },
              ]}
            />
          </Row>
          <Button
            icon="auto_fix_high"
            variant="tertiary-tonal"
            className="w-full mt-3"
            onClick={recalcTargets}
          >
            Auto-calculate targets
          </Button>
        </SectionCard>

        {/* Targets */}
        <SectionCard title="Daily Targets">
          <Row label="Calories">
            <Stepper
              value={p.dailyCalorieTarget}
              onChange={(v) => update({ dailyCalorieTarget: v })}
              step={50}
              min={1000}
              max={6000}
              unit="kcal"
            />
          </Row>
          <Row label="Protein">
            <Stepper
              value={p.dailyProteinTarget}
              onChange={(v) => update({ dailyProteinTarget: v })}
              step={5}
              min={20}
              max={400}
              unit="g"
            />
          </Row>
          <Row label="Carbs">
            <Stepper
              value={p.dailyCarbsTarget}
              onChange={(v) => update({ dailyCarbsTarget: v })}
              step={5}
              min={20}
              max={800}
              unit="g"
            />
          </Row>
          <Row label="Fat">
            <Stepper
              value={p.dailyFatTarget}
              onChange={(v) => update({ dailyFatTarget: v })}
              step={5}
              min={10}
              max={250}
              unit="g"
            />
          </Row>
          <Row label="Water">
            <Stepper
              value={p.dailyWaterMl}
              onChange={(v) => update({ dailyWaterMl: v })}
              step={250}
              min={500}
              max={6000}
              unit="ml"
            />
          </Row>
        </SectionCard>

        {/* Theme */}
        <SectionCard title="Expressive Theme">
          <div className="grid grid-cols-4 gap-2">
            {THEMES.map((t) => (
              <button
                key={t.key}
                onClick={() => {
                  update({ theme: t.key });
                  document.documentElement.setAttribute('data-theme', t.key);
                  toast.show(`${t.label} theme`, 'palette');
                }}
                className="relative rounded-3xl p-3 flex flex-col items-center gap-2"
                style={{
                  background:
                    p.theme === t.key
                      ? 'color-mix(in srgb, var(--primary) 15%, transparent)'
                      : 'color-mix(in srgb, var(--surface-container) 80%, transparent)',
                  border:
                    p.theme === t.key
                      ? `2px solid var(--primary)`
                      : '2px solid transparent',
                  transition: 'all 0.3s var(--spring-fast-spatial)',
                }}
              >
                <div
                  className="rounded-full"
                  style={{
                    width: 36,
                    height: 36,
                    background: `linear-gradient(135deg, ${t.color}, color-mix(in srgb, ${t.color} 60%, #fff))`,
                  }}
                />
                <span className="text-[11px] font-extrabold">{t.label}</span>
                {p.theme === t.key && (
                  <Icon
                    name="check"
                    size={16}
                    filled
                    className="absolute top-1 right-1"
                    style={{ color: 'var(--primary)' }}
                  />
                )}
              </button>
            ))}
          </div>
        </SectionCard>

        <Button
          variant="outlined"
          icon="restart_alt"
          className="w-full"
          onClick={() => {
            if (confirm('Reset all data?')) {
              store.reset();
              toast.show('Data reset', 'refresh');
            }
          }}
        >
          Reset all data
        </Button>

        <div className="text-center opacity-40 text-xs font-bold py-4">
          PixelGym v1.0 • Material 3 Expressive
        </div>
      </main>
    </motion.div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="expressive-card"
    >
      <span className="label">{title.toUpperCase()}</span>
      <div className="mt-2 space-y-3">{children}</div>
    </motion.div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="font-bold text-sm opacity-90">{label}</span>
      {children}
    </div>
  );
}
