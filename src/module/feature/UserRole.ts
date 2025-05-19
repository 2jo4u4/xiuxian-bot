import { getLogger } from "@std/log";
import { format, difference } from "../../deps.ts";
import { Role } from "./DataBase.ts";
import type { QuestNode } from "./QuestManager.ts";
import { LevelName, SpiritRootType } from "./Constants.ts";
import { getItemById, ItemDefinition } from "./ItemDefinitions.ts";

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
        return { text: LevelName.渡劫境, priority: Math.pow(10, 20) };
      case this.exp > 51200:
        return { text: LevelName.大乘境, priority: Math.pow(10, 16) };
      case this.exp > 24400:
        return { text: LevelName.合體境, priority: Math.pow(10, 13) };
      case this.exp > 7700:
        return { text: LevelName.煉虛境, priority: Math.pow(10, 10) };
      case this.exp > 1200:
        return { text: LevelName.化神境, priority: Math.pow(10, 7) };
      case this.exp > 700:
        return { text: LevelName.元嬰境, priority: Math.pow(10, 5) };
      case this.exp > 300:
        return { text: LevelName.金丹境, priority: Math.pow(10, 3) };
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
}
