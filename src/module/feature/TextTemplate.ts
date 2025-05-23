import { difference } from "../../deps.ts";
import { CommandCtrl } from "./UserCommand.ts";
import { UserCommand } from "./Constants.ts";
import type { GamePlayer } from "./GamePlayer.ts";
import type { ItemDefinition } from "./ItemDefinitions.ts";

export const Template = {
  sayHi() {
    const str = "天道之大，欲行逆天，亦可獨行，也可抱團。" + "\n" + this.help();
    return str;
  },
  help() {
    // 指令說明
    return [
      "【修仙 Bot 指令說明】",
      "- %修仙 幫助/help：顯示所有指令說明",
      "- %修仙 建立角色/create：創建你的修仙角色",
      "- %修仙 狀態/status：查看當前角色狀態",
      "- %修仙 接受任務/quest：接受一個隨機任務",
      "- %修仙 取消任務/cancel：放棄當前任務",
      "- %修仙 閉關/training：開始閉關修練",
      "- %修仙 閉關結束/trainingQuit：結束閉關並獲得經驗",
      "- %修仙 使用/use <道具ID或名稱>：使用背包中的道具",
      "- %修仙 裝備/equip <裝備ID或名稱>：裝備背包中的裝備/法寶",
      "- %修仙 卸下/unequip <部位>：卸下指定部位的裝備",
      "- %修仙 查看背包/backpack/bag：查看背包與裝備欄",
      "- %修仙 搜尋敵人/search：隨機遭遇一隻魔物",
      "- %修仙 戰鬥/fight：與遭遇的魔物戰鬥",
      "- %修仙 逃跑/flee：逃離當前遭遇的魔物",
      "- %修仙 搜尋並戰鬥/searchfight/searchAndFight：自動搜尋並立即戰鬥",
      "- %修仙 故事模式/story：開始互動式修仙劇情（可重複體驗）",
      "- %修仙 故事選擇/storypick <編號>：選擇故事選項，推進劇情",
      "- %修仙 故事進度/storystate：查詢目前故事進度",
    ].join("\n");
  },
  noHasRole() {
    const str =
      "請先使用指令" +
      "`" +
      CommandCtrl.prefix +
      CommandCtrl.keyword +
      " " +
      UserCommand.建立角色 +
      "`" +
      "來建立角色。";

    return str;
  },
  createRole(userName: string) {
    return `天道之下，又逢一位欲逆天改命之人。${userName}。`;
  },
  status(userName: string, role: GamePlayer) {
    let str = "```md\n";
    str += userName + " 的修仙之路\n";
    str += "> 目前境界 " + role.level.text + "\n";
    // 顯示複數靈根
    const rootNames = (role.spiritRoots || [])
      .map((r) => {
        switch (r) {
          case 0:
            return "金";
          case 1:
            return "木";
          case 2:
            return "水";
          case 3:
            return "火";
          case 4:
            return "土";
          default:
            return "未知";
        }
      })
      .join("");
    str += "> 血量：" + role.hp + "\n";
    str += "> 法力：" + role.mp + "\n";
    str += "> 靈根：" + rootNames + "靈根\n";
    str += "> 名聲：" + role.reputation + "\n";
    str += "> 資源：" + role.resources + "\n";
    str +=
      "> 總共修行了 " +
      difference(new Date(role.createDate), new Date(), { units: ["days"] })
        .days! +
      " 天\n";
    if (role.duringTraining) {
      str += "目前正在閉關中\n";
    }
    str += "```";
    return str;
  },
  questDesc(title: string, desc: string, userName?: string) {
    const prefix = userName ? "已指派任務給" + userName + "\n" : "";
    const str = prefix + "```md\n" + title + "\n\n" + desc + "\n```";
    return str;
  },
  chooseQuestOption(questTitle: string, questDesc: string, optionDesc: string) {
    const str =
      this.questDesc(questTitle, questDesc) +
      "\n已選擇了" +
      "`" +
      optionDesc +
      "`" +
      "。";
    return str;
  },
  noHasQuest() {
    return "目前沒有接受的任務";
  },
  alreadyHasQuest() {
    const str =
      "請使用" +
      "`" +
      CommandCtrl.prefix +
      CommandCtrl.keyword +
      " " +
      UserCommand.取消任務 +
      "`" +
      " 來放棄當前任務。";

    return str;
  },
  giveupQuest(title: string) {
    return `已放棄 ${title} 任務`;
  },
  incorrectUser() {
    return "不正確的使用者";
  },
  unavailableCommand() {
    return "無效或未實現的指令。";
  },
  unknownError() {
    return "未知的錯誤";
  },
  starTraining(userName: string) {
    return `${userName} 已開始閉關修練`;
  },
  starTrainingFirst() {
    let str = "尚未開始閉關，";
    str +=
      "請使用 " +
      "`" +
      CommandCtrl.prefix +
      CommandCtrl.keyword +
      " " +
      UserCommand.閉關 +
      "`";
    str += " 來開始閉關修練。";
    return str;
  },
  overTraining(userName: string, hours: number) {
    let str = "```md\n";
    str += " > " + userName + " 已完成閉關修練\n";
    str += " > 總共耗時" + hours + "小時";
    str += "\n```";
    return str;
  },
  duringTraining(role: GamePlayer) {
    let str = "```md\n";
    str += "> 正在閉關中，請先出關 ";
    str +=
      "`" +
      CommandCtrl.prefix +
      CommandCtrl.keyword +
      " " +
      UserCommand.閉關結束 +
      "`" +
      "\n";
    str += "> 目前已修練了 " + role.sofarTraning() + " 小時";
    str += "\n```";
    return str;
  },
  /**
   * 顯示背包與裝備欄內容
   */
  showBackpackAndEquipment(
    backpack: Array<{ item: ItemDefinition; count: number }>,
    equipment: Record<string, ItemDefinition | null>
  ): string {
    let str = "【背包】\n";
    if (backpack.length === 0) {
      str += "（空）\n";
    } else {
      str +=
        backpack
          .map(
            ({ item, count }) =>
              `- ${item.name}（${item.id}，${item.rarity}）x${count}`
          )
          .join("\n") + "\n";
    }
    str += "\n【裝備欄】\n";
    for (const slot of Object.keys(equipment)) {
      const item = equipment[slot];
      if (item) {
        str += `${slot}: ${item.name}（${item.id}，${item.rarity}）\n`;
      } else {
        str += `${slot}: 無\n`;
      }
    }
    return str;
  },
};
