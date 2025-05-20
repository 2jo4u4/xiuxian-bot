// 單元測試：Bot/feature 主要功能
import {
  assertEquals,
  assert,
} from "https://deno.land/std@0.224.0/testing/asserts.ts";
import { GamePlayer } from "./GamePlayer.ts";
import {
  getBaseStatsByLevel,
  LevelName,
  UserCommand,
  CommandAlais,
} from "./Constants.ts";
import { getItemById } from "./ItemDefinitions.ts";
import { battle } from "./Battle.ts";
import { MonsterList } from "./Monster.ts";
import { CommandCtrl } from "./UserCommand.ts";

Deno.test("GamePlayer: 建立角色與屬性初始化", () => {
  const role = new GamePlayer({ userId: 1n, guildId: 1n });
  const base = getBaseStatsByLevel(LevelName.練氣境);
  assertEquals(role.getRoleState().maxHp, base.maxHp);
  assertEquals(role.getRoleState().maxMp, base.maxMp);
  assertEquals(role.hp, base.maxHp);
  assertEquals(role.mp, base.maxMp);
});

Deno.test("GamePlayer: 裝備加成與百分比加成", () => {
  const role = new GamePlayer({ userId: 2n, guildId: 1n });
  // 給予裝備
  role.gainEquipment("sword_qingfeng");
  role.gainEquipment("blade_lieyan");
  role.equipItem("sword_qingfeng");
  role.equipItem("blade_lieyan");
  const stats = role.getRoleState();
  assert(stats.atk > getBaseStatsByLevel(LevelName.練氣境).atk);
});

Deno.test("GamePlayer: 使用消耗品", () => {
  const role = new GamePlayer({ userId: 3n, guildId: 1n });
  role.gainItem("elixir_qi");
  const before = role.resources;
  const result = role.useItem("elixir_qi");
  assert(result.success);
  assertEquals(role.resources, before + 10);
});

Deno.test("Battle: 玩家與魔物單回合戰鬥", () => {
  const role = new GamePlayer({ userId: 4n, guildId: 1n });
  const monster = { ...MonsterList[0] };
  const result = battle(role, monster);
  assert(["player", "monster"].includes(result.winner));
  assert(typeof result.playerHp === "number");
  assert(typeof result.monsterHp === "number");
});

Deno.test("UserCommand: 指令別名對應正確", () => {
  // 測試部分常用指令
  assertEquals(CommandAlais["幫助"], UserCommand.幫助);
  assertEquals(CommandAlais["help"], UserCommand.幫助);
  assertEquals(CommandAlais["建立角色"], UserCommand.建立角色);
  assertEquals(CommandAlais["create"], UserCommand.建立角色);
  assertEquals(CommandAlais["狀態"], UserCommand.狀態);
  assertEquals(CommandAlais["status"], UserCommand.狀態);
  assertEquals(CommandAlais["使用"], UserCommand.使用道具);
  assertEquals(CommandAlais["use"], UserCommand.使用道具);
  assertEquals(CommandAlais["裝備"], UserCommand.裝備);
  assertEquals(CommandAlais["卸下"], UserCommand.卸下裝備);
  assertEquals(CommandAlais["查看背包"], UserCommand.查看背包);
});

Deno.test("UserCommand: CommandCtrl 解析指令", () => {
  const ctrl = new CommandCtrl();
  // 正常指令
  let result = ctrl.getCommandType("%修仙 狀態");
  assert(result && result.command === UserCommand.狀態);
  // 英文別名
  result = ctrl.getCommandType("%修仙 status");
  assert(result && result.command === UserCommand.狀態);
  // 參數指令
  result = ctrl.getCommandType("%修仙 使用 elixir_qi");
  assert(result && result.command === UserCommand.使用道具);
  assertEquals(result.p[0], "elixir_qi");
  // 無效指令
  result = ctrl.getCommandType("%修仙 不存在");
  assert(result === null);
  // 非修仙指令
  result = ctrl.getCommandType("%其他 狀態");
  assert(result === null);
});
