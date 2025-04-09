/**
 * Calculates the great-circle distance between two geographical points using the Haversine formula.
 * This function provides an accurate distance calculation that accounts for the Earth's curvature.
 * 
 * 使用Haversine公式计算两个地理点之间的大圆距离。
 * 此函数提供了考虑地球曲率的准确距离计算。
 * 
 * @param lat1 - Latitude of the first point in decimal degrees | 第一点的纬度（十进制度）
 * @param lon1 - Longitude of the first point in decimal degrees | 第一点的经度（十进制度）
 * @param lat2 - Latitude of the second point in decimal degrees | 第二点的纬度（十进制度）
 * @param lon2 - Longitude of the second point in decimal degrees | 第二点的经度（十进制度）
 * @returns Distance between the points in meters | 两点之间的距离（米）
 */
export const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    // Earth's mean radius in meters | 地球平均半径（米）
    const R = 6371e3;
    // Convert degrees to radians | 将度转换为弧度
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    // Difference in coordinates in radians | 坐标差（弧度）
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    // Haversine formula components | Haversine公式组成部分
    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    // Return distance in meters | 返回距离（米）
    return R * c;
  };