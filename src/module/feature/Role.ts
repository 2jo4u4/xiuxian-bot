import type { QuestNode } from "./Quest.ts";

export enum LevelThreshold {
  練氣 = 100,
  築基 = 300,
  金丹 = 700,
  元嬰 = 1200,
}

export class Role {
  readonly userId: bigint;
  readonly createDate: string;
  private exp: number;

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
  constructor(status: { userId: bigint; exp?: number; date?: string }) {
    const { userId, exp = 0, date } = status;
    this.userId = userId;
    this.exp = exp;
    this.createDate = date ?? new Date().toDateString();
    this.executeQuest = null;
  }

  gainExp(exp: number) {
    this.exp += exp;
    this.executeQuest = null;
  }

  toJSON() {
    return {
      userId: this.userId.toString(),
      exp: this.exp,
      date: this.createDate,
    };
  }
}
