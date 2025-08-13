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
    return `
        <ul id="sky-controls" class="controls-ul">
          <li id="togglePlanets"><span>${t('planet')}</span><img src="${label}"></li>
          <li id="togglePlanetOrbits"><span>${t('orbits')}</span><img src="${label}"></li>
          <li id="toggleConstellations"><span>${t('con')}</span><img src="${label}"></li>
          <li id="toggleBoundaries"><span>${t('conbound')}</span><img src="${conbound}"></li>
          <li id="toggleGalaxy"><span>${t('gal')}</span><img src="${label}"></li>
          <li id="toggleShowers"><span>${t('meteorshowers')}</span><img src="${label}"></li>
          <li id="toggleMessier"><span>${t('messier')}</span><img src="${label}"></li>
          <li id="toggleEquator"><span>${t('eq')}</span><img src="${eq_grid}"></li>
          <li id="toggleAzAlt"><span>${t('az')}</span><img src="${label}"></li>
          <li id="toggleMeridian"><span>${t('meridian')}</span><img src="${label}"></li>
          <li id="toggleEclipticLine"><span>${t('ec')}</span><img src="${label}"></li>
          <li id="toggleGround"><span>${t('ground')}</span><img src="${this.config.showGround?atmosphere_active:atmosphere}"></li>
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
    if (!icon) return;

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
