import { getLogger } from "@std/log";
import { database, RoleJson } from "./DataBase.ts";
import { GamePlayer } from "./GamePlayer.ts";

type GuildId = bigint;
type UserId = bigint;
export class GameHost {
  guildMap: Map<GuildId, Map<UserId, GamePlayer>>;
  readonly log: ReturnType<typeof getLogger>;
  constructor() {
    this.guildMap = new Map();
    this.log = getLogger("default");
    setInterval(() => {
      this.log.debug("開始存檔");
      this.storeUser();
      this.log.debug("存檔完成");
    }, 300 * 1000);
  }

  getGuild(guildId: GuildId) {
    return this.guildMap.get(guildId);
  }
  getRole(guildId: GuildId, userId: UserId): GamePlayer | undefined {
    if (this.guildMap.has(guildId)) {
      return this.guildMap.get(guildId)!.get(userId);
    }
    return undefined;
  }
  createRole(guildId: GuildId, userId: UserId) {
    const role = this.getRole(guildId, userId);
    if (role) return role;
    return new GamePlayer({ userId, guildId });
  }
  addRole(role: GamePlayer) {
    const guild = this.getGuild(role.guildId);
    if (guild) {
      guild.set(role.userId, role);
    } else {
      this.guildMap.set(role.guildId, new Map([[role.userId, role]]));
    }
  }
  injectUsers() {
    const users = database.readUsers();
    users.role.forEach(({ guildId, userId, equipment, ...state }) => {
      const equipmentRecord: Record<string, string | null> = {};
      if (equipment instanceof Map) {
        equipment.forEach((value, key) => {
          equipmentRecord[key] = value;
        });
      }
      const role = new GamePlayer({
        userId: BigInt(userId),
        guildId: BigInt(guildId),
        equipment: equipmentRecord,
        ...state,
      });
      this.addRole(role);
    });
  }
  storeUser() {
    database.storeUsers(
      Array.from(this.guildMap).reduce((prev, [_, roleMap]) => {
        return prev.concat(this.userMap2json(roleMap));
      }, [] as RoleJson)
    );
  }
  private userMap2json(map: Map<bigint, GamePlayer>) {
    const json: RoleJson = [];
    map.forEach((role) => {
      const data = role.toRole();
      json.push({ ...data, id: json.length + 1 });
    });

    return json;
  }
}
