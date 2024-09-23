import "jsr:@std/dotenv/load";
import {
  ButtonComponent,
  ButtonStyles,
  ChannelTypes,
  createBot,
  Intents,
  InteractionResponseTypes,
  MessageComponentTypes,
  startBot,
} from "./deps.ts";
import { CommandCtrl, UserCommand } from "./UserCommand.ts";
import { Game } from "./Game.ts";
import { QuestManager } from "./Quest.ts";
import { Template } from "./TextTemplate.ts";

async function botLoop() {
  const DiceKey = "!!Dice";
  const commandCtrl = new CommandCtrl();
  const game = new Game();
  const questManager = new QuestManager();

  const bot = createBot({
    token: Deno.env.get("discordToken") ?? "",
    intents: Intents.Guilds | Intents.GuildMessages | Intents.MessageContent,
    events: {
      ready() {
        console.log("Successfully connected to gateway");
      },
      guildCreate(bot, guild) {
        const defaultChannel = guild.channels.find(
          (channel) => channel.type === ChannelTypes.GuildText
        );
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
        const { command } = isCommand;

        switch (command) {
          case UserCommand.幫助: {
            const content = Template.help();
            bot.helpers.sendMessage(message.channelId, { content });
            break;
          }
          case UserCommand.建立角色: {
            const role = game.createRole(message.authorId);
            game.addRole(role);
            game.storeRoleData();
            const content = Template.createRole(message.tag);
            bot.helpers.sendMessage(message.channelId, { content });
            break;
          }
          case UserCommand.狀態: {
            const role = game.getRole(message.authorId);
            const content = role
              ? Template.status(message.tag, role.level.text)
              : Template.noHasRole();
            bot.helpers.sendMessage(message.channelId, { content });

            break;
          }
          case UserCommand.接受任務: {
            const role = game.getRole(message.authorId);
            if (role && role.executeQuest === null) {
              const quest = questManager.assignQuest(role);

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
              const content = Template.questDesc(
                quest.title,
                quest.desc,
                message.tag
              );
              bot.helpers.sendMessage(message.channelId, {
                content,
                components: [
                  {
                    type: MessageComponentTypes.ActionRow,
                    components: components as [ButtonComponent],
                  },
                ],
              });
            } else {
              const content =
                role === undefined
                  ? Template.noHasRole()
                  : Template.alreadyHasQuest();
              bot.helpers.sendMessage(message.channelId, { content });
            }
            break;
          }
          case UserCommand.取消任務: {
            const role = game.getRole(message.authorId);
            if (role) {
              if (role.executeQuest === null) {
                const content = Template.noHasQuest();
                bot.helpers.sendMessage(message.channelId, { content });
              } else {
                const { title } = role.executeQuest;
                const content = Template.giveupQuest(title);
                bot.helpers.sendMessage(message.channelId, { content });
                role.executeQuest = null;
              }
            } else {
              const content = Template.noHasRole();
              bot.helpers.sendMessage(message.channelId, { content });
            }
            break;
          }
          default: {
            const content = Template.unavailableCommand();
            bot.helpers.sendMessage(message.channelId, { content });
            break;
          }
        }
      },
      interactionCreate(bot, interaction) {
        if (interaction.data?.customId === undefined) {
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
        const [_userid, customId] = interaction.data.customId.split(", ");

        const userid = BigInt(_userid);
        const role = game.getRole(userid);
        if (role === undefined || role.executeQuest === null) {
          bot.helpers.sendInteractionResponse(
            interaction.id,
            interaction.token,
            {
              type: InteractionResponseTypes.ChannelMessageWithSource,
              data: { content: Template.incorrectUser() },
            }
          );
        } else {
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
            role.executeQuest = null;
          }
        }
      },
    },
  });

  await startBot(bot);
}

async function main() {
  console.log("The Server Version:", Deno.env.get("version"));
  await botLoop();
}

main();
