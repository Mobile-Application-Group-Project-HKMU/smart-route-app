import { TransportMode } from '../types/transport-types';
import { JourneyImpact, UserImpactMetrics, ImpactMilestone } from '../types/impact-types';
import { generateUUID } from './uuidGenerator';

// CO2 emission factors (kg/km) for different transportation modes vs private car
const CO2_EMISSION_FACTORS = {
  CAR: 0.192, // Average car emissions
  BUS: 0.105,
  MINIBUS: 0.089,
  MTR: 0.027,
  FERRY: 0.120,
  WALK: 0.0,
};

// Average calorie burn rates per minute
const CALORIE_BURN_RATES = {
  WALK: 4.5, // walking at moderate pace
  BUS: 1.2, // sitting + walking to/from stops
  MINIBUS: 1.2,
  MTR: 1.5, // includes stairs, transfers
  FERRY: 1.0,
};

// Average steps per minute for different modes (including transfers, waiting)
const STEPS_PER_MINUTE = {
  WALK: 100, // about 100 steps per minute at moderate pace
  BUS: 10,   // getting to/from stops
  MINIBUS: 10,
  MTR: 15,   // transfers involve more walking
  FERRY: 8,
};

/**
 * Calculate environmental and health impact for a journey
 */
export function calculateJourneyImpact(
  transportMode: TransportMode,
  distanceKm: number,
  durationMinutes: number
): JourneyImpact {
  // Calculate CO2 saved compared to driving
  const carEmissions = CO2_EMISSION_FACTORS.CAR * distanceKm;
  const modeEmissions = CO2_EMISSION_FACTORS[transportMode] * distanceKm;
  const co2Saved = Math.max(0, carEmissions - modeEmissions);
  
  // Calculate calories burned
  const caloriesBurned = CALORIE_BURN_RATES[transportMode] * durationMinutes;
  
  // Calculate steps taken
  const stepsCount = STEPS_PER_MINUTE[transportMode] * durationMinutes;
  
  return {
    id: generateUUID(),
    date: new Date().toISOString(),
    transportMode,
    distanceKm,
    durationMinutes,
    co2Saved,
    caloriesBurned,
    stepsCount
  };
}

/**
 * Calculate cumulative impact metrics from journeys
 */
export function calculateUserImpactMetrics(journeys: JourneyImpact[]): UserImpactMetrics {
  const totalJourneys = journeys.length;
  const totalDistanceKm = journeys.reduce((sum, journey) => sum + journey.distanceKm, 0);
  const totalDurationMinutes = journeys.reduce((sum, journey) => sum + journey.durationMinutes, 0);
  const totalCO2Saved = journeys.reduce((sum, journey) => sum + journey.co2Saved, 0);
  const totalCaloriesBurned = journeys.reduce((sum, journey) => sum + journey.caloriesBurned, 0);
  const totalStepsCount = journeys.reduce((sum, journey) => sum + journey.stepsCount, 0);
  
  // Calculate equivalent impacts
  // Average tree absorbs about 25kg CO2 per year
  const treesEquivalent = totalCO2Saved / 25;
  
  // Average car uses about 8L/100km, and 1L of fuel produces about 2.3kg of CO2
  const gasEquivalent = totalCO2Saved / 2.3;
  
  return {
    totalJourneys,
    totalDistanceKm,
    totalDurationMinutes,
    totalCO2Saved,
    totalCaloriesBurned,
    totalStepsCount,
    treesEquivalent,
    gasEquivalent
  };
}

/**
 * Get impact milestones with completion status
 */
export function getImpactMilestones(metrics: UserImpactMetrics): ImpactMilestone[] {
  const milestones: ImpactMilestone[] = [
    {
      id: 'distance-10',
      title: 'Urban Explorer',
      description: 'Travel 10km using public transportation',
      threshold: 10,
      metricType: 'distance',
      iconName: 'map.fill',
      isAchieved: metrics.totalDistanceKm >= 10
    },
    {
      id: 'distance-50',
      title: 'City Voyager',
      description: 'Travel 50km using public transportation',
      threshold: 50,
      metricType: 'distance',
      iconName: 'map.fill',
      isAchieved: metrics.totalDistanceKm >= 50
    },
    {
      id: 'distance-100',
      title: 'Transit Centurion',
      description: 'Travel 100km using public transportation',
      threshold: 100,
      metricType: 'distance',
      iconName: 'map.fill',
      isAchieved: metrics.totalDistanceKm >= 100
    },
    {
      id: 'co2-5',
      title: 'Climate Guardian',
      description: 'Save 5kg of CO2 emissions',
      threshold: 5,
      metricType: 'co2',
      iconName: 'leaf.fill',
      isAchieved: metrics.totalCO2Saved >= 5
    },
    {
      id: 'co2-25',
      title: 'Eco Warrior',
      description: 'Save 25kg of CO2 emissions',
      threshold: 25,
      metricType: 'co2',
      iconName: 'leaf.fill',
      isAchieved: metrics.totalCO2Saved >= 25
    },
    {
      id: 'journeys-10',
      title: 'Consistent Commuter',
      description: 'Complete 10 public transport journeys',
      threshold: 10,
      metricType: 'journeys',
      iconName: 'repeat',
      isAchieved: metrics.totalJourneys >= 10
    },
    {
      id: 'calories-500',
      title: 'Active Traveler',
      description: 'Burn 500 calories through transit activities',
      threshold: 500,
      metricType: 'calories',
      iconName: 'flame.fill',
      isAchieved: metrics.totalCaloriesBurned >= 500
    },
    {
      id: 'steps-10000',
      title: 'Transit Stepper',
      description: 'Take 10,000 steps during your transit journeys',
      threshold: 10000,
      metricType: 'steps',
      iconName: 'figure.walk',
      isAchieved: metrics.totalStepsCount >= 10000
    }
  ];
  
  return milestones;
}
