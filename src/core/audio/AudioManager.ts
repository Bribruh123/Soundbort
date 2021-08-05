import Discord from "discord.js";
import * as Voice from "@discordjs/voice";
import { AudioSubscription } from "./AudioSubscription";
import Logger from "../../log";

const log = Logger.child({ label: "Audio" });

export enum JoinFailureTypes {
    FailedNotInVoiceChannel,
    FailedTryAgain,
}

// https://github.com/discordjs/voice/blob/main/examples/music-bot/src/bot.ts
class AudioManager {
    private subscriptions = new Map<Discord.Snowflake, AudioSubscription>();

    public async join(member: Discord.GuildMember): Promise<AudioSubscription | JoinFailureTypes> {
        let subscription = this.subscriptions.get(member.guild.id);
        if (subscription) return subscription;

        const channel = member.voice.channel;
        if (!channel) return JoinFailureTypes.FailedNotInVoiceChannel; // Join a voice channel first

        /*
        Here, we try to establish a connection to a voice channel. If we're already connected
        to this voice channel, @discordjs/voice will just return the existing connection for
        us!
        */
        const voice_channel = Voice.joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator as Voice.DiscordGatewayAdapterCreator,
        });
        subscription = new AudioSubscription(voice_channel, () => this.subscriptions.delete(member.guild.id));
        this.subscriptions.set(channel.guild.id, subscription);

        /*
        If we're dealing with a connection that isn't yet Ready, we can set a reasonable
        time limit before giving up. In this example, we give the voice connection 20 seconds
        to enter the ready state before giving up.
        */
        try {
            await Voice.entersState(subscription.voice_connection, Voice.VoiceConnectionStatus.Ready, 20e3);
            return subscription;
        } catch (error) {
            log.warn({ error });
            /*
            At this point, the voice connection has not entered the Ready state. We should make
            sure to destroy it, and propagate the error by throwing it, so that the calling function
            is aware that we failed to connect to the channel.
            */
            subscription.voice_connection.destroy();
            return JoinFailureTypes.FailedTryAgain;
        }
    }

    public get(guildId: Discord.Snowflake): AudioSubscription | undefined {
        return this.subscriptions.get(guildId);
    }
}

export default new AudioManager();