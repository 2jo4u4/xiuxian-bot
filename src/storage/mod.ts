import { getLogger } from "jsr:@std/log";
import { existsSync, join } from "../deps.ts";

export enum StorageFilename {
  People,
  Person,
  Users,
  QuestBoard,
}

function log() {
  return getLogger("storage");
}

export function init(): void {
  // create the folders
  const folderpath = join(Deno.cwd(), Deno.env.get("STORAGEFOLDER") ?? "");
  log().debug(`The store folder path:${folderpath}`);
  Deno.mkdirSync(folderpath, { recursive: true });
}

export function write(filename: StorageFilename, data: Uint8Array): void {
  const folderpath = join(Deno.cwd(), Deno.env.get("STORAGEFOLDER") ?? "");
  Deno.mkdirSync(folderpath, { recursive: true });
  const filepath = join(folderpath, StorageFilename[filename]);
  log().debug(filepath);
  Deno.writeFileSync(filepath, data);
}

export function read(filename: StorageFilename): Uint8Array {
  const filepath = join(
    Deno.cwd(),
    Deno.env.get("STORAGEFOLDER") ?? "",
    StorageFilename[filename]
  );
  log().debug(filepath);
  if (!existsSync(filepath)) {
    log().error(`The file not exists ${filepath} !!`);
    throw new Error(`The file not exists ${filepath}`);
  }
  return Deno.readFileSync(filepath);
}

export function readStaticJSONFile<T>(filename: string, def?: T): T {
  const filepath = join(Deno.cwd(), "static", filename);
  log().debug(filepath);
  if (!existsSync(filepath)) {
    log().error(`The file not exists ${filepath} !!`);
    throw new Error(`The file not exists ${filepath}`);
  }
  const raw = Deno.readTextFileSync(filepath);

  try {
    return JSON.parse(raw) as T;
  } catch {
    return def ?? ({} as T);
  }
}
