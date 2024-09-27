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
  export type QuestOptions = {
    ansId: string;
    desc: string;
    score: number;
  }
}

export type Type = $.QuestOptions;

export function getDefaultValue(): $.QuestOptions {
  return {
    ansId: "",
    desc: "",
    score: 0,
  };
}

export function createValue(partialValue: Partial<$.QuestOptions>): $.QuestOptions {
  return {
    ...getDefaultValue(),
    ...partialValue,
  };
}

export function encodeJson(value: $.QuestOptions): unknown {
  const result: any = {};
  if (value.ansId !== undefined) result.ansId = tsValueToJsonValueFns.string(value.ansId);
  if (value.desc !== undefined) result.desc = tsValueToJsonValueFns.string(value.desc);
  if (value.score !== undefined) result.score = tsValueToJsonValueFns.int32(value.score);
  return result;
}

export function decodeJson(value: any): $.QuestOptions {
  const result = getDefaultValue();
  if (value.ansId !== undefined) result.ansId = jsonValueToTsValueFns.string(value.ansId);
  if (value.desc !== undefined) result.desc = jsonValueToTsValueFns.string(value.desc);
  if (value.score !== undefined) result.score = jsonValueToTsValueFns.int32(value.score);
  return result;
}

export function encodeBinary(value: $.QuestOptions): Uint8Array {
  const result: WireMessage = [];
  if (value.ansId !== undefined) {
    const tsValue = value.ansId;
    result.push(
      [1, tsValueToWireValueFns.string(tsValue)],
    );
  }
  if (value.desc !== undefined) {
    const tsValue = value.desc;
    result.push(
      [2, tsValueToWireValueFns.string(tsValue)],
    );
  }
  if (value.score !== undefined) {
    const tsValue = value.score;
    result.push(
      [3, tsValueToWireValueFns.int32(tsValue)],
    );
  }
  return serialize(result);
}

export function decodeBinary(binary: Uint8Array): $.QuestOptions {
  const result = getDefaultValue();
  const wireMessage = deserialize(binary);
  const wireFields = new Map(wireMessage);
  field: {
    const wireValue = wireFields.get(1);
    if (wireValue === undefined) break field;
    const value = wireValueToTsValueFns.string(wireValue);
    if (value === undefined) break field;
    result.ansId = value;
  }
  field: {
    const wireValue = wireFields.get(2);
    if (wireValue === undefined) break field;
    const value = wireValueToTsValueFns.string(wireValue);
    if (value === undefined) break field;
    result.desc = value;
  }
  field: {
    const wireValue = wireFields.get(3);
    if (wireValue === undefined) break field;
    const value = wireValueToTsValueFns.int32(wireValue);
    if (value === undefined) break field;
    result.score = value;
  }
  return result;
}
