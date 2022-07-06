import {
  ContextMenuCommandBuilder,
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from "@discordjs/builders";
import { CommandInteraction, MessageContextMenuInteraction } from "discord.js";
import { Honeybee } from "./modules/honeybee";

export interface CommandContext {
  hb?: Honeybee;
}

export interface SlashCommand {
  data:
    | SlashCommandBuilder
    | SlashCommandSubcommandsOnlyBuilder
    | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
  execute: (
    interaction: CommandInteraction<"cached">,
    context: CommandContext
  ) => any;
}

export interface ContextMenuCommand {
  data: ContextMenuCommandBuilder;
  execute: (
    interaction: MessageContextMenuInteraction<"cached">,
    context: CommandContext
  ) => any;
}
