import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildMember, MessageEmbed } from "discord.js";
import { Command } from "../interfaces";
import { parse } from "../honeyql";
import {
  verifyGuild,
  verifyChannelModerator,
  verifyRole,
} from "../utils/discord";

const MAX_LIMIT = 30;

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("find")
    .setDescription("Query honeybee")
    .addStringOption((builder) =>
      builder.setName("hql").setDescription("HoneyQL").setRequired(true)
    ),
  async execute(intr: CommandInteraction, { hb }) {
    verifyGuild(intr);
    verifyRole(intr);

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
    intr.reply({
      embeds,
    });
  },
};

export default command;
