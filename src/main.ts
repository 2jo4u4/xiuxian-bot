import { load as envLoad } from "./deps.ts";
import { botLoop } from "./module/feature/Bot.ts";
import { init as logInit } from "./module/log/mod.ts";
import { init as storeInit } from "./storage/mod.ts";
import {
    exampleGetFromFile,
    examplePeopleRead,
    examplePeopleWrite,
    exampleSaveToFile,
} from "./storage/example.ts";

function envWithoutBot() {
    exampleSaveToFile();
    exampleGetFromFile();
    examplePeopleWrite();
    examplePeopleRead();
}
function envDevelop() {
  botLoop();
}
function envProduct() {
  botLoop();
}

function main() {
  envLoad();
  // setup the log
  logInit();
  storeInit();
  // choose the env
  switch (Deno.env.get("ENV")) {
    case "withoutBot":
      envWithoutBot();
      break;
    case "product":
      envProduct();
      break;
    default:
      envDevelop();
      break;
  }
}
main();
