export interface AppConfig {
  longitude: number;
  latitude: number;
  clock: Date;
  magnitude: number;
  showPlanets: { planets: boolean; orbits: boolean; labels: boolean };
  constellation: { lines: boolean; labels: boolean };
  showBoundraies: boolean;
  meteorshowers: boolean;
  showGalaxy: boolean;
  showMessier: boolean;
  showGround: boolean;
  showAzAlt: boolean;
  showRaDec: boolean;
  showMeridian:boolean;
  showEcliptic: boolean;
}

  