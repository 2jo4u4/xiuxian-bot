import { database, Quest, QuestOptions } from "./DataBase.ts";
import { Role } from "./Role.ts";

export class QuestManager {
  normalQuestMap: Map<string, QuestNode>;
  hardQuestMap: Map<string, QuestNode>;
  constructor() {
    this.normalQuestMap = new Map();
    this.hardQuestMap = new Map();
  }
  assignQuest(role: Role) {
    const node = this.randomQuest();
    role.executeQuest = node;
    return node;
  }

  async injectQuestData() {
    const [normal, hard] = await Promise.all([
      database.getQuestData("normal"),
      database.getQuestData("hard"),
    ]);

    normal.forEach((quest) => {
      this.normalQuestMap.set(quest.id, new QuestNode(quest));
    });
    hard.forEach((quest) => {
      this.hardQuestMap.set(quest.id, new QuestNode(quest));
    });
  }

  private randomQuest(): QuestNode {
    if (Math.random() > 0.7) {
      // hard
    } else {
      // normal
      // const q = Math.ceil(Math.random() * this.normalQuestMap.size);
      // return Array.from(this.normalQuestMap)[q][1];
    }

    const q = Math.ceil(Math.random() * this.normalQuestMap.size) - 1;
    return Array.from(this.normalQuestMap)[q][1];
  }
}

export class QuestNode {
  readonly type: Quest["type"];
  readonly questId: Quest["id"];
  readonly title: Quest["title"];
  readonly desc: Quest["desc"];
  readonly options: Quest["options"];
  anser?: QuestOptions;
  get isAnswered() {
    return this.anser !== undefined;
  }

  constructor(config: Quest) {
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
      const anser = this.options.find((item) => item.ansId === id);
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
