import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import { Routine, UserProfile } from '../types';
import { EXERCISES } from '../data/exercises';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
  console.warn('[PixelGym] GEMINI_API_KEY is not set. AI features will fail.');
}

export const ai = new GoogleGenAI({ apiKey: apiKey || '' });

const COACH_MODEL = 'gemini-2.5-pro';
const FAST_MODEL = 'gemini-2.5-flash';
const VIDEO_MODEL = 'veo-3.0-generate-preview';

function profileSummary(p: UserProfile): string {
  return `User profile — name: ${p.name}, ${p.age}y ${p.sex}, ${p.heightCm}cm/${p.weightKg}kg, goal: ${p.goal}, activity: ${p.activity}, experience: ${p.experience}, daily target ${p.dailyCalorieTarget}kcal / ${p.dailyProteinTarget}g protein.`;
}

// ─────────────────────────────────────────────────────────────
// Coach chat
// ─────────────────────────────────────────────────────────────
export async function askCoach(prompt: string, profile: UserProfile): Promise<string> {
  const response = await ai.models.generateContent({
    model: COACH_MODEL,
    contents: prompt,
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
      systemInstruction: `You are the PixelGym Coach, an elite, kind, and precise personal trainer and nutritionist.
${profileSummary(profile)}
Always respond in clean Markdown with headings, bullets, and bold emphasis when useful. Be concrete: numbers, sets, reps, macros.
If the user asks for a routine, give a day-by-day plan. Keep responses under ~350 words unless asked for more.`,
    },
  });
  return response.text || '';
}

// ─────────────────────────────────────────────────────────────
// Food image analysis
// ─────────────────────────────────────────────────────────────
export async function analyzeFood(base64Image: string, mimeType: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: FAST_MODEL,
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType } },
        {
          text: 'Analyze this food image. Estimate calories and macros for a single serving visible. Output JSON only.',
        },
      ],
    },
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          meal: { type: Type.STRING, description: 'Short descriptive name of the meal.' },
          calories: { type: Type.NUMBER, description: 'Estimated calories in kcal.' },
          protein: { type: Type.NUMBER, description: 'Estimated protein in grams.' },
          carbs: { type: Type.NUMBER, description: 'Estimated carbs in grams.' },
          fat: { type: Type.NUMBER, description: 'Estimated fat in grams.' },
          tips: { type: Type.STRING, description: 'One concise health or nutrition tip.' },
        },
        required: ['meal', 'calories', 'protein', 'carbs', 'fat'],
      },
      systemInstruction:
        'You are a sports nutritionist. Be realistic and concise. If the image is not food, set meal="Unknown" and zeros.',
    },
  });
  return response.text || '{}';
}

// ─────────────────────────────────────────────────────────────
// Video-based form analysis
// ─────────────────────────────────────────────────────────────
export async function analyzeVideoBase64(
  base64Video: string,
  mimeType: string,
  prompt: string,
): Promise<string> {
  const response = await ai.models.generateContent({
    model: COACH_MODEL,
    contents: {
      parts: [{ inlineData: { data: base64Video, mimeType } }, { text: prompt }],
    },
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
      systemInstruction:
        'You are an elite biomechanics coach. Analyze the exercise performed in the video. Output Markdown with: **Exercise detected**, **What you did right**, **Fixes** (3 bullets), **Cues** (short actionable cues). Keep it focused and friendly.',
    },
  });
  return response.text || '';
}

// ─────────────────────────────────────────────────────────────
// AI routine builder (structured output)
// ─────────────────────────────────────────────────────────────
export async function generateRoutineAI(prompt: string, profile: UserProfile): Promise<Routine> {
  const catalog = EXERCISES.map((e) => ({
    id: e.id,
    name: e.name,
    muscle: e.muscle,
    equipment: e.equipment,
    difficulty: e.difficulty,
  }));

  const response = await ai.models.generateContent({
    model: COACH_MODEL,
    contents: `Build a workout routine for the user based on this request:\n"${prompt}"\n\nPick exercises ONLY from this catalog (use their "id"):\n${JSON.stringify(catalog)}\n\nReturn a routine with 4-8 exercises.`,
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          target: {
            type: Type.STRING,
            description:
              'One of: "Strength", "Hypertrophy", "Endurance", "Mobility", "Fat loss".',
          },
          durationMin: { type: Type.NUMBER },
          difficulty: { type: Type.STRING, description: 'beginner | intermediate | advanced' },
          color: {
            type: Type.STRING,
            description: 'UI accent color: primary | secondary | tertiary | error.',
          },
          icon: { type: Type.STRING, description: 'Material Symbols icon name.' },
          exercises: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                exerciseId: { type: Type.STRING, description: 'id from the catalog' },
                targetSets: { type: Type.NUMBER },
                targetReps: { type: Type.STRING },
                restSeconds: { type: Type.NUMBER },
              },
              required: ['exerciseId', 'targetSets', 'targetReps', 'restSeconds'],
            },
          },
        },
        required: ['name', 'description', 'target', 'durationMin', 'difficulty', 'exercises'],
      },
      systemInstruction: `You are PixelGym's programming AI. ${profileSummary(profile)}
Use valid exerciseIds only (must exist in the provided catalog). Keep total time close to what the user requested.
Pick an appropriate color/icon: strength→"primary"/"fitness_center", hypertrophy→"secondary", cardio→"error"/"favorite", legs→"tertiary"/"directions_run".`,
    },
  });

  const parsed = JSON.parse(response.text || '{}');

  const validIds = new Set(EXERCISES.map((e) => e.id));
  const exercises = (parsed.exercises || [])
    .filter((b: any) => validIds.has(b.exerciseId))
    .map((b: any, i: number) => ({
      id: `ai-b-${Date.now()}-${i}`,
      exerciseId: b.exerciseId,
      targetSets: b.targetSets || 3,
      targetReps: b.targetReps || '8-10',
      restSeconds: b.restSeconds || 60,
      sets: [],
    }));

  const color: Routine['color'] = ['primary', 'secondary', 'tertiary', 'error'].includes(
    parsed.color,
  )
    ? parsed.color
    : 'tertiary';

  const muscleSet = new Set<Routine['muscles'][number]>();
  exercises.forEach((b: any) => {
    const ex = EXERCISES.find((e) => e.id === b.exerciseId);
    if (ex) muscleSet.add(ex.muscle);
  });

  const routine: Routine = {
    id: `routine-ai-${Date.now()}`,
    name: parsed.name || 'AI Routine',
    description: parsed.description || '',
    target: parsed.target || 'Hypertrophy',
    muscles: Array.from(muscleSet),
    durationMin: parsed.durationMin || 45,
    difficulty: (parsed.difficulty || 'intermediate') as Routine['difficulty'],
    color,
    icon: parsed.icon || 'auto_awesome',
    exercises,
    createdAt: Date.now(),
    isAIGenerated: true,
  };

  if (!routine.exercises.length) throw new Error('AI returned no valid exercises');
  return routine;
}

// ─────────────────────────────────────────────────────────────
// AI meal plan (Markdown)
// ─────────────────────────────────────────────────────────────
export async function generateMealPlan(profile: UserProfile): Promise<string> {
  const response = await ai.models.generateContent({
    model: COACH_MODEL,
    contents: `Build a 1-day meal plan hitting ${profile.dailyCalorieTarget} kcal, ${profile.dailyProteinTarget}g protein, ${profile.dailyCarbsTarget}g carbs, ${profile.dailyFatTarget}g fat. Goal: ${profile.goal}. Include breakfast, lunch, snack, dinner. Show approximate macros per meal. Keep foods common and affordable.`,
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
      systemInstruction:
        'Return Markdown only. Use bold headings per meal (### Breakfast etc.), bullet lists for ingredients, and a short "Why" line. End with a daily totals table.',
    },
  });
  return response.text || '';
}

// Alias for older imports
export const generateDietPlan = generateMealPlan;

// ─────────────────────────────────────────────────────────────
// Exercise video generation (Veo). Falls back to a placeholder on failure.
// ─────────────────────────────────────────────────────────────
export async function generateExerciseVideo(
  exerciseName: string,
  muscle: string,
): Promise<string> {
  const prompt = `Cinematic slow-motion 3D render of a fit athlete performing a perfect ${exerciseName}. Target ${muscle}. Clean studio background with soft neon lighting, crisp form cues, 6 second loop, high contrast.`;

  // The Veo video API is long-running; we try with a reasonable timeout.
  try {
    let op: any = await ai.models.generateVideos({
      model: VIDEO_MODEL,
      prompt,
      config: { aspectRatio: '16:9', numberOfVideos: 1 },
    });

    const maxTries = 30; // ~ 2.5 min max
    let tries = 0;
    while (!op.done && tries < maxTries) {
      await new Promise((r) => setTimeout(r, 5000));
      op = await ai.operations.getVideosOperation({ operation: op });
      tries++;
    }

    const video = op.response?.generatedVideos?.[0]?.video;
    const downloadUri = video?.uri;
    if (!downloadUri) throw new Error('No video URI returned');

    // Append API key for download
    const fullUrl = `${downloadUri}${downloadUri.includes('?') ? '&' : '?'}key=${apiKey}`;

    // Fetch as blob and turn into object URL for inline playback
    const resp = await fetch(fullUrl);
    if (!resp.ok) throw new Error(`Download failed ${resp.status}`);
    const blob = await resp.blob();
    return URL.createObjectURL(blob);
  } catch (e: any) {
    console.error('[Video generation] falling back:', e);
    throw new Error(
      e?.message?.includes('not found') || e?.message?.includes('not available')
        ? 'Veo model unavailable right now. Please try again later.'
        : e?.message || 'Video generation failed',
    );
  }
}
