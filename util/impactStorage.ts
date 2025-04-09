import AsyncStorage from '@react-native-async-storage/async-storage';
import { JourneyImpact, UserImpactMetrics, ImpactStreak } from '../types/impact-types';
import { calculateUserImpactMetrics } from './impactCalculator';

// Storage keys
const JOURNEY_IMPACTS_KEY = 'journeyImpacts';
const IMPACT_STREAK_KEY = 'impactStreak';

/**
 * Save a new journey impact to storage
 */
export async function saveJourneyImpact(impact: JourneyImpact): Promise<void> {
  try {
    // Get existing journey impacts
    const journeyImpacts = await getJourneyImpacts();
    
    // Add new impact
    journeyImpacts.push(impact);
    
    // Save updated impacts
    await AsyncStorage.setItem(JOURNEY_IMPACTS_KEY, JSON.stringify(journeyImpacts));
    
    // Update streak
    await updateStreak();
  } catch (error) {
    console.error('Failed to save journey impact:', error);
  }
}

/**
 * Get all saved journey impacts
 */
export async function getJourneyImpacts(): Promise<JourneyImpact[]> {
  try {
    const jsonValue = await AsyncStorage.getItem(JOURNEY_IMPACTS_KEY);
    return jsonValue ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error('Failed to get journey impacts:', error);
    return [];
  }
}

/**
 * Get user's impact metrics
 */
export async function getUserImpactMetrics(): Promise<UserImpactMetrics> {
  try {
    const journeyImpacts = await getJourneyImpacts();
    return calculateUserImpactMetrics(journeyImpacts);
  } catch (error) {
    console.error('Failed to get user impact metrics:', error);
    return {
      totalJourneys: 0,
      totalDistanceKm: 0,
      totalDurationMinutes: 0,
      totalCO2Saved: 0,
      totalCaloriesBurned: 0,
      totalStepsCount: 0,
      treesEquivalent: 0,
      gasEquivalent: 0
    };
  }
}

/**
 * Get user's impact streak
 */
export async function getImpactStreak(): Promise<ImpactStreak> {
  try {
    const jsonValue = await AsyncStorage.getItem(IMPACT_STREAK_KEY);
    return jsonValue 
      ? JSON.parse(jsonValue) 
      : { currentStreak: 0, longestStreak: 0, lastActiveDate: null };
  } catch (error) {
    console.error('Failed to get impact streak:', error);
    return { currentStreak: 0, longestStreak: 0, lastActiveDate: null };
  }
}

/**
 * Update user's impact streak based on new journey
 */
async function updateStreak(): Promise<void> {
  try {
    // Get current streak info
    const streak = await getImpactStreak();
    
    // Get current date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // If this is the first journey ever
    if (!streak.lastActiveDate) {
      streak.currentStreak = 1;
      streak.longestStreak = 1;
      streak.lastActiveDate = today;
    } 
    // If already recorded a journey today, streak doesn't change
    else if (streak.lastActiveDate === today) {
      // No change needed
    } 
    // If yesterday, continue streak
    else {
      const lastDate = new Date(streak.lastActiveDate);
      const todayDate = new Date(today);
      
      // Calculate days between (accounting for timezone issues)
      const timeDiff = Math.abs(todayDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      if (diffDays === 1) {
        // Increment streak
        streak.currentStreak += 1;
        // Update longest streak if needed
        if (streak.currentStreak > streak.longestStreak) {
          streak.longestStreak = streak.currentStreak;
        }
      } else {
        // Reset streak
        streak.currentStreak = 1;
      }
      
      streak.lastActiveDate = today;
    }
    
    // Save updated streak
    await AsyncStorage.setItem(IMPACT_STREAK_KEY, JSON.stringify(streak));
  } catch (error) {
    console.error('Failed to update impact streak:', error);
  }
}

/**
 * Clear all impact data (for testing)
 */
export async function clearImpactData(): Promise<void> {
  try {
    await AsyncStorage.removeItem(JOURNEY_IMPACTS_KEY);
    await AsyncStorage.removeItem(IMPACT_STREAK_KEY);
  } catch (error) {
    console.error('Failed to clear impact data:', error);
  }
}
