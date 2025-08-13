import starsJson from '../../public/file/stars.json';

export interface Star {
    label: number;
    ra: number;     // 赤经 (小时)
    dec: number;    // 赤纬 (度)
    mag: number;    // 星等（亮度）
}

export async function loadAllStarsFromJson(): Promise<Star[]> {
  return [...starsJson.stars, ...starsJson.stars_con].map(([label, mag, ra, dec]) => ({
      label,
      mag,
      ra,
      dec
  }));
}

export async function loadStarsConsFromJson(): Promise<Star[]> {
  return [...starsJson.stars_con].map(([label, mag, ra, dec]) => ({
      label,
      mag,
      ra,
      dec
  }));
}