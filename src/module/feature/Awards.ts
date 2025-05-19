import { UserRole } from "./UserRole.ts";
import { LevelName, SpiritRootType } from "./Constants.ts";

// 境界對應的基礎獎勵倍率
const LEVEL_AWARD_MULTIPLIER: Record<string, number> = {
  [LevelName.練氣境]: 1,
  [LevelName.築基境]: 1.2,
  [LevelName.金丹境]: 1.5,
  [LevelName.元嬰境]: 2,
  [LevelName.化神境]: 3,
  [LevelName.煉虛境]: 4,
  [LevelName.合體境]: 5,
  [LevelName.大乘境]: 7,
  [LevelName.渡劫境]: 10,
};

// 靈根數量對應的加成
function spiritRootsBonus(roots: SpiritRootType[]): number {
  // 單靈根加成最高，複數靈根加成遞減
  switch (roots.length) {
    case 1:
      return 1.5; // 天靈根
    case 2:
      return 1.2;
    case 3:
      return 1.0;
    case 4:
      return 0.8;
    case 5:
      return 0.6; // 五靈雜根
    default:
      return 1.0;
  }
}

// 計算玩家獎勵（如經驗、靈石等）
export function calculateAward(role: UserRole, base: number): number {
  const levelName = role.level.text;
  const levelMultiplier = LEVEL_AWARD_MULTIPLIER[levelName] ?? 1;
  const rootBonus = spiritRootsBonus(role.spiritRoots);
  // 綜合倍率
  const total = base * levelMultiplier * rootBonus;
  return Math.round(total);
}

// 可擴充：根據不同任務、事件、特殊靈根等再加額外條件
