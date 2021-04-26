import * as PluginMsg from '../core/plugin-msg'
import Manifest from '../manifest.json'
import {PluginEvent} from "@/devtools/type";
import {connectBackground} from "@/devtools/connectBackground";

export function init() {
  if (chrome && chrome.devtools) {
    // 对应的是Elements面板的边栏
    chrome.devtools.panels.elements.createSidebarPane('Cocos', function (sidebar) {
      sidebar.setObject({some_data: "some data to show!"});
    });

    // 创建devtools-panel
    chrome.devtools.panels.create("Cocos", "icons/48.png", Manifest.devtools_page, (panel: chrome.devtools.panels.ExtensionPanel) => {
        console.log("[CC-Inspector] Dev Panel Created!");
        panel.onShown.addListener((window) => {
          // 面板显示，查询是否是cocos游戏
          console.log("panel show");
          // let sendData = new PluginEvent(PluginMsg.Msg.Support);
          // connectBackground.postMessage(sendData)
        });
        panel.onHidden.addListener(() => {
          // 面板隐藏
          console.log("panel hide");
        });
        panel.onSearch.addListener(function (action, query) {
          // ctrl+f 查找触发
          console.log("panel search!");
        });
      }
    );
  }

}

