import * as Discord from "discord.js";
import { WithAutocompleteOrChoice, WithAutocompleteOrChoicesOptionData } from "./_shared.js";

export function createStringOption(
    opts: WithAutocompleteOrChoice<Omit<Discord.APIApplicationCommandStringOption, "type">, string>,
): WithAutocompleteOrChoicesOptionData<Discord.APIApplicationCommandStringOption, string> {
    const { autocomplete, ...option } = opts;
    const data = {
        type: Discord.ApplicationCommandOptionType.String,
        ...option,
    } as Discord.APIApplicationCommandStringOption;

    if (autocomplete) {
        data.autocomplete = true;
    }

    return {
        type: Discord.ApplicationCommandOptionType.String,
        data,
        autocomplete,
    };
}
