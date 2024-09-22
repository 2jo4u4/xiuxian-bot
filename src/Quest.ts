import { Quest, QuestOptions } from "./DataBase.ts";
import { Role } from "./Role.ts";

export class QuestManager {
  questMap: Map<string, QuestNode>;
  constructor() {
    this.questMap = new Map();
  }
  assignQuest(role: Role) {
    const node = this.randomQuest();
    role.executeQuest = node;
    return node;
  }

  private randomQuest() {
    return new QuestNode({
      type: Math.random() > 0.5 ? "dice" : "multiple",
      id: "q-1",
      title: "測試任務",
      desc: "測試任務",
      options: [
        { ansId: "a-1", desc: "選項一", score: 100 },
        { ansId: "a-2", desc: "選項二", score: 1 },
        { ansId: "a-3", desc: "選項三", score: 10 },
      ],
    });
  }
}

type QuestNodeType = "multiple" | "dice";
export class QuestNode {
  readonly type: QuestNodeType;
  readonly questId: Quest["id"];
  readonly title: string;
  readonly desc: string;
  readonly options: QuestOptions[];
  anser?: QuestOptions;
  get isAnswered() {
    return this.anser !== undefined;
  }

  constructor(config: Quest & { type: QuestNodeType }) {
    const { title, desc, options, id, type } = config;
    this.questId = id;
    this.title = title;
    this.desc = desc;
    this.options = options;
    this.type = type;
  }
  onAnswer(id: QuestOptions["ansId"]): boolean {
    if (this.isAnswered) return false;

    if (this.type === "multiple") {
      const anser = this.options.find(item => item.ansId === id);
      if (anser) {
        this.anser = anser;
      }
    }

    return this.isAnswered;
  }

  onRoll(role: Role): boolean {
    if (this.isAnswered) return false;

    if (this.type === "dice") {
      const rollres = Math.floor(Math.random() * this.options.length);
      this.anser = this.options[rollres];
    }

    return this.isAnswered;
  }
}
