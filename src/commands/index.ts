import { SlashCommand, ContextMenuCommand } from "../types";
import find from "./find";
import configureRA from "./configureRA";

export const slashCommands: SlashCommand[] = [find];
export const contextMenuCommands: ContextMenuCommand[] = [configureRA];
