// Core domain types for PixelGym

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'legs'
  | 'glutes'
  | 'core'
  | 'cardio'
  | 'full-body';

export type Equipment =
  | 'barbell'
  | 'dumbbell'
  | 'machine'
  | 'bodyweight'
  | 'cable'
  | 'kettlebell'
  | 'band'
  | 'other';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Exercise {
  id: string;
  name: string;
  muscle: MuscleGroup;
  secondaryMuscles?: MuscleGroup[];
  equipment: Equipment;
  difficulty: Difficulty;
  instructions: string[];
  tips: string[];
  videoUrl?: string; // cached generated video
  icon: string; // material icon
  color: string; // accent color token
}

export interface SetEntry {
  id: string;
  reps: number;
  weight: number; // kg
  completed: boolean;
  rpe?: number; // rate of perceived exertion
  notes?: string;
}

export interface ExerciseBlock {
  id: string;
  exerciseId: string;
  targetSets: number;
  targetReps: string; // e.g. "8-12" or "10"
  restSeconds: number;
  sets: SetEntry[]; // default template
}

export interface Routine {
  id: string;
  name: string;
  description: string;
  target: string; // e.g. "Hypertrophy", "Strength"
  muscles: MuscleGroup[];
  durationMin: number;
  difficulty: Difficulty;
  color: 'primary' | 'secondary' | 'tertiary' | 'error';
  icon: string;
  exercises: ExerciseBlock[];
  createdAt: number;
  isAIGenerated?: boolean;
}

export interface WorkoutSession {
  id: string;
  routineId: string;
  routineName: string;
  startedAt: number;
  endedAt?: number;
  durationSec: number;
  totalVolume: number; // sum of weight*reps
  caloriesEst: number;
  exercises: {
    exerciseId: string;
    exerciseName: string;
    sets: SetEntry[];
  }[];
  notes?: string;
}

export interface Meal {
  id: string;
  name: string;
  at: number; // timestamp
  calories: number;
  protein: number; // g
  carbs: number; // g
  fat: number; // g
  imageUrl?: string;
  tips?: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export interface WaterLog {
  id: string;
  at: number;
  ml: number;
}

export interface UserProfile {
  name: string;
  age: number;
  heightCm: number;
  weightKg: number;
  sex: 'male' | 'female' | 'other';
  goal: 'cut' | 'maintain' | 'bulk' | 'recomp';
  activity: 'sedentary' | 'light' | 'moderate' | 'intense' | 'athlete';
  experience: Difficulty;
  dailyCalorieTarget: number;
  dailyProteinTarget: number;
  dailyCarbsTarget: number;
  dailyFatTarget: number;
  dailyWaterMl: number;
  theme: 'dynamic-blue' | 'dynamic-violet' | 'dynamic-green' | 'dynamic-coral';
  onboardingDone: boolean;
}

export interface AppState {
  profile: UserProfile;
  routines: Routine[];
  sessions: WorkoutSession[];
  meals: Meal[];
  water: WaterLog[];
  favoriteExercises: string[];
  generatedVideos: { exerciseId: string; url: string; prompt: string; at: number }[];
}
