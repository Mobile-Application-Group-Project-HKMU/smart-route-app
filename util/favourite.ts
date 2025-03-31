import AsyncStorage from '@react-native-async-storage/async-storage';

export interface FavRouteKMB {
  kmbID: string[];
}

export interface FavRouteStation {
  stationID: string[];
}

export interface FavRouteCTB {
  ctbID: string[];
}

export interface FavRouteNLB {
  nlbID: string[];
}

export interface FavRouteHKKF {
  hkkfID: string[];
}

export const FavRouteExampleKMBData: FavRouteKMB = {
  kmbID: [],
};

export const FavStationExampleData: FavRouteStation = {
  stationID: [],
};

// Initialize storage with empty arrays
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

export async function saveToLocalStorage(key: string, data: FavRouteStation | FavRouteKMB): Promise<void> {
  try {
    const jsonData = JSON.stringify(data);
    await AsyncStorage.setItem(key, jsonData);
    console.log(`Data saved to storage with key: ${key}`);
  } catch (error) {
    console.error("Error saving data to storage:", error);
  }
}

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

