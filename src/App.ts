import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// === 绘制 ===
import { createSkySphere } from './components/SkySphere';
import { drawStars } from './components/drawAstro/drawStars';
import { getPlanetMesh } from './components/drawPlanets/Planets';
import { createPlanetOrbitLines } from './components/drawPlanets/planetOrbitLines';
import { getSunMesh } from './components/drawPlanets/Sun';
import { getMoonMesh } from './components/drawPlanets/Moon';
import { drawMeteorShowers } from './components/drawAstro/drawMeteorShowers';
import { drawCardinalPoints } from './components/drawFunc/drawCardinalPoints';
import { drawConstellations } from './components/drawAstro/drawConstellationLines';
import { drawConstellationBoundaries } from './components/drawAstro/drawConstellaionBoundaries';
import { drawGalaxy } from './components/drawAstro/drawGalaxy';
import { drawMessier } from './components/drawAstro/drawMessier';
import { drawAzAltLines } from './components/drawLines/drawAzAltLines';
import { drawRaDecLines } from './components/drawLines/drawRaDecLines';
import { drawMeridian } from './components/drawLines/drawMeridian'
import { drawEclipticLine } from './components/drawLines/drawEclipticLine'
import { drawGround } from './components/drawFunc/drawGround'

import { type AppConfig } from './config/AppConfig';
import { skyStore } from './store/skyStore';
import { nearestObject, calculateCelestialCoordinates } from './utils/nearestObject';

const earthRadius = 10  // 地球半径
const astroRadius = 100 // 天文单位半径
const az = 180
const fov = 50

export class App {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  
  private skySphere: THREE.Mesh;
  private starField: THREE.Points;
  private galaxyMesh: THREE.Object3D;
  private constellationLines: Promise<THREE.Group>;
  private constellationBoundaries: THREE.Group;
  private meteorShowers: THREE.Group;
  private messierObjects: THREE.Group;
  private planets: Record<string, THREE.Object3D> = {};
  private planetOrbitLines: Record<string, THREE.Object3D>; 
  private sunMesh!: THREE.Group;
  private moonMesh!: THREE.Group;  
  private azAltLines: THREE.Group;
  private raDecLines: THREE.Group;
  private meridian: THREE.Group;
  private eclipticLine: THREE.Group;
  private ground: THREE.Mesh;

  private longPressTimeout: ReturnType<typeof setTimeout> | null = null;
  private touchStartTime: number = 0;

  private config: AppConfig
  private destroyed = false;
  private cleanupList: (() => void)[] = [];
  
  constructor(
    container: HTMLElement,
    config: AppConfig
  ) {
    this.config = structuredClone(config);

    // 场景初始化
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);

    // 相机设置(视角fov, 宽高比aspect, 近平面near, 远平面far);
    const width = container.clientWidth;
    const height = container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(fov, width / height, 0.1, astroRadius*10);
    // this.camera.fov = 50; // 或者更小，视角更窄更聚焦，todo：了解一下和成像系统的fov区别
    // const fovVert = 2 * Math.atan(sensorHeight / (2 * focalLength)) * (180 / Math.PI);
    // this.camera.fov = fovVert;
    // this.camera.aspect = canvasWidth / canvasHeight;
    // this.camera.updateProjectionMatrix();

    // 渲染器设置
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.domElement.style.touchAction = 'none'; //避免浏览器自带的双指缩放行为
    this.renderer.setSize(width, height);
    container.appendChild(this.renderer.domElement);

    // 控制器设置
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableZoom = true;
    this.controls.zoomSpeed = 0.5; // 缩放速度
    this.controls.rotateSpeed = 0.6; 
    this.controls.enableDamping = true;
    this.controls.minDistance = 1;  // 拉到最近的位置
    this.controls.maxDistance = astroRadius * 0.6;  // 拉到最远的位置
    this.controls.minPolarAngle = Math.PI / 2;  // 限制仰角
    this.controls.maxPolarAngle = Math.PI / 2; // 限制仰角
    this.controls.target.set(0, astroRadius*0.5+20, 0);    
    this.controls.update();  

    this.camera.position.set(0, 0, earthRadius); 
    this.camera.updateProjectionMatrix();

    this.initSky(); // 星空背景（内贴图天空球）
    this.initStars(); // 异步初始化加载星空
    this.initPlanets(); //添加行星 
    this.initSunMoon(); //太阳和月亮
    this.initMeteorShowers(); // 添加流星雨
    this.initConstellationLines(); // 添加星座线
    this.initConstellationBoundaries(); // 添加星座边界线
    this.initGalaxy() // 添加银河线
    // this.initMessier(); // 添加深空天体
    this.initAzAltLines(); //添加地平坐标线
    this.initRaDecLines(); //添加赤道坐标线
    this.initMeridian(); //添加子午线
    this.initEclipticLine(); //添加黄道线
    this.initCardinalPoints(); //东南西北标签

    this.initGround() // 添加地平面  --  注意这个要放在最后，否则无法完全遮挡住底下部分

    // 自适应窗口大小
    const resizeHandler = this.onWindowResize.bind(this);
    window.addEventListener('resize', resizeHandler);
    this.cleanupList.push(() => {
      window.removeEventListener('resize', resizeHandler);
    });
    this.bindLongPress();

    this.animate();    // 启动渲染循环
  }

  private initSky() {
    this.skySphere = createSkySphere(astroRadius);
    this.scene.add(this.skySphere);
  }

  private async initStars() {
    this.starField = await drawStars(
      this.config.magnitude, 
      this.config.clock, 
      this.config.latitude, 
      this.config.longitude, 
      astroRadius,
      this.config.showGround
    );
    this.scene.add(this.starField);
  }

  private initPlanets() {
    const planets = ["Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune"]
    const planetsMap: Record<string, THREE.Object3D> = {};
    const orbitLinesMap: Record<string, THREE.Object3D> = {};

    planets.forEach(name => {
      planetsMap[name] = getPlanetMesh( 
        name, 
        this.config.clock, 
        this.config.latitude, 
        this.config.longitude, 
        astroRadius, 
        this.scene, 
        this.config.showPlanets.planets, 
        this.config.showPlanets.labels,
        this.config.showGround
      )

      orbitLinesMap[name] = createPlanetOrbitLines(
        name, 
        this.config.clock, 
        astroRadius, 
        this.scene, 
        this.config.latitude, 
        this.config.longitude, 
        this.config.showPlanets.orbits 
      );
      
      // 添加行星轨道线 -- 老版的-virtualsky
      // this.planetOrbitLines[name] = getPlanetOrbitLine(
      //   name, 
      //   this.config.clock, 
      //   astroRadius, 
      //   this.scene, 
      //   this.config.latitude, 
      //   this.config.longitude,
      // );
    })
    this.planets = planetsMap;
    this.planetOrbitLines = orbitLinesMap;
  }

  private initSunMoon() {
    this.sunMesh = getSunMesh(
      this.config.clock, 
      this.config.latitude, 
      this.config.longitude, 
      astroRadius, 
      this.scene, 
      this.config.showPlanets.planets,
      this.config.showPlanets.labels,
      this.config.showGround)

    this.moonMesh = getMoonMesh(
      this.config.clock, 
      this.config.latitude, 
      this.config.longitude, 
      astroRadius, 
      this.scene, 
      this.config.showPlanets.planets,
      this.config.showPlanets.labels,
      this.config.showGround)
  }

  private initMeteorShowers() {
    this.meteorShowers = drawMeteorShowers(
      this.config.clock,
      this.config.latitude,
      this.config.longitude,
      astroRadius,
      this.scene,
      this.config.meteorshowers,
    );
  }

  private initCardinalPoints() {
    const cardinalPoints = new drawCardinalPoints({
      scene: this.scene,
      az: az,
      radius: astroRadius
    })
  }

  private initConstellationLines() {
    this.constellationLines = drawConstellations(
      this.config.clock,
      this.config.latitude,
      this.config.longitude,
      astroRadius,
      this.scene,
      this.config.showGround,
      this.config.constellation.lines,
      this.config.constellation.labels,
    );
  }

  private initConstellationBoundaries() {
    this.constellationBoundaries = drawConstellationBoundaries(
      this.config.clock,
      this.config.latitude,
      this.config.longitude,
      astroRadius,
      this.scene,
      this.config.showGround,
      this.config.showBoundraies
    );
  }

  private initGalaxy() {
    this.galaxyMesh = drawGalaxy(
      this.config.clock,
      this.config.latitude,
      this.config.longitude,
      astroRadius,
      this.scene,
      this.config.showGalaxy,
      this.config.showGround
    )
  }

  private initMessier() {
    this.messierObjects = drawMessier(
      this.config.clock, 
      this.config.latitude, 
      this.config.longitude, 
      astroRadius, 
      this.scene, 
      this.config.showMessier, 
      this.config.showGround
    )
  }

  private initAzAltLines() {
    this.azAltLines = drawAzAltLines(astroRadius, az, this.config.latitude, this.config.showAzAlt);
    this.scene.add(this.azAltLines);
  }

  private initRaDecLines() {
    this.raDecLines = drawRaDecLines(
      astroRadius, 
      this.config.latitude, 
      this.config.longitude, 
      this.config.clock, 
      this.config.showRaDec
    );
    this.scene.add(this.raDecLines);
  }

  private initMeridian() {
    this.meridian = drawMeridian(
      astroRadius, 
      az, 
      this.config.latitude, 
      this.config.showMeridian
    )
    this.scene.add(this.meridian);
  }

  private initEclipticLine() {
    this.eclipticLine = drawEclipticLine(
      this.config.clock,
      astroRadius,
      this.config.latitude,
      this.config.longitude,
      az,
      this.config.showEcliptic
    )
    this.scene.add(this.eclipticLine);
  }


  private initGround() {
    this.ground = drawGround(astroRadius, this.scene, this.config.showGround)
  }

  // === 更新 ===
  public updateConfig(newConfig: Partial<AppConfig>) {
    const oldClock = new Date(this.config.clock.getTime());
    const oldMagnitude = this.config.magnitude;
    const oldLongitude = this.config.longitude; 
    const oldLatitude = this.config.latitude;

    // 时间变化要处理的地方
    if (newConfig.clock !== undefined) {
      const oldTime = oldClock.getTime();
      const newTime = newConfig.clock.getTime();

      if (Math.abs(newTime - oldTime) > 1000) { // 允许1秒的误差
        this.updateStars();
        if(this.config.showPlanets) this.updatePlanets();
        if(this.config.constellation.lines) this.updateConstellations();
        if(this.config.showBoundraies) this.updateConstellationBoundaries();
        if(this.config.meteorshowers) this.updateMeteorShowers();
        if(this.config.showGalaxy) this.updateGalaxy();
        if(this.config.showMessier) this.updateMessier();
      }
    }

    this.config = { ...this.config, ...newConfig };

    // 位置变化要处理的地方
    if ((newConfig.longitude !== undefined && newConfig.longitude !== oldLongitude) ||
        (newConfig.latitude !== undefined && newConfig.latitude !== oldLatitude)) {
      this.updateAzAltLines();  
      this.updateGround();     
      this.updateRaDecLines(); 
      if(this.config.showPlanets) this.updatePlanets(); 
      if(this.config.constellation.lines) this.updateConstellations();
      if(this.config.showBoundraies) this.updateConstellationBoundaries();
      if(this.config.meteorshowers) this.updateMeteorShowers();
      if(this.config.showGalaxy) this.updateGalaxy();
      if(this.config.showMessier) this.updateMessier();
    }

    // 地平面是否显示要处理的地方
    if (newConfig.showGround !== undefined) {
      this.updateStars();
      this.updateGround();
      if(this.config.showPlanets) this.updatePlanets(); 
      if(this.config.constellation.lines) this.updateConstellations();
      if(this.config.showBoundraies) this.updateConstellationBoundaries();
      if(this.config.meteorshowers) this.updateMeteorShowers();
      if(this.config.showGalaxy) this.updateGalaxy();
      if(this.config.showMessier) this.updateMessier();
      // if(this.config.showMeridian) this.updateMeridian();
      // if(this.config.showEcliptic) this.updateEclipticLine();
    }

    if (newConfig.magnitude !== undefined && newConfig.magnitude !== oldMagnitude) this.updateStars();
    if (newConfig.showPlanets !== undefined) this.updatePlanets();
    if (newConfig.constellation !== undefined) this.updateConstellations();
    if (newConfig.showBoundraies !== undefined) this.updateConstellationBoundaries();
    if (newConfig.meteorshowers !== undefined) this.updateMeteorShowers();
    if (newConfig.showGalaxy !== undefined)  this.updateGalaxy();
    if (newConfig.showMessier !== undefined) this.updateMessier();
    if (newConfig.showAzAlt !== undefined) this.updateAzAltLines();
    if (newConfig.showRaDec !== undefined) this.updateRaDecLines();
    if(newConfig.showMeridian !== undefined) this.updateMeridian();
    if(newConfig.showEcliptic !== undefined) this.updateEclipticLine();
  }
  private updateStars() {
    if (this.starField) {
      this.scene.remove(this.starField);
    }
    this.initStars();
  }
  private updatePlanets() {
    Object.values(this.planets).forEach(planet => this.scene.remove(planet));
    Object.values(this.planetOrbitLines).forEach(line => this.scene.remove(line));
    if(this.sunMesh) this.scene.remove(this.sunMesh)
    if(this.moonMesh) this.scene.remove(this.moonMesh)

    this.initPlanets();
    this.initSunMoon();
  }
  private async updateConstellations() {
    if (this.constellationLines) {
      this.scene.remove(await this.constellationLines);
    }
    this.initConstellationLines();
  }
  private async updateConstellationBoundaries() {
    if (this.constellationBoundaries) {
      this.scene.remove(this.constellationBoundaries);
    }
    this.initConstellationBoundaries();
  }
  private updateMeteorShowers() {
    if (this.meteorShowers) {
      this.scene.remove(this.meteorShowers);
    }
    this.initMeteorShowers();
  }
  private updateGalaxy() {
    if (this.galaxyMesh) {
      this.scene.remove(this.galaxyMesh);
    }
    this.initGalaxy();
  }
  private updateMessier() {
    if (this.messierObjects) {
      this.scene.remove(this.messierObjects);
    }
    this.initMessier();
  }
  private updateAzAltLines() {
    if (this.azAltLines) {
      this.scene.remove(this.azAltLines);
    }
    this.initAzAltLines();
  }
  private updateRaDecLines() {
    if (this.raDecLines) {
      this.scene.remove(this.raDecLines);
    }
    this.initRaDecLines();
  }
  private updateMeridian() {
    if (this.meridian) {
      this.scene.remove(this.meridian);
    }
    this.initMeridian();
  }
  private updateEclipticLine() {
    if (this.eclipticLine) {
      this.scene.remove(this.eclipticLine);
    }
    this.initEclipticLine();
  }
  private updateGround() {
    if (this.ground) {
      this.scene.remove(this.ground);
    }
    this.initGround();
  }
  // === end of 更新 ===

  private onWindowResize() {
    const width = this.renderer.domElement.parentElement?.clientWidth || window.innerWidth;
    const height = this.renderer.domElement.parentElement?.clientHeight || window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private bindLongPress() {
    const dom = this.renderer.domElement;
    // dom.addEventListener('touchstart', (e) => this.onTouchStart(e));
    // dom.addEventListener('touchend', (e) => this.onTouchEnd(e));

    dom.addEventListener('click', this.onClick.bind(this));
  }
  private onClick(e: MouseEvent) {
    const {ra, dec} = calculateCelestialCoordinates(
      e,
      this.renderer,
      this.camera,
      this.skySphere,
      this.config.clock,
      this.config.latitude,
      this.config.longitude,
      az
    )
    const nearest = nearestObject(ra,dec,skyStore.lookup)
    console.log(nearest)
  }
  private onTouchStart(e: TouchEvent) {
    this.touchStartTime = Date.now();
  }
  private onTouchEnd(e: TouchEvent) {
    const duration = Date.now() - this.touchStartTime;
    if (duration >= 500) { // 500ms 可以自己调
      //todo:把click拉到这边即可
    }
  }

  public animate() {
    if (this.destroyed) return;
    requestAnimationFrame(() => this.animate());

    this.controls.update(); // 控制器平滑动画
    this.renderer.render(this.scene, this.camera); // 渲染场景
  }

  // ----- 销毁 -----
  public destroy() {
    this.destroyed = true;
    this.cleanupList.forEach(fn => fn());
    this.renderer.dispose();
    this.scene.clear();
  }

}
