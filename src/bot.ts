import { Client, Intents } from "discord.js";
import { commands } from "./commands";
import { Honeybee } from "./modules/honeybee";
import { CommandContext } from "./types";
import { log } from "./utils/log";

const HB_MONGO_URI = process.env.HB_MONGO_URI;

export function createBot() {
  let hb;
  if (HB_MONGO_URI) {
    hb = new Honeybee(HB_MONGO_URI);
    log("honeybee", "enabled");
  }

  const context: CommandContext = { hb };

  const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;

    const command = commands.find(
      (command) => command.data.name === interaction.commandName
    );

    if (!command) return;

    try {
      await command.execute(interaction, context);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: (error as Error).message,
        ephemeral: true,
      });
    }
  });

  client.once("ready", () => {
    log("client", "ready");
  });

  client.on("guildDelete", async (guild) => {
    log("client", "guildDelete", guild);
    // const invalidSubs = await removeSubscriptionForGuild(guild.id);
  });

  client.on("channelDelete", async (channel) => {
    log("client", "channelDelete", channel);
    // const invalidSubs = await removeSubscriptionForChannel(channel.id);
  });

  return client;
}
