import * as THREE from 'three';
import { radec2xyz } from '../../utils/coordinateChange'; 
import { htmlDecode } from '../../utils/htmlDecode'; 
import colors from '../../config/color';
import showersOri from '../../../public/file/showers.json'
import { createTextSprite } from '../drawFunc/drawLabels';
import { skyStore } from '../../store/skyStore';
import { d2r } from '../../utils/degRad'

const colour = colors.normal.showers
const showers = showersOri.showers;

export function drawMeteorShowers(
  clock: Date,
  latitude: number,
  longitude: number,
  radius: number,
  scene: THREE.Scene,
  showMeteorShowers: boolean
):THREE.Group | undefined {

  const meteorShowersGroup = new THREE.Group();
  meteorShowersGroup.name = "MeteorShowers"; 

  if(!showMeteorShowers) return

  if (!showers || typeof showers === 'string') return;

  let pos: THREE.Vector3, label: string, dra: number, ddc: number, f: number;
  let d: [[number, number], [number, number]];
  let p: [[number, number], [number, number]];
  let start: Date, end: Date;
  const y = clock.getFullYear();

  for (const s in showers) {
    if (showers[s]) {
      d = showers[s].date;
      p = showers[s].pos;
      start = new Date(y, d[0][0] - 1, d[0][1]);
      end = new Date(y, d[1][0] - 1, d[1][1]);
      if (start > end && clock < start) {
        start = new Date(y - 1, d[0][0] - 1, d[0][1]);
      }

      if (clock > start && clock < end) {
        dra = p[1][0] - p[0][0];
        ddc = p[1][1] - p[0][1];
        f = (clock.getTime() - start.getTime()) / (end.getTime() - start.getTime());

        const raNow = p[0][0] + dra * f;
        const decNow = p[0][1] + ddc * f;

        pos = radec2xyz(raNow, decNow, clock, latitude, longitude, radius);

        label = htmlDecode(showers[s].name);

        // 绘制小球（meteor marker）
        const geometry = new THREE.SphereGeometry(0.3, 8, 8);
        const material = new THREE.MeshBasicMaterial({ 
          color: colour,
          transparent: true,
          opacity: 0.8
        });
        const point = new THREE.Mesh(geometry, material);
        point.position.copy(pos);
        meteorShowersGroup.add(point);

        // 添加标签
        const sprite = createTextSprite(label, colour);
        sprite.position.copy(pos.clone().add(new THREE.Vector3(0, 2, 0))); 
        meteorShowersGroup.add(sprite);


        skyStore.register('meteorshower', {
          ra: raNow * d2r,
          dec: decNow * d2r,
          label: label,
          xyz: pos
        });
      }
    }
  }

  scene.add(meteorShowersGroup);
  return meteorShowersGroup;
}
