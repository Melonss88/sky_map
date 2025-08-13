import * as THREE from 'three';
import en from '../lang/en.json';
import zhCN from '../lang/zh-cn.json';

export interface CelestialObject {
  ra: number; // 弧度
  dec: number; // 弧度
  label: string;
  xyz?: THREE.Vector3; 
}

export interface LookupTable {
  stars: CelestialObject[];
  planets: CelestialObject[];
  sun: CelestialObject[];
  moon: CelestialObject[];
  messier: CelestialObject[];
  meteorshower: CelestialObject[];
}

export class SkyStore {
  lookup: LookupTable;
  lang: string;
  i18n: Record<string, string | Record<string, any>>;

  constructor() {
    this.lookup = {
        stars: [],
        planets: [],
        sun: [],
        moon: [],
        messier: [],
        meteorshower: [],
    };

    this.lang = this.detectLanguage();
    this.i18n = this.getLanguageData(this.lang);
  }

  register(type: keyof LookupTable, obj: CelestialObject) {
    this.lookup[type].push(obj);
  }

  clear() {
    for (const key in this.lookup) {
      this.lookup[key as keyof LookupTable] = [];
    }
  }

  detectLanguage(): string {
    //从交互中获取，然后设置return出去就可以了
    return 'zh-cn'; 
  }
  getLanguageData(lang: string) {
    switch (lang) {
      case 'zh-cn':
        return zhCN;
      case 'en':
      default:
        return en;
    }
  }
  setLanguage(lang: string) {
    this.lang = lang;
    switch (lang) {
      case 'en':
        this.i18n = en;
        break;
      case 'zh-cn':
        this.i18n = zhCN;
        break;
      default:
        this.i18n = en;
    }
  }
  t(key: string): string {
    const keys = key.split('.');
    let result: any = this.i18n;
  
    for (const k of keys) {
      if (result && k in result) {
        result = result[k];
      } else {
        return key; 
      }
    }
    return typeof result === 'string' ? result : key; 
  }

}

export const skyStore = new SkyStore();
