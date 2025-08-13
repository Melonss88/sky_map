import type { AppConfig } from './AppConfig';

export const defaultConfig: AppConfig = {
  longitude : 120.5853, // 观测者经度
  latitude : 31.2989,   // 观测者纬度
  clock : new Date(),
  magnitude: 5,
  showPlanets: { planets: true, labels: true, orbits: false },
  constellation: { lines: false, labels: false },
  showBoundraies: false,
  showGalaxy: false,
  meteorshowers: false,
  showMessier: false,
  showGround: true,
  showAzAlt: false,
  showRaDec: false,
  showMeridian: false,
  showEcliptic: false,
};