import { write, read, StorageFilename } from "../../storage/mod.ts";
import * as UsersTools from "../../definition/messages/Users.ts";
import * as RoleTools from "../../definition/messages/Role.ts";
import * as QuestBoardtTools from "../../definition/messages/QuestBoard.ts";
import * as QuestTools from "../../definition/messages/Quest.ts";
import * as QuestOptionsTools from "../../definition/messages/QuestOptions.ts";
import { getLogger } from "jsr:@std/log";

export type RoleJson = UsersTools.Type["role"];
export type QuestJson = QuestBoardtTools.Type["quest"];
export type Role = RoleTools.Type;
export type Quest = QuestTools.Type;

export type QuestOptions = QuestOptionsTools.Type;
class DataBase {
  readonly log: ReturnType<typeof getLogger>;
  constructor() {
    this.log = getLogger("default");
  }

  private checuUserFileExist(filename: StorageFilename) {
    try {
      read(filename);
    } catch (e) {
      write(filename, new Uint8Array());
      this.log.debug("Auto Create File");
    }
  }
  storeUsers(role: RoleJson) {
    write(StorageFilename.Users, UsersTools.encodeBinary({ role }));
  }
  readUsers() {
    this.checuUserFileExist(StorageFilename.Users);
    const file = UsersTools.decodeBinary(read(StorageFilename.Users));
    return file;
  }

  storeQuestBoard(quest: QuestJson) {
    write(
      StorageFilename.QuestBoard,
      QuestBoardtTools.encodeBinary({
        quest,
      })
    );
  }
  readQuestBoard() {
    this.checuUserFileExist(StorageFilename.QuestBoard);
    const file = QuestBoardtTools.decodeBinary(
      read(StorageFilename.QuestBoard)
    );
    return file;
  }
}

export const database = new DataBase();
