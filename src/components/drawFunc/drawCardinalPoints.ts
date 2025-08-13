import * as THREE from 'three';
import { altAzToVector3 } from '../../utils/coordinateChange';
import color from '../../config/color';
import { createTextSprite } from '../drawFunc/drawLabels'
import { az_off } from '../../utils/coordinateChange'
import { skyStore } from '../../store/skyStore';

interface CardinalPointsOptions {
  scene: THREE.Scene;
  az: number;
  radius: number;
}

export class drawCardinalPoints {
  private scene: THREE.Scene;
  private azOff: number;
  private labels: THREE.Sprite[] = []; 

  constructor(options: CardinalPointsOptions) {
    this.scene = options.scene;
    this.azOff = options.az;
    this.create(options.radius);
  }

  private create(radius: number) {
    const t = skyStore.t.bind(skyStore);
    const azs = [0, 90, 180, 270]; 
    const labels = [t('N'), t('E'), t('S'), t('W')];
  
    for (let i = 0; i < azs.length; i++) {
      const azRad = az_off(azs[i], this.azOff);
      const pos = altAzToVector3(azRad, 0, radius * 1.02); 
      
      const label = createTextSprite(labels[i], color.normal.cardinal, 25);
      label.position.copy(pos);
      label.position.y += 1;
      label.position.x += 1;

      this.scene.add(label);
      this.labels.push(label);
    }
  }

  public remove() {
    for (const label of this.labels) {
      this.scene.remove(label);
      if (label.material.map) {
        label.material.map.dispose();
      }
      label.material.dispose();
    }
    this.labels = [];
  }
}