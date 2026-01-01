import * as Discord from "discord.js";
import { WithAutocompleteOrChoice, WithAutocompleteOrChoicesOptionData } from "./_shared.js";

export function createNumberOption(
    opts: WithAutocompleteOrChoice<Omit<Discord.APIApplicationCommandNumberOption, "type">, number>,
): WithAutocompleteOrChoicesOptionData<Discord.APIApplicationCommandNumberOption, number> {
    const { autocomplete, ...optionData } = opts as typeof opts & { autocomplete?: typeof opts["autocomplete"] };
    const data = {
        type: Discord.ApplicationCommandOptionType.Number,
        ...optionData,
    } as Discord.APIApplicationCommandNumberOption;

    const commandAutocomplete = typeof autocomplete === "function" ? autocomplete : undefined;
    if (commandAutocomplete) {
        data.autocomplete = true;
    }

    return {
        type: Discord.ApplicationCommandOptionType.Number,
        data,
        autocomplete: commandAutocomplete,
    };
}
