import * as THREE from 'three';
export function createTextSprite(
    text: string,
    color: string,
    desiredCssFontSize = 13,
    scale = 10
  ): THREE.Sprite {
    const devicePixelRatio = window.devicePixelRatio || 1;
    // const desiredCssFontSize = 13   //设置13px的字体大小
    // const scale = 5
    const canvasFontSize = desiredCssFontSize * devicePixelRatio * 2; // 文字像素大小，保证高清
    // const canvasSize = canvasFontSize * 2; // 文字占据画布大小的 50% 左右

    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCtx.font = `bold ${canvasFontSize}px SF-CRS,Arial, sans-serif`;
    const textWidth = tempCtx.measureText(text).width;
    const padding = canvasFontSize * 0.5;
    const canvasSize = Math.max(textWidth + padding * 2, canvasFontSize + padding * 2);
  
    const canvas = document.createElement('canvas');
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvasSize, canvasSize);
    ctx.fillStyle = color;
    ctx.font = `bold ${canvasFontSize}px SF-CRS,Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvasSize / 2, canvasSize / 2);
  
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
  
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false
    });
  
    const sprite = new THREE.Sprite(material);
  
    sprite.scale.set(scale, scale, 1);
  
    return sprite;
  }
  