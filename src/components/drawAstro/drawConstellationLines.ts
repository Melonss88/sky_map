import * as THREE from 'three';
import { radec2xyz } from '../../utils/coordinateChange'; 
import colors from '../../config/color';
import { createTextSprite } from '../drawFunc/drawLabels';
import { loadStarsConsFromJson } from '../../data/stars';
import linesJson from '../../../public/file/lines_latin.json';

export async function drawConstellations(
  clock: Date,
  latitude: number,
  longitude: number,
  radius: number,
  scene: THREE.Scene,
  showground: boolean,
  showLines: boolean,
  showLabels: boolean
) {
  const constellationGroup = new THREE.Group();
  constellationGroup.name = "constellation_lines"; 

  const maxAngle = 50
  const color = colors.normal.constellation
  //  用 Map 缓存 label -> star
  const starsCon = await loadStarsConsFromJson();
  const starMap = new Map<number, typeof starsCon[number]>();
  starsCon.forEach(s => {
    starMap.set(s.label, s);
  });

  const lines = linesJson.lines;
  const { constellations } = parseConstellationData(lines);

  const material = new THREE.LineBasicMaterial({ 
    color,
    transparent: true,
    opacity: 0.8,
  });

  for (const constellation of constellations) {
    const linePoints: THREE.Vector3[] = [];

    if (showLines) {
      for (const [label1, label2] of constellation.lines) {
        const star1 = starMap.get(Number(label1));
        const star2 = starMap.get(Number(label2));
        if (!star1 || !star2) continue;

        const pos1 = radec2xyz(star1.ra, star1.dec, clock, latitude, longitude, radius);
        const pos2 = radec2xyz(star2.ra, star2.dec, clock, latitude, longitude, radius);

        const angle = pos1.angleTo(pos2) * THREE.MathUtils.RAD2DEG;
        if (angle > maxAngle) continue;

        if(showground && pos1.y < 0) continue;
        if(showground && pos2.y < 0) continue;

        linePoints.push(pos1, pos2);
      }

      if (linePoints.length > 0) {
        const geometry = new THREE.BufferGeometry().setFromPoints(linePoints);
        const lines = new THREE.LineSegments(geometry, material);
        constellationGroup.add(lines);
      }
    }

    if (showLabels) {
      const labelPos = radec2xyz(
        constellation.centerRA,
        constellation.centerDec,
        clock,
        latitude,
        longitude,
        radius
      );

      if (showground && labelPos.y < 0) continue;
      const label = createTextSprite(constellation.name, color);
      label.position.copy(labelPos.clone().add(new THREE.Vector3(0, 4, 0)));
      constellationGroup.add(label);
    }
  }

  scene.add(constellationGroup)
  return constellationGroup
}

export function parseConstellationData(
  linesRaw: (string | number)[][]
) {
  const constellations = linesRaw.map((line) => {
    const name = String(line[0]);
    const centerRA = Number(line[1]) ; 
    const centerDec = Number(line[2]);

    const pairs: [string, string][] = [];
    for (let i = 3; i < line.length; i += 2) {
      pairs.push([line[i].toString(), line[i + 1].toString()]);
    }

    return {
      name,
      centerRA,
      centerDec,
      lines: pairs
    };
  });

  return { constellations };
}
