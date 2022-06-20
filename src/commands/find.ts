import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildMember, MessageEmbed } from "discord.js";
import { Command } from "../types";
import { parse } from "../modules/hql";
import {
  assertInGuild,
  verifyChannelModerator,
  assertHigherRole,
} from "../utils/discord";
import { Honeybee } from "../modules/honeybee";

const MAX_LIMIT = 30;

function assertHoneybee(hb?: Honeybee): asserts hb {
  if (!hb) {
    throw new Error("Honeybee is not enabled");
  }
}

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("find")
    .setDescription("Query honeybee")
    .addStringOption((builder) =>
      builder.setName("hql").setDescription("HoneyQL").setRequired(true)
    ),
  async execute(intr: CommandInteraction, { hb }) {
    assertInGuild(intr);
    assertHigherRole(intr);
    assertHoneybee(hb);

    // parse
    const query = intr.options.getString("hql")!;
    const defaultOptions = { sort: { timestamp: -1 }, limit: 5 };
    const { filter, projection = {}, options = defaultOptions } = parse(query);
    if (options.limit > MAX_LIMIT) options.limit = MAX_LIMIT;
    console.log(filter, projection, options);

    // query
    const result = await hb.Chat.find(filter, projection, options);

    // reply
    const embeds = result.map((res) => {
      const emb = new MessageEmbed();
      emb.setTitle(res.timestamp.toISOString());
      emb.setAuthor({
        name: res.authorName ?? "<empty>",
        url: `https://youtube.com/channel/${res.authorChannelId}`,
      });
      emb.setDescription(res.message ?? "<empty>");
      return emb;
    });

    if (embeds.length === 0) return intr.reply("No result");

    await intr.reply({
      embeds,
    });
  },
};

export default command;
