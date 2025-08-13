import * as THREE from 'three';
import { radec2xyz } from '../../utils/coordinateChange';
import colors from '../../config/color';
import messierJson from '../../../public/file/messier.json'; 
import { createTextSprite } from '../drawFunc/drawLabels';
import { skyStore } from '../../store/skyStore';
import { d2r } from '../../utils/degRad'

export function drawMessier(
  clock: Date,
  latitude: number,
  longitude: number,
  radius: number,
  scene: THREE.Scene,
  showMessier: boolean,
  showGround: boolean
): THREE.Group | undefined {
    // 清除之前绘制的Messier对象
    scene.children = scene.children.filter(child => !(child as any).isMessierObject);

    const messierGroup = new THREE.Group();
    messierGroup.name = "messier"; 

    if(!showMessier) return;
    if (!messierJson) return;

    const messierColor = colors.normal.pointers

    for (const [name, ra, dec] of messierJson) {
        const pos = radec2xyz(ra as number, dec as number, clock, latitude, longitude, radius);

        if(showGround && pos.y < 0) continue;

        const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5); 
        const material = new THREE.MeshBasicMaterial({ 
            color: messierColor,
        });
        const marker = new THREE.Mesh(geometry, material);
        marker.position.copy(pos);
        (marker as any).isMessierObject = true;
        messierGroup.add(marker);

        // 添加标签
        const sprite = createTextSprite(name as string, messierColor);
        sprite.position.copy(pos.clone().add(new THREE.Vector3(0, 1, 0)));
        messierGroup.add(sprite);

        skyStore.register('messier', {
            ra: ra  as number * d2r,
            dec: dec  as number * d2r,
            label: name as string,
            xyz: pos
        });
    }
    
    scene.add(messierGroup)
    return messierGroup
}