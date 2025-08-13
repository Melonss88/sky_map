import { Planets, juliandays } from 'aa-js';
import { radec2xyz } from '../../utils/coordinateChange';
import * as THREE from 'three';
import colors from '../../config/color';

export function createPlanetOrbitLines(
    planetKey: string,
    clock: Date,
    radius: number,
    scene: THREE.Scene,
    latitude: number ,
    longitude: number,
    showOrbits: boolean
  ): THREE.Line | null {
    if(!showOrbits) return 

    const orbitLinesGroup = new THREE.Group();
    orbitLinesGroup.name = "orbitLines_lines"; 
    
    const planet = Planets[planetKey as keyof typeof Planets];
    if (!planet) return null;
  
    const points = calculateOrbitPoints(planetKey, clock, radius, latitude, longitude);
    if (points.length === 0) return null;
  
    // 创建轨道线
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: new THREE.Color(colors.planets[planetKey]),
      opacity: 0.7
    });
  
    const orbitLine = new THREE.Line(geometry, material);
    scene.add(orbitLine);

    return orbitLine;
}

function calculateOrbitPoints(
    planetKey: string,
    clock: Date,
    radius: number,
    latitude: number,
    longitude: number,
    // steps: number = 360,
  ): THREE.Vector3[] {
    const points: THREE.Vector3[] = [];
    const jd = juliandays.getJulianDay(clock);
    const elements = getOrbitalElements(planetKey, jd);

    if (!elements) return points;
  
    const periodDays = calculateOrbitalPeriod(elements.semiMajorAxis);

    // 动态设置采样周期
    const daysSpan = //其实是模拟数据，真实的是periodDays
        planetKey === 'Neptune'? 365 * 10 : 
        planetKey === 'Uranus' ? 365 * 5 : 
        planetKey === 'Jupiter' ? 365 * 3 : 
        planetKey === 'Mars' ? 687 : 
        365;

    const STEPS = {
        mercury: 720,  // 水星曲率大，需更多点
        venus:   540,
        earth:   360,
        mars:    360,
        jupiter: 360,
        saturn:  360,
        uranus:  400,  // 外行星轨道大但曲率小
        neptune: 400,
        pluto:   500
    };

    // 动态调整采样点数：外行星更多点，内行星较少点
    const steps = STEPS[planetKey.toLowerCase()]

    for (let i = 0; i <= steps; i++) {
      // const dayOffset = (i / steps) * periodDays;
      const dayOffset = (i / steps) * daysSpan;
      const targetJD = jd + dayOffset;

        const coords = Planets[planetKey].getApparentGeocentricEquatorialCoordinates(targetJD);
        const point = radec2xyz(
            coords.rightAscension,
            coords.declination,
            clock,
            latitude,
            longitude,
            radius
        );
    
         // 跳过无效点
         if (!isNaN(point.x)) points.push(point);
    }

    // 强制闭合轨道（首尾点一致）
    // if (points.length > 0) {
    //     points.push(points[0].clone());
    // }
    // points.push(points[0].clone()); 
    return points;
  }


// 获取轨道根数的替代方案
function getOrbitalElements(planetKey: string, jd: number) {
    const planet = Planets[planetKey as keyof typeof Planets];
    if (!planet) return null;
  
    return {
      semiMajorAxis: planet.orbitalElements.semiMajorAxis[0],       // 半长轴 (AU)
      eccentricity: planet.getEccentricity(jd),         // 离心率
      inclination: planet.getInclination(jd),           // 轨道倾角 (度)
      longitudeOfAscendingNode: planet.getLongitudeOfAscendingNode(jd), // 升交点经度 (度)
      longitudeOfPerihelion: planet.getLongitudeOfPerihelion(jd),      // 近日点经度 (度)
      meanLongitude: planet.getMeanLongitude(jd)        // 平黄经 (度)
    };
}

  // 计算轨道周期（使用开普勒第三定律）
function calculateOrbitalPeriod(semiMajorAxis: number): number {
    return Math.sqrt(Math.pow(semiMajorAxis, 3)) * 365.256; // 年转天
}
