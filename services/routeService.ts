import { TransportStop } from "@/types/transport-types";
import { generateUUID } from "@/util/uniqueId";
import { calculateDistance } from "@/util/calculateDistance";

// Google Directions API endpoint
const GOOGLE_API_ENDPOINT = "https://maps.googleapis.com/maps/api/directions/json";
const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyAzIv8dRpgFdDuSEWfovppK-pdjTrZxq8g";

// Define type for each step in a journey
type JourneyStep = {
  type: "WALK" | "TRANSIT" | "BUS" | "SUBWAY" | "TRAM" | "RAIL";
  from: TransportStop;
  to: TransportStop;
  distance?: number;
  duration?: number;
  route?: string;
  company?: string;
  vehicleType?: string;
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
 * Fetch available routes between origin and destination using Google Directions API
 */
export async function fetchRoutes(
  origin: TransportStop,
  destination: TransportStop
): Promise<Journey[]> {
  try {
    const params = new URLSearchParams({
      origin: `${origin.lat},${origin.long}`,
      destination: `${destination.lat},${destination.long}`,
      key: GOOGLE_API_KEY,
      mode: "transit",
      alternatives: "true",
      units: "metric",
    });

    const response = await fetch(`${GOOGLE_API_ENDPOINT}?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }

    const data = await response.json();
    return transformResponseToJourneys(data, origin, destination);
  } catch (error) {
    console.error("Error fetching routes:", error);
    return generateFallbackRoutes(origin, destination);
  }
}

/**
 * Transform Google API response into journey objects
 */
function transformResponseToJourneys(
  apiResponse: any,
  origin: TransportStop,
  destination: TransportStop
): Journey[] {
  if (apiResponse.status !== "OK") {
    return generateFallbackRoutes(origin, destination);
  }

  const journeys: Journey[] = apiResponse.routes.map((route: any) => {
    let totalDistance = 0;
    let totalDuration = 0;
    let currentPoint = { ...origin };
    const steps: JourneyStep[] = [];

    route.legs[0].steps.forEach((step: any) => {
      const stepDistance = step.distance.value; // in meters
      const stepDuration = step.duration.value / 60; // convert seconds to minutes

      const nextPoint: TransportStop = {
        lat: step.end_location.lat,
        long: step.end_location.lng,
        name_en: step.end_address || `Point at ${step.end_location.lat},${step.end_location.lng}`,
        name_tc: step.end_address || `點 ${step.end_location.lat},${step.end_location.lng}`,
        stop: `STOP_${generateUUID().slice(0, 8)}`,
        mode: step.travel_mode,
      };

      let journeyStep: JourneyStep = {
        type: step.travel_mode === "WALKING" ? "WALK" : "TRANSIT",
        from: currentPoint,
        to: nextPoint,
        distance: stepDistance,
        duration: Math.round(stepDuration),
      };

      if (step.travel_mode === "TRANSIT" && step.transit_details) {
        const transit = step.transit_details;
        journeyStep = {
          ...journeyStep,
          type: transit.line.vehicle.type === "BUS" ? "BUS" :
                transit.line.vehicle.type === "SUBWAY" ? "SUBWAY" :
                transit.line.vehicle.type === "TRAM" ? "TRAM" :
                transit.line.vehicle.type === "RAIL" ? "RAIL" : "TRANSIT",
          route: transit.line.short_name || transit.line.name,
          company: transit.line.agencies?.[0]?.name,
          vehicleType: transit.line.vehicle.type,
        };
      }

      steps.push(journeyStep);
      totalDistance += stepDistance;
      totalDuration += stepDuration;
      currentPoint = nextPoint;
    });

    return {
      id: generateUUID(),
      steps,
      totalDistance,
      totalDuration: Math.round(totalDuration),
      weatherAdjusted: false,
      weatherProtected: steps.every(step => step.type !== "WALK"),
    };
  });

  return journeys;
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

  const walkingJourney: Journey = {
    id: generateUUID(),
    steps: [{
      type: "WALK",
      from: origin,
      to: destination,
      distance: Math.round(directDistance),
      duration: Math.round((directDistance / 80) * 60), // 80m per minute
    }],
    totalDistance: Math.round(directDistance),
    totalDuration: Math.round((directDistance / 80) * 60),
    weatherAdjusted: false,
    weatherProtected: false,
  };

  return [walkingJourney];
}

/**
 * Create an intermediate point between two locations (used only in fallback)
 */
function createIntermediatePoint(
  start: TransportStop,
  end: TransportStop
): TransportStop {
  const factor = 0.5;
  const lat = start.lat + (end.lat - start.lat) * factor;
  const long = start.long + (end.long - start.long) * factor;

  return {
    lat,
    long,
    name_en: `Midpoint`,
    name_tc: `中點`,
    stop: `MP${generateUUID().slice(0, 8)}`,
    mode: "WALK",
  };
}