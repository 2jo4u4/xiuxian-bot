export enum UserCommand {
  幫助,
  建立角色,
  狀態,
  接受任務,
  丟骰子,
  回覆任務,
  取消任務,
}
export const CommandAlais: Record<string, UserCommand> = {
  幫助: UserCommand.幫助,
  help: UserCommand.幫助,
  建立角色: UserCommand.建立角色,
  create: UserCommand.建立角色,
  狀態: UserCommand.狀態,
  status: UserCommand.狀態,
  接受任務: UserCommand.接受任務,
  "get-quest": UserCommand.接受任務,
  回覆任務: UserCommand.回覆任務,
  "response-quest": UserCommand.回覆任務,
  取消任務: UserCommand.取消任務,
  "cancel-quest": UserCommand.取消任務,
  丟骰子: UserCommand.丟骰子,
  roll: UserCommand.丟骰子,
};

/**
 * @example```
 * %修仙 建立角色
 * ```
 */
export class CommandCtrl {
  static prefix = "%";
  static keyword = "修仙";
  static keyword2 = "paradise";
  static keyword3 = "xiuxian";
  private checkCommand(message: string) {
    const regex = new RegExp(
      `^${CommandCtrl.prefix}(${CommandCtrl.keyword}|${CommandCtrl.keyword2}|${CommandCtrl.keyword3})$`
    );
    if (regex.test(message)) return true;
    else return false;
  }

  getCommandType(message: string) {
    const [p1, p2, ...p] = message.split(" ");
    const isCommand = this.checkCommand(p1);
    if (isCommand) {
      if (p2 === undefined) return null;

      const command = CommandAlais[p2] ?? parseInt(p2);
      if (!isNaN(command)) {
        return { command, p };
      } else {
        return null;
      }
    } else {
      return null;
    }
  }
}
