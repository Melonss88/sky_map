import * as THREE from 'three';
import { loadAllStarsFromJson } from '../../data/stars';
import { radec2xyz, coord2horizon } from '../../utils/coordinateChange'; 
import { calculateAstronomicalTimes } from '../../utils/date';
import { skyStore } from '../../store/skyStore';
import { d2r } from '../../utils/degRad'

export async function drawStars(
    magnitude: number,
    clock: Date,
    latitude: number,
    longitude: number,
    radius: number, 
    showGround: boolean
  ): Promise<THREE.Points> {
  const allStars = await loadAllStarsFromJson();
  const geometry = new THREE.BufferGeometry();
  const positions: number[] = [];
  const sizes: number[] = [];
  const LST = calculateAstronomicalTimes(clock, longitude).LST

  for (const star of allStars) {
    const { ra, dec, mag, label } = star;
    if (mag >= magnitude) continue; 

    const pos = radec2xyz(ra, dec, clock, latitude, longitude, radius); 

    if (showGround && pos.y <= 0) continue; 
    
    positions.push(pos.x, pos.y, pos.z);

    let d = 0.8 * Math.max(3 - mag / 2.1, 0.5);

    // 模拟大气消光
    const el = coord2horizon(ra, dec, LST, latitude)[0]; 
    // d *= Math.exp(-(90 - el) * 0.01); 
    const atmos = Math.exp(-(90 - el) * 0.01);
    d *= Math.sqrt(atmos);

    sizes.push(d);


    skyStore.register('stars', {
      ra: ra * d2r,
      dec: dec  * d2r,
      label: String(label),
      xyz: pos
    });
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

  const material = new THREE.ShaderMaterial({
    uniforms: {
      color: { value: new THREE.Color(0xffffff) },
    },
    vertexShader: `
      attribute float size;
      void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z); //模拟视距远近调整点大小
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 color;
      void main() {
        float dist = length(gl_PointCoord - vec2(0.5));
        if (dist > 0.5) discard;
        gl_FragColor = vec4(color, 1.0);
      }
    `,
    transparent: true,
  });

  const points = new THREE.Points(geometry, material);
  return points;
}
