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
import { CommandCtrl, UserCommand } from "./UserCommand.ts";
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

  const bot = createBot({
    token: Deno.env.get("DISCORDTOKEN") ?? "",
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
        if (message.isFromBot || message.guildId === undefined) return;

        const isCommand = commandCtrl.getCommandType(message.content);
        if (isCommand === null) return;
        const { command } = isCommand;
        const { guildId, authorId, channelId, tag } = message;

        switch (command) {
          case UserCommand.幫助: {
            const content = Template.help();
            bot.helpers.sendMessage(channelId, { content });
            return;
          }
          case UserCommand.建立角色: {
            const role = game.createRole(guildId, authorId);
            game.addRole(role);
            const content = Template.createRole(tag);
            bot.helpers.sendMessage(channelId, { content });
            return;
          }
          case UserCommand.狀態: {
            const role = game.getRole(guildId, authorId);
            if (role) {
              bot.helpers.sendMessage(channelId, {
                content: Template.status(tag, role),
              });
            } else {
              bot.helpers.sendMessage(channelId, {
                content: Template.noHasRole(),
              });
            }
            return;
          }
          case UserCommand.接受任務: {
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

              const content = Template.questDesc(quest.title, quest.desc, tag);
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

            return;
          }
          case UserCommand.取消任務: {
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
            return;
          }
          case UserCommand.閉關: {
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
            return;
          }
          case UserCommand.閉關結束: {
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

            return;
          }
          case UserCommand.保存所有使用者: {
            game.storeUser();
            return;
          }
          case UserCommand.關閉伺服器: {
            game.storeUser();
            return Deno.exit(0);
          }
          default: {
            const content = Template.unavailableCommand();
            bot.helpers.sendMessage(channelId, { content });
            return;
          }
        }
      },
      interactionCreate(bot, interaction) {
        if (
          interaction.data === undefined ||
          interaction.data.customId === undefined ||
          interaction.guildId === undefined
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

        const [_userid, customId] = splitBtnCustomId(interaction.data.customId);
        const userid = BigInt(_userid);
        if (interaction.user.id === userid) {
          const role = game.getRole(interaction.guildId, userid);
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
        bot.helpers.sendInteractionResponse(interaction.id, interaction.token, {
          type: InteractionResponseTypes.ChannelMessageWithSource,
          data: { content: Template.incorrectUser() },
        });
      },
    },
  });

  await startBot(bot);
}
