import search from '../../img/search.svg'
import close from '../../img/close.svg'
import checked from '../../img/checked.svg'
import center from '../../img/center.svg'
import center_disabled from '../../img/center_disabled.svg'
import observe from '../../img/observe.svg'
import observe_disabled from '../../img/observe_disabled.svg'
import loading from '../../img/loading.svg'

export class searchPanle {
  getHTML() {
    return ` 
      <div class="search-panel">
          <section class="search-panel-input">
            <div class="search-panel-input-left">
              <img class="search-panel-img-search" src="${search}">
              <input type="text" placeholder="Search" autocomplete="off">
            </div>
            <img id="searchClose" class="search-panel-close" src="${close}">
          </section>
          <ul class="search-panel-result control-panel-bg">
            <li><span>NGC 7000</span><img src="${checked}"></li>
            <li><span>NGC 700</span><img src="${checked}"></li>
            <li><span>NGC 70</span><img src="${checked}"></li>
            <li><span>NGC 7</span><img src="${checked}"></li>
          </ul>

          <section class="search-panel-confirm control-panel-bg">
            <span>Observer</span>
            <img class="search-panel-img-confirm" src="${observe_disabled}">
          </section>
          <section class="search-panel-slewing control-panel-bg">
            <img src="${loading}">
            <span>Slewing to NGC 7000</span>
            <span class="search-panel-slewing-line">|</span>
            <span class="search-panel-slewing-stop">停止</span>
          </section>
      </div>
    `;
  }

  bindEvents(container: HTMLElement, onAction: (action: string, payload?: any) => void) {
    const closeBtn = container.querySelector('#searchClose');
  
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        onAction('closeSearch');
      });
    }
  }
}
