import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";
import { Honeybee } from "../modules/honeybee";
import { parse } from "../modules/hql";
import { SlashCommand } from "../types";
import { assertHigherRole, assertInGuild } from "../utils/discord";

const MAX_LIMIT = 30;

function assertHoneybee(hb?: Honeybee): asserts hb {
  if (!hb) {
    throw new Error("Honeybee is not enabled");
  }
}

const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("find")
    .setDescription("Query honeybee")
    .addStringOption((builder) =>
      builder
        .setName("hql")
        .setDescription("Honeybee Query Language")
        .setRequired(true)
    ),

  async execute(intr, { hb }) {
    assertInGuild(intr);
    assertHigherRole(intr.member);
    assertHoneybee(hb);

    await intr.deferReply();

    // parse
    const query = intr.options.getString("hql")!;
    const defaultOptions = { sort: { timestamp: -1 }, limit: 5 };

    const { filter, projection = {}, options = defaultOptions } = parse(query);
    options.limit = Math.min(options.limit, MAX_LIMIT);

    console.log(filter, projection, options);

    // query
    const result = await hb.Chat.find(filter, projection, options);

    // reply
    const embeds = result.map((res) => {
      const emb = new MessageEmbed();
      emb.setAuthor({
        name: res.authorName ?? "<empty>",
        url: `https://www.youtube.com/watch?v=${res.originVideoId}`,
      });
      emb.setDescription(res.message ?? "<empty>");
      // emb.setURL(`https://www.youtube.com/watch?v=${res.originVideoId}`);
      emb.setFooter({ text: res.timestamp.toISOString() });
      emb.setColor("ORANGE");
      return emb;
    });

    if (embeds.length === 0) return intr.editReply("No result");

    await intr.editReply({
      embeds,
    });
  },
};

export default command;
