import { database, Quest, QuestOptions } from "./DataBase.ts";
import { UserRole } from "./UserRole.ts";

export class QuestManager {
  questBoard: QuestNode[];
  constructor() {
    this.questBoard = [];
  }
  assignQuest(role: UserRole) {
    const node = this.randomQuest();
    role.executeQuest = node;
    return node;
  }

  private randomQuest(): QuestNode {
    const q = Math.ceil(Math.random() * this.questBoard.length) - 1;
    const node = this.questBoard[q];
    return node;
  }

  injectQuest() {
    const questBoard = database.readQuestBoard();
    questBoard.quest.forEach((quest) => {
      this.questBoard.push(new QuestNode(quest));
    });
  }

  storeQuest() {
    database.storeQuestBoard(this.questBoard.map((node) => node.toQuest()));
  }
}

export class QuestNode {
  readonly id: Quest["id"];
  readonly type: Quest["type"];
  readonly questId: Quest["questId"];
  readonly title: Quest["title"];
  readonly desc: Quest["desc"];
  readonly options: Quest["options"];
  anser?: QuestOptions;
  get isAnswered() {
    return this.anser !== undefined;
  }
  constructor(config: Quest) {
    const { title, desc, options, questId, type, id } = config;
    this.questId = questId;
    this.title = title;
    this.desc = desc;
    this.options = options;
    this.type = type;
    this.id = id;
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
  onRoll(role: UserRole): boolean {
    if (this.isAnswered) return false;

    if (this.type === "dice") {
      const rollres = Math.floor(Math.random() * this.options.length);
      this.anser = this.options[rollres];
    }

    return this.isAnswered;
  }
  toQuest(): Quest {
    return {
      id: this.id,
      questId: this.questId,
      type: this.type,
      title: this.title,
      desc: this.desc,
      options: this.options,
    };
  }
}
