import * as THREE from 'three'

export function drawGround(
    radius:number,
    scene: THREE.Scene,
    showGround: boolean
): THREE.Mesh | undefined {
    if(!showGround) return 
    
    const halfSphere = new THREE.SphereGeometry(
        radius,
        64,          // 水平方向分段
        32,          // 垂直方向分段
        0,           // phiStart
        Math.PI * 2, // phiLength (整圈)
        Math.PI / 2, // thetaStart 从赤道开始
        Math.PI / 2  // thetaLength 半球
    );    

    const groundMaterial = new THREE.MeshBasicMaterial({
        color: 0x000000,
        side: THREE.BackSide,
        transparent: false,
        opacity: 1.0,
        depthWrite: true,       
        depthTest: true      
    });

    const groundMesh = new THREE.Mesh(halfSphere, groundMaterial);
    groundMesh.renderOrder = 999;
    scene.add(groundMesh);
    return groundMesh;
}