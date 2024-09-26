import { join, existsSync } from "../../deps.ts";

export type RoleJson = Record<
  string,
  { userId: string; exp: number; date: string }
>;
export type QuestJson = Record<string, Quest[]>;
export interface Quest {
  id: string;
  type: "multiple" | "dice";
  title: string;
  desc: string;
  options: QuestOptions[];
}
export interface QuestOptions {
  ansId: string;
  desc: string;
  score: number;
}

class DataBase {
  readonly rootDir: string;
  readonly roleDir: string;
  readonly questDir: string;
  constructor() {
    this.rootDir = Deno.cwd();
    this.roleDir = "roles";
    this.questDir = "quest";
  }

  async getRoleData(guildId: string): Promise<RoleJson> {
    const file = join(this.rootDir, "static", this.roleDir, `${guildId}.json`);
    const isExistFile = existsSync(file);
    if (isExistFile) {
      const decoder = new TextDecoder("utf-8");
      const data = await Deno.readFile(file);
      const result = decoder.decode(data);
      return JSON.parse(result);
    } else {
      await Deno.writeTextFile(file, "{}");
      return {};
    }
  }
  async storeRoleData(guildId: string, json: string) {
    const file = join(this.rootDir, "static", this.roleDir, `${guildId}.json`);
    await Deno.writeTextFile(file, json);
  }
  async getQuestData(difficulty: "normal" | "hard"): Promise<QuestJson> {
    const file = join(
      this.rootDir,
      "static",
      this.questDir,
      `${difficulty}.json`
    );
    const decoder = new TextDecoder("utf-8");
    const data = await Deno.readFile(file);
    const result = decoder.decode(data);
    return JSON.parse(result);
  }
}

export const database = new DataBase();
