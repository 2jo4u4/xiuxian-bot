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
  dropIds?: string[]; // 新增：掉落物品 id 陣列
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
    dropIds: ["elixir_qi", "spirit_stone"],
  },
  {
    id: "wolf",
    name: "妖狼",
    level: LevelName.築基境,
    hp: 80,
    atk: 15,
    def: 5,
    description: "兇猛的野獸，擁有一定靈性。",
    dropIds: ["elixir_heal", "armor_ling", "spirit_wood"],
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
    dropIds: ["blade_lieyan", "artifact_hulu", "talisman_tp"],
  },
  {
    id: "snake_spirit",
    name: "蛇妖",
    level: LevelName.築基境,
    hp: 120,
    atk: 18,
    def: 8,
    skills: ["毒液噴射"],
    description: "潛伏於沼澤的蛇妖，擅長毒攻。",
    dropIds: ["elixir_heal", "spirit_wood", "ring_ling"],
  },
  {
    id: "stone_golem",
    name: "石像魔",
    level: LevelName.金丹境,
    hp: 300,
    atk: 35,
    def: 30,
    description: "由靈力凝聚的石像，防禦極高。",
    dropIds: ["armor_ling", "shield_xuantie", "spirit_stone"],
  },
  {
    id: "fire_phoenix",
    name: "火鳳凰",
    level: LevelName.元嬰境,
    hp: 500,
    atk: 70,
    def: 25,
    skills: ["鳳羽焚天", "烈焰重生"],
    description: "浴火重生的神鳥，攻擊極為兇猛。",
    dropIds: ["artifact_hulu", "artifact_flying_sword", "talisman_tp"],
  },
  {
    id: "ancient_dragon",
    name: "上古龍獸",
    level: LevelName.化神境,
    hp: 1200,
    atk: 150,
    def: 60,
    skills: ["龍息", "龍威震懾"],
    description: "傳說中的上古巨龍，極為稀有且危險。",
    dropIds: ["artifact_bag", "artifact_pearl", "blade_lieyan"],
  },
  {
    id: "demon_lord",
    name: "魔尊",
    level: LevelName.大乘境,
    hp: 3000,
    atk: 300,
    def: 120,
    skills: ["魔焰滅世", "黑暗支配"],
    description: "統御萬魔的魔界霸主，僅有最強修士能挑戰。",
    dropIds: ["artifact_hulu", "artifact_bag", "artifact_pearl", "talisman_tp"],
  },
];

// 依 id 取得魔物
export function getMonsterById(id: string): Monster | undefined {
  return MonsterList.find((m) => m.id === id);
}

/**
 * 根據玩家等級加權隨機挑選魔物
 * @param playerLevel LevelName
 * @returns Monster
 */
export function getRandomMonsterByPlayerLevel(playerLevel: LevelName): Monster {
  // 權重規則：同級 60%，低一級 20%，高一級 20%，其他極低
  const weights: number[] = MonsterList.map((m) => {
    if (m.level === playerLevel) return 60;
    const levels = Object.values(LevelName);
    const idx = levels.indexOf(playerLevel);
    const mIdx = levels.indexOf(m.level);
    if (mIdx === idx - 1) return 20;
    if (mIdx === idx + 1) return 20;
    return 1;
  });
  // 加權隨機
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < MonsterList.length; i++) {
    if (r < weights[i]) return MonsterList[i];
    r -= weights[i];
  }
  // 保底
  return MonsterList[0];
}
