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
  搜尋敵人, // 新增
  戰鬥, // 新增
  逃跑, // 新增
  搜尋並戰鬥, // 新增：整合搜尋敵人與戰鬥
  story, // 故事模式主指令
  storyPick, // 選擇故事選項
  storyState, // 查詢故事進度
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
  搜尋敵人: UserCommand.搜尋敵人,
  search: UserCommand.搜尋敵人,
  戰鬥: UserCommand.戰鬥,
  fight: UserCommand.戰鬥,
  逃跑: UserCommand.逃跑,
  flee: UserCommand.逃跑,
  搜尋並戰鬥: UserCommand.搜尋並戰鬥,
  searchfight: UserCommand.搜尋並戰鬥,
  searchAndFight: UserCommand.搜尋並戰鬥,
  story: UserCommand.story,
  故事模式: UserCommand.story,
  storypick: UserCommand.storyPick,
  故事選擇: UserCommand.storyPick,
  storystate: UserCommand.storyState,
  故事進度: UserCommand.storyState,
};

// 境界對應經驗值表
export const LevelExpTable: Record<LevelName, number> = {
  [LevelName.練氣境]: 0, // + 100
  [LevelName.築基境]: 100, // + 300
  [LevelName.金丹境]: 400, // + 600
  [LevelName.元嬰境]: 1000, // + 1000
  [LevelName.化神境]: 2000, // + 2000
  [LevelName.煉虛境]: 4000, // + 4000
  [LevelName.合體境]: 8000, // + 8000
  [LevelName.大乘境]: 16000, // + 16000
  [LevelName.渡劫境]: 32000,
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
  let ratio = 1;
  switch (level) {
    case LevelName.練氣境:
      ratio = 1;
      break;
    case LevelName.築基境:
      ratio = 1.5;
      break;
    case LevelName.金丹境:
      ratio = 3.5;
      break;
    case LevelName.元嬰境:
      ratio = 5;
      break;
    case LevelName.化神境:
      ratio = 8;
      break;
    case LevelName.煉虛境:
      ratio = 16;
      break;
    case LevelName.合體境:
      ratio = 24;
      break;
    case LevelName.大乘境:
      ratio = 32;
      break;
    case LevelName.渡劫境:
      ratio = 48;
      break;
    default:
      ratio = 1;
      break;
  }

  return {
    maxHp: 100 * ratio,
    maxMp: 30 * ratio,
    atk: 10 * ratio,
    def: 5 * ratio,
  };
}
