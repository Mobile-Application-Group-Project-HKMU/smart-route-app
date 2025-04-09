/**
 * Achievement-related type definitions
 */

import { TransportCompany, TransportMode } from './transport-types';

// Types of achievements available in the app
export type AchievementCategory = 
  | 'JOURNEY_COUNT' 
  | 'TRANSPORT_VARIETY'
  | 'DISTRICT_EXPLORER'
  | 'ROUTE_MASTER'
  | 'TIME_TRAVELER';

// Levels for each achievement (bronze, silver, gold)
export type AchievementLevel = 'BRONZE' | 'SILVER' | 'GOLD';

// Status of an achievement
export type AchievementStatus = 'LOCKED' | 'UNLOCKED';

// Base achievement interface
export interface Achievement {
  id: string;
  category: AchievementCategory;
  title: {
    en: string;
    'zh-Hant': string;
    'zh-Hans': string;
  };
  description: {
    en: string;
    'zh-Hant': string;
    'zh-Hans': string;
  };
  level: AchievementLevel;
  icon: string; // IconSymbol name
  status: AchievementStatus;
  progress: number; // 0-100
  requirement: number; // Total needed to achieve
  currentValue: number; // Current progress value
  unlockedAt?: Date; // When the achievement was unlocked
}

// Journey data structure for tracking transportation usage
export interface JourneyEntry {
  id: string;
  transportMode: TransportMode;
  transportCompany: TransportCompany;
  routeId: string;
  origin: string;
  destination: string;
  district: string;
  timestamp: Date;
  isCompleted: boolean;
}

// User achievement progress
export interface UserAchievements {
  achievements: Achievement[];
  journeys: JourneyEntry[];
  stats: {
    totalJourneys: number;
    transportTypesUsed: Set<TransportMode>;
    companiesUsed: Set<TransportCompany>;
    districtsVisited: Set<string>;
    routesTaken: Set<string>;
  };
}
