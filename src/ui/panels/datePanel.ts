import calendar from '../../img/calendar.svg'
import backward from '../../img/backward.svg'
import pause from '../../img/pause.svg'
import forward from '../../img/forward.svg'
import now from '../../img/now.svg'
import now_disabled from '../../img/now_disabled.svg'
import up from '../../img/up.svg'
import down from '../../img/down.svg'
import play from '../../img/play.svg'

export class datePanel {
    private clock = new Date()
    private playTimer: number | null = null;
    private playSpeed = 1;
    private playDirection: 'forward' | 'backward' | null = null;
    private isNowActive = false;

    getHTML() {
        const parts = this.getDateParts(this.clock);
        return `
            <div class="datetime-picker">
                <div class="datetime-picker-now">
                    <span>${this.formatDate(this.clock)}</span>
                    <img id="open-datetime-picker" src="${calendar}">
                </div> 
                <div class="datetime-picker-control">
                    <div class="datetime-picker-control-left">
                        <img id="datetime-backward" src="${backward}">
                        <img id="datetime-pause" src="${play}" data-state="paused">
                        <img id="datetime-forward" src="${forward}">
                    </div>
                    <img id="datetime-now" src="${now_disabled}">
                </div>
            </div>
            <div class="datetime-picker-showbox" id="datetime-picker-showbox">
                <div id="datetime-year" class="datetime-showbox-num">
                    <img class="datetime-up" src="${up}">
                    <span class="datetime-year datetime-change">${String(parts.year).padStart(4, '0')}</span>
                    <img class="datetime-down" src="${down}">
                </div>
                <div id="datetime-month" class="datetime-showbox-num">
                    <img class="datetime-up" src="${up}">
                    <span class="datetime-change">${String(parts.month).padStart(2, '0')}</span>
                    <img class="datetime-down" src="${down}">
                </div>
                <div id="datetime-day" class="datetime-showbox-num">
                    <img class="datetime-up" src="${up}">
                    <span class="datetime-change">${String(parts.day).padStart(2, '0')}</span>
                    <img class="datetime-down" src="${down}">
                </div>
                <div id="datetime-hour" class="datetime-showbox-num">
                    <img class="datetime-up" src="${up}">
                    <span class="datetime-change">${String(parts.hour).padStart(2, '0')}</span>
                    <img class="datetime-down" src="${down}">
                </div>
                <div id="datetime-min" class="datetime-showbox-num">
                    <img class="datetime-up" src="${up}">
                    <span class="datetime-min datetime-change">${String(parts.min).padStart(2, '0')}</span>
                    <img class="datetime-down" src="${down}">
                </div>
            </div>
        `;
    }

    private formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}·${month}·${day} ${hours}:${minutes}:${seconds}`;
    }

    private getDateParts(date: Date) {
        return {
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            day: date.getDate(),
            hour: date.getHours(),
            min: date.getMinutes(),
        };
    }

    private updateHTML(container: HTMLElement) {
        const parts = this.getDateParts(this.clock);
        container.querySelector(".datetime-picker-now span")!.textContent = this.formatDate(this.clock);
    
        (container.querySelector("#datetime-year .datetime-change") as HTMLElement).textContent = String(parts.year).padStart(4, '0');
        (container.querySelector("#datetime-month .datetime-change") as HTMLElement).textContent = String(parts.month).padStart(2, '0');
        (container.querySelector("#datetime-day .datetime-change") as HTMLElement).textContent = String(parts.day).padStart(2, '0');
        (container.querySelector("#datetime-hour .datetime-change") as HTMLElement).textContent = String(parts.hour).padStart(2, '0');
        (container.querySelector("#datetime-min .datetime-change") as HTMLElement).textContent = String(parts.min).padStart(2, '0');
    
        this.isNowActive = true; 
        this.updateNowButton(container);
    }

    private togglePicker(container: HTMLElement) {
        const toggleBtn = container.querySelector("#open-datetime-picker");
        const pickerBox = container.querySelector("#datetime-picker-showbox") as HTMLElement;

        if (toggleBtn && pickerBox) {
            toggleBtn.addEventListener("click", () => {
                const isHidden = pickerBox.style.display === "none" || getComputedStyle(pickerBox).display === "none";
                pickerBox.style.display = isHidden ? "flex" : "none"; 
            });
        }
    }

    private bindControlEvents(container: HTMLElement, onAction: (action: string, payload?: any) => void) {
        const change = (type: 'year' | 'month' | 'day' | 'hour' | 'min', step: number) => {
            const date = new Date(this.clock); 
    
            switch (type) {
                case 'year':
                    const newYear = date.getFullYear() + step;
                    if (newYear >= 2020 && newYear <= 2120) date.setFullYear(newYear);
                    break;
                case 'month':
                    date.setMonth(date.getMonth() + step);
                    break;
                case 'day':
                    date.setDate(date.getDate() + step);
                    break;
                case 'hour':
                    date.setHours(date.getHours() + step);
                    break;
                case 'min':
                    date.setMinutes(date.getMinutes() + step);
                    break;
            }
    
            date.setSeconds(0); 
            this.clock = date;
            this.updateHTML(container);
            onAction('toggleTime', this.clock);
        };
    
        container.querySelectorAll(".datetime-up, .datetime-down").forEach((btn) => {
            btn.addEventListener("click", () => {
                const parent = (btn.parentElement as HTMLElement).id;
                const isUp = btn.classList.contains("datetime-up");
                const step = isUp ? 1 : -1;
    
                if (parent.includes("year")) change("year", step);
                else if (parent.includes("month")) change("month", step);
                else if (parent.includes("day")) change("day", step);
                else if (parent.includes("hour")) change("hour", step);
                else if (parent.includes("min")) change("min", step);
            });
        });
    }

    private toNowDate(container: HTMLElement, onAction: (action: string, payload?: any) => void) {
        const nowBtn = container.querySelector("#datetime-now");
        nowBtn.addEventListener("click", () => {
            this.clock = new Date();
            this.updateHTML(container);

            this.isNowActive = false; 
            this.updateNowButton(container);

            onAction('toggleTime', this.clock);
        });
    }

    private bindPlayEvents(container: HTMLElement, onAction: (action: string, payload?: any) => void) {
        const backwardBtn = container.querySelector("#datetime-backward");
        const forwardBtn = container.querySelector("#datetime-forward");
        const pauseBtn = container.querySelector<HTMLImageElement>("#datetime-pause");
    
        backwardBtn?.addEventListener("click", () => {
            this.playTime(container, 'backward', onAction);
            this.updatePauseIcon(pauseBtn, true);
        });
    
        forwardBtn?.addEventListener("click", () => {
            this.playTime(container, 'forward', onAction);
            this.updatePauseIcon(pauseBtn, true);
        });
    
        pauseBtn?.addEventListener("click", () => {
            this.stopPlaying();
            this.updatePauseIcon(pauseBtn, false);
        });
    }
    
    private updatePauseIcon(pauseBtn: HTMLImageElement | null, isPlaying: boolean) {
        if (!pauseBtn) return;
        pauseBtn.src = isPlaying ? pause : play; 
        pauseBtn.setAttribute('data-state', isPlaying ? 'playing' : 'paused');
    }
    private playTime(container: HTMLElement, direction: 'forward' | 'backward', onAction: (action: string, payload?: any) => void) {
        if (this.playDirection !== direction) {
            this.playSpeed = 1;  // 切换方向时重置倍率
        } else {
            if (this.playSpeed < 10000) {
                this.playSpeed *= 10;
            }
        }
    
        this.stopPlaying(); // 清除旧定时器
    
        this.playDirection = direction;
        this.playTimer = window.setInterval(() => {
            const newTime = new Date(this.clock);
            const delta = this.playSpeed;
    
            if (direction === 'forward') {
                newTime.setSeconds(newTime.getSeconds() + delta);
            } else {
                newTime.setSeconds(newTime.getSeconds() - delta);
            }
    
            this.clock = newTime;
            this.updateHTML(container);
            onAction('toggleTime', this.clock);
        }, 1000);
    }
    private stopPlaying() {
        if (this.playTimer !== null) {
            clearInterval(this.playTimer);
            this.playTimer = null;
        }
        this.playDirection = null;
    }
    private updateNowButton(container: HTMLElement) {
        const nowBtn = container.querySelector<HTMLImageElement>("#datetime-now");
        if (!nowBtn) return;
        nowBtn.src = this.isNowActive ? now : now_disabled;
    }
    

    bindEvents(container: HTMLElement, onAction: (action: string, payload?: any) => void) {
        this.togglePicker(container);  // 显示时间选择器
        this.bindControlEvents(container, onAction);  // 控制时间选择器加减
        this.toNowDate(container, onAction);  // 切换到当前时间
        this.bindPlayEvents(container, onAction); // 加速播放 & 暂停播放
    }

}
