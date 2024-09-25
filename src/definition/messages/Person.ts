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
  export type Person = {
    id: number;
    name: string;
  }
}

export type Type = $.Person;

export function getDefaultValue(): $.Person {
  return {
    id: 0,
    name: "",
  };
}

export function createValue(partialValue: Partial<$.Person>): $.Person {
  return {
    ...getDefaultValue(),
    ...partialValue,
  };
}

export function encodeJson(value: $.Person): unknown {
  const result: any = {};
  if (value.id !== undefined) result.id = tsValueToJsonValueFns.int32(value.id);
  if (value.name !== undefined) result.name = tsValueToJsonValueFns.string(value.name);
  return result;
}

export function decodeJson(value: any): $.Person {
  const result = getDefaultValue();
  if (value.id !== undefined) result.id = jsonValueToTsValueFns.int32(value.id);
  if (value.name !== undefined) result.name = jsonValueToTsValueFns.string(value.name);
  return result;
}

export function encodeBinary(value: $.Person): Uint8Array {
  const result: WireMessage = [];
  if (value.id !== undefined) {
    const tsValue = value.id;
    result.push(
      [1, tsValueToWireValueFns.int32(tsValue)],
    );
  }
  if (value.name !== undefined) {
    const tsValue = value.name;
    result.push(
      [2, tsValueToWireValueFns.string(tsValue)],
    );
  }
  return serialize(result);
}

export function decodeBinary(binary: Uint8Array): $.Person {
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
    result.name = value;
  }
  return result;
}
