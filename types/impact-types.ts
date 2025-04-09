/**
 * Types for the Transit Impact Tracker feature
 */

// Transit journey record with impact data
export interface JourneyImpact {
  id: string;
  date: string;
  transportMode: string;
  distanceKm: number;
  durationMinutes: number;
  co2Saved: number;  // in kg
  caloriesBurned: number;
  stepsCount: number;
}

// User's cumulative impact metrics
export interface UserImpactMetrics {
  totalJourneys: number;
  totalDistanceKm: number;
  totalDurationMinutes: number;
  totalCO2Saved: number;
  totalCaloriesBurned: number;
  totalStepsCount: number;
  treesEquivalent: number;
  gasEquivalent: number; // in liters
}

// Impact streak data
export interface ImpactStreak {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
}

// Impact milestone definitions
export interface ImpactMilestone {
  id: string;
  title: string;
  description: string;
  threshold: number;
  metricType: 'distance' | 'co2' | 'journeys' | 'calories' | 'steps';
  iconName: string;
  isAchieved: boolean;
}
