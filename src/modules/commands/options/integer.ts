import * as Discord from "discord.js";
import { WithAutocompleteOrChoice, WithAutocompleteOrChoicesOptionData } from "./_shared.js";

export function createIntegerOption(
    opts: WithAutocompleteOrChoice<Omit<Discord.APIApplicationCommandIntegerOption, "type">, number>,
): WithAutocompleteOrChoicesOptionData<Discord.APIApplicationCommandIntegerOption, number> {
    const { autocomplete, ...option } = opts;
    const data = {
        type: Discord.ApplicationCommandOptionType.Integer,
        ...option,
    } as Discord.APIApplicationCommandIntegerOption;

    if (autocomplete) {
        data.autocomplete = true;
    }

    return {
        type: Discord.ApplicationCommandOptionType.Integer,
        data,
        autocomplete,
    };
}
