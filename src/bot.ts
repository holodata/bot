import { PrismaClient } from "@prisma/client";
import {
  Client,
  CommandInteraction,
  GuildEmoji,
  Intents,
  MessageContextMenuInteraction,
  ReactionEmoji,
} from "discord.js";
import { contextMenuCommands, slashCommands } from "./commands";
import { Honeybee } from "./modules/honeybee";
import { CommandContext } from "./types";
import { log } from "./utils/log";

const HB_MONGO_URI = process.env.HB_MONGO_URI;

function stringifyEmoji(emoji: ReactionEmoji | GuildEmoji): string {
  if (emoji.id === null) {
    return emoji.name!;
  } else {
    return `<${emoji.animated ? "a" : ""}:${emoji.name}:${emoji.id}>`;
  }
}

export function createBot() {
  let hb;
  if (HB_MONGO_URI) {
    hb = new Honeybee(HB_MONGO_URI);
    log("honeybee", "enabled");
  }

  const context: CommandContext = { hb };

  // https://discordjs.guide/popular-topics/reactions.html#listening-for-reactions-on-old-messages
  const client = new Client({
    intents: [
      Intents.FLAGS.GUILDS,
      Intents.FLAGS.GUILD_MESSAGES,
      Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    ],
    partials: ["MESSAGE", "CHANNEL", "REACTION"],
  });

  client.on("interactionCreate", async (interaction) => {
    // Slash command
    // Context menu: https://discordjs.guide/interactions/context-menus.html#registering-context-menu-commands
    if (interaction.isCommand()) {
      const command = slashCommands.find(
        (command) => command.data.name === interaction.commandName
      );

      if (!command) return;

      try {
        await command.execute(
          interaction as CommandInteraction<"cached">,
          context
        );
      } catch (error) {
        console.error(error);
        const content = (error as Error).message;
        if (interaction.deferred || interaction.replied) {
          await interaction.editReply({ content });
        } else {
          await interaction.reply({ content, ephemeral: true });
        }
      }
    } else if (interaction.isMessageContextMenu()) {
      const command = contextMenuCommands.find(
        (command) => command.data.name === interaction.commandName
      );

      if (!command) return;

      try {
        await command.execute(
          interaction as MessageContextMenuInteraction<"cached">,
          context
        );
      } catch (error) {
        console.error(error);
        const content = (error as Error).message;
        if (interaction.deferred || interaction.replied) {
          await interaction.editReply({ content });
        } else {
          await interaction.reply({ content, ephemeral: true });
        }
      }
    }
  });

  client.once("ready", () => {
    log("client", "ready");
  });

  client.on("guildDelete", async (guild) => {
    log("client", "guildDelete", guild);
  });

  client.on("channelDelete", async (channel) => {
    log("client", "channelDelete", channel);
  });

  client.on("guildMemberAdd", async (member) => {
    console.log("client", "guildMemberAdd", member);
  });

  client.on("guildMemberRemove", async (member) => {
    console.log("client", "guildMemberRemove", member);
  });

  // https://discordjs.guide/popular-topics/reactions.html#custom-emojis
  client.on("messageReactionAdd", async (reaction, user) => {
    if (user.bot) return;

    // When a reaction is received, check if the structure is partial
    if (reaction.partial) {
      // If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
      try {
        await reaction.fetch();
      } catch (error) {
        console.error("Something went wrong when fetching the message:", error);
        // Return as `reaction.message.author` may be undefined/null
        return;
      }
    }

    const {
      message: { id: targetId, guild },
      emoji,
    } = reaction;
    if (!guild) return;

    try {
      const stringifiedEmoji = stringifyEmoji(emoji);

      const prisma = new PrismaClient();
      const rap = await prisma.mapping.findFirst({
        where: { guildId: guild.id, targetId, emoji: stringifiedEmoji },
      });
      if (!rap) return;

      const { roleId } = rap;

      const member = guild.members.cache.find((m) => m.id === user.id);
      if (!member) return;

      await member.roles.add(roleId);
      console.log("assigned", user.username, roleId);
    } catch (err) {
      console.log(err);
    }
  });

  client.on("messageReactionRemove", async (reaction, user) => {
    if (user.bot) return;

    if (reaction.partial) {
      try {
        await reaction.fetch();
      } catch (error) {
        console.error("Something went wrong when fetching the message:", error);
        return;
      }
    }

    const {
      message: { id: targetId, guild },
      emoji,
    } = reaction;
    if (!guild) return;

    try {
      const stringifiedEmoji = stringifyEmoji(emoji);

      const prisma = new PrismaClient();
      const rap = await prisma.mapping.findFirst({
        where: { guildId: guild.id, targetId, emoji: stringifiedEmoji },
      });
      if (!rap) return;

      const { roleId } = rap;

      const member = guild.members.cache.find((m) => m.id === user.id);
      if (!member) return;

      await member.roles.remove(roleId);
      console.log("unassigned", user.username, roleId);
    } catch (err) {
      console.log(err);
    }
  });

  return client;
}
