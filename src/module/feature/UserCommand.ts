import { CommandAlais } from "./Constants.ts";

/**
 * @example```
 * %修仙 建立角色
 * ```
 */
export class CommandCtrl {
  static prefix = "%";
  static keyword = "修仙";
  static keywords = ["paradise", "xiuxian", "xx"];
  readonly regexp: RegExp;

  constructor() {
    const keywords = CommandCtrl.keywords.reduce((prev, curr) => {
      return prev + "|" + curr;
    }, CommandCtrl.keyword);
    this.regexp = new RegExp(`^${CommandCtrl.prefix}(${keywords})$`);
  }
  private checkCommand(message: string) {
    if (this.regexp.test(message)) return true;
    else return false;
  }
  getCommandType(message: string) {
    const [p1, p2, ...parameter] = message.split(" ");
    const isCommand = this.checkCommand(p1);
    if (isCommand) {
      if (p2 === undefined) return null;

      const command = CommandAlais[p2] ?? parseInt(p2);
      if (!isNaN(command)) {
        return { command, p: parameter };
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  getSecondCommand(...parameter: string[]) {
    return null;
  }
}
