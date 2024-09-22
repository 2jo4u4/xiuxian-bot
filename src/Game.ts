import { DataBaseType, database } from "./DataBase.ts";
import { Role } from "./Role.ts";

export class Game {
  roles: Map<bigint, Role>;
  constructor() {
    this.roles = new Map();
    this.injectRoleData();
  }
  createRole(userId: bigint) {
    if (this.roles.has(userId)) return this.getRole(userId) as Role;
    return new Role({ userId });
  }
  addRole(role: Role) {
    this.roles.set(role.userId, role);
  }
  getRole(userId: bigint) {
    return this.roles.get(userId);
  }
  storeRoleData() {
    const roles = Array.from(this.roles).reduce((prev, [_, role]) => {
      return { ...prev, [role.userId.toString()]: role.toJSON() };
    }, {} as DataBaseType["role"]);
    database.storeRole(JSON.stringify({ ...roles }));
  }

  private async injectRoleData() {
    const data = await database.getDataBase("role");
    Object.keys(data).forEach(key => {
      const { userId, exp, date } = data[key];
      this.addRole(new Role({ userId: BigInt(userId), exp, date }));
    });
  }
}
