import { join } from "../../deps.ts";

export interface DataBaseType {
  role: Record<string, { userId: string; exp: number; date: string }>;
  quest: Record<string, Quest[]>;
}
export interface Quest {
  id: string;
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
  constructor() {
    this.rootDir = Deno.cwd();
  }
  async getDataBase<T extends keyof DataBaseType>(type: T) {
    const file = join(this.rootDir, "static", `${type}.json`);
    const decoder = new TextDecoder("utf-8");
    const data = await Deno.readFile(file);
    const result = decoder.decode(data);
    return JSON.parse(result) as DataBaseType[T];
  }

  async storeRole(json: string) {
    const file = join(this.rootDir, "static", "role.json");

    try {
      await Deno.writeTextFile(file, json);
      return 0;
    } catch (err) {
      console.error(err);
      return 1;
    }
  }
}

export const database = new DataBase();
