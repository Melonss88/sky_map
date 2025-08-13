import { skyStore } from "../../store/skyStore";

const t = skyStore.t.bind(skyStore);

export class locationPanel {
  getHTML() {
    return `
        <div class="location-input">
            <input type="number" id="longitudeInput" placeholder="${t('longitude')}" step="0.0001" min="0" max="360">
            <input type="number" id="latitudeInput" placeholder="${t('latitude')}" step="0.0001" min="-90" max="90">
            <button id="setLocation">${t('positionchange')}</button>
        </div>
    `;
  }

  bindEvents(container: HTMLElement, onAction: (action: string, payload?: any) => void) {
    const setLocationBtn = container.querySelector<HTMLButtonElement>('#setLocation');
    const longitudeInput = container.querySelector<HTMLInputElement>('#longitudeInput');
    const latitudeInput = container.querySelector<HTMLInputElement>('#latitudeInput');
  
    if (setLocationBtn && longitudeInput && latitudeInput) {
      setLocationBtn.addEventListener('click', () => {
        const longitude = parseFloat(longitudeInput.value);
        const latitude = parseFloat(latitudeInput.value);
  
        if (isNaN(longitude) || isNaN(latitude)) {
          alert('请输入有效的经纬度数值');
          return;
        }
  
        if (longitude < 0 || longitude > 360 || latitude < -90 || latitude > 90) {
          alert('经纬度范围超出限制');
          return;
        }
  
        onAction('setLocation', { longitude, latitude });
      });
    }
  }
}
