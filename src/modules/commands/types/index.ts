import Discord from "discord.js";

export type SimpleFuncReturn = string | Discord.MessagePayload | Discord.InteractionReplyOptions | undefined | void;

export type SimpleFunc = (interaction: Discord.CommandInteraction) => (Promise<SimpleFuncReturn> | SimpleFuncReturn);

export type GuildCreateEvent = (handler: Discord.ApplicationCommand) => Discord.Awaited<void>;

export interface CommandTarget {
    global: boolean;
    guildHidden: boolean;
}