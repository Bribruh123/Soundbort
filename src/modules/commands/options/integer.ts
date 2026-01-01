import * as Discord from "discord.js";
import { WithAutocompleteOrChoice, WithAutocompleteOrChoicesOptionData } from "./_shared.js";

export function createIntegerOption(
    opts: WithAutocompleteOrChoice<Omit<Discord.APIApplicationCommandIntegerOption, "type">, number>,
): WithAutocompleteOrChoicesOptionData<Discord.APIApplicationCommandIntegerOption, number> {
    const { autocomplete, ...rest } = opts as typeof opts & { autocomplete?: typeof opts["autocomplete"] };

    return {
        type: Discord.ApplicationCommandOptionType.Integer,
        data: {
            type: Discord.ApplicationCommandOptionType.Integer,
            ...rest,
            ...(autocomplete ? { autocomplete: true } : {}),
        },
        autocomplete,
    };
}
