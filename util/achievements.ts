import AsyncStorage from '@react-native-async-storage/async-storage';
// Remove the uuid import and add our own implementation
import { 
  Achievement, 
  AchievementCategory, 
  JourneyEntry, 
  UserAchievements 
} from '@/types/achievement-types';
import { TransportCompany, TransportMode, TransportRoute } from '@/types/transport-types';

// Custom UUID function that doesn't rely on external dependencies
function generateUUID(): string {
  // Simple implementation of UUID v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const ACHIEVEMENTS_STORAGE_KEY = 'user_achievements';

// List of Hong Kong districts for district explorer achievements
const HK_DISTRICTS = [
  'Central & Western', 'Eastern', 'Southern', 'Wan Chai', 
  'Sham Shui Po', 'Kowloon City', 'Kwun Tong', 'Wong Tai Sin', 
  'Yau Tsim Mong', 'Islands', 'Kwai Tsing', 'North', 'Sai Kung',
  'Sha Tin', 'Tai Po', 'Tsuen Wan', 'Tuen Mun', 'Yuen Long'
];

// Default achievements
export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  // Journey count achievements
  {
    id: 'journey-count-10',
    category: 'JOURNEY_COUNT',
    title: {
      en: 'Regular Commuter',
      'zh-Hant': '定期通勤者',
      'zh-Hans': '定期通勤者'
    },
    description: {
      en: 'Complete 10 journeys using public transport',
      'zh-Hant': '使用公共交通完成10次旅程',
      'zh-Hans': '使用公共交通完成10次旅程'
    },
    level: 'BRONZE',
    icon: 'trophy.fill',
    status: 'LOCKED',
    progress: 0,
    requirement: 10,
    currentValue: 0
  },
  {
    id: 'journey-count-50',
    category: 'JOURNEY_COUNT',
    title: {
      en: 'Dedicated Traveler',
      'zh-Hant': '專業旅行者',
      'zh-Hans': '专业旅行者'
    },
    description: {
      en: 'Complete 50 journeys using public transport',
      'zh-Hant': '使用公共交通完成50次旅程',
      'zh-Hans': '使用公共交通完成50次旅程'
    },
    level: 'SILVER',
    icon: 'trophy.fill',
    status: 'LOCKED',
    progress: 0,
    requirement: 50,
    currentValue: 0
  },
  {
    id: 'journey-count-100',
    category: 'JOURNEY_COUNT',
    title: {
      en: 'Transport Maestro',
      'zh-Hant': '交通大師',
      'zh-Hans': '交通大师'
    },
    description: {
      en: 'Complete 100 journeys using public transport',
      'zh-Hant': '使用公共交通完成100次旅程',
      'zh-Hans': '使用公共交通完成100次旅程'
    },
    level: 'GOLD',
    icon: 'trophy.fill',
    status: 'LOCKED',
    progress: 0,
    requirement: 100,
    currentValue: 0
  },
  
  // Transport variety achievements
  {
    id: 'transport-variety-3',
    category: 'TRANSPORT_VARIETY',
    title: {
      en: 'Transport Explorer',
      'zh-Hant': '交通探險家',
      'zh-Hans': '交通探险家'
    },
    description: {
      en: 'Use 3 different types of transport',
      'zh-Hant': '使用3種不同類型的交通工具',
      'zh-Hans': '使用3种不同类型的交通工具'
    },
    level: 'BRONZE',
    icon: 'bus.fill',
    status: 'LOCKED',
    progress: 0,
    requirement: 3,
    currentValue: 0
  },
  {
    id: 'transport-variety-5',
    category: 'TRANSPORT_VARIETY',
    title: {
      en: 'Versatile Traveler',
      'zh-Hant': '多功能旅行者',
      'zh-Hans': '多功能旅行者'
    },
    description: {
      en: 'Use all 5 types of transport in Hong Kong',
      'zh-Hant': '使用香港所有5種交通工具',
      'zh-Hans': '使用香港所有5种交通工具'
    },
    level: 'GOLD',
    icon: 'bus.fill',
    status: 'LOCKED',
    progress: 0,
    requirement: 5,
    currentValue: 0
  },
  
  // District explorer achievements
  {
    id: 'district-explorer-5',
    category: 'DISTRICT_EXPLORER',
    title: {
      en: 'Area Visitor',
      'zh-Hant': '地區遊客',
      'zh-Hans': '地区游客'
    },
    description: {
      en: 'Visit 5 different districts in Hong Kong',
      'zh-Hant': '參觀香港5個不同地區',
      'zh-Hans': '参观香港5个不同地区'
    },
    level: 'BRONZE',
    icon: 'map.fill',
    status: 'LOCKED',
    progress: 0,
    requirement: 5,
    currentValue: 0
  },
  {
    id: 'district-explorer-10',
    category: 'DISTRICT_EXPLORER',
    title: {
      en: 'District Adventurer',
      'zh-Hant': '地區冒險家',
      'zh-Hans': '地区冒险家'
    },
    description: {
      en: 'Visit 10 different districts in Hong Kong',
      'zh-Hant': '參觀香港10個不同地區',
      'zh-Hans': '参观香港10个不同地区'
    },
    level: 'SILVER',
    icon: 'map.fill',
    status: 'LOCKED',
    progress: 0,
    requirement: 10,
    currentValue: 0
  },
  {
    id: 'district-explorer-18',
    category: 'DISTRICT_EXPLORER',
    title: {
      en: 'Hong Kong Expert',
      'zh-Hant': '香港專家',
      'zh-Hans': '香港专家'
    },
    description: {
      en: 'Visit all 18 districts in Hong Kong',
      'zh-Hant': '參觀香港所有18個地區',
      'zh-Hans': '参观香港所有18个地区'
    },
    level: 'GOLD',
    icon: 'map.fill',
    status: 'LOCKED',
    progress: 0,
    requirement: 18,
    currentValue: 0
  },
  
  // Route master achievements
  {
    id: 'route-master-10',
    category: 'ROUTE_MASTER',
    title: {
      en: 'Route Collector',
      'zh-Hant': '路線收藏家',
      'zh-Hans': '路线收藏家'
    },
    description: {
      en: 'Travel on 10 different routes',
      'zh-Hant': '乘搭10條不同路線',
      'zh-Hans': '乘搭10条不同路线'
    },
    level: 'BRONZE',
    icon: 'arrow.triangle.turn.up.right.circle.fill',
    status: 'LOCKED',
    progress: 0,
    requirement: 10,
    currentValue: 0
  },
  {
    id: 'route-master-30',
    category: 'ROUTE_MASTER',
    title: {
      en: 'Route Enthusiast',
      'zh-Hant': '路線愛好者',
      'zh-Hans': '路线爱好者'
    },
    description: {
      en: 'Travel on 30 different routes',
      'zh-Hant': '乘搭30條不同路線',
      'zh-Hans': '乘搭30条不同路线'
    },
    level: 'SILVER',
    icon: 'arrow.triangle.turn.up.right.circle.fill',
    status: 'LOCKED',
    progress: 0,
    requirement: 30,
    currentValue: 0
  },
  {
    id: 'route-master-50',
    category: 'ROUTE_MASTER',
    title: {
      en: 'Route Master',
      'zh-Hant': '路線大師',
      'zh-Hans': '路线大师'
    },
    description: {
      en: 'Travel on 50 different routes',
      'zh-Hant': '乘搭50條不同路線',
      'zh-Hans': '乘搭50条不同路线'
    },
    level: 'GOLD',
    icon: 'arrow.triangle.turn.up.right.circle.fill',
    status: 'LOCKED',
    progress: 0,
    requirement: 50,
    currentValue: 0
  }
];

// Initialize empty user achievements
export const initUserAchievements = async (): Promise<UserAchievements> => {
  const defaultUserAchievements: UserAchievements = {
    achievements: DEFAULT_ACHIEVEMENTS,
    journeys: [],
    stats: {
      totalJourneys: 0,
      transportTypesUsed: new Set<TransportMode>(),
      companiesUsed: new Set<TransportCompany>(),
      districtsVisited: new Set<string>(),
      routesTaken: new Set<string>(),
    }
  };
  
  try {
    await AsyncStorage.setItem(
      ACHIEVEMENTS_STORAGE_KEY, 
      JSON.stringify({
        ...defaultUserAchievements,
        stats: {
          ...defaultUserAchievements.stats,
          transportTypesUsed: Array.from(defaultUserAchievements.stats.transportTypesUsed),
          companiesUsed: Array.from(defaultUserAchievements.stats.companiesUsed),
          districtsVisited: Array.from(defaultUserAchievements.stats.districtsVisited),
          routesTaken: Array.from(defaultUserAchievements.stats.routesTaken),
        }
      })
    );
    return defaultUserAchievements;
  } catch (error) {
    console.error('Failed to initialize user achievements:', error);
    return defaultUserAchievements;
  }
};

// Get user achievements from storage
export const getUserAchievements = async (): Promise<UserAchievements> => {
  try {
    const jsonValue = await AsyncStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
    
    if (!jsonValue) {
      return await initUserAchievements();
    }
    
    const parsedData = JSON.parse(jsonValue);
    
    // Process achievement data to ensure dates are proper Date objects
    const achievements = parsedData.achievements.map((achievement: Achievement) => {
      // Convert unlockedAt string to Date object if it exists
      if (achievement.unlockedAt && typeof achievement.unlockedAt === 'string') {
        return {
          ...achievement,
          unlockedAt: new Date(achievement.unlockedAt)
        };
      }
      return achievement;
    });
    
    // Convert arrays back to Sets
    return {
      ...parsedData,
      achievements,
      stats: {
        ...parsedData.stats,
        transportTypesUsed: new Set(parsedData.stats.transportTypesUsed),
        companiesUsed: new Set(parsedData.stats.companiesUsed),
        districtsVisited: new Set(parsedData.stats.districtsVisited),
        routesTaken: new Set(parsedData.stats.routesTaken),
      }
    };
  } catch (error) {
    console.error('Failed to get user achievements:', error);
    return await initUserAchievements();
  }
};

// Save user achievements to storage
export const saveUserAchievements = async (userAchievements: UserAchievements): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      ACHIEVEMENTS_STORAGE_KEY,
      JSON.stringify({
        ...userAchievements,
        stats: {
          ...userAchievements.stats,
          transportTypesUsed: Array.from(userAchievements.stats.transportTypesUsed),
          companiesUsed: Array.from(userAchievements.stats.companiesUsed),
          districtsVisited: Array.from(userAchievements.stats.districtsVisited),
          routesTaken: Array.from(userAchievements.stats.routesTaken),
        }
      })
    );
  } catch (error) {
    console.error('Failed to save user achievements:', error);
  }
};

// Record a new journey and update achievements
export const recordJourney = async (
  transportMode: TransportMode,
  transportCompany: TransportCompany,
  routeId: string,
  origin: string,
  destination: string,
  district: string
): Promise<{
  userAchievements: UserAchievements,
  newlyUnlockedAchievements: Achievement[]
}> => {
  const userAchievements = await getUserAchievements();
  
  // Create a new journey entry
  const newJourney: JourneyEntry = {
    id: generateUUID(), // Use our custom UUID function instead of uuidv4
    transportMode,
    transportCompany,
    routeId,
    origin,
    destination,
    district,
    timestamp: new Date(),
    isCompleted: true
  };
  
  // Add the journey to the list
  userAchievements.journeys.push(newJourney);
  
  // Update stats
  userAchievements.stats.totalJourneys += 1;
  userAchievements.stats.transportTypesUsed.add(transportMode);
  userAchievements.stats.companiesUsed.add(transportCompany);
  userAchievements.stats.districtsVisited.add(district);
  userAchievements.stats.routesTaken.add(routeId);
  
  // Update achievements
  const previouslyLockedAchievements = userAchievements.achievements
    .filter(achievement => achievement.status === 'LOCKED');
    
  userAchievements.achievements = updateAchievements(userAchievements);
  
  // Save updated achievements
  await saveUserAchievements(userAchievements);
  
  // Find newly unlocked achievements
  const newlyUnlockedAchievements = userAchievements.achievements
    .filter(achievement => 
      achievement.status === 'UNLOCKED' && 
      previouslyLockedAchievements.some(prev => prev.id === achievement.id)
    );
  
  return {
    userAchievements,
    newlyUnlockedAchievements
  };
};

// Update achievement progress based on user stats
const updateAchievements = (userAchievements: UserAchievements): Achievement[] => {
  return userAchievements.achievements.map(achievement => {
    let currentValue = 0;
    let status = achievement.status;
    
    // Calculate current value based on achievement category
    switch (achievement.category) {
      case 'JOURNEY_COUNT':
        currentValue = userAchievements.stats.totalJourneys;
        break;
      case 'TRANSPORT_VARIETY':
        currentValue = userAchievements.stats.transportTypesUsed.size;
        break;
      case 'DISTRICT_EXPLORER':
        currentValue = userAchievements.stats.districtsVisited.size;
        break;
      case 'ROUTE_MASTER':
        currentValue = userAchievements.stats.routesTaken.size;
        break;
    }
    
    // Calculate progress percentage
    const progress = Math.min(Math.floor((currentValue / achievement.requirement) * 100), 100);
    
    // Check if achievement is unlocked
    const wasLocked = status === 'LOCKED';
    if (wasLocked && currentValue >= achievement.requirement) {
      status = 'UNLOCKED';
    }
    
    // Ensure unlockedAt is a proper Date object when status changes to UNLOCKED
    let unlockedAt = achievement.unlockedAt;
    if (status === 'UNLOCKED') {
      // If newly unlocked or unlockedAt is missing, set to current time
      if (wasLocked || !unlockedAt) {
        unlockedAt = new Date();
      } 
      // If unlockedAt is a string (from JSON storage), convert to Date
      else if (typeof unlockedAt === 'string') {
        unlockedAt = new Date(unlockedAt);
      }
    }
    
    return {
      ...achievement,
      currentValue,
      progress,
      status,
      unlockedAt
    };
  });
};

// Map district to achievement district based on proximity or matching
export const mapLocationToDistrict = (latitude: number, longitude: number): string => {
  // This would normally use a geolocation service or polygon matching
  // For demonstration, we'll return a random district
  const randomIndex = Math.floor(Math.random() * HK_DISTRICTS.length);
  return HK_DISTRICTS[randomIndex];
};

// Get achievement badge color based on level
export const getAchievementColor = (level: Achievement['level']): string => {
  switch (level) {
    case 'BRONZE':
      return '#CD7F32';
    case 'SILVER':
      return '#C0C0C0';
    case 'GOLD':
      return '#FFD700';
    default:
      return '#CCCCCC';
  }
};

// Get total achievement points
export const getAchievementPoints = (achievements: Achievement[]): number => {
  return achievements
    .filter(a => a.status === 'UNLOCKED')
    .reduce((total, achievement) => {
      switch (achievement.level) {
        case 'BRONZE':
          return total + 10;
        case 'SILVER':
          return total + 25;
        case 'GOLD':
          return total + 50;
        default:
          return total;
      }
    }, 0);
};
