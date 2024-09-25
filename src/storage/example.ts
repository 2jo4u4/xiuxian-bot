import { read, StorageFilename, write } from "./mod.ts";
import { getLogger } from "jsr:@std/log";
import {
    decodeBinary,
    encodeBinary,
    Type as Person,
} from "../definition/messages/Person.ts";
function log() {
    return getLogger("default");
}
export function exampleSaveToFile() {
    const bys: Person = { id: 1, name: "BYS" };
    write(StorageFilename.Person, encodeBinary(bys));
}
export function exampleGetFromFile() {
    const bys: Person = decodeBinary(read(StorageFilename.Person));
    log().info("here deconde from file the values:");
    log().info(bys);
}
