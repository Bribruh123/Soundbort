import registry from "../core/CommandRegistry";
import { createStringOption } from "../modules/commands/options/createOption";
import { TopCommandGroup } from "../modules/commands/TopCommandGroup";
import { Command } from "../modules/commands/Command";
import { CommandGroup } from "../modules/commands/CommandGroup";
import { exit } from "../util/exit";
import { upload } from "../core/soundboard/methods/upload";
import SoundboardManager from "../core/soundboard/SoundboardManager";
import { EmbedType, isOwner, replyEmbed, replyEmbedEphemeral } from "../util/util";
import { CustomSample } from "../core/soundboard/sample/CustomSample";
import SampleID from "../core/soundboard/SampleID";

const upload_pre_cmd = new Command({
    name: "upload-pre",
    description: "Add a sample to standard soundboard. Upload the audio file first, then call this command.",
    options: [
        createStringOption("name", "Name for the sample", true),
    ],
    async func(interaction) {
        const name = interaction.options.getString("name", true);

        await upload(interaction, name, "standard");
    },
});

const delete_extern_cmd = new Command({
    name: "extern",
    description: "Delete a custom sample by id.",
    options: [
        createStringOption("id", "Id of the custom sample to delete.", true),
    ],
    async func(interaction) {
        const userId = interaction.user.id;

        const id = interaction.options.getString("id", true);

        if (!isOwner(userId)) {
            return await interaction.reply(replyEmbedEphemeral("You're not a bot developer, you can't just remove any sample.", EmbedType.Error));
        }

        if (!SampleID.isId(id)) {
            return await interaction.reply(replyEmbedEphemeral(`${id} is not a valid id.`, EmbedType.Error));
        }

        const sample = await CustomSample.findById(id);
        if (!sample) {
            return await interaction.reply(replyEmbedEphemeral(`Couldn't find sample with id ${id}`, EmbedType.Error));
        }

        await CustomSample.removeCompletely(sample);

        return await interaction.reply(replyEmbed(`Removed ${sample.name} (${sample.id}) from user soundboard!`, EmbedType.Success));
    },
});

const delete_standard_cmd = new Command({
    name: "standard",
    description: "Delete a standard sample by name.",
    options: [
        createStringOption("name", "Name of the standard sample to delete.", true),
    ],
    async func(interaction) {
        const name = interaction.options.getString("sample", true);

        await SoundboardManager.remove(interaction, name, "standard");
    },
});

const backup_cmd = new Command({
    name: "backup",
    description: "Backup the server.",
});

const reboot_cmd = new Command({
    name: "reboot",
    description: "Reboot the bot",
    func(interaction) {
        exit(interaction.client, 0);
    },
});

registry.addCommand(new TopCommandGroup({
    name: "owner",
    description: "A set of owner commands.",
    commands: [
        upload_pre_cmd,
        new CommandGroup({
            name: "delete",
            description: "Import a sample to standard soundboard.",
            commands: [
                delete_extern_cmd,
                delete_standard_cmd,
            ],
        }),
        backup_cmd,
        reboot_cmd,
    ],
}));