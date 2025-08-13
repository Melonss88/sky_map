import * as THREE from 'three';
import colors from '../../config/color';
import { d2r } from '../../utils/degRad';
import { calculateAstronomicalTimes } from '../../utils/date';
import { ecliptic2xyz } from '../../utils/coordinateChange';

export function drawEclipticLine(
    clock: Date,
    radius: number,
    latDeg: number,
    lonDeg: number,
    azOff: number,
    showEcliptic: boolean
): THREE.Group {
  if (!showEcliptic) return new THREE.Group();

  const group = new THREE.Group();
  const step = 2; 
  const { LST } = calculateAstronomicalTimes(clock, lonDeg);
  const latRad = latDeg * d2r;

  const curvePoints: THREE.Vector3[] = [];
  
  // 绘制黄道线
  for (let lonDeg = 0; lonDeg <= 360; lonDeg += step) {
    // 黄道坐标系中纬度始终为0
    const vec = ecliptic2xyz(lonDeg, 0, LST, latRad, radius, azOff);
    curvePoints.push(vec);
  }

  // 闭合曲线
  const firstPoint = ecliptic2xyz(0, 0, LST, latRad, radius, azOff);
  curvePoints.push(firstPoint);

  const line = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(curvePoints),
    new THREE.LineBasicMaterial({ 
      color: colors.normal.ec,
      transparent: true,
      opacity: 0.4
    })
  );

  group.add(line);
  return group;
}
