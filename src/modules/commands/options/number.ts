import * as Discord from "discord.js";
import { WithAutocompleteOrChoice, WithAutocompleteOrChoicesOptionData } from "./_shared.js";

export function createNumberOption(
    opts: WithAutocompleteOrChoice<Omit<Discord.APIApplicationCommandNumberOption, "type">, number>,
): WithAutocompleteOrChoicesOptionData<Discord.APIApplicationCommandNumberOption, number> {
    const { autocomplete, ...option } = opts;
    const data = {
        type: Discord.ApplicationCommandOptionType.Number,
        ...option,
    } as Discord.APIApplicationCommandNumberOption;

    if (autocomplete) {
        data.autocomplete = true;
    }

    return {
        type: Discord.ApplicationCommandOptionType.Number,
        data,
        autocomplete,
    };
}
