import { getLogger } from "@std/log";
import { format, difference } from "../../deps.ts";
import { Role } from "./DataBase.ts";
import type { QuestNode } from "./QuestManager.ts";

export enum LevelThreshold {
  練氣 = 100,
  築基 = 300,
  金丹 = 700,
  元嬰 = 1200,
}

export class UserRole {
  readonly userId: bigint;
  readonly guildId: bigint;
  readonly createDate: string;
  private exp: number;
  private training?: string;
  readonly log: ReturnType<typeof getLogger>;

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
  }) {
    const { userId, guildId, exp = 0, date } = status;
    this.log = getLogger("default");
    this.userId = userId;
    this.guildId = guildId;
    this.exp = exp;
    this.createDate = format(
      new Date(date ?? new Date()),
      "yyyy-MM-dd HH:mm:ss"
    );
    this.executeQuest = null;
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
    };
  }

  starTraining() {
    this.training = format(new Date(), "yyyy-MM-dd HH:mm:ss");
  }

  overTraining() {
    if (this.training !== undefined) {
      const hours = difference(new Date(this.training), new Date(), {
        units: ["hours"],
      }).hours!;
      this.gainExp(hours * 5);
    }
  }
}
