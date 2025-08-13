import * as THREE from 'three';
import { Vector3 } from 'three';
import { planets, type PlanetDefinition } from '../../data/planets';
import { julianDate } from '../../utils/date';
import { radec2xyz } from '../../utils/coordinateChange';

// 常量
const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;
const ECLIPTIC_OBLIQUITY = 23.439292 * DEG_TO_RAD;

// 获取单个行星轨道线
export function getPlanetOrbitLine(
    planetKey: string,
    clock: Date,
    radius: number,
    scene: THREE.Scene,
    latitude: number = 0,
    longitude: number = 0
): THREE.Line | null {
    const planet = planets.find(p => p.name === planetKey);
    if (!planet || !planet.colour || planetKey === 'Earth') return null;

    // 创建轨道点
    const points: Vector3[] = [];
    const nowJD = julianDate(clock);
    const steps = 180; // 轨道点数
    const daysSpan = planetKey === 'Pluto' ? 365 * 5 : planetKey === 'Mars' ? 687 :365; // 冥王星轨道周期较长

    for (let i = -daysSpan / 2; i <= daysSpan / 2; i += daysSpan / steps) {
        const jd = nowJD + i;
        const [ra, dec] = calculatePlanetPosition(planet, jd);
        const pos3D = radec2xyz(ra, dec, clock, latitude, longitude, radius);
        points.push(pos3D);
    }

    // 闭合轨道
    points.push(points[0].clone());

    // 创建轨道线
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ 
        color: new THREE.Color(planet.colour),
        transparent: true,
        opacity: 0.7,
        linewidth: 1
    });
    
    const orbitLine = new THREE.Line(geometry, material);
    orbitLine.name = `${planetKey}_orbit`;
    
    // 可选：添加到场景
    if (scene) {
        scene.add(orbitLine);
    }

    return orbitLine;
}

// 更新轨道线位置
export function updatePlanetOrbitLine(
    orbitLine: THREE.Line,
    planetKey: string,
    clock: Date,
    radius: number,
    latitude: number = 0,
    longitude: number = 0
): void {
    const planet = planets.find(p => p.name === planetKey);
    if (!planet) return;

    const points: Vector3[] = [];
    const nowJD = julianDate(clock);
    const steps = 180;
    const daysSpan = planetKey === 'Pluto' ? 365 * 5 : planetKey === 'Mars' ? 687 :365;

    for (let i = -daysSpan / 2; i <= daysSpan / 2; i += daysSpan / steps) {
        const jd = nowJD + i;
        const [ra, dec] = calculatePlanetPosition(planet, jd);
        const pos3D = radec2xyz(ra, dec, clock, latitude, longitude, radius);
        points.push(pos3D);
    }

    points.push(points[0].clone());

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    orbitLine.geometry.dispose();
    orbitLine.geometry = geometry;
}

// 计算行星位置（内部使用）
function calculatePlanetPosition(planet: PlanetDefinition, jd: number): [number, number] {
    const v = calculateHeliocentric(planet, jd);
    const earth = planets.find(p => p.name === "Earth")!;
    const e = calculateHeliocentric(earth, jd);

    // 地心坐标计算
    const q = new Vector3(
        v.xyz.x - e.xyz.x,
        (v.xyz.y - e.xyz.y) * Math.cos(ECLIPTIC_OBLIQUITY) - (v.xyz.z - e.xyz.z) * Math.sin(ECLIPTIC_OBLIQUITY),
        (v.xyz.y - e.xyz.y) * Math.sin(ECLIPTIC_OBLIQUITY) + (v.xyz.z - e.xyz.z) * Math.cos(ECLIPTIC_OBLIQUITY)
    );

    // 赤经赤纬计算
    let ra = Math.atan2(q.y, q.x) * RAD_TO_DEG;
    ra = ra < 0 ? ra + 360 : ra;
    const dec = Math.atan2(q.z, Math.sqrt(q.x * q.x + q.y * q.y)) * RAD_TO_DEG;

    return [ra, dec];
}

function calculateHeliocentric(planet: PlanetDefinition, jd: number): { xyz: Vector3; r: number } {
    const element = findClosestOrbitalElements(planet.elements, jd);
    const d = jd - element.jd;
    const M = normalizeAngle(element.n * d + element.L - element.w_bar);
    const v = calculateTrueAnomaly(M * DEG_TO_RAD, element.e, 10) * RAD_TO_DEG;
    const r = element.a * (1 - element.e * element.e) / (1 + element.e * Math.cos(v * DEG_TO_RAD));
    
    return {
        xyz: calculateHeliocentricXYZ(
            v * DEG_TO_RAD, 
            r, 
            element.w_bar * DEG_TO_RAD, 
            element.omega * DEG_TO_RAD, 
            element.i * DEG_TO_RAD
        ),
        r
    };
}

function calculateHeliocentricXYZ(v: number, r: number, w: number, omega: number, i: number): Vector3 {
    const vpw_omega = v + w - omega;
    const sinV = Math.sin(vpw_omega);
    const cosV = Math.cos(vpw_omega);
    const cosO = Math.cos(omega);
    const sinO = Math.sin(omega);
    const cosI = Math.cos(i);
    const sinI = Math.sin(i);

    return new Vector3(
        r * (cosO * cosV - sinO * sinV * cosI),
        r * (sinO * cosV + cosO * sinV * cosI),
        r * (sinV * sinI)
    );
}

function calculateTrueAnomaly(m: number, ecc: number, iterations = 10): number {
    let e = m;
    for (let i = 0; i < iterations; i++) {
        e = m + ecc * Math.sin(e);
    }
    return 2 * Math.atan(Math.sqrt((1 + ecc) / (1 - ecc)) * Math.tan(e / 2));
}

function normalizeAngle(degrees: number): number {
    return ((degrees % 360) + 360) % 360;
}

function findClosestOrbitalElements(elements: PlanetElements[], jd: number): PlanetElements {
    let closest = elements[0];
    let minDiff = Math.abs(elements[0].jd - jd);

    for (let i = 1; i < elements.length; i++) {
        const diff = Math.abs(elements[i].jd - jd);
        if (diff < minDiff) {
            minDiff = diff;
            closest = elements[i];
        }
    }
    return closest;
}