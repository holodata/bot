import { Client, Intents } from "discord.js";
// import { Honeybee } from "./honeybee";
import { commands } from "./commands";
import { CommandContext } from "./interfaces";

const MONGO_URI = process.env.MONGO_URI!;

export function createBot() {
  // const hb = new Honeybee(MONGO_URI);

  const context: CommandContext = {};

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
    console.log("ready");
  });

  client.on("guildDelete", async (guild) => {
    console.log("guildDelete", guild);
    // const invalidSubs = await removeSubscriptionForGuild(guild.id);
  });

  client.on("channelDelete", async (channel) => {
    console.log("channelDelete", channel);
    // const invalidSubs = await removeSubscriptionForChannel(channel.id);
  });

  return client;
}
