import { getLogger } from "@std/log";
import { format, difference } from "../../deps.ts";
import { Role } from "./DataBase.ts";
import type { QuestNode } from "./QuestManager.ts";
import { LevelName, SpiritRootType } from "./Constants.ts";
import {
  getItemById,
  getItemByNameOrId,
  ItemDefinition,
} from "./ItemDefinitions.ts";

export class UserRole {
  readonly userId: bigint;
  readonly guildId: bigint;
  readonly createDate: string;
  private exp: number;
  private training?: string;
  readonly log: ReturnType<typeof getLogger>;
  // 新增屬性
  spiritRoots: SpiritRootType[]; // 支援複數靈根
  reputation: number; // 名聲
  resources: number; // 靈石數量
  backpack: string[]; // 背包，存放道具名稱
  equipment: Record<string, string | null>; // 裝備欄，key為部位如'weapon','armor'等，value為裝備名稱

  get duringTraining() {
    return this.training !== undefined;
  }

  executeQuest: QuestNode | null;
  get level() {
    switch (true) {
      case this.exp > 100000:
        return { text: LevelName.渡劫境, priority: Math.pow(10, 14) };
      case this.exp > 51200:
        return { text: LevelName.大乘境, priority: Math.pow(10, 11) };
      case this.exp > 24400:
        return { text: LevelName.合體境, priority: Math.pow(10, 9) };
      case this.exp > 7700:
        return { text: LevelName.煉虛境, priority: Math.pow(10, 7) };
      case this.exp > 1200:
        return { text: LevelName.化神境, priority: Math.pow(10, 5) };
      case this.exp > 700:
        return { text: LevelName.元嬰境, priority: Math.pow(10, 3) };
      case this.exp > 300:
        return { text: LevelName.金丹境, priority: Math.pow(10, 2) };
      case this.exp > 100:
        return { text: LevelName.築基境, priority: Math.pow(10, 1) };
      default:
        return { text: LevelName.練氣境, priority: 0 };
    }
  }
  constructor(status: {
    userId: bigint;
    guildId: bigint;
    exp?: number;
    date?: string;
    training?: string;
    spiritRoots?: SpiritRootType[]; // 支援複數靈根
    reputation?: number; // 名聲
    resources?: number; // 靈石數量
    backpack?: string[]; // 背包，存放道具名稱
    equipment?: Record<string, string | null>; // 裝備欄，key為部位如'weapon','armor'等，value為裝備名稱
  }) {
    const {
      userId,
      guildId,
      exp = 0,
      date,
      training,
      spiritRoots,
      reputation,
      resources,
      backpack,
      equipment,
    } = status;
    this.log = getLogger("default");
    this.userId = userId;
    this.guildId = guildId;
    this.exp = exp;
    this.createDate = format(
      new Date(date ?? new Date()),
      "yyyy-MM-dd HH:mm:ss"
    );
    this.executeQuest = null;
    this.training = training;
    // 新增屬性初始化
    this.spiritRoots = spiritRoots ?? UserRole.randomSpiritRoots();
    this.reputation = reputation ?? 0;
    this.resources = resources ?? 0;
    this.backpack = backpack ?? [];
    this.equipment = equipment ?? UserRole.defaultEquipment();
  }
  // 隨機分配複數靈根
  static randomSpiritRoots(): SpiritRootType[] {
    const allRoots = [
      SpiritRootType.金靈根,
      SpiritRootType.木靈根,
      SpiritRootType.水靈根,
      SpiritRootType.火靈根,
      SpiritRootType.土靈根,
    ];
    // 隨機決定有幾種靈根（1~5）
    const count = Math.floor(Math.random() * 5) + 1;
    // 隨機選出 count 個不重複的靈根
    return allRoots.sort(() => 0.5 - Math.random()).slice(0, count);
  }

  // 預設裝備欄
  static defaultEquipment(): Record<string, string | null> {
    return {
      weapon: null,
      armor: null,
      ring: null,
      necklace: null,
    };
  }

  gainExp(exp: number) {
    this.exp += exp;
    this.executeQuest = null;
  }

  toRole(): Omit<Role, "id"> {
    return {
      userId: this.userId.toString(),
      guildId: this.guildId.toString(),
      exp: this.exp,
      date: this.createDate,
      training: this.training,
      spiritRoots: this.spiritRoots.map((root) => root as number),
      reputation: this.reputation,
      resources: this.resources,
      backpack: this.backpack,
      equipment: this.equipment,
    };
  }

  starTraining() {
    this.training = format(new Date(), "yyyy-MM-dd HH:mm:ss");
  }

  overTraining() {
    const hours = this.sofarTraning();
    this.gainExp(hours * 5);
    this.training = undefined;
    return hours;
  }

  sofarTraning() {
    if (this.training !== undefined) {
      return difference(new Date(this.training), new Date(), {
        units: ["hours"],
      }).hours!;
    } else {
      return 0;
    }
  }

  // 取得背包所有物品詳細資料
  getBackpackItems(): ItemDefinition[] {
    return this.backpack
      .map((id) => getItemById(id))
      .filter(Boolean) as ItemDefinition[];
  }

  // 取得裝備詳細資料（依部位）
  getEquipmentDetails(): Record<string, ItemDefinition | null> {
    const details: Record<string, ItemDefinition | null> = {};
    for (const slot of Object.keys(this.equipment)) {
      const id = this.equipment[slot];
      details[slot] = id ? getItemById(id) ?? null : null;
    }
    return details;
  }

  /**
   * 使用背包中的道具（消耗品）
   * @param itemIdOrName 道具ID或名稱
   * @returns { success: boolean, message: string }
   */
  useItem(itemIdOrName: string): { success: boolean; message: string } {
    // 支援名稱或ID
    const item = getItemByNameOrId(itemIdOrName);
    if (!item) return { success: false, message: "道具不存在" };
    const idx = this.backpack.indexOf(item.id);
    if (idx === -1) return { success: false, message: "背包中沒有此道具" };
    if (item.type !== "consumable")
      return { success: false, message: "此道具不可直接使用" };
    // 實際效果可根據 itemId 擴充
    let effectMsg = "";
    switch (item.id) {
      case "elixir_qi":
        this.resources += 10;
        effectMsg = "你服用了回氣丹，靈石+10。";
        break;
      case "elixir_heal":
        this.resources += 30;
        effectMsg = "你服用了小還丹，靈石+30。";
        break;
      default:
        effectMsg = `你使用了${item.name}。`;
    }
    // 移除道具
    this.backpack.splice(idx, 1);
    return { success: true, message: effectMsg };
  }

  /**
   * 裝備背包中的裝備/法寶（支援名稱或ID）
   * @param itemIdOrName 道具ID或名稱
   * @returns { success: boolean, message: string }
   */
  equipItem(itemIdOrName: string): { success: boolean; message: string } {
    // 支援名稱或ID
    const item = getItemByNameOrId(itemIdOrName);
    if (!item) return { success: false, message: "裝備不存在" };
    const idx = this.backpack.indexOf(item.id);
    if (idx === -1) return { success: false, message: "背包中沒有此裝備" };
    if (item.type !== "equipment" && item.type !== "artifact")
      return { success: false, message: "此物品不可裝備" };
    if (!item.slot) return { success: false, message: "裝備缺少部位資訊" };
    // 若該部位已有裝備，先卸下
    if (this.equipment[item.slot]) {
      // 將原裝備放回背包
      this.backpack.push(this.equipment[item.slot]!);
    }
    // 裝備新物品
    this.equipment[item.slot] = item.id;
    // 從背包移除
    this.backpack.splice(idx, 1);
    return { success: true, message: `你裝備了${item.name}（${item.slot}）。` };
  }

  /**
   * 卸下裝備
   * @param slot 部位名稱
   * @returns { success: boolean, message: string }
   */
  unequip(slot: string): { success: boolean; message: string } {
    const itemId = this.equipment[slot];
    if (!itemId) return { success: false, message: "該部位沒有裝備" };
    this.backpack.push(itemId);
    this.equipment[slot] = null;
    const item = getItemById(itemId);
    return { success: true, message: `你卸下了${item ? item.name : itemId}。` };
  }
}
