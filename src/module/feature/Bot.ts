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

// 玩家臨時遭遇怪物暫存（型別明確）
const playerEncounter: Map<string, Monster> = new Map();
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

export async function botLoop() {
  const DiceKey = "!!Dice";
  const commandCtrl = new CommandCtrl();
  const game = new GameHost();
  const questManager = new QuestManager();
  game.injectUsers();
  questManager.injectQuest();
  const token = Deno.env.get("DISCORDTOKEN");
  const hasAdmin = Deno.env.get("MANAGER") !== undefined;
  const admin = BigInt(Deno.env.get("MANAGER")!);
  if (token !== undefined) {
    const guildId = BigInt(0);
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
          const { authorId, channelId, tag } = message;
          /**
           * 不因有不同伺服器(公會)而有不同角色。
           *
           * 保留此參數為相容既有程式碼。
           */
          const guildId = 0n;
          const userId = BigInt(authorId);

          // 指令對應處理函式表（補齊所有 UserCommand key，未實作的給預設回應）
          const commandHandlers: Record<UserCommand, () => void> = {
            [UserCommand.幫助]: () => {
              safeSendMessage(bot, channelId, { content: Template.help() });
            },
            [UserCommand.建立角色]: () => {
              const role = game.createRole(guildId, authorId);
              game.addRole(role);
              safeSendMessage(bot, channelId, {
                content: Template.createRole(tag),
              });
            },
            [UserCommand.狀態]: () => {
              const role = game.getRole(guildId, authorId);
              const content =
                role === undefined
                  ? Template.noHasRole()
                  : Template.status(tag, role);
              safeSendMessage(bot, channelId, { content });
            },
            [UserCommand.接受任務]: () => {
              const role = game.getRole(guildId, authorId);
              let content = "";
              if (role === undefined) {
                content = Template.noHasRole();
              } else if (role.executeQuest !== null) {
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
              const role = game.getRole(guildId, authorId);
              if (role && role.executeQuest !== null) {
                const content = Template.giveupQuest(role.executeQuest.title);
                safeSendMessage(bot, channelId, { content });
                role.executeQuest = null;
              } else {
                const content =
                  role === undefined
                    ? Template.noHasRole()
                    : Template.noHasQuest();
                safeSendMessage(bot, channelId, { content });
              }
            },
            [UserCommand.閉關]: () => {
              const role = game.getRole(guildId, authorId);
              let content = "";
              if (role === undefined) {
                content = Template.noHasRole();
              } else if (role.duringTraining) {
                content = Template.duringTraining(role);
              } else {
                role.starTraining();
                content = Template.starTraining(tag);
              }
              safeSendMessage(bot, channelId, { content });
            },
            [UserCommand.閉關結束]: () => {
              const role = game.getRole(guildId, authorId);
              let content = "";
              if (role === undefined) {
                content = Template.noHasRole();
              } else if (!role.duringTraining) {
                content = Template.starTrainingFirst();
              } else {
                const hours = role.overTraining();
                content = Template.overTraining(tag, hours);
              }
              safeSendMessage(bot, channelId, { content });
            },
            [UserCommand.使用道具]: () => {
              const item_id: string | undefined = p[0];
              const role = game.getRole(guildId, authorId);
              let content = "";
              if (role === undefined) {
                content = Template.noHasRole();
              } else if (!item_id) {
                content = "請輸入要使用的道具ID。";
              } else {
                const result = role.useItem(item_id);
                content = result.message;
              }
              safeSendMessage(bot, channelId, { content });
            },
            [UserCommand.裝備]: () => {
              const item_id: string | undefined = p[0];
              const role = game.getRole(guildId, authorId);
              let content = "";
              if (role === undefined) {
                content = Template.noHasRole();
              } else if (!item_id) {
                content = "請輸入要裝備的道具ID。";
              } else {
                const result = role.equipItem(item_id);
                content = result.message;
              }
              safeSendMessage(bot, channelId, { content });
            },
            [UserCommand.卸下裝備]: () => {
              const slot: string | undefined = p[0];
              const role = game.getRole(guildId, authorId);
              let content = "";
              if (role === undefined) {
                content = Template.noHasRole();
              } else if (!slot) {
                content =
                  "請輸入要卸下的部位名稱（如 weapon/armor/ring/necklace）。";
              } else {
                const result = role.unequip(slot);
                content = result.message;
              }
              safeSendMessage(bot, channelId, { content });
            },
            [UserCommand.查看背包]: () => {
              const role = game.getRole(guildId, authorId);
              let content = "";
              if (role === undefined) {
                content = Template.noHasRole();
              } else {
                const backpackItems = role.getBackpackItems();
                const equipmentDetails = role.getEquipmentDetails();
                content = Template.showBackpackAndEquipment(
                  backpackItems,
                  equipmentDetails
                );
              }
              safeSendMessage(bot, channelId, { content });
            },
            [UserCommand.保存所有使用者]: () => {
              if (hasAdmin && admin === userId) {
                game.storeUser();
              }
            },
            [UserCommand.關閉伺服器]: () => {
              if (hasAdmin && admin === userId) {
                game.storeUser();
                return Deno.exit(0);
              }
            },
            [UserCommand.搜尋敵人]: () => {
              const role = game.getRole(guildId, userId);
              if (!role) {
                safeSendMessage(bot, channelId, {
                  content: Template.noHasRole(),
                });
                return;
              }
              const monster = getRandomMonsterByPlayerLevel(role.level.text);
              playerEncounter.set(`${role.guildId}_${role.userId}`, monster);
              safeSendMessage(bot, channelId, {
                content: `你在附近發現了一隻「${monster.name}」（${monster.level}）！\n輸入「%修仙 戰鬥」挑戰或「%修仙 逃跑」離開。`,
              });
            },
            [UserCommand.戰鬥]: () => {
              const role = game.getRole(guildId, userId);
              if (!role) {
                safeSendMessage(bot, channelId, {
                  content: Template.noHasRole(),
                });
                return;
              }
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
              if (result.winner === "player") {
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
              const role = game.getRole(guildId, userId);
              if (!role) {
                safeSendMessage(bot, channelId, {
                  content: Template.noHasRole(),
                });
                return;
              }
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
              const role = game.getRole(guildId, userId);
              if (!role) {
                safeSendMessage(bot, channelId, {
                  content: Template.noHasRole(),
                });
                return;
              }
              // 搜尋敵人
              const monster = getRandomMonsterByPlayerLevel(role.level.text);
              // 立即戰鬥
              const result = battle(role, monster);
              let msg = `你在附近發現了一隻「${monster.name}」（${monster.level}）！\n`;
              msg += `你與「${monster.name}」展開戰鬥！\n`;
              msg += result.log ? result.log.join("\n") + "\n" : "";
              if (result.winner === "player") {
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
          };

          if (command in commandHandlers) {
            commandHandlers[command as UserCommand]!();
          } else {
            const content = Template.unavailableCommand();
            safeSendMessage(bot, channelId, { content });
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
