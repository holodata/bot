import { CommandInteraction, Guild, GuildMember } from "discord.js";

export function verifyRole(intr: CommandInteraction) {
  const member = intr.member as GuildMember;
  const guild = intr.guild as Guild;
  const bot = guild.me!;

  const hasPermission =
    member.roles.highest.position > bot.roles.highest.position;

  if (!hasPermission) {
    throw new Error("You are not allowed to run this command");
  }
}

export function verifyChannelModerator(intr: CommandInteraction) {
  if (!(intr.channel && intr.channel.type === "GUILD_TEXT")) {
    throw new Error("Invalid channel");
  }

  const hasPermission =
    intr.channel.permissionsFor(intr.user)?.has("MANAGE_CHANNELS") ?? false;

  if (!hasPermission) {
    throw new Error("You are not allowed to run this command");
  }
}

export function verifyGuild(intr: CommandInteraction) {
  const guild = intr.guild;
  if (!guild) throw new Error("No DM allowed");
}
