// @ts-nocheck
import {
  Type as Person,
  encodeJson as encodeJson_1,
  decodeJson as decodeJson_1,
  encodeBinary as encodeBinary_1,
  decodeBinary as decodeBinary_1,
} from "./Person.ts";
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
  export type People = {
    people: Person[];
  }
}

export type Type = $.People;

export function getDefaultValue(): $.People {
  return {
    people: [],
  };
}

export function createValue(partialValue: Partial<$.People>): $.People {
  return {
    ...getDefaultValue(),
    ...partialValue,
  };
}

export function encodeJson(value: $.People): unknown {
  const result: any = {};
  result.people = value.people.map(value => encodeJson_1(value));
  return result;
}

export function decodeJson(value: any): $.People {
  const result = getDefaultValue();
  result.people = value.people?.map((value: any) => decodeJson_1(value)) ?? [];
  return result;
}

export function encodeBinary(value: $.People): Uint8Array {
  const result: WireMessage = [];
  for (const tsValue of value.people) {
    result.push(
      [1, { type: WireType.LengthDelimited as const, value: encodeBinary_1(tsValue) }],
    );
  }
  return serialize(result);
}

export function decodeBinary(binary: Uint8Array): $.People {
  const result = getDefaultValue();
  const wireMessage = deserialize(binary);
  const wireFields = new Map(wireMessage);
  collection: {
    const wireValues = wireMessage.filter(([fieldNumber]) => fieldNumber === 1).map(([, wireValue]) => wireValue);
    const value = wireValues.map((wireValue) => wireValue.type === WireType.LengthDelimited ? decodeBinary_1(wireValue.value) : undefined).filter(x => x !== undefined);
    if (!value.length) break collection;
    result.people = value as any;
  }
  return result;
}
