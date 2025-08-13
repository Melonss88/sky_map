import * as THREE from 'three';
import { d2r } from './degRad';
import { calculateAstronomicalTimes } from '../utils/date'

// 计算点击位置的天体坐标
export function calculateCelestialCoordinates(
    event: MouseEvent,
    renderer: THREE.WebGLRenderer,
    camera: THREE.Camera,
    skySphere: THREE.Object3D,
    clock: Date,
    latitude: number,
    longitude: number,
    az: number
): { ra: number; dec: number } | null {
    const rect = renderer.domElement.getBoundingClientRect();
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(skySphere);

    if (intersects.length > 0) {
        const point = intersects[0].point;
        const tiltAngle = Math.PI/2 - latitude * d2r;
  
        const vec = point.clone();
        vec.applyAxisAngle(new THREE.Vector3(1, 0, 0), -tiltAngle);
  
        const r = vec.length();
        const dec = Math.asin(vec.y / r);
  
        const haRaw = Math.atan2(-vec.x, vec.z);
        const ha = haRaw + az * d2r;
  
        const { LST } = calculateAstronomicalTimes(clock, longitude);
        let ra = (Math.PI * LST / 12) - ha;
  
        if (ra < 0) ra += 2 * Math.PI;
        if (ra > 2 * Math.PI) ra -= 2 * Math.PI;

        return { ra, dec };
    }
    return null;
}

export function nearestObject(
    ra: number,
    dec: number,
    lookup: any
) {
    let nearest = null;
    let minDistance = Infinity;

    for (const type in lookup) {
        for (const obj of lookup[type]) {
        const angDist = greatCircle(ra, dec, obj.ra, obj.dec);
        if (angDist < minDistance) {
            nearest = {
                type: type,
                label: obj.label,
                distance: angDist,
                ra: obj.ra,
                dec: obj.dec
            };
            minDistance = angDist;
        }
        }
    }

    if (nearest) {
        nearest.distance = nearest.distance / d2r; // 转成度
    }
    
    return nearest;
}

export function greatCircle(l1: number, d1: number, l2: number, d2: number): number {
    return Math.acos(
      Math.cos(d1) * Math.cos(d2) * Math.cos(l1 - l2) + 
      Math.sin(d1) * Math.sin(d2)
    );
}
