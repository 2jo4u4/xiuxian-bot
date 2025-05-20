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

// 其他可集中管理的常數、描述、字串等
