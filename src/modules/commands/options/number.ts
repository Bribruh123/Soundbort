import * as Discord from "discord.js";
import { WithAutocompleteOrChoice, WithAutocompleteOrChoicesOptionData } from "./_shared.js";

export function createNumberOption(
    opts: WithAutocompleteOrChoice<Omit<Discord.APIApplicationCommandNumberOption, "type">, number>,
): WithAutocompleteOrChoicesOptionData<Discord.APIApplicationCommandNumberOption, number> {
    const { autocomplete, ...rest } = opts as typeof opts & { autocomplete?: typeof opts["autocomplete"] };

    return {
        type: Discord.ApplicationCommandOptionType.Number,
        data: {
            type: Discord.ApplicationCommandOptionType.Number,
            ...rest,
            ...(autocomplete ? { autocomplete: true } : {}),
        },
        autocomplete,
    };
}
