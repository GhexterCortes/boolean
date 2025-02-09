import { SlashCommandBuilder } from "@discordjs/builders";
import {
    CommandInteraction,
    MessageEmbed,
    TextChannel,
    Util,
} from "discord.js";

import { getSpecialChannel } from "../database";
import { Bot, BotCommand } from "../structures";

class Suggest extends BotCommand {
    constructor() {
        super(
            "suggest",
            "Write a new suggestion.",
            new SlashCommandBuilder()
                .setName("suggest")
                .setDescription("Write a new suggestion.")
                .addStringOption((option) =>
                    option
                        .setName("title")
                        .setDescription("Suggestion's title.")
                        .setRequired(true)
                )
                .addStringOption((option) =>
                    option
                        .setName("description")
                        .setDescription("Set suggestion's description.")
                        .setRequired(true)
                )
                .toJSON(),
            { timeout: 600_000 }
        );
    }

    public async execute(
        interaction: CommandInteraction<"cached">,
        _: Bot
    ): Promise<void> {
        const optSuggest = await getSpecialChannel(
            interaction.guildId,
            "suggestions"
        );
        if (optSuggest === null) {
            throw new Error("There is not a suggestions channel yet.");
        }
        const suggestionsChannel = optSuggest as TextChannel;

        const title = Util.cleanContent(
            interaction.options.getString("title", true),
            interaction.channel!
        );

        const suggestionEmbed = new MessageEmbed()
            .setColor("ORANGE")
            .setTitle(`${title} - ${interaction.member?.user.tag}`)
            .setDescription(interaction.options.getString("description", true));

        await interaction.deferReply({ ephemeral: true });

        const message = await suggestionsChannel.send({
            embeds: [suggestionEmbed],
        });
        await message.react("✅");
        await message.react("❌");
        const thread = await message.startThread({
            name: title,
            autoArchiveDuration: "MAX",
        });
        await thread.members.add(interaction.user);

        const successMessageEmbed = new MessageEmbed()
            .setColor("GREEN")
            .setDescription(
                `Suggestion successfully created at ${suggestionsChannel}`
            );

        await interaction.editReply({ embeds: [successMessageEmbed] });
    }
}

export default new Suggest();
