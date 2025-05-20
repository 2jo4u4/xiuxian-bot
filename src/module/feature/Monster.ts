// filepath: src/module/feature/Monster.ts

import { LevelName } from "./Constants.ts";

export interface Monster {
  id: string; // 唯一識別碼
  name: string; // 魔物名稱
  level: LevelName; // 魔物等級，沿用 LevelName
  hp: number; // 血量
  atk: number; // 攻擊力
  def: number; // 防禦力
  skills?: string[]; // 技能（可選）
  description?: string; // 描述（可選）
}

// 範例魔物資料
export const MonsterList: Monster[] = [
  {
    id: "slime",
    name: "史萊姆",
    level: LevelName.練氣境,
    hp: 30,
    atk: 5,
    def: 1,
    description: "最低階的魔物，常見於新手村附近。",
  },
  {
    id: "wolf",
    name: "妖狼",
    level: LevelName.築基境,
    hp: 80,
    atk: 15,
    def: 5,
    description: "兇猛的野獸，擁有一定靈性。",
  },
  {
    id: "golden_crow",
    name: "金烏",
    level: LevelName.金丹境,
    hp: 200,
    atk: 40,
    def: 15,
    skills: ["火焰羽擊"],
    description: "傳說中的靈禽，擁有強大火屬性攻擊。",
  },
];

// 依 id 取得魔物
export function getMonsterById(id: string): Monster | undefined {
  return MonsterList.find((m) => m.id === id);
}
