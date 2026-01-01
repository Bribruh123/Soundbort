import * as Discord from "discord.js";
import { WithAutocompleteOrChoice, WithAutocompleteOrChoicesOptionData } from "./_shared.js";

export function createStringOption(
    opts: WithAutocompleteOrChoice<Omit<Discord.APIApplicationCommandStringOption, "type">, string>,
): WithAutocompleteOrChoicesOptionData<Discord.APIApplicationCommandStringOption, string> {
    const { autocomplete, ...rest } = opts as typeof opts & { autocomplete?: typeof opts["autocomplete"] };

    return {
        type: Discord.ApplicationCommandOptionType.String,
        data: {
            type: Discord.ApplicationCommandOptionType.String,
            ...rest,
            ...(autocomplete ? { autocomplete: true } : {}),
        },
        autocomplete,
    };
}
