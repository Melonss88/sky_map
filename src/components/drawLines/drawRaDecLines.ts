import * as THREE from 'three';
import colors from '../../config/color';
import { radec2xyz } from '../../utils/coordinateChange';
import { createTextSprite } from '../drawFunc/drawLabels';

export function drawRaDecLines(
  radius: number,
  latDeg: number,
  lonDeg: number,
  clock: Date,
  showRaDec: boolean,
): THREE.Group {
  if (!showRaDec) return new THREE.Group();

  const group = new THREE.Group();
  const decStep = 15; 
  const raStep = 15;  

  // 绘制赤纬圈
  for (let decDeg = -90; decDeg <= 90; decDeg += decStep) {
    if (Math.abs(decDeg) > 85) continue; // 跳过极区

    const curvePoints: THREE.Vector3[] = [];
    for (let raDeg = 0; raDeg <= 360; raDeg += 1) {
      const vec = radec2xyz(raDeg, decDeg, clock, latDeg, lonDeg, radius)

      curvePoints.push(vec);
    }

    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(curvePoints),
      new THREE.LineBasicMaterial({ 
        color: colors.normal.eqLines,
        transparent: true,
        opacity: 0.6
      })
    );
    group.add(line);

    // 添加赤纬标签
    // if (decDeg !== 0) {
    //   const labelVec = radec2xyz(0, decDeg, clock, latDeg, lonDeg, radius * 1.05)

    //   const label = createTextSprite(`${decDeg}°`, colors.normal.eq);
    //   label.position.copy(labelVec);
    //   group.add(label);
    // }
  }

  // 绘制赤经线
  for (let raDeg = 0; raDeg < 360; raDeg += raStep) {
    const curvePoints: THREE.Vector3[] = [];
    const minDec = -90, maxDec = 90;

    for (let decDeg = minDec; decDeg <= maxDec; decDeg += 1) {
      const vec = radec2xyz(raDeg, decDeg, clock, latDeg, lonDeg, radius)

      curvePoints.push(vec);
    }

    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(curvePoints),
      new THREE.LineBasicMaterial({ 
        color: colors.normal.eqLines,
        transparent: true,
        opacity: 0.6
      })
    );
    group.add(line);

    // 添加赤经标签
    // const labelVec = radec2xyz(raDeg, 0, clock, latDeg, lonDeg, radius * 1.05)
    // const labelText = degToHourString(raDeg);
    // const label = createTextSprite(labelText, colors.normal.eq);
    // label.position.copy(labelVec);
    // group.add(label);
  }

  return group;
}

function degToHourString(deg: number): string {
  const hours = deg / 15;
  const h = Math.floor(hours);
  return `${h}h`;
}
