// https://discordjs.guide/interactions/slash-commands.html#registering-slash-commands
// NOTE: authorize `applications.commands` scope

import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { slashCommands, contextMenuCommands } from "./commands";

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID!;
const DISCORD_TOKEN = process.env.DISCORD_TOKEN!;
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID!;

const serializedCommands = [...slashCommands, ...contextMenuCommands].map(
  (command) => command.data.toJSON()
);

const rest = new REST({ version: "9" }).setToken(DISCORD_TOKEN);

console.log(serializedCommands);

(async () => {
  try {
    await rest.put(
      Routes.applicationGuildCommands(DISCORD_CLIENT_ID, DISCORD_GUILD_ID),
      {
        body: serializedCommands,
      }
    );

    console.log("Successfully registered application commands.");
  } catch (error) {
    console.error(error);
  }
})();
