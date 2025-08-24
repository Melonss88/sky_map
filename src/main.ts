import { App } from './App';
import './style.css';
import { UIControl } from './ui/UIControl';
import { defaultConfig } from './config/defaultConfig';

let app: App | null = null;
let config = { ...defaultConfig };

function initApp() {
  const container = document.getElementById('app');
  if (!container) {
    throw new Error('Cannot find container element #app');
  }

  if (app) {
    app.destroy();  // 如果已有实例，先销毁
    app = null;
  }

  app = new App(container, config);
  app.animate();
}
initApp();

// 控制按钮
const uiControl = new UIControl((action, payload) => {
  switch (action) {
    case 'setLocation':
      config.longitude = payload.lon;
      config.latitude = payload.lat;
      app?.updateConfig({ 
        longitude: payload.lon,
        latitude: payload.lat
      });
      break;
    case 'toggleTime':
      if (payload instanceof Date) {
        app?.updateConfig({ clock: new Date(payload) });
      }
      break;
    case 'togglePlanets':
      config.showPlanets.planets = !config.showPlanets.planets;
      config.showPlanets.labels = !config.showPlanets.labels;
      app?.updateConfig({ showPlanets: config.showPlanets });
      uiControl.updateViewIcon('togglePlanets', config.showPlanets.planets);
      break;
    case 'togglePlanetOrbits':
      config.showPlanets.orbits = !config.showPlanets.orbits;
      app?.updateConfig({ showPlanets: config.showPlanets });
      uiControl.updateViewIcon('togglePlanetOrbits', config.showPlanets.orbits);
      break;
    case 'toggleConstellations':
      app?.updateConfig({ constellation: config.constellation });
      config.constellation.lines = !config.constellation.lines;
      config.constellation.labels = !config.constellation.labels;
      uiControl.updateViewIcon('toggleConstellations', config.constellation.lines);
      break;
    case 'toggleBoundaries':
      app?.updateConfig({ showBoundraies: !config.showBoundraies });
      config.showBoundraies = !config.showBoundraies;
      uiControl.updateViewIcon('toggleBoundaries', config.showBoundraies);
      break;
    case 'toggleGalaxy':
      app?.updateConfig({ showGalaxy: !config.showGalaxy });
      config.showGalaxy = !config.showGalaxy;
      uiControl.updateViewIcon('toggleGalaxy', config.showGalaxy);
      break;
    case 'toggleShowers':
      app?.updateConfig({ meteorshowers: !config.meteorshowers });
      config.meteorshowers = !config.meteorshowers;
      uiControl.updateViewIcon('toggleShowers', config.meteorshowers);
      break;
    case 'toggleMessier':
      app?.updateConfig({ showMessier: !config.showMessier });
      config.showMessier = !config.showMessier;
      uiControl.updateViewIcon('toggleMessier', config.showMessier);
      break;
    case 'toggleEquator':
      app?.updateConfig({ showRaDec: !config.showRaDec });
      config.showRaDec = !config.showRaDec;
      uiControl.updateViewIcon('toggleEquator', config.showRaDec);
      break;
    case 'toggleAzAlt':
      app?.updateConfig({ showAzAlt: !config.showAzAlt });
      config.showAzAlt = !config.showAzAlt;
      uiControl.updateViewIcon('toggleAzAlt', config.showAzAlt);
      break;
    case 'toggleMeridian':
      app?.updateConfig({ showMeridian: !config.showMeridian });
      config.showMeridian = !config.showMeridian;
      uiControl.updateViewIcon('toggleMeridian', config.showMeridian);
      break;
    case 'toggleEclipticLine':
      app?.updateConfig({ showEcliptic: !config.showEcliptic });
      config.showEcliptic = !config.showEcliptic;
      uiControl.updateViewIcon('toggleEclipticLine', config.showEcliptic);
      break;
    case 'toggleGround':
      app?.updateConfig({ showGround: !config.showGround });
      config.showGround = !config.showGround;
      uiControl.updateViewIcon('toggleGround', config.showGround);
      break;
  }

}, config);