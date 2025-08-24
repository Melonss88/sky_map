import { defaultConfig } from "../../config/defaultConfig";
import { skyStore } from "../../store/skyStore";

import eq_grid from '../../img/eq_grid.svg'
import eq_grid_active from '../../img/eq_grid_active.svg'
import atmosphere from '../../img/atmosphere.svg'
import atmosphere_active from '../../img/atmosphere_active.svg'
import conbound from '../../img/cons.svg'
import conbound_active from '../../img/cons_active.svg'
import label from '../../img/label.svg'
import label_active from '../../img/label_active.svg'

const t = skyStore.t.bind(skyStore);

export class layerPanel {
  constructor(private config: typeof defaultConfig) {}

  getHTML() {
    const c = this.config;
    return `
      <ul id="sky-controls" class="controls-ul">
        <li id="togglePlanets">
          <span class="${c.showPlanets.planets ? 'active' : ''}">${t('planet')}</span>
          <img src="${c.showPlanets.planets ? label_active : label}">
        </li>
        <li id="togglePlanetOrbits">
          <span class="${c.showPlanets.orbits ? 'active' : ''}">${t('orbits')}</span>
          <img src="${label}">
        </li>
        <li id="toggleConstellations">
          <span class="${c.constellation.lines ? 'active' : ''}">${t('con')}</span>
          <img src="${label}">
        </li>
        <li id="toggleBoundaries">
          <span class="${c.showBoundraies ? 'active' : ''}">${t('conbound')}</span>
          <img src="${c.showBoundraies ? conbound_active : conbound}">
        </li>
        <li id="toggleGalaxy">
          <span class="${c.showGalaxy ? 'active' : ''}">${t('gal')}</span>
          <img src="${label}">
        </li>
        <li id="toggleShowers">
          <span class="${c.meteorshowers ? 'active' : ''}">${t('meteorshowers')}</span>
          <img src="${label}">
        </li>
        <li id="toggleMessier">
          <span class="${c.showMessier ? 'active' : ''}">${t('messier')}</span>
          <img src="${label}">
        </li>
        <li id="toggleEquator">
          <span class="${c.showRaDec ? 'active' : ''}">${t('eq')}</span>
          <img src="${c.showRaDec ? eq_grid_active : eq_grid}">
        </li>
        <li id="toggleAzAlt">
          <span class="${c.showAzAlt ? 'active' : ''}">${t('az')}</span>
          <img src="${label}">
        </li>
        <li id="toggleMeridian">
          <span class="${c.showMeridian ? 'active' : ''}">${t('meridian')}</span>
          <img src="${label}">
        </li>
        <li id="toggleEclipticLine">
          <span class="${c.showEcliptic ? 'active' : ''}">${t('ec')}</span>
          <img src="${label}">
        </li>
        <li id="toggleGround">
          <span class="${c.showGround ? 'active' : ''}">${t('ground')}</span>
          <img src="${c.showGround ? atmosphere_active : atmosphere}">
        </li>
      </ul>
    `;
  }

  bindEvents(container: HTMLElement, onAction: (action: string) => void) {
    container.querySelectorAll('#sky-controls li').forEach(btn => {
      btn.addEventListener('click', () => {
        onAction(btn.id);
      });
    });
  }
  
  updateIcon(container: HTMLElement, toggleId: string, active: boolean) {
    const iconLi = container.querySelector<HTMLLIElement>(`#${toggleId}`);
    if (!iconLi) return;

    const icon = iconLi.querySelector('img');
    const text = iconLi.querySelector('span');
    if (text) text.classList.toggle('active', active);
    if (!icon || !text) return;

    switch (toggleId) {
      case 'togglePlanets':
        icon.src = active ? label_active : label;
        break;
      case 'toggleBoundaries':
        icon.src = active ? conbound_active : conbound;
        break;
      case 'toggleEquator':
        icon.src = active ? eq_grid_active : eq_grid;
        break;
      case 'toggleGround':
        icon.src = active ? atmosphere_active : atmosphere;
        break;
    }
  }
}
