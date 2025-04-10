import { TransportStop } from "@/types/transport-types"; 
import { generateUUID } from "@/util/uniqueId"; 
import { calculateDistance } from "@/util/calculateDistance"; 
import axios from "axios"; 
 
// 高德地图 API Key，需要替换为你自己的 Key 
const GAODE_API_KEY = "6a20f25ef26e7c79e20011360d5de199"; 
// 高德地图公交路线规划 API 端点 
const ROUTE_API_ENDPOINT = `https://restapi.amap.com/v3/direction/transit/integrated`;  
 
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
      // 动态获取城市代码（示例：通过经纬度反查）
      const cityCode = await getCityCodeByLocation(origin.lat, origin.long);

      async function getCityCodeByLocation(lat: number, long: number): Promise<string> {
        // Example implementation: Replace with actual API call or logic
        const response = await axios.get(`https://restapi.amap.com/v3/geocode/regeo`, {
          params: {
            location: `${long},${lat}`,
            key: GAODE_API_KEY,
          },
        });
        if (response.data.status === "1") {
          return response.data.regeocode.addressComponent.citycode || "0000";
        } else {
          throw new Error("Failed to fetch city code");
        }
      }
      const params = {
        origin: `${origin.long},${origin.lat}`, 
        destination: `${destination.long},${destination.lat}`, 
        key: GAODE_API_KEY,
        city: cityCode,
        extensions: "all",
      };
   
      const response = await axios.get(ROUTE_API_ENDPOINT,  { params });
      if (response.status  !== 200) {
        throw new Error(`API请求失败: ${response.status}`); 
      }
   
      const data = response.data; 
      if (data.status  === "1") {
        return transformResponseToJourneys(data, origin, destination);
      } else {
        // 根据错误码提供具体提示 
        if (data.info  === "USERKEY_PLAT_NOMATCH") {
          throw new Error("API密钥与平台不匹配，请检查配置");
        }
        throw new Error(`API错误: ${data.info}`); 
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(" 路线获取失败:", errorMessage); 
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
  const journeys: Journey[] = []; 
  const routes = apiResponse.route.transits;  
 
  routes.forEach((route:  any) => { 
    const steps: JourneyStep[] = []; 
    let totalDuration = route.duration;  
    let totalDistance = 0; 
 
    route.segments.forEach((segment:  any) => { 
      segment.steps.forEach((step:  any) => { 
        const stepType = step.mode  === "WALK" ? "WALK" : "BUS"; 
        const from = { 
          lat: step.start_location.lat,  
          long: step.start_location.lng,  
          name_en: step.start_stop?.name  || "Start Point", 
          name_tc: step.start_stop?.name  || "起點", 
          stop: step.start_stop?.id  || "SP", 
          mode: stepType, 
        } as TransportStop; 
        const to = { 
          lat: step.end_location.lat,  
          long: step.end_location.lng,  
          name_en: step.end_stop?.name  || "End Point", 
          name_tc: step.end_stop?.name  || "終點", 
          stop: step.end_stop?.id  || "EP", 
          mode: stepType, 
        } as TransportStop; 
        const distance = step.distance;  
        const duration = step.duration;  
        const routeName = step.bus?.buslines?.[0]?.name;  
        const company = step.bus?.buslines?.[0]?.company;  
 
        steps.push({  
          type: stepType, 
          from, 
          to, 
          distance, 
          duration, 
          route: routeName, 
          company, 
        }); 
 
        totalDistance += distance; 
      }); 
    }); 
 
    journeys.push({  
      id: generateUUID(), 
      steps, 
      totalDuration: parseInt(totalDuration), 
      totalDistance, 
      weatherAdjusted: false, 
      weatherProtected: false, 
    }); 
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
 
  // For shorter distances, offer a direct walking option 
  const journeys: Journey[] = []; 
 
  if (directDistance < 2000) { 
    // Walking journey for short distances 
    const walkTime = Math.round((directDistance  / 80) * 60); // 80m per minute 
    journeys.push({  
      id: generateUUID(), 
      steps: [ 
        { 
          type: "WALK", 
          from: origin, 
          to: destination, 
          distance: Math.round(directDistance),  
          duration: walkTime, 
        }, 
      ], 
      totalDuration: walkTime, 
      totalDistance: Math.round(directDistance),  
      weatherAdjusted: false, 
      weatherProtected: false, 
    }); 
  } 
 
  // 这里可以根据实际情况添加更多的本地计算路线逻辑 
  return journeys; 
} 
 