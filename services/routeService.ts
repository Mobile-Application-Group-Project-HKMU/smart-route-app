import { TransportStop } from "@/types/transport-types";
import { generateUUID } from "@/util/uniqueId";
import { calculateDistance } from "@/util/calculateDistance";

// API endpoint for route planning
const ROUTE_API_ENDPOINT = "https://api.hktransit.org/v1/routes";

// Define type for each step in a journey
type JourneyStep = {
  type: "WALK" | "BUS" | "MTR";
  from: TransportStop;
  to: TransportStop;
  distance?: number;
  duration?: number;
  route?: string;
  company?: string;
};

// Define type for a complete journey
type Journey = {
  id: string;
  steps: JourneyStep[];
  totalDuration: number;
  totalDistance: number;
  weatherAdjusted?: boolean;
  weatherProtected?: boolean;
};

/**
 * Fetch available routes between origin and destination
 * @param origin Starting location
 * @param destination Ending location
 * @returns Array of possible journeys
 */
export async function fetchRoutes(
  origin: TransportStop,
  destination: TransportStop
): Promise<Journey[]> {
  try {
    // Make API request to get route data
    const response = await fetch(
      `${ROUTE_API_ENDPOINT}?origin_lat=${origin.lat}&origin_lng=${origin.long}&dest_lat=${destination.lat}&dest_lng=${destination.long}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transform API response into our Journey format
    return transformResponseToJourneys(data, origin, destination);
  } catch (error) {
    console.error("Error fetching routes:", error);
    
    // If API fails, fall back to locally calculated routes
    return generateFallbackRoutes(origin, destination);
  }
}

/**
 * Transform API response into journey objects
 */
function transformResponseToJourneys(
  apiResponse: any,
  origin: TransportStop,
  destination: TransportStop
): Journey[] {
  // Implementation depends on actual API response structure
  // For now, using fallback as a placeholder
  return generateFallbackRoutes(origin, destination);
}

/**
 * Generate fallback routes when API is unavailable
 */
function generateFallbackRoutes(
  origin: TransportStop,
  destination: TransportStop
): Journey[] {
  const directDistance = calculateDistance(
    origin.lat,
    origin.long,
    destination.lat,
    destination.long
  );
  
  // For shorter distances, offer a direct walking option
  const journeys: Journey[] = [];
  
  if (directDistance < 2000) {
    // Walking journey for short distances
    const walkTime = Math.round((directDistance / 80) * 60); // 80m per minute
    journeys.push({
      id: generateUUID(),
      steps: [
        {
          type: "WALK",
          from: origin,
          to: destination,
          distance: Math.round(directDistance),
          duration: walkTime
        }
      ],
      totalDuration: walkTime,
      totalDistance: Math.round(directDistance),
      weatherAdjusted: false,
      weatherProtected: false
    });
  }
  
  // Bus journey
  const busRoutes = ["1", "1A", "5", "5C", "6", "7", "9", "11K", "11X", "40X"];
  const busRoute = busRoutes[Math.floor(Math.random() * busRoutes.length)];
  
  const busJourney = createMultiStepJourney(
    origin,
    destination,
    [
      { type: "WALK", distanceFactor: 0.2, speedFactor: 80 },
      { type: "BUS", distanceFactor: 0.7, speedFactor: 500, route: busRoute, company: "KMB" },
      { type: "WALK", distanceFactor: 0.1, speedFactor: 80 }
    ]
  );
  journeys.push(busJourney);
  
  // MTR journey
  const mtrRoutes = ["TWL", "ISL", "TKL", "EAL", "SIL", "TML", "KTL"];
  const mtrRoute = mtrRoutes[Math.floor(Math.random() * mtrRoutes.length)];
  
  const mtrJourney = createMultiStepJourney(
    origin,
    destination,
    [
      { type: "WALK", distanceFactor: 0.15, speedFactor: 80 },
      { type: "MTR", distanceFactor: 0.75, speedFactor: 1000, route: mtrRoute, company: "MTR" },
      { type: "WALK", distanceFactor: 0.1, speedFactor: 80 }
    ]
  );
  journeys.push(mtrJourney);
  
  // Combined journey
  const combinedJourney = createMultiStepJourney(
    origin,
    destination,
    [
      { type: "WALK", distanceFactor: 0.1, speedFactor: 80 },
      { type: "BUS", distanceFactor: 0.3, speedFactor: 500, route: busRoutes[1], company: "KMB" },
      { type: "WALK", distanceFactor: 0.1, speedFactor: 80 },
      { type: "MTR", distanceFactor: 0.4, speedFactor: 1000, route: mtrRoutes[2], company: "MTR" },
      { type: "WALK", distanceFactor: 0.1, speedFactor: 80 }
    ]
  );
  journeys.push(combinedJourney);
  
  return journeys;
}

/**
 * Helper to create a multi-step journey
 */
function createMultiStepJourney(
  origin: TransportStop,
  destination: TransportStop,
  stepConfigs: Array<{
    type: "WALK" | "BUS" | "MTR";
    distanceFactor: number;
    speedFactor: number;
    route?: string;
    company?: string;
  }>
): Journey {
  const directDistance = calculateDistance(
    origin.lat,
    origin.long,
    destination.lat,
    destination.long
  );
  
  let totalDistance = 0;
  let totalDuration = 0;
  const steps: JourneyStep[] = [];
  let currentPoint = { ...origin };
  
  // Create each step of the journey
  stepConfigs.forEach((config, index) => {
    const nextPoint = createIntermediatePoint(
      currentPoint,
      destination,
      index === stepConfigs.length - 1
    );
    
    const stepDistance = Math.round(directDistance * config.distanceFactor);
    const stepDuration = Math.round((stepDistance / config.speedFactor) * 60);
    
    steps.push({
      type: config.type,
      from: currentPoint,
      to: nextPoint,
      distance: stepDistance,
      duration: stepDuration,
      route: config.route,
      company: config.company
    });
    
    totalDistance += stepDistance;
    totalDuration += stepDuration;
    currentPoint = nextPoint;
  });
  
  return {
    id: generateUUID(),
    steps,
    totalDuration,
    totalDistance,
    weatherAdjusted: false,
    weatherProtected: false
  };
}

/**
 * Create an intermediate point between two locations
 */
function createIntermediatePoint(
  start: TransportStop,
  end: TransportStop,
  isLastPoint: boolean
): TransportStop {
  if (isLastPoint) {
    return end;
  }
  
  // Create a point between start and end
  const factor = Math.random() * 0.5 + 0.25; // 0.25 to 0.75
  const lat = start.lat + (end.lat - start.lat) * factor;
  const long = start.long + (end.long - start.long) * factor;
  
  return {
    lat,
    long,
    name_en: `Via Point ${Math.round(factor * 100)}`,
    name_tc: `途經點 ${Math.round(factor * 100)}`,
    stop: `VP${Math.round(factor * 100)}`,
    mode: "WALK"
  };
}
