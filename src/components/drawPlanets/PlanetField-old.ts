import { Vector3 } from 'three';
import * as THREE from 'three';
import { planets, type PlanetDefinition, type PlanetElements } from '../../data/planets';
import { julianDate } from '../../utils/date'
import { radec2xyz } from '../../utils/coordinateChange'

// 类型定义
export interface PlanetPosition {
    ra: number;  // 赤经 (度)
    dec: number; // 赤纬 (度)
    mag: number; // 星等
}

export interface PlanetField {
    update: (date: Date) => PlanetPosition[];
    getPositions: () => PlanetPosition[];
    getPositionByName: (name: string) => PlanetPosition | undefined;
    updateScenePositions: (clock: Date, latitude: number, longitude: number, radius: number) => void;
    dispose: () => void; 
}

// 常量
const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;
const ECLIPTIC_OBLIQUITY = 23.439292 * DEG_TO_RAD;
const labelCache = new Map<string, THREE.CanvasTexture>();
const orbitLines: Record<string, THREE.Line> = {};

// 创建行星场
export function createPlanetField(
    scene:THREE.Scene,
    clock: Date,
    latitude: number,
    longitude: number,
    radius: number
): PlanetField {
    let currentPositions: PlanetPosition[] = [];
    const planetMeshes: Record<string, THREE.Mesh> = {}; // 存储行星3D对象的字典
    
    // 初始化行星3D对象
    function initPlanets() {
        planets.forEach(planet => {
            if (!planet.colour) return;
            if (planet.name == 'Earth') return;
            
            const geometry = new THREE.SphereGeometry(planet.size, 32, 32);
            const material = new THREE.MeshBasicMaterial({ 
                color: new THREE.Color(planet.colour) 
            });
            const mesh = new THREE.Mesh(geometry, material);
            
             // 添加标签
            const label = createLabel(planet.name);
            label.position.set(0, planet.size * 2, 0); // 在行星上方显示
            mesh.add(label);

            planetMeshes[planet.name] = mesh;
            scene.add(mesh);

            const orbit = createOrbitLine(planet, clock, latitude, longitude, radius);
            if (orbit) {
                orbit.name = `${planet.name}_orbit`;
                orbitLines[planet.name] = orbit;
                scene.add(orbit);
            }
        });
    }

    // 更新行星位置
    const update = (date: Date = new Date()): PlanetPosition[] => {
        const jd = julianDate(date);
        currentPositions = calculateAllPlanetPositions(jd);
        return currentPositions;
    };

    // 获取当前行星位置
    const getPositions = (): PlanetPosition[] => [...currentPositions];

    // 按名称获取行星位置
    const getPositionByName = (name: string): PlanetPosition | undefined => {
        const index = planets.findIndex(p => p.name === name);
        return index >= 0 ? currentPositions[index] : undefined;
    };

    // 更新场景中的行星位置
    const updateScenePositions = (
        clock: Date,
        latitude: number,
        longitude: number,
        astroRadius: number
    ) => {
        currentPositions.forEach((pos, index) => {
            const planet = planets[index];
            if (!planet.colour) return;
            if (planet.name == 'Earth') return;
            
            const mesh = planetMeshes[planet.name];
            if (mesh) {
                const pos3D = radec2xyz( pos.ra, pos.dec, clock, latitude, longitude, astroRadius);
                ;
                mesh.position.copy(pos3D);
            }
        });
    };

    initPlanets();
    update();

    function createOrbitLine(
        planet: PlanetDefinition, 
        clock: Date,
        latitude: number,
        longitude: number,
        radius: number,
    ): THREE.Line | null {
        if (!planet.colour || planet.name === 'Earth') return null;
    
        const points: Vector3[] = [];
        const nowJD = julianDate(new Date());
        const steps = 180
        const daysSpan = 365
    
        for (let i = -daysSpan / 2; i <= daysSpan / 2; i += daysSpan / steps) {
            const jd = nowJD + i;
            const [ra, dec] = calculateEphemeris(planet, jd);
            const pos3D = radec2xyz(ra, dec, clock, latitude, longitude, radius); 
            points.push(pos3D);
        }
    
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color: new THREE.Color(planet.colour) });
        return new THREE.Line(geometry, material);
    }

    return {
        update,
        getPositions,
        getPositionByName,
        updateScenePositions: (clock: Date, latitude: number, longitude: number, radius: number) => {
            updateScenePositions(clock, latitude, longitude, radius);
        },
        dispose: () => {
            Object.values(planetMeshes).forEach(mesh => {
                mesh.geometry?.dispose();
                scene.remove(mesh);
            });
        }
    };
}


function createLabel(text: string, color: string = 'white'): THREE.Sprite {
    const cacheKey = `${text}_${color}`;
    if (!labelCache.has(cacheKey)) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        canvas.width = 256;
        canvas.height = 64;
        ctx.fillStyle = color;
        ctx.font = 'bold 30px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);

        labelCache.set(cacheKey, new THREE.CanvasTexture(canvas));
    }

    const material = new THREE.SpriteMaterial({
        map: labelCache.get(cacheKey),
        transparent: true,
    });

    const sprite = new THREE.Sprite(material);
    sprite.scale.set(10, 2.5, 1); // 标签大小可调整
    return sprite;
}

// 核心计算函数
function calculateAllPlanetPositions(jd: number): PlanetPosition[] {
    return planets
        .filter(planet => planet.colour)
        .map(planet => {
            const [ra, dec, mag] = calculateEphemeris(planet, jd);
            return { ra, dec, mag };
        });
}

function calculateEphemeris(planet: PlanetDefinition, jd: number): [number, number, number] {
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
    const distance = q.length();

    // 星等计算
    const FV = Math.acos((v.r * v.r + distance * distance - e.r * e.r) / (2 * v.r * distance));
    const mag = planet.magnitude({
        a: v.r,
        r: v.r,
        R: distance,
        FV: FV * RAD_TO_DEG,
        x: q.x, y: q.y, z: q.z,
        jd,
        d2r: DEG_TO_RAD
    });

    return [ra, dec, mag];
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

// 辅助计算函数
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