// @ts-nocheck
import {
  tsValueToJsonValueFns,
  jsonValueToTsValueFns,
} from "../runtime/json/scalar.ts";
import { WireMessage, WireType } from "../runtime/wire/index.ts";
import { default as serialize } from "../runtime/wire/serialize.ts";
import {
  tsValueToWireValueFns,
  wireValueToTsValueFns,
} from "../runtime/wire/scalar.ts";
import { default as deserialize } from "../runtime/wire/deserialize.ts";

export declare namespace $ {
  export type Role = {
    id: number;
    userId: string;
    guildId: string;
    exp: number;
    date: string;
    training?: string;
    spiritRoots?: number[]; // SpiritRootType[] 的數字陣列
    reputation?: number;
    resources?: number;
    backpack?: string[]; // 新增：背包道具ID陣列
    equipment?: Record<string, string | null>; // 新增：裝備欄，key為部位，value為道具ID或null
  };
}

export type Type = $.Role;

export function getDefaultValue(): $.Role {
  return {
    id: 0,
    userId: "",
    guildId: "",
    exp: 0,
    date: "",
    training: undefined,
    spiritRoots: [],
    reputation: 0,
    resources: 0,
    backpack: [],
    equipment: {},
  };
}

export function createValue(partialValue: Partial<$.Role>): $.Role {
  return {
    ...getDefaultValue(),
    ...partialValue,
    backpack: partialValue.backpack ?? [],
    equipment: partialValue.equipment ?? {},
  };
}

export function encodeJson(value: $.Role): unknown {
  const result: Record<string, unknown> = {};
  if (value.id !== undefined) result.id = tsValueToJsonValueFns.int32(value.id);
  if (value.userId !== undefined)
    result.userId = tsValueToJsonValueFns.string(value.userId);
  if (value.guildId !== undefined)
    result.guildId = tsValueToJsonValueFns.string(value.guildId);
  if (value.exp !== undefined)
    result.exp = tsValueToJsonValueFns.int32(value.exp);
  if (value.date !== undefined)
    result.date = tsValueToJsonValueFns.string(value.date);
  if (value.training !== undefined)
    result.training = tsValueToJsonValueFns.string(value.training);
  if (value.spiritRoots !== undefined) result.spiritRoots = value.spiritRoots;
  if (value.reputation !== undefined)
    result.reputation = tsValueToJsonValueFns.int32(value.reputation);
  if (value.resources !== undefined)
    result.resources = tsValueToJsonValueFns.int32(value.resources);
  if (value.backpack !== undefined)
    result.backpack = value.backpack.map(tsValueToJsonValueFns.string);
  if (value.equipment !== undefined) {
    result.equipment = {};
    for (const [k, v] of Object.entries(value.equipment)) {
      result.equipment[k] = v ?? "";
    }
  }
  return result;
}

export function decodeJson(value: unknown): $.Role {
  const result = getDefaultValue();
  const obj = value as Record<string, unknown>;
  if (obj.id !== undefined) result.id = jsonValueToTsValueFns.int32(obj.id);
  if (obj.userId !== undefined)
    result.userId = jsonValueToTsValueFns.string(obj.userId);
  if (obj.guildId !== undefined)
    result.guildId = jsonValueToTsValueFns.string(obj.guildId);
  if (obj.exp !== undefined) result.exp = jsonValueToTsValueFns.int32(obj.exp);
  if (obj.date !== undefined)
    result.date = jsonValueToTsValueFns.string(obj.date);
  if (obj.training !== undefined)
    result.training = jsonValueToTsValueFns.string(obj.training);
  if (obj.spiritRoots !== undefined && Array.isArray(obj.spiritRoots))
    result.spiritRoots = (obj.spiritRoots as unknown[]).map(
      jsonValueToTsValueFns.int32
    );
  if (obj.reputation !== undefined)
    result.reputation = jsonValueToTsValueFns.int32(obj.reputation);
  if (obj.resources !== undefined)
    result.resources = jsonValueToTsValueFns.int32(obj.resources);
  if (obj.backpack !== undefined && Array.isArray(obj.backpack))
    result.backpack = (obj.backpack as unknown[]).map(
      jsonValueToTsValueFns.string
    );
  if (
    obj.equipment !== undefined &&
    typeof obj.equipment === "object" &&
    obj.equipment !== null
  ) {
    result.equipment = {};
    for (const [k, v] of Object.entries(
      obj.equipment as Record<string, unknown>
    )) {
      result.equipment[k] = v === "" ? null : jsonValueToTsValueFns.string(v);
    }
  }
  return result;
}

export function encodeBinary(value: $.Role): Uint8Array {
  const result: WireMessage = [];
  if (value.id !== undefined) {
    const tsValue = value.id;
    result.push([1, tsValueToWireValueFns.int32(tsValue)]);
  }
  if (value.userId !== undefined) {
    const tsValue = value.userId;
    result.push([2, tsValueToWireValueFns.string(tsValue)]);
  }
  if (value.guildId !== undefined) {
    const tsValue = value.guildId;
    result.push([3, tsValueToWireValueFns.string(tsValue)]);
  }
  if (value.exp !== undefined) {
    const tsValue = value.exp;
    result.push([4, tsValueToWireValueFns.int32(tsValue)]);
  }
  if (value.date !== undefined) {
    const tsValue = value.date;
    result.push([5, tsValueToWireValueFns.string(tsValue)]);
  }
  if (value.training !== undefined) {
    const tsValue = value.training;
    result.push([6, tsValueToWireValueFns.string(tsValue)]);
  }
  if (value.spiritRoots !== undefined) {
    for (const v of value.spiritRoots) {
      result.push([7, tsValueToWireValueFns.int32(v)]);
    }
  }
  if (value.reputation !== undefined) {
    const tsValue = value.reputation;
    result.push([8, tsValueToWireValueFns.int32(tsValue)]);
  }
  if (value.resources !== undefined) {
    const tsValue = value.resources;
    result.push([9, tsValueToWireValueFns.int32(tsValue)]);
  }
  if (value.backpack !== undefined) {
    for (const v of value.backpack) {
      result.push([10, tsValueToWireValueFns.string(v)]);
    }
  }
  if (value.equipment !== undefined) {
    for (const [k, v] of Object.entries(value.equipment)) {
      result.push([
        11,
        {
          type: WireType.LengthDelimited as const,
          value: serializeEquipmentEntry(k, v),
        },
      ]);
    }
  }
  return serialize(result);
}

function serializeEquipmentEntry(
  key: string,
  value: string | null
): Uint8Array {
  // map<string, string> => message EquipmentEntry { string key = 1; string value = 2; }
  const entry: WireMessage = [];
  entry.push([1, tsValueToWireValueFns.string(key)]);
  entry.push([2, tsValueToWireValueFns.string(value ?? "")]);
  return serialize(entry);
}

export function decodeBinary(binary: Uint8Array): $.Role {
  const result = getDefaultValue();
  const wireMessage = deserialize(binary);
  const wireFields = new Map(wireMessage);
  field: {
    const wireValue = wireFields.get(1);
    if (wireValue === undefined) break field;
    const value = wireValueToTsValueFns.int32(wireValue);
    if (value === undefined) break field;
    result.id = value;
  }
  field: {
    const wireValue = wireFields.get(2);
    if (wireValue === undefined) break field;
    const value = wireValueToTsValueFns.string(wireValue);
    if (value === undefined) break field;
    result.userId = value;
  }
  field: {
    const wireValue = wireFields.get(3);
    if (wireValue === undefined) break field;
    const value = wireValueToTsValueFns.string(wireValue);
    if (value === undefined) break field;
    result.guildId = value;
  }
  field: {
    const wireValue = wireFields.get(4);
    if (wireValue === undefined) break field;
    const value = wireValueToTsValueFns.int32(wireValue);
    if (value === undefined) break field;
    result.exp = value;
  }
  field: {
    const wireValue = wireFields.get(5);
    if (wireValue === undefined) break field;
    const value = wireValueToTsValueFns.string(wireValue);
    if (value === undefined) break field;
    result.date = value;
  }
  field: {
    const wireValue = wireFields.get(6);
    if (wireValue === undefined) break field;
    const value = wireValueToTsValueFns.string(wireValue);
    if (value === undefined) break field;
    result.training = value;
  }
  // repeated int32 spiritRoots = 7;
  for (const [fieldNo, wireValue] of wireMessage) {
    if (fieldNo === 7) {
      const value = wireValueToTsValueFns.int32(wireValue);
      if (value !== undefined) result.spiritRoots.push(value);
    }
    if (fieldNo === 10) {
      const value = wireValueToTsValueFns.string(wireValue);
      if (value !== undefined) result.backpack.push(value);
    }
    if (fieldNo === 11 && wireValue.type === WireType.LengthDelimited) {
      const entry = deserializeEquipmentEntry(wireValue.value);
      if (entry) result.equipment[entry.key] = entry.value;
    }
  }
  field: {
    const wireValue = wireFields.get(8);
    if (wireValue === undefined) break field;
    const value = wireValueToTsValueFns.int32(wireValue);
    if (value === undefined) break field;
    result.reputation = value;
  }
  field: {
    const wireValue = wireFields.get(9);
    if (wireValue === undefined) break field;
    const value = wireValueToTsValueFns.int32(wireValue);
    if (value === undefined) break field;
    result.resources = value;
  }
  return result;
}

function deserializeEquipmentEntry(
  binary: Uint8Array
): { key: string; value: string | null } | null {
  // message EquipmentEntry { string key = 1; string value = 2; }
  const wireMessage = deserialize(binary);
  let key = "";
  let value: string | null = null;
  for (const [fieldNo, wireValue] of wireMessage) {
    if (fieldNo === 1) key = wireValueToTsValueFns.string(wireValue);
    if (fieldNo === 2) value = wireValueToTsValueFns.string(wireValue);
  }
  return key ? { key, value } : null;
}
