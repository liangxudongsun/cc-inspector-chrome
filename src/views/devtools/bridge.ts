import CCP from "cc-plugin/src/ccp/entry-render";
import { TinyEmitter } from "tiny-emitter";
import { debugLog, Msg, Page, PluginEvent } from "../../core/types";
import { Terminal } from "../../scripts/terminal";
import { TestClient, testServer } from "./test/server";
export type BridgeCallback = (data: PluginEvent, sender: chrome.runtime.Port) => void;
if (chrome.devtools) {
  console.log("chrome devtools");
}
class Bridge implements TestClient {
  private emitter = new TinyEmitter();
  /**
   * 和background建立的链接
   */
  private connect: chrome.runtime.Port | null = null;
  private terminal = new Terminal(Page.Devtools);

  private _inited = false;
  public disconnect() {
    if (this.connect) {
      this.connect.disconnect();
      this.connect = null;
      debugger;
    }
  }
  private init() {
    if (this._inited) {
      return;
    }
    this._inited = true;
    if (CCP.Adaptation.Env.isChromeRuntime) {
      // 调试的标签ID
      const id = chrome.devtools.inspectedWindow.tabId;
      this.connect = chrome.runtime.connect({ name: `${Page.Devtools}-${id}` });
      this.connect.onDisconnect.addListener((port: chrome.runtime.Port) => {
        debugLog && console.log(...this.terminal.disconnect(""));
        this.connect = null;
        debugger;
      });

      this.connect.onMessage.addListener((event, sender: chrome.runtime.Port) => {
        const data = PluginEvent.create(event);
        debugLog && console.log(...this.terminal.chunkMessage(data.toChunk()));
        if (data.valid && data.isTargetDevtools()) {
          this.emitter.emit(data.msg, data);
        } else {
          console.log(JSON.stringify(event));
          debugger;
        }
      });
    } else {
      testServer.add(this);
    }
  }
  on(msg: Msg, callback: (data: PluginEvent) => void) {
    this.emitter.on(msg, callback);
  }
  off(msg: Msg, callback: (data: PluginEvent) => void) {
    this.emitter.off(msg, callback);
  }
  recv(event: PluginEvent): void {
    this.emit(event);
  }
  emit(data: PluginEvent) {
    this.emitter.emit(data.msg, data);
  }
  send(msg: Msg, data?: any) {
    this.init();
    if (CCP.Adaptation.Env.isChromeDevtools) {
      if (this.connect) {
        let sendData = new PluginEvent(Page.Devtools, Page.Background, msg, data);
        this.connect.postMessage(sendData);
      } else {
        console.warn(...this.terminal.log("重新和background建立链接"));
        this._inited = false;
        this.init();
        this.send(msg, data);
      }
    } else {
      testServer.recv(msg, data);
    }
  }
}

export const bridge = new Bridge();
