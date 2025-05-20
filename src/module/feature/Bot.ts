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
import { CommandCtrl } from "./UserCommand.ts";
import { UserCommand } from "./Constants.ts";
import { Game } from "./Game.ts";
import { QuestManager } from "./QuestManager.ts";
import { Template } from "./TextTemplate.ts";

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

export async function botLoop() {
  const DiceKey = "!!Dice";
  const commandCtrl = new CommandCtrl();
  const game = new Game();
  const questManager = new QuestManager();
  game.injectUsers();
  questManager.injectQuest();
  const token = Deno.env.get("DISCORDTOKEN");
  if (token !== undefined) {
    const guildId = BigInt(0);
    const bot = createBot({
      token,
      intents: Intents.Guilds | Intents.GuildMessages | Intents.MessageContent,
      events: {
        ready() {
          console.log("Successfully connected to gateway");
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
          const parsed = commandCtrl.getSecondCommand(...p);
          const { authorId, channelId, tag } = message;

          // 指令對應處理函式表（補齊所有 UserCommand key，未實作的給預設回應）
          const commandHandlers: Record<UserCommand, () => void> = {
            [UserCommand.幫助]: () => {
              bot.helpers.sendMessage(channelId, { content: Template.help() });
            },
            [UserCommand.建立角色]: () => {
              const role = game.createRole(guildId, authorId);
              game.addRole(role);
              bot.helpers.sendMessage(channelId, {
                content: Template.createRole(tag),
              });
            },
            [UserCommand.狀態]: () => {
              const role = game.getRole(guildId, authorId);
              const content =
                role === undefined
                  ? Template.noHasRole()
                  : Template.status(tag, role);
              bot.helpers.sendMessage(channelId, { content });
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
                bot.helpers.sendMessage(channelId, {
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
              bot.helpers.sendMessage(channelId, { content });
            },
            [UserCommand.丟骰子]: () => {
              bot.helpers.sendMessage(channelId, {
                content: Template.unavailableCommand(),
              });
            },
            [UserCommand.回覆任務]: () => {
              bot.helpers.sendMessage(channelId, {
                content: Template.unavailableCommand(),
              });
            },
            [UserCommand.取消任務]: () => {
              const role = game.getRole(guildId, authorId);
              if (role && role.executeQuest !== null) {
                const content = Template.giveupQuest(role.executeQuest.title);
                bot.helpers.sendMessage(channelId, { content });
                role.executeQuest = null;
              } else {
                const content =
                  role === undefined
                    ? Template.noHasRole()
                    : Template.noHasQuest();
                bot.helpers.sendMessage(channelId, { content });
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
              bot.helpers.sendMessage(channelId, { content });
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
              bot.helpers.sendMessage(channelId, { content });
            },
            [UserCommand.使用道具]: () => {
              const role = game.getRole(guildId, authorId);
              let content = "";
              if (role === undefined) {
                content = Template.noHasRole();
              } else if (!parsed?.itemId) {
                content = "請輸入要使用的道具ID。";
              } else {
                const result = role.useItem(parsed.itemId);
                content = result.message;
              }
              bot.helpers.sendMessage(channelId, { content });
            },
            [UserCommand.裝備]: () => {
              const role = game.getRole(guildId, authorId);
              let content = "";
              if (role === undefined) {
                content = Template.noHasRole();
              } else if (!parsed?.itemId) {
                content = "請輸入要裝備的道具ID。";
              } else {
                const result = role.equipItem(parsed.itemId);
                content = result.message;
              }
              bot.helpers.sendMessage(channelId, { content });
            },
            [UserCommand.卸下裝備]: () => {
              const role = game.getRole(guildId, authorId);
              let content = "";
              if (role === undefined) {
                content = Template.noHasRole();
              } else if (!parsed?.slot) {
                content =
                  "請輸入要卸下的部位名稱（如 weapon/armor/ring/necklace）。";
              } else {
                const result = role.unequip(parsed.slot);
                content = result.message;
              }
              bot.helpers.sendMessage(channelId, { content });
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
              bot.helpers.sendMessage(channelId, { content });
            },
            [UserCommand.保存所有使用者]: () => {
              game.storeUser();
            },
            [UserCommand.關閉伺服器]: () => {
              game.storeUser();
              return Deno.exit(0);
            },
          };

          if (command in commandHandlers) {
            commandHandlers[command as UserCommand]!();
          } else {
            const content = Template.unavailableCommand();
            bot.helpers.sendMessage(channelId, { content });
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
                bot.helpers.deleteMessage(
                  interaction.channelId!,
                  interaction.message!.id
                );
                bot.helpers.sendMessage(interaction.channelId!, {
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
