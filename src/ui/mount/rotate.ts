import rqc_rotator from '../../img/rqc_rotator.svg'
import qc_stop from '../../img/qc_stop.svg'
import dragger from '../../img/dragger.svg'

export class rotateMount {
    getHTML(): string {
      return `
        <div class="rotate-mount-conatiner">
            <section class="rotate-mount">
                <div class="rotate-mount-action">
                    <img src="${qc_stop}" />
                    <img src="${rqc_rotator}" />  
                </div>
                <div class="rotate-mount-control">
                    <span class="rotate-mount-control-gray"></span>
                    <span class="rotate-mount-control-move"></span>
                    <img class="rotate-mount-cursor" src="${dragger}">
                </div>
            </section>
            <section class="rotate-mount-data-container">
                <div class="rotate-mount-data control-panel-bg">
                    <p class="rotate-mount-data-h1">CW 145°</p>
                    <p>45°</p>
                </div>
                <div class="rotate-mount-data control-panel-bg">
                    <p class="rotate-mount-data-h1">0</p>
                    <p>45°</p>
                </div>
            </section>
        </div>
      `;
    }
  
    bindEvents(container: HTMLElement, onAction: (action: string, payload?: any) => void) {
      
  
    }
  }