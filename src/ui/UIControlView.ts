import "flatpickr/dist/flatpickr.min.css";
import { defaultConfig } from '../config/defaultConfig';

import { datePanel } from './panels/datePanel';
import { locationPanel } from './panels/locationPanel';
import { layerPanel } from './panels/layerPanel';
import { searchPanle } from './panels/searchPanel';
import { rotateMount } from './mount/rotate';
import { fovMount } from './mount/fov';

import downIcon from "../img/down-back.svg";
import layer from '../img/layer.svg'
import datetime from '../img/datetime.svg'
import nav from '../img/nav.svg'
import search from '../img/objects_quick_search.svg'

import rqc from '../img/rqc.svg'
import rqc_default from '../img/rqc_default.svg'
import mqc from '../img/mqc.svg'
import mqc_default from '../img/mqc_default.svg'


export interface UIControlViewOptions {
  onAction: (action: string, payload?: any) => void;
  config: typeof defaultConfig;
}

export class UIControlView {
  private container: HTMLElement;
  private onAction: (action: string, payload?: any) => void;
  private config: typeof defaultConfig; 
  private panels: Record<string, any>;
  private activePanel: string | null = null;
  private mounts: Record<string, any>;
  private mountActivePanel: string | null = null;

  constructor(containerId: string, options: UIControlViewOptions) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Cannot find container element #${containerId}`);
    }

    this.container = container;
    this.onAction = options.onAction;
    this.config = options.config;

    this.panels = {
      datetime: new datePanel(),
      nav: new locationPanel(),
      layer: new layerPanel(this.config),
      search: new searchPanle(),
    };

    this.mounts = {
      rotate: new rotateMount(),
      fov: new fovMount(),
    };

    this.render();
    this.bindEvents();
  }

  private render() {
    this.container.innerHTML = `
      <div class="sky-atlas-controls1">
          <section class="return">
              <img id="down-close" src="${downIcon}">
          </section>
          <section class="fov control-panel-bg">FOV 2.3° × 3.2°</section>

          <section class="controls">
            <span class="controls-img" data-panel="layer"><img src="${layer}"></span>
            <span class="controls-img" data-panel="datetime"><img src="${datetime}"></span>
            <span class="controls-img controls-nav" data-panel="nav">
              <span class="controls-nav-nw">NW</span>
              <img src="${nav}">
            </span>
            <span class="controls-img" data-panel="search"><img src="${search}"></span>

            <div class="controls-showbox control-panel-bg" id="controls-showbox">
                ${this.getShowBoxHTML()}
            </div>
          </section>

          <section class="search-container" style="display: none;"></section>
      </div>

      <section class="search-point-1"><span></span></section>
      <section class="search-point-2"><span></span></section>
      <section class="mount-rotate-1"><span></span></section>
      <section class="mount-rotate-2"><span></span></section>
      <section class="mount-fov-center">
        <p class="border"></p>
        <p class="text">FOV 2.3° x 3.2°</p>
      </section>

      <div class="sky-atlas-controls2">
          <section class="mount-control" id="mount-control">
            <img src="${rqc_default}"> 
            <img src="${mqc_default}"> 
          </section>
          <div class="mount-showbox" id="mount-showbox"></div>
      </div> 
    `;
  }

  // 绑定赤道仪事件
  private bindMountControl() {
    const mountControl = this.container.querySelector('#mount-control');
    if (!mountControl) return;
  
    const imgs = mountControl.querySelectorAll('img');
  
    imgs[0].addEventListener('click', () => {
      this.mountActivePanel = this.mountActivePanel === 'rotate' ? null : 'rotate';
      this.showMountPanel();
    });
  
    imgs[1].addEventListener('click', () => {
      this.mountActivePanel = this.mountActivePanel === 'fov' ? null : 'fov';
      this.showMountPanel();
    });
  }
  private showMountPanel() {
    const mountShowBox = this.container.querySelector<HTMLDivElement>('#mount-showbox');
    if (!mountShowBox) return;
  
    if (this.mountActivePanel && this.mounts[this.mountActivePanel]) {
      mountShowBox.style.display = 'block';
      mountShowBox.innerHTML = this.mounts[this.mountActivePanel].getHTML();
      this.mounts[this.mountActivePanel].bindEvents(mountShowBox, this.config);
    } else {
      mountShowBox.style.display = 'none';
      mountShowBox.innerHTML = '';
    }
  }

  // 右上角showbox的内容模块化在panels文件夹
  private getShowBoxHTML(): string {
    if (this.activePanel && this.panels[this.activePanel]) {
      return this.panels[this.activePanel].getHTML();
    }
    return "";
  }
  private bindControlsPanel() {
    const controls = this.container.querySelector('.controls');
    if (!controls) return;
  
    controls.querySelectorAll('.controls-img').forEach(controls => {
      controls.addEventListener('click', () => {
        const panel = controls.getAttribute('data-panel');
        if (!panel) return;

        if (this.activePanel === panel) {
          this.activePanel = null;
        } else {
          this.activePanel = panel;
        }
  
        this.updateShowBox();
      });
    });
  }
  // 控制showbox显示
  private updateShowBox() {
    const showBox = this.container.querySelector<HTMLDivElement>('#controls-showbox');
    const controls = this.container.querySelector<HTMLDivElement>('.controls');
    const searchContainer = this.container.querySelector<HTMLDivElement>('.search-container');

    if (this.activePanel === 'search') {
      controls.style.display = 'none';
      searchContainer.style.display = 'block';
      searchContainer.innerHTML = this.panels['search'].getHTML();
      this.panels['search'].bindEvents(searchContainer, this.onAction);
    } 
    else if (this.activePanel) {
      controls.style.display = 'flex'; 
      searchContainer.style.display = 'none';
      showBox.style.display = this.activePanel ? 'block' : 'none';
      if (this.activePanel) {
        showBox.innerHTML = this.getShowBoxHTML();
        this.panels[this.activePanel].bindEvents(showBox, this.onAction);
      }
    } 
    else {
      controls.style.display = 'flex';
      searchContainer.style.display = 'none';
      showBox.style.display = 'none';
    }
  }

  // layerPanel的图标更新，这里只是传输，实际底层在layerPanel里面
  public updateIcon(toggleId: string, active: boolean) {
    if (!this.panels['layer']) return;
  
    const showBox = this.container.querySelector<HTMLDivElement>('#controls-showbox');
    if (!showBox) return;
  
    this.panels['layer'].updateIcon(showBox, toggleId, active);
  }
  
  private bindClose() {
    const closeBtn = this.container.querySelector('#down-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.onAction('closePage');
      });
    }
  }

  private bindEvents() {
    this.bindControlsPanel();
    this.bindMountControl();
    this.bindClose();  // 关闭页面

    const originalOnAction = this.onAction;
    this.onAction = (action: string, payload?: any) => {
      if (action === 'closeSearch') {
        this.activePanel = null;
        this.updateShowBox();
      } else {
        originalOnAction(action, payload);
      }
    };
  }

}
