import * as THREE from 'three';
import colors from '../config/color'

export function createSkySphere(astroRadius: number): THREE.Mesh {
  const geometry = new THREE.SphereGeometry(astroRadius, 64, 64);
  const texture = new THREE.TextureLoader().load('/public/img/star-bg.jpg', (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
  });
  const material = new THREE.MeshBasicMaterial({
    // map: texture,  //这里是添加背景图需要的，我们用不着
    color: colors.normal.black, 
    side: THREE.BackSide,
    transparent: true,    
    opacity: 0.2,
    depthWrite: false
  });

  const skySphere = new THREE.Mesh(geometry, material);
  skySphere.renderOrder = -1; 
  return skySphere;
}
