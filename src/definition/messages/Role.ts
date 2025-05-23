// @ts-nocheck
import {
  tsValueToJsonValueFns,
  jsonValueToTsValueFns,
} from "../runtime/json/scalar.ts";
import {
  WireMessage,
  WireType,
} from "../runtime/wire/index.ts";
import {
  default as serialize,
} from "../runtime/wire/serialize.ts";
import {
  tsValueToWireValueFns,
  wireValueToTsValueFns,
  unpackFns,
} from "../runtime/wire/scalar.ts";
import {
  default as deserialize,
} from "../runtime/wire/deserialize.ts";

export declare namespace $ {
  export type Role = {
    id: number;
    userId: string;
    guildId: string;
    exp: number;
    date: string;
    training?: string;
    spiritRoots: number[];
    reputation: number;
    resources: number;
    backpack: Map<string, string>;
    equipment: Map<string, string>;
    hp: number;
    mp: number;
  }
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
    backpack: new Map(),
    equipment: new Map(),
    hp: 0,
    mp: 0,
  };
}

export function createValue(partialValue: Partial<$.Role>): $.Role {
  return {
    ...getDefaultValue(),
    ...partialValue,
  };
}

export function encodeJson(value: $.Role): unknown {
  const result: any = {};
  if (value.id !== undefined) result.id = tsValueToJsonValueFns.int32(value.id);
  if (value.userId !== undefined) result.userId = tsValueToJsonValueFns.string(value.userId);
  if (value.guildId !== undefined) result.guildId = tsValueToJsonValueFns.string(value.guildId);
  if (value.exp !== undefined) result.exp = tsValueToJsonValueFns.int32(value.exp);
  if (value.date !== undefined) result.date = tsValueToJsonValueFns.string(value.date);
  if (value.training !== undefined) result.training = tsValueToJsonValueFns.string(value.training);
  result.spiritRoots = value.spiritRoots.map(value => tsValueToJsonValueFns.int32(value));
  if (value.reputation !== undefined) result.reputation = tsValueToJsonValueFns.int32(value.reputation);
  if (value.resources !== undefined) result.resources = tsValueToJsonValueFns.int32(value.resources);
  if (value.backpack !== undefined) result.backpack = Object.fromEntries([...value.backpack.entries()].map(([key, value]) => [key, tsValueToJsonValueFns.string(value)]));
  if (value.equipment !== undefined) result.equipment = Object.fromEntries([...value.equipment.entries()].map(([key, value]) => [key, tsValueToJsonValueFns.string(value)]));
  if (value.hp !== undefined) result.hp = tsValueToJsonValueFns.int32(value.hp);
  if (value.mp !== undefined) result.mp = tsValueToJsonValueFns.int32(value.mp);
  return result;
}

export function decodeJson(value: any): $.Role {
  const result = getDefaultValue();
  if (value.id !== undefined) result.id = jsonValueToTsValueFns.int32(value.id);
  if (value.userId !== undefined) result.userId = jsonValueToTsValueFns.string(value.userId);
  if (value.guildId !== undefined) result.guildId = jsonValueToTsValueFns.string(value.guildId);
  if (value.exp !== undefined) result.exp = jsonValueToTsValueFns.int32(value.exp);
  if (value.date !== undefined) result.date = jsonValueToTsValueFns.string(value.date);
  if (value.training !== undefined) result.training = jsonValueToTsValueFns.string(value.training);
  result.spiritRoots = value.spiritRoots?.map((value: any) => jsonValueToTsValueFns.int32(value)) ?? [];
  if (value.reputation !== undefined) result.reputation = jsonValueToTsValueFns.int32(value.reputation);
  if (value.resources !== undefined) result.resources = jsonValueToTsValueFns.int32(value.resources);
  if (value.backpack !== undefined) result.backpack = Object.fromEntries([...value.backpack.entries()].map(([key, value]) => [key, jsonValueToTsValueFns.string(value)]));
  if (value.equipment !== undefined) result.equipment = Object.fromEntries([...value.equipment.entries()].map(([key, value]) => [key, jsonValueToTsValueFns.string(value)]));
  if (value.hp !== undefined) result.hp = jsonValueToTsValueFns.int32(value.hp);
  if (value.mp !== undefined) result.mp = jsonValueToTsValueFns.int32(value.mp);
  return result;
}

export function encodeBinary(value: $.Role): Uint8Array {
  const result: WireMessage = [];
  if (value.id !== undefined) {
    const tsValue = value.id;
    result.push(
      [1, tsValueToWireValueFns.int32(tsValue)],
    );
  }
  if (value.userId !== undefined) {
    const tsValue = value.userId;
    result.push(
      [2, tsValueToWireValueFns.string(tsValue)],
    );
  }
  if (value.guildId !== undefined) {
    const tsValue = value.guildId;
    result.push(
      [3, tsValueToWireValueFns.string(tsValue)],
    );
  }
  if (value.exp !== undefined) {
    const tsValue = value.exp;
    result.push(
      [4, tsValueToWireValueFns.int32(tsValue)],
    );
  }
  if (value.date !== undefined) {
    const tsValue = value.date;
    result.push(
      [5, tsValueToWireValueFns.string(tsValue)],
    );
  }
  if (value.training !== undefined) {
    const tsValue = value.training;
    result.push(
      [6, tsValueToWireValueFns.string(tsValue)],
    );
  }
  for (const tsValue of value.spiritRoots) {
    result.push(
      [7, tsValueToWireValueFns.int32(tsValue)],
    );
  }
  if (value.reputation !== undefined) {
    const tsValue = value.reputation;
    result.push(
      [8, tsValueToWireValueFns.int32(tsValue)],
    );
  }
  if (value.resources !== undefined) {
    const tsValue = value.resources;
    result.push(
      [9, tsValueToWireValueFns.int32(tsValue)],
    );
  }
  {
    const fields = value.backpack.entries();
    for (const [key, value] of fields) {
      result.push(
        [10, { type: WireType.LengthDelimited as const, value: serialize([[1, tsValueToWireValueFns.string(key)], [2, tsValueToWireValueFns.string(value)]]) }],
      );
    }
  }
  {
    const fields = value.equipment.entries();
    for (const [key, value] of fields) {
      result.push(
        [11, { type: WireType.LengthDelimited as const, value: serialize([[1, tsValueToWireValueFns.string(key)], [2, tsValueToWireValueFns.string(value)]]) }],
      );
    }
  }
  if (value.hp !== undefined) {
    const tsValue = value.hp;
    result.push(
      [12, tsValueToWireValueFns.int32(tsValue)],
    );
  }
  if (value.mp !== undefined) {
    const tsValue = value.mp;
    result.push(
      [13, tsValueToWireValueFns.int32(tsValue)],
    );
  }
  return serialize(result);
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
  collection: {
    const wireValues = wireMessage.filter(([fieldNumber]) => fieldNumber === 7).map(([, wireValue]) => wireValue);
    const value = Array.from(unpackFns.int32(wireValues));
    if (!value.length) break collection;
    result.spiritRoots = value as any;
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
  collection: {
    const wireValues = wireMessage.filter(([fieldNumber]) => fieldNumber === 10).map(([, wireValue]) => wireValue);
    const value = wireValues.map((wireValue) => (() => { if (wireValue.type !== WireType.LengthDelimited) { return; } const { 1: key, 2: value } = Object.fromEntries(deserialize(wireValue.value)); if (key === undefined || value === undefined) return; return [wireValueToTsValueFns.string(key), wireValueToTsValueFns.string(value)] as const;})()).filter(x => x !== undefined);
    if (!value.length) break collection;
    result.backpack = new Map(value as any);
  }
  collection: {
    const wireValues = wireMessage.filter(([fieldNumber]) => fieldNumber === 11).map(([, wireValue]) => wireValue);
    const value = wireValues.map((wireValue) => (() => { if (wireValue.type !== WireType.LengthDelimited) { return; } const { 1: key, 2: value } = Object.fromEntries(deserialize(wireValue.value)); if (key === undefined || value === undefined) return; return [wireValueToTsValueFns.string(key), wireValueToTsValueFns.string(value)] as const;})()).filter(x => x !== undefined);
    if (!value.length) break collection;
    result.equipment = new Map(value as any);
  }
  field: {
    const wireValue = wireFields.get(12);
    if (wireValue === undefined) break field;
    const value = wireValueToTsValueFns.int32(wireValue);
    if (value === undefined) break field;
    result.hp = value;
  }
  field: {
    const wireValue = wireFields.get(13);
    if (wireValue === undefined) break field;
    const value = wireValueToTsValueFns.int32(wireValue);
    if (value === undefined) break field;
    result.mp = value;
  }
  return result;
}
