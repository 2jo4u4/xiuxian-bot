// filepath: src/module/feature/Constants.ts

// 角色境界（Level）
export enum LevelName {
  練氣境 = "練氣境",
  築基境 = "築基境",
  金丹境 = "金丹境",
  元嬰境 = "元嬰境",
  化神境 = "化神境",
  煉虛境 = "煉虛境",
  合體境 = "合體境",
  大乘境 = "大乘境",
  渡劫境 = "渡劫境",
}

// 靈根類型
export enum SpiritRootType {
  金靈根,
  木靈根,
  水靈根,
  火靈根,
  土靈根,
}

// 指令相關
export enum UserCommand {
  幫助 = 1,
  建立角色,
  狀態,
  接受任務,
  丟骰子,
  回覆任務,
  取消任務,
  閉關,
  閉關結束,
  使用道具, // + item name
  裝備, // + item name
  卸下裝備, // + slot("weapon" | "armor" | "ring" | "necklace")
  查看背包,
  保存所有使用者 = 998,
  關閉伺服器 = 999,
}

export const CommandAlais: Record<string, UserCommand> = {
  幫助: UserCommand.幫助,
  help: UserCommand.幫助,
  建立角色: UserCommand.建立角色,
  create: UserCommand.建立角色,
  狀態: UserCommand.狀態,
  status: UserCommand.狀態,
  接受任務: UserCommand.接受任務,
  quest: UserCommand.接受任務,
  回覆任務: UserCommand.回覆任務,
  retuen: UserCommand.回覆任務,
  取消任務: UserCommand.取消任務,
  cancel: UserCommand.取消任務,
  丟骰子: UserCommand.丟骰子,
  roll: UserCommand.丟骰子,
  閉關: UserCommand.閉關,
  training: UserCommand.閉關,
  閉關結束: UserCommand.閉關結束,
  trainingQuit: UserCommand.閉關結束,
  使用: UserCommand.使用道具,
  use: UserCommand.使用道具,
  裝備: UserCommand.裝備,
  equip: UserCommand.裝備,
  卸下: UserCommand.卸下裝備,
  unequip: UserCommand.卸下裝備,
  查看背包: UserCommand.查看背包,
  backpack: UserCommand.查看背包,
  bag: UserCommand.查看背包,
};

// 境界對應經驗值表
export const LevelExpTable: Record<LevelName, number> = {
  [LevelName.練氣境]: 0,
  [LevelName.築基境]: 100,
  [LevelName.金丹境]: 300,
  [LevelName.元嬰境]: 700,
  [LevelName.化神境]: 1200,
  [LevelName.煉虛境]: 7700,
  [LevelName.合體境]: 24400,
  [LevelName.大乘境]: 51200,
  [LevelName.渡劫境]: 100000,
};

export function getLevelByExp(exp: number): LevelName {
  // 依經驗值由高到低找出對應境界
  const levels = Object.entries(LevelExpTable) as [LevelName, number][];
  levels.sort((a, b) => b[1] - a[1]);
  for (const [level, threshold] of levels) {
    if (exp >= threshold) return level;
  }
  return LevelName.練氣境;
}

// 根據境界取得基礎屬性
export function getBaseStatsByLevel(level: LevelName): {
  maxHp: number;
  maxMp: number;
  atk: number;
  def: number;
} {
  switch (level) {
    case LevelName.練氣境:
      return { maxHp: 100, maxMp: 30, atk: 10, def: 5 };
    case LevelName.築基境:
      return { maxHp: 200, maxMp: 60, atk: 20, def: 10 };
    case LevelName.金丹境:
      return { maxHp: 400, maxMp: 120, atk: 40, def: 20 };
    case LevelName.元嬰境:
      return { maxHp: 800, maxMp: 240, atk: 80, def: 40 };
    case LevelName.化神境:
      return { maxHp: 1600, maxMp: 480, atk: 160, def: 80 };
    case LevelName.煉虛境:
      return { maxHp: 3200, maxMp: 960, atk: 320, def: 160 };
    case LevelName.合體境:
      return { maxHp: 6400, maxMp: 1920, atk: 640, def: 320 };
    case LevelName.大乘境:
      return { maxHp: 12800, maxMp: 3840, atk: 1280, def: 640 };
    case LevelName.渡劫境:
      return { maxHp: 25600, maxMp: 7680, atk: 2560, def: 1280 };
    default:
      return { maxHp: 100, maxMp: 30, atk: 10, def: 5 };
  }
}
