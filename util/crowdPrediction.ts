/**
 * Crowd prediction utility for transportation ETAs
 * Uses time-based patterns and historical data patterns to predict crowding levels
 */

export type CrowdLevel = 'low' | 'moderate' | 'high' | 'veryHigh';

export interface CrowdPrediction {
  level: CrowdLevel;
  percentage: number; // Estimated percentage of capacity (0-100)
}

// Get color for crowd level visualization
export const getCrowdLevelColor = (level: CrowdLevel): string => {
  switch (level) {
    case 'low':
      return '#4CAF50'; // Green
    case 'moderate':
      return '#FFC107'; // Amber
    case 'high':
      return '#FF9800'; // Orange
    case 'veryHigh':
      return '#F44336'; // Red
    default:
      return '#9E9E9E'; // Gray for unknown
  }
};

// Get icon name for crowd level visualization
export const getCrowdLevelIcon = (level: CrowdLevel): string => {
  switch (level) {
    case 'low':
      return 'person';
    case 'moderate':
      return 'person.2';
    case 'high':
      return 'person.3';
    case 'veryHigh':
      return 'person.3.fill';
    default:
      return 'person.fill.questionmark';
  }
};

/**
 * Predict crowd level based on route, time, and day of week
 * This is a simplified model - in a real app, this would use:
 * - Historical data
 * - Real-time passenger counts (if available from APIs)
 * - Weather conditions
 * - Special events
 */
export const predictCrowdLevel = (
  routeId: string,
  stopId: string,
  timestamp: Date = new Date()
): CrowdPrediction => {
  const hour = timestamp.getHours();
  const day = timestamp.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const isWeekend = day === 0 || day === 6;
  const isRushHour = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);
  
  // Base percentage on time factors
  let basePercentage = 40; // Default moderate load
  
  // Rush hour adjustment
  if (isRushHour && !isWeekend) {
    basePercentage += 40;
  } else if (isRushHour && isWeekend) {
    basePercentage += 20;
  }
  
  // Weekend adjustment
  if (isWeekend) {
    if (hour >= 12 && hour <= 18) { // Weekend shopping hours
      basePercentage += 25;
    } else {
      basePercentage -= 15;
    }
  }
  
  // Route-specific adjustments (could be expanded with real data)
  // Use the hash of route+stop for deterministic but seemingly random variation
  const routeHash = (routeId.charCodeAt(0) + stopId.charCodeAt(0)) % 20;
  basePercentage += routeHash - 10; // -10 to +10 variation
  
  // Ensure within bounds
  const finalPercentage = Math.max(5, Math.min(100, basePercentage));
  
  // Determine crowd level category
  let level: CrowdLevel;
  if (finalPercentage < 30) {
    level = 'low';
  } else if (finalPercentage < 60) {
    level = 'moderate';
  } else if (finalPercentage < 85) {
    level = 'high';
  } else {
    level = 'veryHigh';
  }
  
  return {
    level,
    percentage: finalPercentage
  };
};

/**
 * Get descriptive text for crowd level
 */
export const getCrowdLevelText = (level: CrowdLevel, language: string): string => {
  if (language === 'en') {
    switch (level) {
      case 'low':
        return 'Seats available';
      case 'moderate':
        return 'Some seats available';
      case 'high':
        return 'Standing room only';
      case 'veryHigh':
        return 'Very crowded';
      default:
        return 'Unknown';
    }
  } else if (language === 'zh-Hans') {
    switch (level) {
      case 'low':
        return '座位充足';
      case 'moderate':
        return '部分座位可用';
      case 'high':
        return '仅限站立';
      case 'veryHigh':
        return '非常拥挤';
      default:
        return '未知';
    }
  } else {
    // Traditional Chinese (default)
    switch (level) {
      case 'low':
        return '座位充足';
      case 'moderate':
        return '部分座位可用';
      case 'high':
        return '只能站立';
      case 'veryHigh':
        return '非常擠迫';
      default:
        return '未知';
    }
  }
};
