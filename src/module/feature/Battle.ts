// filepath: src/module/feature/Battle.ts

import type { UserRole } from "./UserRole.ts";
import type { Monster } from "./Monster.ts";

export interface BattleResult {
  winner: "player" | "monster";
  playerHp: number;
  monsterHp: number;
  log: string[];
}

/**
 * 進行單回合戰鬥（簡單物理攻防，無技能/閃避/暴擊）
 * @param player UserRole 實例
 * @param monster Monster 實例
 * @returns BattleResult
 */
export function battle(player: UserRole, monster: Monster): BattleResult {
  const playerStats = player.getRoleState();
  let playerHp = player.hp;
  let monsterHp = monster.hp;
  const log: string[] = [];

  // 玩家攻擊
  const playerDmg = Math.max(playerStats.atk - monster.def, 1);
  monsterHp -= playerDmg;
  log.push(`你對${monster.name}造成了${playerDmg}點傷害。`);

  // 若怪物未死，反擊
  if (monsterHp > 0) {
    const monsterDmg = Math.max(monster.atk - playerStats.def, 1);
    playerHp -= monsterDmg;
    log.push(`${monster.name}對你造成了${monsterDmg}點傷害。`);
  }

  // 判斷勝負
  let winner: "player" | "monster";
  if (monsterHp <= 0 && playerHp > 0) {
    winner = "player";
    log.push(`你擊敗了${monster.name}！`);
  } else if (playerHp <= 0 && monsterHp > 0) {
    winner = "monster";
    log.push(`你被${monster.name}擊敗了……`);
  } else if (playerHp <= 0 && monsterHp <= 0) {
    winner = "player"; // 同歸於盡視為玩家勝
    log.push(`你與${monster.name}同歸於盡！`);
  } else {
    winner = playerHp > monsterHp ? "player" : "monster";
  }

  return {
    winner,
    playerHp: Math.max(playerHp, 0),
    monsterHp: Math.max(monsterHp, 0),
    log,
  };
}
