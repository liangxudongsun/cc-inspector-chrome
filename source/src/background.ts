import * as  PluginMsg from "./core/plugin-msg"

let Devtools: chrome.runtime.Port | null = null;
let DevtoolsPanel: chrome.runtime.Port | null = null;
let Content: chrome.runtime.Port | null = null;
console.log('on background')

chrome.runtime.onConnect.addListener((port: chrome.runtime.Port) => {
  console.log(`%c[Connect] ${port.name}`, "color:blue;");
  port.onMessage.addListener((data: any, sender: any) => {
    console.log(`%c[Connect-Message] ${sender.name}\n${JSON.stringify(data)}`, "color:green;")
    sender.postMessage(data);
    if (data.msg === PluginMsg.Msg.UrlChange) {
      if (sender.name === PluginMsg.Page.DevToolsPanel) {
        Content && Content.postMessage({msg: PluginMsg.Msg.UrlChange, data: {}})
      }
    }
    // chrome.tabs.executeScript(message.tabId, {code: message.content});
    // port.postMessage(message);
  });
  port.onDisconnect.addListener(function (port: chrome.runtime.Port) {
    console.log(`%c[Connect-Dis] ${port.name}`, "color:red");
    // port.onMessage.removeListener(longConnectionLink);
    if (port.name === PluginMsg.Page.Devtools) {
      Devtools = null;
    } else if (port.name === PluginMsg.Page.Content) {
      Content = null;
    } else if (port.name === PluginMsg.Page.DevToolsPanel) {
      DevtoolsPanel = null;
    }
  });

  // 缓存
  if (port.name === PluginMsg.Page.Devtools) {
    Devtools = port;
  } else if (port.name === PluginMsg.Page.Content) {
    Content = port;
  } else if (port.name === PluginMsg.Page.DevToolsPanel) {
    DevtoolsPanel = port;
  }
});

// background.js 更像是一个主进程,负责整个插件的调度,生命周期和chrome保持一致
//  监听来自content.js发来的事件
chrome.runtime.onMessage.addListener((request: any, sender: any, sendResponse: any) => {
    console.log(`%c[Message]url:${sender.url}]\n${JSON.stringify(request)}`, 'color:green')
    sendResponse && sendResponse(request);
    if (request.msg === PluginMsg.Msg.Support ||
      request.msg === PluginMsg.Msg.ListInfo ||
      request.msg === PluginMsg.Msg.NodeInfo) {
      // 将消息转发到devtools
      Devtools && Devtools.postMessage(request);
    }
  }
);

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status === "complete") {
    // 加载新的url
    if (Content) {
      let data = {msg: PluginMsg.Msg.UrlChange, data: {url: tab.favIconUrl}}
      Content.postMessage(data);
    }
  }
})

function createPluginMenus() {
  const menus = [];

  let parent = chrome.contextMenus.create({id: "parent", title: "CC-Inspector"});
  chrome.contextMenus.create({
    id: "test",
    title: "测试右键菜单",
    parentId: parent,
    // 上下文环境，可选：["all", "page", "frame", "selection", "link", "editable", "image", "video", "audio"]，默认page
    contexts: ["page"],
  });
  chrome.contextMenus.create({
    id: "notify",
    parentId: parent,
    title: "通知"
  })

  chrome.contextMenus.onClicked.addListener(function (info, tab) {
    if (info.menuItemId === "test") {
      alert("您点击了右键菜单！");
    } else if (info.menuItemId === "notify") {
      chrome.notifications.create("null", {
        type: "basic",
        iconUrl: "icons/48.png",
        title: "通知",
        message: "测试通知",
      })
    }
  })
}

chrome.contextMenus.removeAll(function () {
  createPluginMenus();
});

