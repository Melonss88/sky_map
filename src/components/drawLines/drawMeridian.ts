import * as THREE from 'three';
import { altAzToVector3 } from '../../utils/coordinateChange';
import color from '../../config/color'
import { d2r } from '../../utils/degRad'
import { az_off } from '../../utils/coordinateChange'

export function drawMeridian(
  radius: number,
  az: number,   
  lat: number, 
  showMeridian: boolean,
): THREE.Group {
  if (!showMeridian) return new THREE.Group();

  const group = new THREE.Group();
  const curvePoints: THREE.Vector3[] = [];

  // 上半段：az = 0° or 360° (北)
  for (let altDeg = -90; altDeg <= 90; altDeg += 1) {
    const azDeg = lat >= 0 ? 0 : 180;
    const azRad = az_off(azDeg, az);
    const altRad = altDeg * d2r;
    curvePoints.push(altAzToVector3(azRad, altRad, radius));
  }

  // 下半段：az = 180° (南)
  for (let altDeg = 90; altDeg >= -90; altDeg -= 1) {
    const azDeg = lat >= 0 ? 180 : 180;
    const azRad = az_off(azDeg, az);
    const altRad = altDeg * d2r;
    curvePoints.push(altAzToVector3(azRad, altRad, radius));
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
  const material = new THREE.LineBasicMaterial({ 
    color: color.normal.meridian,
    transparent: true,
    opacity: 0.4
  });
  const line = new THREE.Line(geometry, material);
  group.add(line);
  return group;
}