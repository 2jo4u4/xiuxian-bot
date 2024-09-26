import { database, RoleJson } from "./DataBase.ts";
import { Role } from "./Role.ts";

type GuildId = bigint;
type UserId = bigint;
export class Game {
  guildMap: Map<GuildId, Map<UserId, Role>>;
  constructor() {
    this.guildMap = new Map();
  }

  getGuild(guildId: GuildId) {
    return this.guildMap.get(guildId);
  }
  getRole(guildId: GuildId, userId: UserId): Role | undefined {
    if (this.guildMap.has(guildId)) {
      return this.guildMap.get(guildId)!.get(userId);
    }
    return undefined;
  }
  createRole(guildId: GuildId, userId: UserId) {
    const role = this.getRole(guildId, userId);
    if (role) return role;
    return new Role({ userId, guildId });
  }
  addRole(role: Role) {
    const guild = this.getGuild(role.guildId);
    if (guild) {
      guild.set(role.userId, role);
    } else {
      this.guildMap.set(role.guildId, new Map([[role.userId, role]]));
    }
  }

  async injectRoleData(guildId: bigint) {
    const data = await database.getRoleData(guildId.toString());
    data.forEach(({ userId, exp, date }) => {
      const role = new Role({ userId: BigInt(userId), exp, date, guildId });
      this.addRole(role);
    });
  }

  async onDestroy() {
    await Promise.all(
      Array.from(this.guildMap).map(([guildId, userMap]) =>
        database.storeRoleData(guildId.toString(), this.userMap2json(userMap))
      )
    );
  }

  private userMap2json(map: Map<bigint, Role>) {
    const json: RoleJson = [];
    map.forEach((role) => {
      const userId = role.userId.toString();
      json.push({ userId, exp: role.exp, date: role.createDate });
    });

    return JSON.stringify(json);
  }
}
