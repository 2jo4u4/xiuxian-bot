import { getLogger } from "@std/log";
import { format, difference } from "../../deps.ts";
import { Role } from "./DataBase.ts";
import type { QuestNode } from "./QuestManager.ts";

export enum LevelThreshold {
  練氣 = 100,
  築基 = 300,
  金丹 = 700,
  元嬰 = 1200,
  化神 = 7700,
  煉虛 = 24400,
  合體 = 51200,
  大乘 = 100000,
}

export class UserRole {
  readonly userId: bigint;
  readonly guildId: bigint;
  readonly createDate: string;
  private exp: number;
  private training?: string;
  readonly log: ReturnType<typeof getLogger>;
  // 新增屬性
  spiritRoot: string; // 靈根（金/木/水/火/土）
  constitution: string; // 體質
  reputation: number; // 名聲
  resources: number; // 資源

  get duringTraining() {
    return this.training !== undefined;
  }

  executeQuest: QuestNode | null;
  get level() {
    switch (true) {
      case this.exp > LevelThreshold.元嬰:
        return { text: "化神境", priority: Math.pow(10, 7) };
      case this.exp > LevelThreshold.金丹:
        return { text: "元嬰境", priority: Math.pow(10, 5) };
      case this.exp > LevelThreshold.築基:
        return { text: "金丹境", priority: Math.pow(10, 3) };
      case this.exp > LevelThreshold.練氣:
        return { text: "築基境", priority: Math.pow(10, 1) };
      default:
        return { text: "練氣境", priority: 0 };
    }
  }
  constructor(status: {
    userId: bigint;
    guildId: bigint;
    exp?: number;
    date?: string;
    training?: string;
    spiritRoot?: string;
    constitution?: string;
    reputation?: number;
    resources?: number;
  }) {
    const {
      userId,
      guildId,
      exp = 0,
      date,
      training,
      spiritRoot,
      constitution,
      reputation,
      resources,
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
    this.spiritRoot = spiritRoot ?? UserRole.randomSpiritRoot();
    this.constitution = constitution ?? "普通";
    this.reputation = reputation ?? 0;
    this.resources = resources ?? 0;
  }
  // 隨機分配靈根
  static randomSpiritRoot(): string {
    const roots = ["金", "木", "水", "火", "土"];
    return roots[Math.floor(Math.random() * roots.length)];
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
      spiritRoot: this.spiritRoot,
      constitution: this.constitution,
      reputation: this.reputation,
      resources: this.resources,
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
}
