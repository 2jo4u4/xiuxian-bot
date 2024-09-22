import {
  ButtonComponent,
  ButtonStyles,
  ChannelTypes,
  createBot,
  Intents,
  InteractionResponseTypes,
  MessageComponentTypes,
  startBot,
} from "https://deno.land/x/discordeno@18.0.1/mod.ts";
import { CommandCtrl, UserCommand } from "./UserCommand.ts";
import { Game } from "./Game.ts";
import { QuestManager } from "./Quest.ts";
import { token } from "../discord-token.ts";
// import "./Dice.ts";

const commandCtrl = new CommandCtrl();
const game = new Game();
const questManager = new QuestManager();

const DiceKey = "!!Dice";

const bot = createBot({
  token: token,
  intents: Intents.Guilds | Intents.GuildMessages | Intents.MessageContent,
  events: {
    ready() {
      console.log("Successfully connected to gateway");
    },
    guildCreate(bot, guild) {
      const defaultChannel = guild.channels.find(channel => channel.type === ChannelTypes.GuildText);
      if (defaultChannel) {
        bot.helpers.sendMessage(defaultChannel.id, {
          content: `天道之大，欲行逆天，亦可獨行，也可抱團。\n使用 **\`${CommandCtrl.prefix}${CommandCtrl.keyword} 幫助\`** 獲得使用說明`,
        });
      }
    },
    messageCreate(bot, message) {
      if (message.isFromBot) return;

      const isCommand = commandCtrl.getCommandType(message.content);
      if (isCommand === null) return;
      const { command, p } = isCommand;

      switch (command) {
        case UserCommand.幫助: {
          bot.helpers.sendMessage(message.channelId, { content: "不告訴你" });
          break;
        }
        case UserCommand.建立角色: {
          const role = game.createRole(message.authorId);
          game.addRole(role);
          game.storeRoleData();
          bot.helpers.sendMessage(message.channelId, { content: `天道之下，又逢一位欲逆天改命之人。${message.tag}` });
          break;
        }
        case UserCommand.狀態: {
          const role = game.getRole(message.authorId);
          if (role) {
            bot.helpers.sendMessage(message.channelId, { content: `${message.tag}目前的境界為\`${role.level.text}\`` });
          } else {
            bot.helpers.sendMessage(message.channelId, {
              content: `請先使用指令 \`${CommandCtrl.prefix}${CommandCtrl.keyword} 建立角色\` 創建角色`,
            });
          }
          break;
        }
        case UserCommand.接受任務: {
          const role = game.getRole(message.authorId);
          if (role && role.executeQuest === null) {
            const quest = questManager.assignQuest(role);
            bot.helpers.sendMessage(message.channelId, {
              content: `\`\`\`md
${quest.title}

${quest.desc}
\`\`\``,
            });

            const components: ButtonComponent[] = [];
            const disabled = quest.type === "dice";
            if (disabled) {
              components.push({
                type: MessageComponentTypes.Button,
                label: "投骰子",
                style: ButtonStyles.Primary,
                customId: `${role.userId.toString()}, ${DiceKey}`,
              });
            }
            quest.options.forEach(({ desc, ansId }) => {
              components.push({
                type: MessageComponentTypes.Button,
                label: desc,
                style: ButtonStyles.Primary,
                customId: `${role.userId.toString()}, ${ansId}`,
                disabled,
              });
            });
            setTimeout(() => {
              bot.helpers.sendMessage(message.channelId, {
                components: [
                  {
                    type: MessageComponentTypes.ActionRow,
                    components: components as any,
                  },
                ],
              });
            }, 16);
          } else {
            bot.helpers.sendMessage(message.channelId, {
              content: `請使用指令 \`${CommandCtrl.prefix}${CommandCtrl.keyword} 建立角色\`來建立角色。\n若已建立角色，請使用  \`${CommandCtrl.prefix}${CommandCtrl.keyword} 接受任務\`來獲取任務。`,
            });
          }
          break;
        }
        case UserCommand.取消任務: {
          const role = game.getRole(message.authorId);
          if (role) {
            if (role.executeQuest === null) {
              bot.helpers.sendMessage(message.channelId, {
                content: "目前沒有接受的任務",
              });
            } else {
              const { title } = role.executeQuest;
              bot.helpers.sendMessage(message.channelId, { content: `已放棄 ${title} 任務` });
              role.executeQuest = null;
            }
          } else {
            bot.helpers.sendMessage(message.channelId, {
              content: `請先使用指令 \`${CommandCtrl.prefix}${CommandCtrl.keyword} 建立角色\` 創建角色`,
            });
          }
          break;
        }
        default:
          bot.helpers.sendMessage(message.channelId, { content: "無效或未實現的指令" });
          break;
      }
    },
    interactionCreate(bot, interaction) {
      if (interaction.data?.customId === undefined) {
        bot.helpers.sendInteractionResponse(interaction.id, interaction.token, {
          type: InteractionResponseTypes.ChannelMessageWithSource,
          data: { content: "未知的錯誤" },
        });
        return;
      }
      const [_userid, customId] = interaction.data.customId.split(", ");

      const userid = BigInt(_userid);
      const role = game.getRole(userid);
      if (role === undefined || role.executeQuest === null) {
        bot.helpers.sendInteractionResponse(interaction.id, interaction.token, {
          type: InteractionResponseTypes.ChannelMessageWithSource,
          data: { content: "不正確的使用者" },
        });
      } else {
        if (customId === DiceKey) {
          role.executeQuest.onRoll(role);
        } else {
          role.executeQuest.onAnswer(customId);
        }
        if (role.executeQuest.anser) {
          bot.helpers.deleteMessage(interaction.channelId!, interaction.message!.id);
          bot.helpers.sendMessage(interaction.channelId!, {
            content: `已選擇了 ${role.executeQuest.anser!.desc} `,
          });
          role.gainExp(role.executeQuest.anser.score);
          role.executeQuest = null;
        }
      }
    },
  },
});

await startBot(bot);
