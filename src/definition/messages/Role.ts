// @ts-nocheck
import {
  tsValueToJsonValueFns,
  jsonValueToTsValueFns,
} from "../runtime/json/scalar.ts";
import {
  WireMessage,
} from "../runtime/wire/index.ts";
import {
  default as serialize,
} from "../runtime/wire/serialize.ts";
import {
  tsValueToWireValueFns,
  wireValueToTsValueFns,
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
  return result;
}

export function decodeJson(value: any): $.Role {
  const result = getDefaultValue();
  if (value.id !== undefined) result.id = jsonValueToTsValueFns.int32(value.id);
  if (value.userId !== undefined) result.userId = jsonValueToTsValueFns.string(value.userId);
  if (value.guildId !== undefined) result.guildId = jsonValueToTsValueFns.string(value.guildId);
  if (value.exp !== undefined) result.exp = jsonValueToTsValueFns.int32(value.exp);
  if (value.date !== undefined) result.date = jsonValueToTsValueFns.string(value.date);
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
  return result;
}
