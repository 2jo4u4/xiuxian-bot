import { read, StorageFilename, write } from "./mod.ts";
import { getLogger } from "jsr:@std/log";
import {
    decodeBinary,
    encodeBinary,
    Type as Person,
} from "../definition/messages/Person.ts";
import * as People from "../definition/messages/People.ts";
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

export function examplePeopleWrite() {
    const bys: Person = { id: 1, name: "BYS" };
    const cys: Person = { id: 2, name: "CYS" };
    const people: People.Type = { people: [bys, cys] };
    write(StorageFilename.People, People.encodeBinary(people));
}
export function examplePeopleRead() {
    const { people }: People.Type = People.decodeBinary(
        read(StorageFilename.People),
    );
    log().info("people value:");
    console.log(people);
}
