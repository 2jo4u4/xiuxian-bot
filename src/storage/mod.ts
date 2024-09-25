import { getLogger } from "jsr:@std/log";
import { existsSync, join } from "../deps.ts";

enum StorageFilename {
    People,
}

function log() {
    return getLogger("storage");
}

export function init() {
    log().info("hello this is stoarge mod");
    read(StorageFilename.People);
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
