import * as THREE from 'three';
import { altAzToVector3 } from '../../utils/coordinateChange';
import color from '../../config/color'
import { d2r, drLatitude } from '../../utils/degRad'
import { createTextSprite } from '../drawFunc/drawLabels';
import { az_off } from '../../utils/coordinateChange'

export function drawAzAltLines(
  radius: number,
  az: number,   
  lat:number,
  showAzAlt: boolean,
): THREE.Group {
  if(!showAzAlt) return new THREE.Group();
  
  const group = new THREE.Group();
  const altStep = 15; 
  const azStep = 15;  

  // 绘制高度圈
  for (let altDeg = 0; altDeg <= 90; altDeg += altStep) {
    const curvePoints: THREE.Vector3[] = [];
    for (let azDeg = 0; azDeg <= 360; azDeg += 1) { 
      const azRad = az_off(azDeg, az);
      const altRad = altDeg * d2r;
      curvePoints.push(altAzToVector3(azRad, altRad, radius));
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
    const material = new THREE.LineBasicMaterial({ 
      color: color.normal.azLines,
      transparent: true,
      opacity: 0.6
    });
    const line = new THREE.Line(geometry, material);
    group.add(line);

    // 添加高度标签
    // if (altDeg > 0) { 
    //   const labelAzRad = az_off(0, az);
    //   const labelPos = altAzToVector3(labelAzRad, altDeg * d2r, radius * 1.02);
    //   const label = createTextSprite(`${altDeg}°`, color.normal.az);
    //   label.position.copy(labelPos);
    //   group.add(label);
    // }
  }

  // 绘制方位线
  for (let azDeg = 0; azDeg < 360; azDeg += azStep) {
    const curvePoints: THREE.Vector3[] = [];
    for (let altDeg = 0; altDeg <= 90; altDeg += 1) { 
      const azRad = az_off(azDeg, az);
      const altRad = altDeg * d2r;
      curvePoints.push(altAzToVector3(azRad, altRad, radius));
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
    const material = new THREE.LineBasicMaterial({ 
      color: color.normal.azLines,
      transparent: true,
      opacity: 0.6
    });
    const line = new THREE.Line(geometry, material);
    group.add(line);

    // 添加方位标签（地平线位置）
    // const labelAzRad = az_off(azDeg, az);
    // const labelPos = altAzToVector3(labelAzRad, 1*d2r, radius * 1.05);
    // const labelText = `${azDeg}°`;
    // const label = createTextSprite(labelText, color.normal.az);
    // label.position.copy(labelPos);
    // group.add(label);
  }

  return group;
}
