import { UIControlView } from "./UIControlView";
import { defaultConfig } from "../config/defaultConfig";
import { skyStore } from '../store/skyStore'

declare global {
  interface Window {
    unigo_app?: {
      onUnigoCommandReceived: (command: string) => void;
      postMessage: (command: string) => void;
    };
  }
}

export class UIControl {
  private view: UIControlView;
  private commEnabled = false;
  private config: typeof defaultConfig;
  private tonightObjects: [string, number, number][] = [];

  constructor(
    private mainCallback: (action: string, payload?: any) => void,
    config: typeof defaultConfig 
  ) {
    this.config = config;
    this.view = new UIControlView('control-panel', {
      onAction: (action, payload) => this.handleAction(action, payload),
      config: this.config 
    });

    this.initCommunication();
  }

  private initCommunication() {
    this.commEnabled = true;

    if (window.unigo_app) {
      window.unigo_app.onUnigoCommandReceived = (command) => this.handleCommandResponse(command);
    } else {
      console.warn("unigo_app 未定义，通信可能无法进行！");
    }
    console.log('JS通信已初始化');

    this.sendCommand('/getLanguage:');  // 获取语言
    this.sendCommand('/getLatLon:');  // 获取经纬度
  }

  private sendCommand(command: string) {
    console.log('发送到 Flutter:', command);

    if (!this.commEnabled) {
      console.warn('通信未就绪');
      return;
    }

    window.unigo_app?.postMessage(command);
  }

  private handleCommandResponse(command: string) {
    // console.log('收到来自 Flutter 的命令:', command);

    const index = command.indexOf(':');
    if (index === -1) {
      console.warn('命令格式不正确，没有冒号');
      return;
    }

    const fullCommand = command.slice(0, index);
    const cmd = fullCommand.substring(1);
    const content = command.slice(index + 1);

    switch (cmd) {
      case 'tonightObjects':
        this.tonightObjects = JSON.parse(content);
        this.mainCallback('toggleMessier', this.tonightObjects);
        break;
      case 'getLanguage':
        skyStore.setLanguage(JSON.parse(content));
        break;
      case 'getLatLon':
        this.mainCallback('setLocation', JSON.parse(content));
        break;
      default:
        console.warn('未知命令:', cmd);
    }
  }

  private handleAction(action: string, payload: any) {
    console.log(`用户操作: ${action}`, payload);

    switch (action) {
      case 'closePage':
        this.sendCommand(`/closePage:`);
        break;
      case 'toggleMessier':
        console.log(this.config.showMessier)
        this.sendCommand('/tonightObjects:');  
        break;
      case 'toggleTime':
        this.sendCommand(`/${action}:${(payload as Date).toISOString()}`);
        break;
      // case 'setLocation':
      //   this.sendCommand(`/${action}:${JSON.stringify(payload)}`);
      //   break;
      default:
        this.sendCommand(`/${action}:`);
    }

    if (action !== 'toggleMessier') {
      this.mainCallback(action, payload);
    }
  }

  public updateViewIcon(toggleId: string, active: boolean) {
    this.view.updateIcon(toggleId, active);
  }
}
