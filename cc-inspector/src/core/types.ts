import { Chunk } from "../scripts/terminal";
import { FrameDetails, Info, NodeInfoData, ObjectData, ObjectItemRequestData, TreeData } from "../views/devtools/data";

export enum Page {
  None = "None",
  Inject = "Inject",
  Devtools = "Devtools",
  Background = "Background",
  Content = "Content",
  Popup = "Popup",
  Options = "Options",
}

// #region 定义接受发送的数据声明，方便定位
export interface RequestTreeInfoData {
  /**
   * 当前正在使用的frameID
   */
  frameID: number;
}
export type ResponseTreeInfoData = TreeData;

export interface RequestNodeInfoData {
  /**
   * 节点的UUID
   */
  uuid: string;
}
export type ResponseNodeInfoData = NodeInfoData;

export interface RequestSupportData {}
export interface ResponseSupportData {
  /**
   * 是否支持
   */
  support: boolean;
  /**
   * 消息
   */
  msg: string;
}

export type ResponseUpdateFramesData = FrameDetails[];

export interface RequestUseFrameData {
  id: number;
}
export type RequestSetPropertyData = Info;
export type ResponseSetPropertyData = Info;
export type RequestLogData = string[];
export type RequestObjectData = ObjectData;
export type ResponseObjectData = ObjectItemRequestData;
export enum Msg {
  None = "None",
  /**
   * 具体的节点信息
   */
  RequestNodeInfo = "request-node-info",
  ResponseNodeInfo = "response-node-info",
  /**
   * 节点树信息
   */
  RequstTreeInfo = "request-tree-info",
  ResponseTreeInfo = "response-tree-info",
  /**
   * 游戏支持信息
   */
  RequestSupport = "request-support",
  ResponseSupport = "response-support",

  ResponseMemoryInfo = "response-memory-info",
  MemoryInfo = "memory-info",
  /**
   * 当前页面信息
   */
  TabsInfo = "tabs_info",
  /**
   * 获取页面ID
   */
  GetTabID = "GetTabID",
  /**
   * 更新页面的frame
   */
  ResponseUpdateFrames = "response-update-frames",
  RequestUseFrame = "request-use-frame",

  RequestObjectItemData = "request-object-item-data",
  ResponseObjectItemData = "response-object-item-data",

  RequestLogData = "request-log-data",

  RequestSetProperty = "request-set-property",
  ResponseSetProperty = "update-property",
}

export class PluginEvent {
  public static FLAG = "cc-inspector";
  /**
   * 增加一个消息的标记位，方便知道是自己插件的消息
   */
  flag: string = PluginEvent.FLAG;
  /**
   * 消息是否有效
   */
  valid: boolean = false;
  /**
   * 消息的类型
   */
  msg: Msg | null = null;
  /**
   * 携带的数据
   */
  data: any = null;

  /**
   * 事件发送的源头
   */
  source: Page | null = null;
  /**
   * 事件要发送的目标
   */
  target: Page | null = null;
  isTargetDevtools() {
    return this.target === Page.Devtools;
  }
  isTargetBackground() {
    return this.target === Page.Background;
  }
  isTargetContent() {
    return this.target === Page.Content;
  }
  /**
   * 将addListener监听的数据转换为类
   */
  static create(data: any): PluginEvent {
    let obj = data;
    if (typeof data === "string") {
      obj = JSON.stringify(data);
    } else if (typeof data === "object") {
      obj = data;
    } else {
      debugger;
    }

    const ret = new PluginEvent(Page.None, Page.None, Msg.None, null);
    if (obj.flag !== PluginEvent.FLAG) {
      ret.valid = false;
    } else {
      const cls = data as PluginEvent;
      ret.source = cls.source;
      ret.target = cls.target;
      ret.msg = cls.msg;
      ret.data = cls.data;
      ret.valid = true;
    }
    return ret;
  }
  check(source: Page, target: Page) {
    return source && target && this.source === source && this.target === target;
  }

  reset(source: Page | null, target: Page | null) {
    if (source && target) {
      this.source = source;
      this.target = target;
    }
  }

  /**
   *
   */
  static finish(event: PluginEvent) {
    event.source = event.target = null;
  }
  toChunk(): Chunk[] {
    return [new Chunk(new Date().toLocaleString()).color("white").background("black").padding("0 4px"), new Chunk(this.source).color("white").background("red").padding("0 4px").margin("0 0 0 5px"), new Chunk("=>").color("black").background("yellow").bold(), new Chunk(this.target, false).color("white").background("green").padding("0 4px"), new Chunk(this.msg, true).color("white").background("black").margin("0 0 0 5px").padding("0 6px"), new Chunk(JSON.stringify(this.data))];
  }
  constructor(source: Page, target: Page, msg: Msg, data?: any) {
    if (PageInclude(target)) {
      this.source = source;
      this.target = target;
      this.msg = msg;
      this.data = data;
    } else {
      console.warn(`无效的target: ${target}`);
    }
  }
}

function inEnum(enumValues: any, value: Page | Msg) {
  for (let key in enumValues) {
    if (enumValues.hasOwnProperty(key)) {
      //@ts-ignore
      let itemEnum = enumValues[key] as string;
      if (itemEnum === value) {
        return true;
      }
    }
  }
  return false;
}

export function PageInclude(page: Page) {
  return inEnum(Page, page);
}

export function MsgInclude(msg: Msg) {
  return inEnum(Msg, msg);
}
