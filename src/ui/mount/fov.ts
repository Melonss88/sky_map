import qc_stop from '../../img/qc_stop.svg'
import qmc_north from '../../img/qmc_north.svg'
import qmc_south from '../../img/qmc_south.svg'
import qmc_east from '../../img/qmc_east.svg'
import qmc_west from '../../img/qmc_west.svg'

export class fovMount {
    getHTML(): string {
      const scalePoints = Array.from({ length: 4 }, (_, i) => {
        const level = 4 - i;
        return `<span class="scale-point" data-level="${level}"></span>`;
      }).join('');
    
      return `
        <div class="fov-mount">
          <section class="fov-mount-left">
            <img src="${qc_stop}">
            <div class="fov-mount-left-direction">
              <img src="${qmc_north}">
              <img src="${qmc_south}">
            </div>
          </section>
          <section class="fov-mount-right">
            <div class="fov-mount-right-1">
              <div class="to-home">
                <p class="to-home-showbox control-panel-bg">
                  <span>Slew to Home Postion and stop.</span>
                  <span class="to-home-link">HOME</span>
                </p>
              </div>
              <p class="fov-mount-right-direction">
                <img src="${qmc_west}">
                <img src="${qmc_east}">
              </p>
            </div>
            <div class="fov-mount-right-2">
              <div class="fov-mount-right-scale">
                <div class="scale-point-box">${scalePoints}</div>
                <span class="scale-num">1X</span>
              </div>
              <span class="fov-mount-right-shot"></span>
            </div>
          </section>
        </div>
      `;
    }

    updateScale(container: HTMLElement, level: number) {
      const points = container.querySelectorAll<HTMLSpanElement>('.scale-point');
      points.forEach(point => {
        const pointLevel = Number(point.dataset.level);
        if (pointLevel <= level) {
          point.classList.add('active');
        } else {
          point.classList.remove('active');
        }
      });
    
      const scaleNum = container.querySelector('.scale-num');
      if (scaleNum) {
        scaleNum.textContent = `${level}X`;
      }
    }

    bindEvents(container: HTMLElement, onAction: (action: string, payload?: any) => void) {
      this.updateScale(container, 1);
  
    }
  }