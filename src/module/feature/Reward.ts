// filepath: src/module/feature/Reward.ts
// 計算玩家擊敗魔物後的獎勵（經驗、道具、裝備）
import { GamePlayer } from "./GamePlayer.ts";
import { Monster } from "./Monster.ts";
import { ItemList, ItemDefinition } from "./ItemDefinitions.ts";

export interface RewardResult {
  exp: number;
  items: ItemDefinition[];
}

/**
 * 根據玩家與魔物資訊計算獎勵
 * @param player GamePlayer
 * @param monster Monster
 * @returns RewardResult
 */
export function calculateReward(
  player: GamePlayer,
  monster: Monster
): RewardResult {
  // 經驗值：基礎值 + 等級差修正
  const playerLevel = player.level.text;
  const monsterLevel = monster.level;
  let baseExp = 10;
  if (monsterLevel === playerLevel) baseExp = 20;
  else if (monsterLevel > playerLevel) baseExp = 30;
  else if (monsterLevel < playerLevel) baseExp = 5;

  // 掉落道具/裝備：根據魔物設定與稀有度隨機
  const drops: ItemDefinition[] = [];
  if (monster.dropIds && monster.dropIds.length > 0) {
    for (const id of monster.dropIds) {
      const item = ItemList.find((i) => i.id === id);
      if (item && Math.random() < getDropRate(item.rarity)) {
        drops.push(item);
      }
    }
  }

  return {
    exp: baseExp,
    items: drops,
  };
}

function getDropRate(rarity: string): number {
  switch (rarity) {
    case "common":
      return 0.8;
    case "uncommon":
      return 0.5;
    case "rare":
      return 0.2;
    case "epic":
      return 0.05;
    case "legendary":
      return 0.01;
    default:
      return 0.1;
  }
}
