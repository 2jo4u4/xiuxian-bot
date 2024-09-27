// @ts-nocheck
import {
  Type as QuestOptions,
  encodeJson as encodeJson_1,
  decodeJson as decodeJson_1,
  encodeBinary as encodeBinary_1,
  decodeBinary as decodeBinary_1,
} from "./QuestOptions.ts";
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
} from "../runtime/wire/scalar.ts";
import {
  default as deserialize,
} from "../runtime/wire/deserialize.ts";

export declare namespace $ {
  export type Quest = {
    id: number;
    questId: string;
    type: string;
    title: string;
    desc: string;
    options: QuestOptions[];
  }
}

export type Type = $.Quest;

export function getDefaultValue(): $.Quest {
  return {
    id: 0,
    questId: "",
    type: "",
    title: "",
    desc: "",
    options: [],
  };
}

export function createValue(partialValue: Partial<$.Quest>): $.Quest {
  return {
    ...getDefaultValue(),
    ...partialValue,
  };
}

export function encodeJson(value: $.Quest): unknown {
  const result: any = {};
  if (value.id !== undefined) result.id = tsValueToJsonValueFns.int32(value.id);
  if (value.questId !== undefined) result.questId = tsValueToJsonValueFns.string(value.questId);
  if (value.type !== undefined) result.type = tsValueToJsonValueFns.string(value.type);
  if (value.title !== undefined) result.title = tsValueToJsonValueFns.string(value.title);
  if (value.desc !== undefined) result.desc = tsValueToJsonValueFns.string(value.desc);
  result.options = value.options.map(value => encodeJson_1(value));
  return result;
}

export function decodeJson(value: any): $.Quest {
  const result = getDefaultValue();
  if (value.id !== undefined) result.id = jsonValueToTsValueFns.int32(value.id);
  if (value.questId !== undefined) result.questId = jsonValueToTsValueFns.string(value.questId);
  if (value.type !== undefined) result.type = jsonValueToTsValueFns.string(value.type);
  if (value.title !== undefined) result.title = jsonValueToTsValueFns.string(value.title);
  if (value.desc !== undefined) result.desc = jsonValueToTsValueFns.string(value.desc);
  result.options = value.options?.map((value: any) => decodeJson_1(value)) ?? [];
  return result;
}

export function encodeBinary(value: $.Quest): Uint8Array {
  const result: WireMessage = [];
  if (value.id !== undefined) {
    const tsValue = value.id;
    result.push(
      [1, tsValueToWireValueFns.int32(tsValue)],
    );
  }
  if (value.questId !== undefined) {
    const tsValue = value.questId;
    result.push(
      [2, tsValueToWireValueFns.string(tsValue)],
    );
  }
  if (value.type !== undefined) {
    const tsValue = value.type;
    result.push(
      [3, tsValueToWireValueFns.string(tsValue)],
    );
  }
  if (value.title !== undefined) {
    const tsValue = value.title;
    result.push(
      [4, tsValueToWireValueFns.string(tsValue)],
    );
  }
  if (value.desc !== undefined) {
    const tsValue = value.desc;
    result.push(
      [5, tsValueToWireValueFns.string(tsValue)],
    );
  }
  for (const tsValue of value.options) {
    result.push(
      [6, { type: WireType.LengthDelimited as const, value: encodeBinary_1(tsValue) }],
    );
  }
  return serialize(result);
}

export function decodeBinary(binary: Uint8Array): $.Quest {
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
    result.questId = value;
  }
  field: {
    const wireValue = wireFields.get(3);
    if (wireValue === undefined) break field;
    const value = wireValueToTsValueFns.string(wireValue);
    if (value === undefined) break field;
    result.type = value;
  }
  field: {
    const wireValue = wireFields.get(4);
    if (wireValue === undefined) break field;
    const value = wireValueToTsValueFns.string(wireValue);
    if (value === undefined) break field;
    result.title = value;
  }
  field: {
    const wireValue = wireFields.get(5);
    if (wireValue === undefined) break field;
    const value = wireValueToTsValueFns.string(wireValue);
    if (value === undefined) break field;
    result.desc = value;
  }
  collection: {
    const wireValues = wireMessage.filter(([fieldNumber]) => fieldNumber === 6).map(([, wireValue]) => wireValue);
    const value = wireValues.map((wireValue) => wireValue.type === WireType.LengthDelimited ? decodeBinary_1(wireValue.value) : undefined).filter(x => x !== undefined);
    if (!value.length) break collection;
    result.options = value as any;
  }
  return result;
}
