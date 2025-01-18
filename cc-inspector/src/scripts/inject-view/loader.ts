import { githubMirrorMgr } from "./github";

export class AdItem {
  /**
   * 广告的名字
   */
  name: string = "";
  /**
   * 鼠标悬浮提示
   */
  tip: string = "";
  /**
   * 插件的试用地址
   */
  try: string = "";
  /**
   * 广告的store购买链接
   */
  store: string = "";
  /**
   * 广告的展示时间，单位s
   */
  duration: number = 0;
  /**
   * 广告的有效性
   */
  valid: boolean = true;
  /**
   * 背景图
   */
  img: string = "";
  parse(data: AdItem) {
    this.name = data.name;
    this.store = data.store || "";
    this.try = data.try || "";
    this.tip = data.tip || "";
    this.duration = data.duration || 0;
    this.valid = !!data.valid;
    this.img = data.img || "";
    return this;
  }
}
export class AdData {
  desc: string = "";
  version: string = "";
  /**
   * 是否启用广告
   */
  valid: boolean = false;
  /**
   * 多少分钟不再展示，单位分钟，默认10分钟
   */
  showDuration: number = 10;
  /**
   * 底部广告多少秒滚动一次
   */
  scrollDuration: number = 3;
  data: Array<AdItem> = [];
  parse(data: AdData) {
    this.desc = data.desc;
    this.version = data.version;
    this.valid = !!data.valid;
    this.showDuration = data.showDuration || 10;
    this.scrollDuration = data.scrollDuration || 3;
    if (data.data) {
      data.data.forEach((el) => {
        const item = new AdItem().parse(el);
        if (!item.duration) {
          console.warn(`add failed, ad.duration is ${item.duration}, ${JSON.stringify(item)}`);
          return;
        }
        if (!item.valid) {
          console.warn(`add failed, ad is invalid, ${JSON.stringify(item)}`);
          return;
        }
        this.data.push(item);
      });
    }
  }
}

export async function getAdData(): Promise<AdData | null> {
  const data = await githubMirrorMgr.getData("ad.json");
  if (data) {
    const ad = new AdData();
    ad.parse(data as AdData);
    return ad;
  }
  return null;
}
