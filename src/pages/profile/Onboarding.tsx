import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/ui/Icon';
import Button from '../../components/ui/Button';
import PillChip from '../../components/ui/PillChip';
import Stepper from '../../components/ui/Stepper';
import SegmentedControl from '../../components/ui/SegmentedControl';
import { store } from '../../data/store';
import { UserProfile } from '../../types';
import { calculateTargets } from '../../lib/nutrition';

const STEPS = ['welcome', 'identity', 'body', 'goal', 'level', 'done'] as const;

type Step = (typeof STEPS)[number];

export default function Onboarding() {
  const [step, setStep] = useState<Step>('welcome');
  const [data, setData] = useState({
    name: '',
    age: 25,
    sex: 'male' as UserProfile['sex'],
    heightCm: 175,
    weightKg: 75,
    goal: 'recomp' as UserProfile['goal'],
    activity: 'moderate' as UserProfile['activity'],
    experience: 'intermediate' as UserProfile['experience'],
  });
  const navigate = useNavigate();

  const idx = STEPS.indexOf(step);
  const progress = idx / (STEPS.length - 1);

  const next = () => {
    const i = STEPS.indexOf(step);
    if (i < STEPS.length - 1) setStep(STEPS[i + 1]);
  };

  const finish = () => {
    const targets = calculateTargets({
      ...data,
      // fill defaults
      name: data.name || 'Athlete',
      dailyCalorieTarget: 2000,
      dailyProteinTarget: 0,
      dailyCarbsTarget: 0,
      dailyFatTarget: 0,
      dailyWaterMl: 2500,
      theme: 'dynamic-blue',
      onboardingDone: true,
    });
    store.completeOnboarding({ ...data, ...targets });
    navigate('/');
  };

  return (
    <div
      className="min-h-[100dvh] flex flex-col"
      style={{
        background:
          'radial-gradient(circle at 50% 0%, var(--primary-container) 0%, var(--background) 60%)',
      }}
    >
      {/* Progress */}
      <div className="p-5">
        {step !== 'welcome' && (
          <div className="bar-gauge" style={{ height: 4 }}>
            <motion.div
              className="fill"
              animate={{ width: `${progress * 100}%` }}
              style={{
                background: 'linear-gradient(90deg, var(--primary), var(--tertiary))',
              }}
            />
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-center px-6">
        <AnimatePresence mode="wait">
          {step === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center"
            >
              <motion.div
                animate={{ rotate: [0, 8, -8, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="rounded-[36px] mx-auto mb-6 flex items-center justify-center"
                style={{
                  width: 140,
                  height: 140,
                  background: 'linear-gradient(135deg, var(--primary), var(--tertiary))',
                  boxShadow: '0 30px 60px -10px color-mix(in srgb, var(--primary) 60%, transparent)',
                }}
              >
                <Icon name="fitness_center" filled size={72} style={{ color: 'var(--on-primary)' }} />
              </motion.div>
              <h1 className="display-xl gradient-text">PixelGym</h1>
              <p className="opacity-70 mt-3 text-base font-medium max-w-xs mx-auto">
                Your Material 3 Expressive fitness companion.  
                Track sets, learn form, eat smart.
              </p>
              <Button xl icon="arrow_forward" className="mt-10 w-full" onClick={next} glow>
                Let's build your plan
              </Button>
            </motion.div>
          )}

          {step === 'identity' && (
            <StepWrap key="identity" title="What's your name?" subtitle="We'll make things personal.">
              <input
                value={data.name}
                onChange={(e) => setData((d) => ({ ...d, name: e.target.value }))}
                placeholder="Your name"
                className="m3-input text-center font-extrabold"
                style={{ fontSize: '1.75rem', padding: '20px', letterSpacing: '-0.02em' }}
                autoFocus
              />
              <NextButton onClick={next} disabled={!data.name.trim()} />
            </StepWrap>
          )}

          {step === 'body' && (
            <StepWrap key="body" title="Your body" subtitle="Used to fine-tune calories and water.">
              <div className="space-y-4">
                <LabeledRow label="Age">
                  <Stepper
                    value={data.age}
                    onChange={(v) => setData((d) => ({ ...d, age: v }))}
                    min={14}
                    max={100}
                  />
                </LabeledRow>
                <LabeledRow label="Sex">
                  <SegmentedControl
                    value={data.sex}
                    onChange={(v) => setData((d) => ({ ...d, sex: v }))}
                    options={[
                      { value: 'male', label: 'Male' },
                      { value: 'female', label: 'Female' },
                      { value: 'other', label: 'Other' },
                    ]}
                  />
                </LabeledRow>
                <LabeledRow label="Height">
                  <Stepper
                    value={data.heightCm}
                    onChange={(v) => setData((d) => ({ ...d, heightCm: v }))}
                    min={120}
                    max={240}
                    unit="cm"
                  />
                </LabeledRow>
                <LabeledRow label="Weight">
                  <Stepper
                    value={data.weightKg}
                    onChange={(v) => setData((d) => ({ ...d, weightKg: v }))}
                    min={30}
                    max={250}
                    step={0.5}
                    unit="kg"
                  />
                </LabeledRow>
              </div>
              <NextButton onClick={next} />
            </StepWrap>
          )}

          {step === 'goal' && (
            <StepWrap key="goal" title="Your goal" subtitle="Pick the one that matches your current focus.">
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    { key: 'cut', label: 'Cut', icon: 'local_fire_department', desc: 'Lose fat' },
                    { key: 'maintain', label: 'Maintain', icon: 'balance', desc: 'Stay the same' },
                    { key: 'bulk', label: 'Bulk', icon: 'trending_up', desc: 'Gain muscle' },
                    { key: 'recomp', label: 'Recomp', icon: 'sync_alt', desc: 'Lean gains' },
                  ] as const
                ).map((g) => {
                  const active = data.goal === g.key;
                  return (
                    <button
                      key={g.key}
                      onClick={() => setData((d) => ({ ...d, goal: g.key as any }))}
                      className="expressive-card text-left p-4"
                      style={{
                        background: active
                          ? 'var(--primary-container)'
                          : 'color-mix(in srgb, var(--surface-container) 80%, transparent)',
                        color: active ? 'var(--on-primary-container)' : 'var(--on-surface)',
                        border: active
                          ? '2px solid var(--primary)'
                          : '1px solid color-mix(in srgb, var(--on-surface) 6%, transparent)',
                      }}
                    >
                      <Icon name={g.icon} filled size={28} />
                      <h3 className="title mt-2" style={{ letterSpacing: '-0.02em' }}>
                        {g.label}
                      </h3>
                      <p className="text-xs opacity-70 font-medium">{g.desc}</p>
                    </button>
                  );
                })}
              </div>
              <NextButton onClick={next} />
            </StepWrap>
          )}

          {step === 'level' && (
            <StepWrap key="level" title="Training level" subtitle="We'll size your routines accordingly.">
              <div className="space-y-4">
                <div>
                  <div className="label mb-2">EXPERIENCE</div>
                  <div className="flex flex-wrap gap-2">
                    {(['beginner', 'intermediate', 'advanced'] as const).map((l) => (
                      <PillChip
                        key={l}
                        active={data.experience === l}
                        onClick={() => setData((d) => ({ ...d, experience: l }))}
                      >
                        {l}
                      </PillChip>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="label mb-2">ACTIVITY</div>
                  <div className="flex flex-wrap gap-2">
                    {(['sedentary', 'light', 'moderate', 'intense', 'athlete'] as const).map(
                      (l) => (
                        <PillChip
                          key={l}
                          active={data.activity === l}
                          onClick={() => setData((d) => ({ ...d, activity: l }))}
                          variant="tertiary"
                        >
                          {l}
                        </PillChip>
                      ),
                    )}
                  </div>
                </div>
              </div>
              <NextButton onClick={next} />
            </StepWrap>
          )}

          {step === 'done' && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center"
            >
              <motion.div
                initial={{ rotate: -20, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring', damping: 18, stiffness: 200 }}
                className="rounded-[36px] mx-auto mb-6 flex items-center justify-center"
                style={{
                  width: 140,
                  height: 140,
                  background: 'linear-gradient(135deg, var(--primary), var(--tertiary))',
                }}
              >
                <Icon name="check" filled size={80} style={{ color: 'var(--on-primary)' }} />
              </motion.div>
              <h1 className="display-xl">You're all set, {data.name || 'champ'}!</h1>
              <p className="opacity-70 mt-3 font-medium max-w-xs mx-auto">
                We crafted a starting point. Adjust anytime in your Profile.
              </p>
              <Button xl icon="rocket_launch" className="mt-10 w-full" onClick={finish} glow>
                Enter PixelGym
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function StepWrap({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ type: 'spring', damping: 26, stiffness: 260 }}
    >
      <h1 className="display-lg">{title}</h1>
      {subtitle && <p className="opacity-70 mt-2 font-medium">{subtitle}</p>}
      <div className="mt-8">{children}</div>
    </motion.div>
  );
}

function NextButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <Button
      xl
      className="w-full mt-8"
      onClick={onClick}
      disabled={disabled}
      trailingIcon="arrow_forward"
    >
      Continue
    </Button>
  );
}

function LabeledRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-bold text-sm">{label}</span>
      {children}
    </div>
  );
}
