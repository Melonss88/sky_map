import * as THREE from 'three';
import { radec2xyz } from '../../utils/coordinateChange';
import colors from '../../config/color';
import galaxyJson from '../../../public/file/galaxy.json'; 

export function drawGalaxy(
  clock: Date,
  latitude: number,
  longitude: number,
  radius: number,
  scene: THREE.Scene,
  showGalaxy: boolean,
  showGround: boolean
  ): THREE.Group | undefined {
    // 清除之前绘制的银河线
    scene.children = scene.children.filter(child => !(child as any).isGalaxyLine);

    const galaxyGroup = new THREE.Group();
    galaxyGroup.name = "galaxy_lines"; 

    if (!showGalaxy || !galaxyJson) return;
    const galaxyColor = colors.normal.galaxy

    for (const contour of galaxyJson.galaxy) {
      if (!contour || contour.length < 3) continue;

      const color = contour[0] as string; // 第一个元素是颜色
      const points = contour.slice(1) as number[]; // 剩余是坐标点

      // 创建几何体
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array((points.length / 2) * 3);
      
      // 转换坐标
      for (let i = 0, j = 0; i < points.length; i += 2, j += 3) {
        const ra = points[i];
        const dec = points[i + 1];
        const pos = radec2xyz(ra, dec, clock, latitude, longitude, radius);
        
        positions[j] = pos.x;
        positions[j + 1] = pos.y;
        positions[j + 2] = pos.z;
      }

      // 设置几何体属性
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      
      // 创建线材质
      const material = new THREE.LineBasicMaterial({
        color: galaxyColor || color,
        transparent: true,    
        opacity: 0.5,
      });

      const line = new THREE.Line(geometry, material);
      (line as any).isGalaxyLine = true; // 标记为银河线，便于后续管理
      
      galaxyGroup.add(line);
    }
    
    galaxyGroup.renderOrder = 0; 
    scene.add(galaxyGroup);
    return galaxyGroup; 
}