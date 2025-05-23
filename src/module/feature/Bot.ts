import { getLogger } from "jsr:@std/log";
import "jsr:@std/dotenv/load";
import {
  ButtonComponent,
  ButtonStyles,
  createBot,
  Intents,
  InteractionResponseTypes,
  MessageComponentTypes,
  startBot,
} from "../../deps.ts";
import type { Bot } from "../../deps.ts";
import { CommandCtrl } from "./UserCommand.ts";
import { UserCommand } from "./Constants.ts";
import { GameHost } from "./GameHost.ts";
import { QuestManager } from "./QuestManager.ts";
import { Template } from "./TextTemplate.ts";
import { getRandomMonsterByPlayerLevel, Monster } from "./Monster.ts";
import { calculateReward } from "./Reward.ts";
import { battle } from "./Battle.ts";
import { StoryEngine, GameStory } from "./Story.ts";
import { ItemList, ItemDefinition } from "./ItemDefinitions.ts";
import { readStaticJSONFile } from "../../storage/mod.ts";

const log = getLogger("Bot");
const symbolCustomId = ", ";
function createBtnCustomId(...ss: string[]) {
  return ss.reduce((prev, curr, index) => {
    if (index === 0) return curr;
    return prev + symbolCustomId + curr;
  }, "");
}
function splitBtnCustomId(s: string) {
  return s.split(symbolCustomId);
}

// 安全包裝發送訊息，防止權限錯誤導致服務終止
async function safeSendMessage(
  bot: Bot,
  channelId: bigint,
  payload: Record<string, unknown>
) {
  try {
    await bot.helpers.sendMessage(channelId, payload);
  } catch (e) {
    let msg = "";
    if (
      typeof e === "object" &&
      e !== null &&
      "message" in e &&
      typeof (e as { message: unknown }).message === "string"
    ) {
      msg = (e as { message: string }).message;
    } else {
      msg = String(e);
    }
    if (msg.includes("Missing Permissions")) {
      log.warn("Bot 沒有權限在此頻道發言");
    } else {
      log.error("sendMessage error:", e);
    }
  }
}

// 安全包裝刪除訊息，防止權限錯誤導致服務終止
async function safeDeleteMessage(
  bot: Bot,
  channelId: bigint,
  messageId: bigint
) {
  try {
    await bot.helpers.deleteMessage(channelId, messageId);
  } catch (e) {
    let msg = "";
    if (
      typeof e === "object" &&
      e !== null &&
      "message" in e &&
      typeof (e as { message: unknown }).message === "string"
    ) {
      msg = (e as { message: string }).message;
    } else {
      msg = String(e);
    }
    if (msg.includes("Missing Permissions")) {
      log.warn("Bot 沒有權限刪除此頻道訊息");
    } else {
      log.error("deleteMessage error:", e);
    }
  }
}

const defStory: GameStory = {
  nostory: {
    id: "nostory",
    title: "故事載入失敗",
    description: "",
    options: [],
    isStartingScene: true,
    isEndingScene: true,
  },
};

function getRandomStoryFn() {
  const all_story = [
    readStaticJSONFile<GameStory>("Story1.json", defStory),
    readStaticJSONFile<GameStory>("Story2.json", defStory),
    readStaticJSONFile<GameStory>("Story3.json", defStory),
  ];
  return () => {
    const idx = Math.floor(Math.random() * all_story.length);
    return all_story[idx];
  };
}

export async function botLoop() {
  const DiceKey = "!!Dice";
  const commandCtrl = new CommandCtrl();
  const game = new GameHost();
  const questManager = new QuestManager();
  game.injectUsers();
  questManager.injectQuest();
  const token = Deno.env.get("DISCORDTOKEN");
  const admin_id = Deno.env.get("MANAGER");
  const admin = admin_id ? BigInt(admin_id) : null;

  // 玩家臨時遭遇怪物暫存（型別明確）
  const playerEncounter: Map<string, Monster> = new Map();
  // 故事模式：每位用戶獨立進度
  const userStories: Map<string, StoryEngine> = new Map();
  const randomStoryFn = getRandomStoryFn();

  if (token !== undefined) {
    /**
     * 不因有不同伺服器(公會)而有不同角色。
     *
     * 保留此參數為相容既有程式碼。
     */
    const guildId = 0n;
    const bot = createBot({
      token,
      intents: Intents.Guilds | Intents.GuildMessages | Intents.MessageContent,
      events: {
        ready() {
          log.info("Successfully connected to gateway");
        },
        // guildCreate(bot, guild) {
        //   const defaultChannel = guild.channels.find(
        //     (channel) => channel.type === ChannelTypes.GuildText
        //   );
        //   if (defaultChannel) {
        //     const content = Template.sayHi();
        //     bot.helpers.sendMessage(defaultChannel.id, { content });
        //   }
        // },
        messageCreate(bot, message) {
          if (message.isFromBot) return;

          const isCommand = commandCtrl.getCommandType(message.content);
          if (isCommand === null) return;
          const { command, p } = isCommand;
          const { authorId: userId, channelId, tag } = message;
          const role = game.getRole(guildId, userId);
          if (isCommand.command === UserCommand.幫助) {
            safeSendMessage(bot, channelId, { content: Template.help() });
          } else if (isCommand.command === UserCommand.建立角色) {
            const role = game.createRole(guildId, userId);
            game.addRole(role);
            safeSendMessage(bot, channelId, {
              content: Template.createRole(tag),
            });
          } else if (role !== undefined) {
            // 指令對應處理函式表（補齊所有 UserCommand key，未實作的給預設回應）
            const commandHandlers: Record<UserCommand, () => void> = {
              [UserCommand.幫助]: () => {
                // 不會觸發
              },
              [UserCommand.建立角色]: () => {
                // 不會觸發
              },
              [UserCommand.狀態]: () => {
                safeSendMessage(bot, channelId, {
                  content: Template.status(tag, role),
                });
              },
              [UserCommand.接受任務]: () => {
                let content = "";
                if (role.executeQuest !== null) {
                  content = Template.alreadyHasQuest();
                } else if (role.duringTraining) {
                  content = Template.duringTraining(role);
                } else {
                  const quest = questManager.assignQuest(role);
                  const components: ButtonComponent[] = [];
                  const disabled = quest.type === "dice";
                  if (disabled) {
                    const customId = createBtnCustomId(
                      role.userId.toString(),
                      DiceKey
                    );
                    components.push({
                      type: MessageComponentTypes.Button,
                      label: "投骰子",
                      style: ButtonStyles.Primary,
                      customId,
                    });
                  }
                  quest.options.forEach(({ desc, ansId }) => {
                    const customId = createBtnCustomId(
                      role.userId.toString(),
                      ansId
                    );
                    components.push({
                      type: MessageComponentTypes.Button,
                      label: desc,
                      style: ButtonStyles.Primary,
                      customId,
                      disabled,
                    });
                  });
                  content = Template.questDesc(quest.title, quest.desc, tag);
                  safeSendMessage(bot, channelId, {
                    content,
                    components: [
                      {
                        type: MessageComponentTypes.ActionRow,
                        components: components as [ButtonComponent],
                      },
                    ],
                  });
                  return;
                }
                safeSendMessage(bot, channelId, { content });
              },
              [UserCommand.丟骰子]: () => {
                safeSendMessage(bot, channelId, {
                  content: Template.unavailableCommand(),
                });
              },
              [UserCommand.回覆任務]: () => {
                safeSendMessage(bot, channelId, {
                  content: Template.unavailableCommand(),
                });
              },
              [UserCommand.取消任務]: () => {
                if (role.executeQuest !== null) {
                  const content = Template.giveupQuest(role.executeQuest.title);
                  safeSendMessage(bot, channelId, { content });
                  role.executeQuest = null;
                } else {
                  safeSendMessage(bot, channelId, {
                    content: Template.noHasQuest(),
                  });
                }
              },
              [UserCommand.閉關]: () => {
                let content = "";
                if (role.duringTraining) {
                  content = Template.duringTraining(role);
                } else {
                  role.starTraining();
                  content = Template.starTraining(tag);
                }
                safeSendMessage(bot, channelId, { content });
              },
              [UserCommand.閉關結束]: () => {
                let content = "";
                if (!role.duringTraining) {
                  content = Template.starTrainingFirst();
                } else {
                  const hours = role.overTraining();
                  content = Template.overTraining(tag, hours);
                }
                safeSendMessage(bot, channelId, { content });
              },
              [UserCommand.使用道具]: () => {
                const item_id: string | undefined = p[0];
                let content = "";
                if (!item_id) {
                  content = "請輸入要使用的道具ID。";
                } else {
                  const result = role.useItem(item_id);
                  content = result.message;
                }
                safeSendMessage(bot, channelId, { content });
              },
              [UserCommand.裝備]: () => {
                const item_id: string | undefined = p[0];
                let content = "";
                if (!item_id) {
                  content = "請輸入要裝備的道具ID。";
                } else {
                  const result = role.equipItem(item_id);
                  content = result.message;
                }
                safeSendMessage(bot, channelId, { content });
              },
              [UserCommand.卸下裝備]: () => {
                const slot: string | undefined = p[0];
                let content = "";
                if (!slot) {
                  content =
                    "請輸入要卸下的部位名稱（如 weapon/armor/ring/necklace）。";
                } else {
                  const result = role.unequip(slot);
                  content = result.message;
                }
                safeSendMessage(bot, channelId, { content });
              },
              [UserCommand.查看背包]: () => {
                const backpackItems = role.getBackpackItems();
                const equipmentDetails = role.getEquipmentDetails();
                const content = Template.showBackpackAndEquipment(
                  backpackItems,
                  equipmentDetails
                );
                safeSendMessage(bot, channelId, { content });
              },
              [UserCommand.保存所有使用者]: () => {
                if (admin === userId) {
                  game.storeUser();
                }
              },
              [UserCommand.關閉伺服器]: () => {
                if (admin === userId) {
                  game.storeUser();
                  return Deno.exit(0);
                }
              },
              [UserCommand.搜尋敵人]: () => {
                const monster = getRandomMonsterByPlayerLevel(role.level.text);
                playerEncounter.set(`${role.guildId}_${role.userId}`, monster);
                safeSendMessage(bot, channelId, {
                  content: `你在附近發現了一隻「${monster.name}」（${monster.level}）！\n輸入「%修仙 戰鬥」挑戰或「%修仙 逃跑」離開。`,
                });
              },
              [UserCommand.戰鬥]: () => {
                const key = `${role.guildId}_${role.userId}`;
                const monster = playerEncounter.get(key);
                if (!monster) {
                  safeSendMessage(bot, channelId, {
                    content: "你目前沒有遇到任何敵人，請先『搜尋敵人』。",
                  });
                  return;
                }
                // 執行戰鬥
                const result = battle(role, monster);
                let msg = `你與「${monster.name}」展開戰鬥！\n`;
                msg += result.log ? result.log.join("\n") + "\n" : "";
                if (result.isWin) {
                  // 勝利給獎勵，並寫回剩餘血量/法力
                  role.hp = result.playerHp;
                  role.mp = result.playerMp;
                  const reward = calculateReward(role, monster);
                  role.gainExp(reward.exp);
                  reward.items.forEach((item) => role.gainItem(item.id));
                  msg += `你擊敗了敵人，獲得經驗值 ${reward.exp}`;
                  if (reward.items.length > 0) {
                    msg += `，並獲得：${reward.items
                      .map((i) => i.name)
                      .join("、")}。`;
                  }
                } else {
                  // 失敗：扣 1% 經驗，血量/法力補滿
                  const lostExp = Math.floor(role.exp * 0.01);
                  role.gainExp(-lostExp);
                  const state = role.getRoleState();
                  role.hp = state.maxHp;
                  role.mp = state.maxMp;
                  msg += `你戰敗了，損失經驗值 ${lostExp}，血量與法力已恢復。請再接再厲！`;
                }
                playerEncounter.delete(key);
                safeSendMessage(bot, channelId, { content: msg });
              },
              [UserCommand.逃跑]: () => {
                const key = `${role.guildId}_${role.userId}`;
                if (playerEncounter.has(key)) {
                  playerEncounter.delete(key);
                  safeSendMessage(bot, channelId, {
                    content: "你選擇了逃跑，暫時脫離了危險。",
                  });
                } else {
                  safeSendMessage(bot, channelId, {
                    content: "你目前沒有遇到任何敵人。",
                  });
                }
              },
              [UserCommand.搜尋並戰鬥]: () => {
                // 搜尋敵人
                const monster = getRandomMonsterByPlayerLevel(role.level.text);
                // 立即戰鬥
                const result = battle(role, monster);
                let msg = `你在附近發現了一隻「${monster.name}」（${monster.level}）！\n`;
                msg += `你與「${monster.name}」展開戰鬥！\n`;
                msg += result.log ? result.log.join("\n") + "\n" : "";
                if (result.isWin) {
                  role.hp = result.playerHp;
                  role.mp = result.playerMp;
                  const reward = calculateReward(role, monster);
                  role.gainExp(reward.exp);
                  reward.items.forEach((item) => role.gainItem(item.id));
                  msg += `你擊敗了敵人，獲得經驗值 ${reward.exp}`;
                  if (reward.items.length > 0) {
                    msg += `，並獲得：${reward.items
                      .map((i) => i.name)
                      .join("、")}。`;
                  }
                } else {
                  const lostExp = Math.floor(role.exp * 0.01);
                  role.gainExp(-lostExp);
                  const state = role.getRoleState();
                  role.hp = state.maxHp;
                  role.mp = state.maxMp;
                  msg += `你戰敗了，損失經驗值 ${lostExp}，血量與法力已恢復。請再接再厲！`;
                }
                safeSendMessage(bot, channelId, { content: msg });
              },
              [UserCommand.story]: () => {
                const key = `${guildId}_${userId}`;
                let engine = userStories.get(key);
                if (!engine) {
                  engine = new StoryEngine(randomStoryFn());
                  userStories.set(key, engine);
                }
                const scene = engine.getCurrentScene();
                let msg = `【${scene.title}】\n${scene.description}\n`;
                if (engine.isEnd()) {
                  msg += "\n【故事已結束】請重新輸入 story 以開始新故事。";
                } else {
                  msg +=
                    "\n可選擇：" +
                    scene.options
                      .map((o, i) => `(${i + 1})${o.text}`)
                      .join("  ");
                  msg += "\n請用 storypick <編號> 選擇。";
                }
                safeSendMessage(bot, channelId, { content: msg });
              },
              [UserCommand.storyPick]: () => {
                const key = `${guildId}_${userId}`;
                const engine = userStories.get(key);
                if (!engine) {
                  safeSendMessage(bot, channelId, {
                    content: "請先輸入 story 開始故事模式。",
                  });
                  return;
                }
                const scene = engine.getCurrentScene();
                if (engine.isEnd()) {
                  safeSendMessage(bot, channelId, {
                    content: "故事已結束，請重新輸入 story 以開始新故事。",
                  });
                  return;
                }
                const idx = parseInt(p[0]);
                if (isNaN(idx) || idx < 1 || idx > scene.options.length) {
                  safeSendMessage(bot, channelId, {
                    content: `請輸入有效的選項編號（1-${scene.options.length}）。`,
                  });
                  return;
                }
                const option = scene.options[idx - 1];
                const outcome = engine.chooseOption(option.id);
                let msg = `你選擇了「${option.text}」\n${outcome || ""}`;
                const nextScene = engine.getCurrentScene();
                msg += `\n\n【${nextScene.title}】\n${nextScene.description}`;
                let rewardMsg = "";
                if (engine.isEnd()) {
                  // === 獎勵邏輯 ===
                  // 經驗值獎勵
                  const exp = 100 + Math.floor(Math.random() * 101); // 100~200
                  role.gainExp(exp);
                  rewardMsg += `\n\n🎉 恭喜完成故事，獲得經驗值 ${exp}`;
                  // 隨機道具/裝備
                  const weighted: ItemDefinition[] = [];
                  for (const item of ItemList) {
                    let weight = 1;
                    switch (item.rarity) {
                      case "legendary":
                        weight = 1;
                        break;
                      case "epic":
                        weight = 3;
                        break;
                      case "rare":
                        weight = 8;
                        break;
                      case "uncommon":
                        weight = 20;
                        break;
                      case "common":
                        weight = 40;
                        break;
                      default:
                        weight = 1;
                        break;
                    }
                    for (let i = 0; i < weight; i++) weighted.push(item);
                    if (weighted.length > 0) {
                      const item =
                        weighted[Math.floor(Math.random() * weighted.length)];
                      role.gainItem(item.id);
                      rewardMsg += `，並獲得道具/裝備：${item.name}（${item.rarity}）`;
                    }
                  }
                  msg += `\n${rewardMsg}`;
                  msg += "\n【故事已結束】請重新輸入 story 以開始新故事。";
                } else {
                  msg +=
                    "\n可選擇：" +
                    nextScene.options
                      .map((o, i) => `(${i + 1})${o.text}`)
                      .join("  ");
                  msg += "\n請用 storypick <編號> 選擇。";
                }
                safeSendMessage(bot, channelId, { content: msg });
              },
              [UserCommand.storyState]: () => {
                const key = `${guildId}_${userId}`;
                const engine = userStories.get(key);
                if (!engine) {
                  safeSendMessage(bot, channelId, {
                    content: "請先輸入 story 開始故事模式。",
                  });
                  return;
                }
                const scene = engine.getCurrentScene();
                let msg = `【${scene.title}】\n${scene.description}\n`;
                if (engine.isEnd()) {
                  msg += "\n【故事已結束】請重新輸入 story 以開始新故事。";
                } else {
                  msg +=
                    "\n可選擇：" +
                    scene.options
                      .map((o, i) => `(${i + 1})${o.text}`)
                      .join("  ");
                  msg += "\n請用 storypick <編號> 選擇。";
                }
                safeSendMessage(bot, channelId, { content: msg });
              },
            };

            if (command in commandHandlers) {
              commandHandlers[command]!();
            } else {
              const content = Template.unavailableCommand();
              safeSendMessage(bot, channelId, { content });
            }
          } else {
            safeSendMessage(bot, channelId, { content: Template.noHasRole() });
          }
        },
        interactionCreate(bot, interaction) {
          if (
            interaction.data === undefined ||
            interaction.data.customId === undefined
          ) {
            bot.helpers.sendInteractionResponse(
              interaction.id,
              interaction.token,
              {
                type: InteractionResponseTypes.ChannelMessageWithSource,
                data: { content: Template.unknownError() },
              }
            );
            return;
          }

          const [_userid, customId] = splitBtnCustomId(
            interaction.data.customId
          );
          const userid = BigInt(_userid);
          if (interaction.user.id === userid) {
            const role = game.getRole(guildId, userid);
            if (role !== undefined && role.executeQuest !== null) {
              if (customId === DiceKey) {
                role.executeQuest.onRoll(role);
              } else {
                role.executeQuest.onAnswer(customId);
              }
              if (role.executeQuest.anser) {
                safeDeleteMessage(
                  bot,
                  interaction.channelId!,
                  interaction.message!.id
                );
                safeSendMessage(bot, interaction.channelId!, {
                  content: Template.chooseQuestOption(
                    role.executeQuest.title,
                    role.executeQuest.desc,
                    role.executeQuest.anser!.desc
                  ),
                });
                role.gainExp(role.executeQuest.anser.score);

                return;
              }
            }
          }
          bot.helpers.sendInteractionResponse(
            interaction.id,
            interaction.token,
            {
              type: InteractionResponseTypes.ChannelMessageWithSource,
              data: { content: Template.incorrectUser() },
            }
          );
        },
      },
    });

    await startBot(bot);
    return 0;
  } else {
    return 1;
  }
}
