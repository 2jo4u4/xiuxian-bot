// @ts-nocheck
import {
  Type as Quest,
  encodeJson as encodeJson_1,
  decodeJson as decodeJson_1,
  encodeBinary as encodeBinary_1,
  decodeBinary as decodeBinary_1,
} from "./Quest.ts";
import {
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
  default as deserialize,
} from "../runtime/wire/deserialize.ts";

export declare namespace $ {
  export type QuestBoard = {
    quest: Quest[];
  }
}

export type Type = $.QuestBoard;

export function getDefaultValue(): $.QuestBoard {
  return {
    quest: [],
  };
}

export function createValue(partialValue: Partial<$.QuestBoard>): $.QuestBoard {
  return {
    ...getDefaultValue(),
    ...partialValue,
  };
}

export function encodeJson(value: $.QuestBoard): unknown {
  const result: any = {};
  result.quest = value.quest.map(value => encodeJson_1(value));
  return result;
}

export function decodeJson(value: any): $.QuestBoard {
  const result = getDefaultValue();
  result.quest = value.quest?.map((value: any) => decodeJson_1(value)) ?? [];
  return result;
}

export function encodeBinary(value: $.QuestBoard): Uint8Array {
  const result: WireMessage = [];
  for (const tsValue of value.quest) {
    result.push(
      [1, { type: WireType.LengthDelimited as const, value: encodeBinary_1(tsValue) }],
    );
  }
  return serialize(result);
}

export function decodeBinary(binary: Uint8Array): $.QuestBoard {
  const result = getDefaultValue();
  const wireMessage = deserialize(binary);
  const wireFields = new Map(wireMessage);
  collection: {
    const wireValues = wireMessage.filter(([fieldNumber]) => fieldNumber === 1).map(([, wireValue]) => wireValue);
    const value = wireValues.map((wireValue) => wireValue.type === WireType.LengthDelimited ? decodeBinary_1(wireValue.value) : undefined).filter(x => x !== undefined);
    if (!value.length) break collection;
    result.quest = value as any;
  }
  return result;
}
