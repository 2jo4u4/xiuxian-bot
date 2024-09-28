import { getLogger } from "@std/log";
import { database, RoleJson } from "./DataBase.ts";
import { UserRole } from "./UserRole.ts";

type GuildId = bigint;
type UserId = bigint;
export class Game {
  guildMap: Map<GuildId, Map<UserId, UserRole>>;
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
  getRole(guildId: GuildId, userId: UserId): UserRole | undefined {
    if (this.guildMap.has(guildId)) {
      return this.guildMap.get(guildId)!.get(userId);
    }
    return undefined;
  }
  createRole(guildId: GuildId, userId: UserId) {
    const role = this.getRole(guildId, userId);
    if (role) return role;
    return new UserRole({ userId, guildId });
  }
  addRole(role: UserRole) {
    const guild = this.getGuild(role.guildId);
    if (guild) {
      guild.set(role.userId, role);
    } else {
      this.guildMap.set(role.guildId, new Map([[role.userId, role]]));
    }
  }
  injectUsers() {
    const users = database.readUsers();
    users.role.forEach(({ guildId, userId, ...other }) => {
      const role = new UserRole({
        userId: BigInt(userId),
        guildId: BigInt(guildId),
        ...other,
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
  private userMap2json(map: Map<bigint, UserRole>) {
    const json: RoleJson = [];
    map.forEach((role) => {
      const data = role.toRole();
      json.push({ ...data, id: json.length + 1 });
    });

    return json;
  }
}
