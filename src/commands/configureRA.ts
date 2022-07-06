import { ContextMenuCommandBuilder } from "@discordjs/builders";
import { Mapping, PrismaClient } from "@prisma/client";
import { ApplicationCommandType } from "discord-api-types/v9";
import { GuildMember } from "discord.js";
import EmojiRegex from "emoji-regex";
import { ContextMenuCommand } from "../types";
import { assertHigherRole } from "../utils/discord";

const emojiRegex = EmojiRegex();
const emoteRegex = /<a?:([a-zA-Z0-9_]+):(\d+)>/;

function getReaction(msg: string): string | undefined {
  const emoji = msg.match(emojiRegex);
  if (emoji) return emoji[0];

  const emote = emoteRegex.exec(msg);
  if (emote) return emote[0];
}

function getRoleString(msg: string): string | undefined {
  const match = /`(.+)`/.exec(msg);
  if (match) return match[1];
}

const command: ContextMenuCommand = {
  data: new ContextMenuCommandBuilder()
    .setName("configureRA")
    .setType(ApplicationCommandType.Message),
  async execute(intr) {
    assertHigherRole(intr.member as GuildMember);

    await intr.deferReply({ ephemeral: true });

    const prisma = new PrismaClient();

    const {
      targetId,
      targetMessage,
      targetMessage: { content },
      guild,
      guild: { id: guildId },
    } = intr;

    // parse message
    const mappings = [];
    for (const line of content.split("\n")) {
      const emoji = getReaction(line);
      if (!emoji) continue;
      const roleName = getRoleString(line);
      if (!roleName) continue;
      const role = guild.roles.cache.find((r) => r.name === roleName);
      if (!role) continue;

      console.log("foundMapping:", emoji, role.id);
      mappings.push({ emoji, roleId: role.id });
    }

    if (mappings.length === 0)
      return await intr.editReply({ content: "Invalid format" });

    // Save to db
    await prisma.mapping.deleteMany({ where: { guildId, targetId } });
    await Promise.all(
      mappings.map(({ emoji, roleId }) =>
        prisma.mapping.create({
          data: {
            guildId,
            targetId,
            emoji,
            roleId,
          },
        })
      )
    );

    // Place role reactions
    await Promise.all(mappings.map(({ emoji }) => targetMessage.react(emoji)));

    intr.editReply({
      content:
        "Configured:\n" +
        mappings.map((m) => `${m.emoji} -> <@&${m.roleId}>`).join("\n"),
    });
  },
};

export default command;
