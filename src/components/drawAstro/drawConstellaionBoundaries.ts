import * as THREE from 'three';
import { radec2xyz } from '../../utils/coordinateChange';
import colors from '../../config/color';
import boundariesJson from '../../../public/file/boundaries.json';
import { d2r, r2d } from '../../utils/degRad'

const constellationBoundaryCache: Record<string, THREE.Vector3[]> = {};

export function drawConstellationBoundaries(
    clock: Date,
    latitude: number,
    longitude: number,
    radius: number,
    scene: THREE.Scene,
    showground: boolean,
    showBoundaries: boolean
) {
    if(!showBoundaries) return;

    const constellationBoundraiesGroup = new THREE.Group();
    constellationBoundraiesGroup.name = "constellation_boundraies"; 
    
    const boundaries = boundariesJson.boundaries;
    if (!boundaries || boundaries.length === 0) return;
  
    const maxLineDistance = radius * 0.2;
    const material = new THREE.LineBasicMaterial({ 
        color: colors.normal.constellationboundary,
        transparent: true,
        opacity: 0.6,
    });
  
    boundaries.forEach((boundary, c) => {
        if (!boundary || boundary.length === 0) return;
    
        const cacheKey = `${c}_${showground ? 'ground' : 'noground'}`;
        let linePoints: THREE.Vector3[] = [];
        
        if (constellationBoundaryCache[cacheKey]) {
            linePoints = constellationBoundaryCache[cacheKey];
        } else {
            let prevPoint: [number, number] | null = null;
            const processedLines = new Set<string>();
        
            for (let i = 1; i < boundary.length; i += 2) {
                const currentPoint: [number, number] = [boundary[i] as number, boundary[i + 1] as number];
        
                if (prevPoint) {
                    const lineKey1 = `${prevPoint[0]},${prevPoint[1]}-${currentPoint[0]},${currentPoint[1]}`;
                    const lineKey2 = `${currentPoint[0]},${currentPoint[1]}-${prevPoint[0]},${prevPoint[1]}`;
            
                    if (!processedLines.has(lineKey1)) {
                        processedLines.add(lineKey1);
                        processedLines.add(lineKey2);
            
                        let raDiff = (currentPoint[0] - prevPoint[0]) % 360;
                        if (raDiff > 180) raDiff -= 360;
                        if (raDiff < -180) raDiff += 360;
                        const decDiff = currentPoint[1] - prevPoint[1];
            
                        const segmentCount = Math.max(2, Math.ceil(Math.max(Math.abs(raDiff), Math.abs(decDiff)) / 2));
            
                        for (let j = 0; j <= segmentCount; j++) {
                            const t = j / segmentCount;
                            let ra = prevPoint[0] + raDiff * t;
                            if (ra < 0) ra += 360;
                            if (ra >= 360) ra -= 360;
                            const dec = prevPoint[1] + decDiff * t;
                
                            // const [fk5Ra, fk5Dec] = fk1tofk5(
                            //     ra * d2r,
                            //     dec * d2r
                            // );
            
                            const position = radec2xyz(
                                // fk5Ra * r2d,
                                // fk5Dec * r2d,
                                ra,
                                dec,
                                clock,
                                latitude,
                                longitude,
                                radius
                            );
                
                            if (showground && position.y < 0) continue;
                            linePoints.push(position);
                        }
                    }
                }
                prevPoint = currentPoint;
            }

            if (linePoints.length > 2) {
                const first = linePoints[0];
                const last = linePoints[linePoints.length - 1];
                const dist = first.distanceTo(last);

                if (dist <= maxLineDistance) {
                    linePoints.push(first.clone());
                }
            }

            constellationBoundaryCache[cacheKey] = linePoints;
        }
        
        const filteredPoints: THREE.Vector3[] = [];
        if (linePoints.length > 0) {
            filteredPoints.push(linePoints[0]);
            for (let k = 1; k < linePoints.length; k++) {
                const a = linePoints[k - 1];
                const b = linePoints[k];
                const dist = a.distanceTo(b);
                if (dist < maxLineDistance) {
                    filteredPoints.push(b);
                }
            }
        }
        
        if (filteredPoints.length > 1) {
            const geometry = new THREE.BufferGeometry().setFromPoints(filteredPoints);
            const line = new THREE.Line(geometry, material);
            constellationBoundraiesGroup.add(line);
        }
    });

    scene.add(constellationBoundraiesGroup);
    return constellationBoundraiesGroup;
}

// B1875历元转换到J2000历元 -- 已弃用
function fk1tofk5(ra: number, dec: number): [number, number] {
  const rotationMatrix = [
    0.999535873, -0.027936936, -0.012147682,
    0.027936936,  0.999609673, -0.000169760,
    0.012147683, -0.000169687,  0.999926200
  ];

  const cosDec = Math.cos(dec);
  const vec = [
    Math.cos(ra) * cosDec,
    Math.sin(ra) * cosDec,
    Math.sin(dec)
  ];

  // 应用旋转矩阵
  const rotated = [
    vec[0] * rotationMatrix[0] + vec[1] * rotationMatrix[1] + vec[2] * rotationMatrix[2],
    vec[0] * rotationMatrix[3] + vec[1] * rotationMatrix[4] + vec[2] * rotationMatrix[5],
    vec[0] * rotationMatrix[6] + vec[1] * rotationMatrix[7] + vec[2] * rotationMatrix[8]
  ];

  const magnitude = Math.sqrt(rotated[0] ** 2 + rotated[1] ** 2 + rotated[2] ** 2);
  const newDec = Math.asin(rotated[2] / magnitude);
  const cosNewDec = Math.cos(newDec);
  
  let newRa = Math.atan2(rotated[1] / magnitude / cosNewDec, rotated[0] / magnitude / cosNewDec);
  if (newRa < 0) newRa += 2 * Math.PI;

  return [newRa, newDec];
}