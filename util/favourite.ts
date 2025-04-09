import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Interface for KMB favorite routes
 * 九巴收藏路线的接口
 */
export interface FavRouteKMB {
  kmbID: string[];  // Array of KMB route IDs - 九巴路线ID数组
}

/**
 * Interface for favorite stations
 * 收藏车站的接口
 */
export interface FavRouteStation {
  stationID: string[];  // Array of station IDs - 车站ID数组
}

/**
 * Interface for CTB favorite routes
 */
export interface FavRouteCTB {
  ctbID: string[];
}

/**
 * Interface for NLB favorite routes
 */
export interface FavRouteNLB {
  nlbID: string[];
}

/**
 * Interface for HKKF favorite routes
 */
export interface FavRouteHKKF {
  hkkfID: string[];
}

/**
 * Example data structure for KMB favorites (empty)
 */
export const FavRouteExampleKMBData: FavRouteKMB = {
  kmbID: [],
};

/**
 * Example data structure for station favorites (empty)
 */
export const FavStationExampleData: FavRouteStation = {
  stationID: [],
};

/**
 * Initializes storage with default empty arrays if not already present.
 * Should be called when the app starts.
 * 
 * 初始化存储，如果尚未存在则使用默认的空数组。
 * 应在应用启动时调用。
 */
const initializeStorage = async () => {
  try {
    const kmbFavorites = await AsyncStorage.getItem('kmbFavorites');
    const stationFavorites = await AsyncStorage.getItem('stationFavorites');
    
    if (kmbFavorites === null) {
      await AsyncStorage.setItem('kmbFavorites', JSON.stringify({ kmbID: [] }));
    }
    
    if (stationFavorites === null) {
      await AsyncStorage.setItem('stationFavorites', JSON.stringify({ stationID: [] }));
    }
  } catch (error) {
    console.error("Error initializing storage:", error);
  }
};

// Call this when app starts
initializeStorage();

/**
 * Saves favorite data to AsyncStorage.
 * 将收藏数据保存到AsyncStorage。
 * 
 * @param key - The storage key to save under - 要保存在其下的存储键
 * @param data - The favorite data to save - 要保存的收藏数据
 */
export async function saveToLocalStorage(key: string, data: FavRouteStation | FavRouteKMB): Promise<void> {
  try {
    const jsonData = JSON.stringify(data);
    await AsyncStorage.setItem(key, jsonData);
    console.log(`Data saved to storage with key: ${key}`);
  } catch (error) {
    console.error("Error saving data to storage:", error);
  }
}

/**
 * Retrieves favorite data from AsyncStorage.
 * Returns default empty structures if data is not found.
 * 
 * @param key - The storage key to retrieve
 * @returns The favorite data or default empty structure
 */
export async function getFromLocalStorage(key: string): Promise<FavRouteStation | FavRouteKMB | null> {
  try {
    const jsonData = await AsyncStorage.getItem(key);
    if (jsonData) {
      return JSON.parse(jsonData) as FavRouteStation | FavRouteKMB;
    } else {
      // Return empty default structures instead of null
      if (key === 'kmbFavorites') {
        return { kmbID: [] };
      } else if (key === 'stationFavorites') {
        return { stationID: [] };
      }
      console.warn(`No data found in storage for key: ${key}`);
      return null;
    }
  } catch (error) {
    console.error("Error retrieving data from storage:", error);
    return null;
  }
}

/**
 * Deletes a specific value from an array in AsyncStorage.
 * 从AsyncStorage中的数组删除特定值。
 * 
 * @param key - The storage key containing the array - 包含数组的存储键
 * @param arrayKey - The property name of the array within the stored object - 存储对象中数组的属性名
 * @param valueToDelete - The value to remove from the array - 要从数组中删除的值
 */
export async function deleteFromLocalStorageArray(
  key: string,
  arrayKey: keyof FavRouteStation | keyof FavRouteKMB,
  valueToDelete: string
): Promise<void> {
  try {
    const data = await getFromLocalStorage(key);
    if (data) {
      // Check if the property exists and is an array
      if (
        (arrayKey === "stationID" && "stationID" in data && Array.isArray(data.stationID)) ||
        (arrayKey === "kmbID" && "kmbID" in data && Array.isArray(data.kmbID))
      ) {
        // Filter the array to remove the specified value
        if (arrayKey === "stationID") {
          (data as FavRouteStation).stationID = (data as FavRouteStation).stationID.filter(
            (item) => item !== valueToDelete
          );
        } else if (arrayKey === "kmbID") {
          (data as FavRouteKMB).kmbID = (data as FavRouteKMB).kmbID.filter(
            (item) => item !== valueToDelete
          );
        }
        // Save the updated data back to storage
        await saveToLocalStorage(key, data);
        console.log(`Deleted "${valueToDelete}" from ${arrayKey} in storage.`);
      } else {
        console.warn(`Key "${arrayKey}" is not an array in the stored data.`);
      }
    }
  } catch (error) {
    console.error("Error deleting value from storage array:", error);
  }
}

