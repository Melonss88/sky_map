import * as THREE from 'three';
import { julianDate } from '../../utils/date';
import { radec2xyz } from '../../utils/coordinateChange';


export function sunPosition(JD: number) {
  const d2r = Math.PI / 180;
  const r2d = 180 / Math.PI;

  // 计算儒略世纪数（相对于J2000.0）
  const T = (JD - 2451545.0) / 36525.0;

  // 1. 计算太阳平黄经（Mean Longitude）
  const L0 = (280.46645 + 36000.76983 * T + 0.0003032 * T ** 2) % 360;

  // 2. 计算平近点角（Mean Anomaly）
  const M = (357.52910 + 35999.05030 * T - 0.0001559 * T ** 2 - 0.00000048 * T ** 3) % 360;
  const MRad = M * d2r;

  // 3. 计算中心差（Equation of Center）
  const C = (1.914600 - 0.004817 * T - 0.000014 * T ** 2) * Math.sin(MRad) 
          + (0.019993 - 0.000101 * T) * Math.sin(2 * MRad) 
          + 0.000290 * Math.sin(3 * MRad);

  // 4. 计算真黄经（True Longitude）
  const L = (L0 + C) % 360;
  const LRad = L * d2r;

  // 5. 计算黄赤交角（Obliquity of Ecliptic）
  const ε = (23.43929111 - 0.013004167 * T - 0.0000001639 * T ** 2) * d2r;

  // 6. 计算赤经（RA）和赤纬（Dec）
  const ra = Math.atan2(Math.cos(ε) * Math.sin(LRad), Math.cos(LRad)) * r2d; // 转为度
  const dec = Math.asin(Math.sin(ε) * Math.sin(LRad)) * r2d; // 转为度

  // 确保RA在[0, 360)范围内
  const normalizedRA = (ra + 360) % 360;

  return { 
    ra: normalizedRA,  // 赤经（度）
    dec: dec           // 赤纬（度）
  };
}

export function moonPosition(JD: number): { ra: number; dec: number } {
  const d2r = Math.PI / 180;
  const r2d = 180 / Math.PI;

  const D = JD - 2451545.0;

  // 月亮的平均黄经
  const L = (218.316 + 13.176396 * D) % 360;

  // 月亮的平均近点角（Mean Anomaly）
  const M_moon = (134.963 + 13.064993 * D) % 360;

  // 月亮的升交点距角（Mean Distance from Node）
  const F = (93.272 + 13.229350 * D) % 360;

  // 日心黄经（太阳的真黄经）
  const sunLong = (280.460 + 0.9856474 * D) % 360;

  // 月亮黄经修正
  const lon = L
    + 6.289 * Math.sin(d2r * M_moon)
    + 1.274 * Math.sin(d2r * (2 * (L - sunLong) - M_moon))
    + 0.658 * Math.sin(2 * d2r * (L - sunLong))
    + 0.214 * Math.sin(2 * d2r * M_moon)
    - 0.186 * Math.sin(d2r * (357.529 + 0.9856003 * D)); // 太阳近点角 M_sun

  // 月亮黄纬修正
  const lat = 5.128 * Math.sin(d2r * F)
    + 0.280 * Math.sin(d2r * (M_moon + F))
    + 0.277 * Math.sin(d2r * (M_moon - F))
    + 0.173 * Math.sin(d2r * (2 * (L - sunLong) - F));

  // 转为赤道坐标
  const ε = (23.43929111 - 0.0130042 * (D / 36525)) * d2r; // 黄赤交角
  const lonRad = lon * d2r;
  const latRad = lat * d2r;

  const x = Math.cos(lonRad) * Math.cos(latRad);
  const y = Math.sin(lonRad) * Math.cos(latRad) * Math.cos(ε) - Math.sin(latRad) * Math.sin(ε);
  const z = Math.sin(lonRad) * Math.cos(latRad) * Math.sin(ε) + Math.sin(latRad) * Math.cos(ε);

  const ra = Math.atan2(y, x) * r2d;
  const dec = Math.asin(z) * r2d;

  return {
    ra: (ra + 360) % 360,
    dec
  };
}

export function getSunMoonPositions(
  clock: Date,
  latitude: number,
  longitude: number,
  radius: number,
): { sunPos: THREE.Vector3; moonPos: THREE.Vector3 } {
  const JD = julianDate(clock);

  // 太阳
  const sun = sunPosition(JD);
  const rawSunVec = radec2xyz(sun.ra, sun.dec, clock, latitude, longitude, radius);

  // 月亮
  const moon = moonPosition(JD);
  const rawMoonVec = radec2xyz(moon.ra, moon.dec, clock, latitude, longitude, radius);

  return {
    sunPos: rawSunVec,
    moonPos: rawMoonVec,
  };
}
