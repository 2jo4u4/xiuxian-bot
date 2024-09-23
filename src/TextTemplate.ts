import { CommandCtrl, UserCommand, CommandAlais } from "./UserCommand.ts";

const HelpDesc: Record<string, string> = {
  [UserCommand.建立角色]: "創建你的修仙角色",
  [UserCommand.狀態]: "查看當前的境界",
  [UserCommand.接受任務]: "接受一個隨機任務",
  [UserCommand.取消任務]: "放棄當前的任務",
};

export const Template = {
  help() {
    let str =
      "```md\n" +
      "請使用 " +
      CommandCtrl.prefix +
      CommandCtrl.keyword +
      " 作為指令前墜" +
      "\n可替換為: ";

    CommandCtrl.keywords.forEach((keyword, index) => {
      if (index !== 0) {
        str += " | ";
      }
      str += CommandCtrl.prefix + keyword;
    });

    str += "\n\n";
    let index = 1;
    Object.keys(CommandAlais).forEach((key) => {
      const desc = HelpDesc[CommandAlais[key]];
      if (desc) {
        str += index + ". " + key + ": " + desc;
        str += "\n";
        index++;
      }
    });

    str += "```";
    return str;
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
  status(userName: string, level: string) {
    const str = userName + " 目前的境界為" + "`" + level + "`" + "。";
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
};
