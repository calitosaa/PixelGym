import { useSyncExternalStore } from 'react';
import { AppState, Meal, Routine, UserProfile, WaterLog, WorkoutSession } from '../types';
import { DEFAULT_ROUTINES } from './routines';

const STORAGE_KEY = 'pixelgym_state_v1';

const defaultProfile: UserProfile = {
  name: 'Athlete',
  age: 25,
  heightCm: 175,
  weightKg: 75,
  sex: 'male',
  goal: 'recomp',
  activity: 'moderate',
  experience: 'intermediate',
  dailyCalorieTarget: 2600,
  dailyProteinTarget: 160,
  dailyCarbsTarget: 280,
  dailyFatTarget: 80,
  dailyWaterMl: 2500,
  theme: 'dynamic-blue',
  onboardingDone: false,
};

function createInitial(): AppState {
  // seed with some sample sessions and meals for realistic first boot
  const now = Date.now();
  const dayMs = 86400000;
  const sampleSessions: WorkoutSession[] = [
    {
      id: 's-1',
      routineId: 'routine-leg-day',
      routineName: 'Leg Day Blast',
      startedAt: now - dayMs * 1,
      endedAt: now - dayMs * 1 + 1000 * 60 * 58,
      durationSec: 60 * 58,
      totalVolume: 8450,
      caloriesEst: 420,
      exercises: [],
    },
    {
      id: 's-2',
      routineId: 'routine-cardio-core',
      routineName: 'Cardio Core',
      startedAt: now - dayMs * 3,
      endedAt: now - dayMs * 3 + 1000 * 60 * 32,
      durationSec: 60 * 32,
      totalVolume: 2150,
      caloriesEst: 310,
      exercises: [],
    },
    {
      id: 's-3',
      routineId: 'routine-upper-power',
      routineName: 'Upper Body Power',
      startedAt: now - dayMs * 5,
      endedAt: now - dayMs * 5 + 1000 * 60 * 50,
      durationSec: 60 * 50,
      totalVolume: 7200,
      caloriesEst: 380,
      exercises: [],
    },
  ];
  const sampleMeals: Meal[] = [
    {
      id: 'm-1',
      name: 'Oatmeal Bowl',
      at: now - 1000 * 60 * 60 * 4,
      calories: 420,
      protein: 18,
      carbs: 62,
      fat: 10,
      type: 'breakfast',
      tips: 'Great start to fuel the day.',
    },
    {
      id: 'm-2',
      name: 'Chicken & Rice',
      at: now - 1000 * 60 * 60 * 1,
      calories: 610,
      protein: 52,
      carbs: 70,
      fat: 12,
      type: 'lunch',
    },
  ];
  return {
    profile: defaultProfile,
    routines: DEFAULT_ROUTINES,
    sessions: sampleSessions,
    meals: sampleMeals,
    water: [{ id: 'w-1', at: now - 1000 * 60 * 30, ml: 500 }],
    favoriteExercises: [],
    generatedVideos: [],
  };
}

// -- Core store --

let state: AppState = loadState();
const listeners = new Set<() => void>();

function loadState(): AppState {
  if (typeof localStorage === 'undefined') return createInitial();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitial();
    const parsed = JSON.parse(raw);
    // merge with initial to handle new fields
    const init = createInitial();
    return {
      ...init,
      ...parsed,
      profile: { ...init.profile, ...(parsed.profile || {}) },
      routines: parsed.routines?.length ? parsed.routines : init.routines,
    };
  } catch (e) {
    console.warn('Failed to load state, resetting.', e);
    return createInitial();
  }
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Persist failed', e);
  }
}

function notify() {
  persist();
  listeners.forEach((l) => l());
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function getSnapshot() {
  return state;
}

export function useAppState(): AppState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

// -- Mutators --

export const store = {
  // profile
  updateProfile(patch: Partial<UserProfile>) {
    state = { ...state, profile: { ...state.profile, ...patch } };
    notify();
  },
  completeOnboarding(profile: Partial<UserProfile>) {
    state = {
      ...state,
      profile: { ...state.profile, ...profile, onboardingDone: true },
    };
    notify();
  },
  // routines
  addRoutine(r: Routine) {
    state = { ...state, routines: [r, ...state.routines] };
    notify();
  },
  updateRoutine(id: string, patch: Partial<Routine>) {
    state = {
      ...state,
      routines: state.routines.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    };
    notify();
  },
  deleteRoutine(id: string) {
    state = { ...state, routines: state.routines.filter((r) => r.id !== id) };
    notify();
  },
  // sessions
  addSession(s: WorkoutSession) {
    state = { ...state, sessions: [s, ...state.sessions] };
    notify();
  },
  // meals
  addMeal(m: Meal) {
    state = { ...state, meals: [m, ...state.meals] };
    notify();
  },
  deleteMeal(id: string) {
    state = { ...state, meals: state.meals.filter((m) => m.id !== id) };
    notify();
  },
  // water
  addWater(ml: number) {
    const log: WaterLog = { id: `w-${Date.now()}`, at: Date.now(), ml };
    state = { ...state, water: [log, ...state.water] };
    notify();
  },
  // favorites
  toggleFavorite(exerciseId: string) {
    const set = new Set(state.favoriteExercises);
    if (set.has(exerciseId)) set.delete(exerciseId);
    else set.add(exerciseId);
    state = { ...state, favoriteExercises: Array.from(set) };
    notify();
  },
  // videos
  saveGeneratedVideo(exerciseId: string, url: string, prompt: string) {
    state = {
      ...state,
      generatedVideos: [
        { exerciseId, url, prompt, at: Date.now() },
        ...state.generatedVideos,
      ].slice(0, 20),
    };
    notify();
  },
  // full reset
  reset() {
    state = createInitial();
    notify();
  },
};

// -- Selectors / helpers --

export function mealsToday(state: AppState): Meal[] {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  return state.meals.filter((m) => m.at >= startOfDay.getTime());
}

export function waterToday(state: AppState): number {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  return state.water
    .filter((w) => w.at >= startOfDay.getTime())
    .reduce((acc, w) => acc + w.ml, 0);
}

export function sessionsThisWeek(state: AppState): WorkoutSession[] {
  const weekAgo = Date.now() - 7 * 86400000;
  return state.sessions.filter((s) => s.startedAt >= weekAgo);
}

export function calculateStreak(state: AppState): number {
  if (!state.sessions.length) return 0;
  const sortedDays = Array.from(
    new Set(
      state.sessions.map((s) => {
        const d = new Date(s.startedAt);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      }),
    ),
  ).sort((a, b) => b - a);
  let streak = 0;
  let cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  // allow starting streak within last 2 days
  for (let i = 0; i < sortedDays.length; i++) {
    const diff = Math.floor((cursor.getTime() - sortedDays[i]) / 86400000);
    if (diff <= 1) {
      streak++;
      cursor = new Date(sortedDays[i] - 86400000);
      cursor.setHours(0, 0, 0, 0);
    } else {
      break;
    }
  }
  return streak;
}
