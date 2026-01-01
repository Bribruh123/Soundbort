import * as Discord from "discord.js";
import { WithAutocompleteOrChoice, WithAutocompleteOrChoicesOptionData } from "./_shared.js";

export function createStringOption(
    opts: WithAutocompleteOrChoice<Omit<Discord.APIApplicationCommandStringOption, "type">, string>,
): WithAutocompleteOrChoicesOptionData<Discord.APIApplicationCommandStringOption, string> {
    const { autocomplete, ...optionData } = opts as typeof opts & { autocomplete?: typeof opts["autocomplete"] };
    const data = {
        type: Discord.ApplicationCommandOptionType.String,
        ...optionData,
    } as Discord.APIApplicationCommandStringOption;

    const commandAutocomplete = typeof autocomplete === "function" ? autocomplete : undefined;
    if (commandAutocomplete) {
        data.autocomplete = true;
    }

    return {
        type: Discord.ApplicationCommandOptionType.String,
        data,
        autocomplete: commandAutocomplete,
    };
}
