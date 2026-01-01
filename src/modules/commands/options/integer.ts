import * as Discord from "discord.js";
import { WithAutocompleteOrChoice, WithAutocompleteOrChoicesOptionData } from "./_shared.js";

export function createIntegerOption(
    opts: WithAutocompleteOrChoice<Omit<Discord.APIApplicationCommandIntegerOption, "type">, number>,
): WithAutocompleteOrChoicesOptionData<Discord.APIApplicationCommandIntegerOption, number> {
    const { autocomplete, ...optionData } = opts as typeof opts & { autocomplete?: typeof opts["autocomplete"] };
    const data = {
        type: Discord.ApplicationCommandOptionType.Integer,
        ...optionData,
    } as Discord.APIApplicationCommandIntegerOption;

    const commandAutocomplete = typeof autocomplete === "function" ? autocomplete : undefined;
    if (commandAutocomplete) {
        data.autocomplete = true;
    }

    return {
        type: Discord.ApplicationCommandOptionType.Integer,
        data,
        autocomplete: commandAutocomplete,
    };
}
