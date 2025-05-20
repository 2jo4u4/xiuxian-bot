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

  /**
   * 解析二級指令（如：%修仙 使用 elixir_qi）
   * @param parameter 指令參數陣列
   * @returns { itemId?: string, slot?: string } | null
   */
  getSecondCommand(...parameter: string[]) {
    if (!parameter || parameter.length === 0) return null;
    // 嘗試解析道具ID或裝備部位
    if (parameter.length === 1) {
      // 單一參數，可能是道具ID或部位
      return { itemId: parameter[0], slot: parameter[0] };
    }
    if (parameter.length >= 2) {
      // 兩個參數，第一個通常是道具ID，第二個可作為部位
      return { itemId: parameter[0], slot: parameter[1] };
    }
    return null;
  }
}
