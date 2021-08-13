import Discord from "discord.js";

import InteractionRegistry from "../../core/InteractionRegistry";
import { TopCommand } from "../../modules/commands/TopCommand";
import { createStringOption } from "../../modules/commands/options/createOption";
import { CustomSample } from "../../core/soundboard/sample/CustomSample";
import SampleID from "../../core/soundboard/SampleID";
import AudioManager, { JoinFailureTypes } from "../../core/audio/AudioManager";
import Logger from "../../log";
import { CmdInstallerArgs } from "../../util/types";
import { PredefinedSample } from "../../core/soundboard/sample/PredefinedSample";
import { EmbedType, logErr, replyEmbedEphemeral } from "../../util/util";
import { collectionBlacklistUser } from "../../modules/database/models";
import { BUTTON_IDS } from "../../const";

const log = Logger.child({ label: "Command => play" });

export function install({ client, stats_collector }: CmdInstallerArgs): void {
    async function play(interaction: Discord.CommandInteraction | Discord.ButtonInteraction, sample: CustomSample | PredefinedSample): Promise<void> {
        try {
            // shouldn't true, but Typescript wants it
            if (!interaction.inGuild()) return;

            const member = await interaction.guild?.members.fetch(interaction.user.id);
            if (!member) {
                throw new Error("interaction.guild ist nicht definiert.");
            }

            const subscription = await AudioManager.join(member);
            if (subscription === JoinFailureTypes.FailedNotInVoiceChannel) {
                return await interaction.reply(replyEmbedEphemeral("You need to join a voice channel first!", EmbedType.Info));
            }
            if (subscription === JoinFailureTypes.FailedTryAgain) {
                return await interaction.reply(replyEmbedEphemeral("Connecting to the voice channel failed. Try again later.", EmbedType.Error));
            }
            if (AudioManager.has(interaction.guildId) && interaction.guild?.me?.voice.channelId && member.voice.channelId !== interaction.guild.me.voice.channelId) {
                return await interaction.reply(replyEmbedEphemeral("You need to be in the same voice channel as the bot!", EmbedType.Info));
            }

            await sample.play(subscription.audio_player);

            stats_collector.incPlayedSamples(1);

            return await interaction.reply(replyEmbedEphemeral(`🔊 Playing ${sample.name}`));
        } catch (error) {
            log.error({ error: logErr(error) });
            return await interaction.reply(replyEmbedEphemeral("Some error happened and caused some whoopsies", EmbedType.Error));
        }
    }

    client.on("interactionCreate", async interaction => {
        if (!interaction.isButton()) return;
        if (!interaction.inGuild()) return;

        if (await collectionBlacklistUser().findOne({ userId: interaction.user.id })) {
            return await interaction.reply(replyEmbedEphemeral("You're blacklisted from using this bot anywhere.", EmbedType.Error));
        }

        const customId = interaction.customId;
        if (customId.startsWith(BUTTON_IDS.CUSTOM_PLAY)) {
            const id = customId.substring(BUTTON_IDS.CUSTOM_PLAY.length);

            const sample = await CustomSample.findById(id);
            if (!sample) return;

            return await play(interaction, sample);
        }
        if (customId.startsWith(BUTTON_IDS.PREDEF_PLAY)) {
            const name = customId.substring(BUTTON_IDS.PREDEF_PLAY.length);

            const sample = await PredefinedSample.findByName(name);
            if (!sample) return;

            return await play(interaction, sample);
        }
    });

    InteractionRegistry.addCommand(new TopCommand({
        name: "play",
        description: "Joins the voice channel if needed and plays the sound sample.",
        options: [
            createStringOption("sample", "A sample name or sample identifier (sXXXXXX)", true),
        ],
        async func(interaction) {
            if (!interaction.inGuild()) {
                return await interaction.reply(replyEmbedEphemeral("Can only play sound clips in servers", EmbedType.Error));
            }

            const name = interaction.options.getString("sample", true);

            let sample = await CustomSample.findByName(interaction.guildId, interaction.user.id, name) ||
                         await PredefinedSample.findByName(name);

            if (!sample && SampleID.isId(name)) {
                sample = await CustomSample.findById(name);
            }

            if (!sample) {
                return await interaction.reply(replyEmbedEphemeral(`Couldn't find sample with name or id '${name}'`, EmbedType.Error));
            }

            await play(interaction, sample);
        },
    }));
}
