import { UserProfile } from '../types';

/**
 * Mifflin-St Jeor equation (most accurate modern BMR formula)
 * BMR + activity factor + goal adjustment => daily calorie target.
 * Returns balanced macros based on the computed calories.
 */
export function calculateTargets(p: UserProfile) {
  const weight = p.weightKg || 75;
  const height = p.heightCm || 175;
  const age = p.age || 25;
  const sex = p.sex || 'male';

  const bmr =
    sex === 'male'
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : sex === 'female'
      ? 10 * weight + 6.25 * height - 5 * age - 161
      : 10 * weight + 6.25 * height - 5 * age - 78;

  const activityFactor =
    p.activity === 'sedentary'
      ? 1.2
      : p.activity === 'light'
      ? 1.375
      : p.activity === 'moderate'
      ? 1.55
      : p.activity === 'intense'
      ? 1.725
      : 1.9; // athlete

  let tdee = bmr * activityFactor;
  if (p.goal === 'cut') tdee *= 0.82;
  else if (p.goal === 'bulk') tdee *= 1.12;
  // 'maintain' and 'recomp' keep TDEE as-is

  const dailyCalorieTarget = Math.round(tdee / 10) * 10;

  // Macros: 2g/kg protein, 25-30% from fat, rest from carbs
  const dailyProteinTarget = Math.round(weight * 2);
  const dailyFatTarget = Math.round((dailyCalorieTarget * 0.27) / 9);
  const dailyCarbsTarget = Math.max(
    50,
    Math.round((dailyCalorieTarget - dailyProteinTarget * 4 - dailyFatTarget * 9) / 4),
  );

  // Water: 35ml per kg body weight, bounded between 1.5L and 5L
  const dailyWaterMl = Math.min(
    5000,
    Math.max(1500, Math.round((weight * 35) / 50) * 50),
  );

  return {
    dailyCalorieTarget,
    dailyProteinTarget,
    dailyCarbsTarget,
    dailyFatTarget,
    dailyWaterMl,
  };
}
