import { getLogger } from "jsr:@std/log";
import { existsSync, join } from "../deps.ts";
import {encodeBinary,decodeBinary,Type as Person} from "../definition/messages/Person.ts"

enum StorageFilename {
    People,
}

function log() {
    return getLogger("storage");
}
function toBinaray():Uint8Array{
    let bys:Person={id:1,name:"boyou"}
    let bytes:Uint8Array=encodeBinary(bys)
    // let str = ""
    // for (let i = 0; i < bytes.length; i++) {
    //     str += bytes[i].toString(16).padStart(2, '0')
    // }
    // console.log(str)
    return bytes
}
function decode(bytes:Uint8Array):void{
    let bys:Person=decodeBinary(bytes)
    console.log(bys)
}

function test(){
    let bytes=toBinaray()
    decode(bytes);
}

export function init() {
    log().info("hello this is stoarge mod");
    // read(StorageFilename.People);
    // test();
}
export function write(filename: StorageFilename, data: Uint8Array): void {
    const filepath = join(
        Deno.cwd(),
        Deno.env.get("STORAGEFOLDER") ?? "",
        StorageFilename[filename],
    );
    log().debug(filepath);
    Deno.writeFileSync(filepath, data);
}

export function read(filename: StorageFilename): false | Uint8Array {
    const filepath = join(
        Deno.cwd(),
        Deno.env.get("STORAGEFOLDER") ?? "",
        StorageFilename[filename],
    );
    log().debug(filepath);
    if (!existsSync(filepath)) {
        log().error(`The file not exists ${filepath} !!`);
        return false;
    }
    return Deno.readFileSync(filepath);
}
