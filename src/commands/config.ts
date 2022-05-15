import { SlashCommandBuilder } from "@discordjs/builders";
import {
    Badges,
    DEFAULT_BADGES,
    SpecialChannel,
    SpecialRole,
    setBadge,
    setSpecialChannel,
    setSpecialRole,
} from "database";
import { CommandInteraction } from "discord.js";
import { Bot, BotCommand } from "structures";

const badges: [string, string][] = Object.keys(DEFAULT_BADGES).map((v) => [
    v,
    v,
]);
const specRoles: [string, string][] = ["announcements", "members"].map((v) => [
    v,
    v,
]);
const specChannels: [string, string][] = [
    "announcements",
    "information",
    "suggestions",
    "welcomes",
    "warnings",
    "logs",
    "roles",
].map((v) => [v, v]);

export default class Config extends BotCommand {
    constructor() {
        super(
            "config",
            "Configure the bot.",
            new SlashCommandBuilder()
                .setName("config")
                .setDescription("Configure the bot.")
                .addSubcommand((sub) => {
                    return sub
                        .setName("setchannel")
                        .setDescription("Set a special channel.")
                        .addStringOption((opt) =>
                            opt
                                .setName("label")
                                .addChoices(specChannels)
                                .setRequired(true)
                        )
                        .addChannelOption((opt) =>
                            opt
                                .setName("channel")
                                .addChannelType(0)
                                .setRequired(true)
                        );
                })
                .addSubcommand((sub) => {
                    return sub
                        .setName("setbadge")
                        .setDescription("Set a badge.")
                        .addStringOption((opt) =>
                            opt
                                .setName("label")
                                .addChoices(badges)
                                .setRequired(true)
                        )
                        .addStringOption((opt) =>
                            opt.setName("emoji").setRequired(true)
                        );
                })
                .addSubcommand((sub) => {
                    return sub
                        .setName("setrole")
                        .setDescription("Set a special role.")
                        .addStringOption((opt) =>
                            opt
                                .setName("label")
                                .addChoices(specRoles)
                                .setRequired(true)
                        )
                        .addRoleOption((opt) =>
                            opt.setName("role").setRequired(true)
                        );
                })
                .toJSON(),
            { requiredPerms: ["ADMINISTRATOR"] }
        );
    }

    public async execute(
        interaction: CommandInteraction,
        client: Bot
    ): Promise<void> {
        const subCommand = interaction.options.getSubcommand();
        const { guildId } = interaction;
        if (guildId === null) {
            await interaction.reply("This command belongs in a server.");
            return;
        }
        switch (subCommand) {
            case "setchannel":
                await Config.setChannel(guildId, interaction);
                break;
            case "setbadge":
                await Config.setBadge(guildId, interaction);
                break;
            case "setrole":
                await Config.setRole(guildId, interaction);
                break;
        }
        await interaction.reply("Done.");
    }

    private static async setChannel(
        guildId: string,
        inter: CommandInteraction
    ) {
        const label = inter.options.getString("label", true);
        const channel = inter.options.getChannel("channel", true);
        await setSpecialChannel(guildId, label as SpecialChannel, channel.id);
    }

    private static async setBadge(guildId: string, inter: CommandInteraction) {
        const label = inter.options.getString("label", true);
        const emoji = inter.options.getString("emoji", true);
        await setBadge(guildId, label as Badges, emoji);
    }

    private static async setRole(guildId: string, inter: CommandInteraction) {
        const label = inter.options.getString("label", true);
        const role = inter.options.getRole("role", true);
        await setSpecialRole(guildId, label as SpecialRole, role.id);
    }
}
