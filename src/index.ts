import { createBot } from "./bot";

const bot = createBot();

bot.login(process.env.DISCORD_TOKEN);
