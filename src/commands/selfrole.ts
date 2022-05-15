import { SlashCommandBuilder } from "@discordjs/builders";
import {
    addRoleChoice,
    createRoleList,
    removeRoleChoice,
    removeRoleList,
} from "database";
import { CommandInteraction } from "discord.js";
import { Bot, BotCommand } from "structures";

export default class SelfRole extends BotCommand {
    constructor() {
        super(
            "selfrole",
            "Setup self-role lists.",
            new SlashCommandBuilder()
                .setName("selfrole")
                .setDescription("Setup self-role lists.")
                .addSubcommand((sub) => {
                    return sub
                        .setName("createlist")
                        .setDescription(
                            "Create a list of roles that users" +
                                " can assign themselves."
                        )
                        .addStringOption((opt) =>
                            opt
                                .setName("listname")
                                .setDescription("A name for the list.")
                                .setRequired(true)
                        );
                })
                .addSubcommand((sub) => {
                    return sub
                        .setName("deletelist")
                        .setDescription("Delete a role list.")
                        .addStringOption((opt) =>
                            opt
                                .setName("listname")
                                .setDescription("A name for the list.")
                                .setRequired(true)
                        );
                })
                .addSubcommand((sub) => {
                    return sub
                        .setName("addchoice")
                        .setDescription("Add a role to a role list.")
                        .addStringOption((opt) =>
                            opt
                                .setName("label")
                                .setDescription("The name of the list.")
                                .setRequired(true)
                        )
                        .addRoleOption((opt) =>
                            opt
                                .setName("role")
                                .setDescription("The role to add")
                                .setRequired(true)
                        );
                })
                .addSubcommand((sub) => {
                    return sub
                        .setName("remchoice")
                        .setDescription("Remove a role from a role list.")
                        .addStringOption((opt) =>
                            opt
                                .setName("label")
                                .setDescription("The name of the list.")
                                .setRequired(true)
                        )
                        .addRoleOption((opt) =>
                            opt
                                .setName("role")
                                .setDescription("The role to remove")
                                .setRequired(true)
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
            case "createlist":
                await SelfRole.createRoleList(guildId, interaction);
                break;
            case "deletelist":
                await SelfRole.deleteRoleList(guildId, interaction);
                break;
            case "addchoice":
                await SelfRole.addChoice(guildId, interaction);
                break;
            case "remchoice":
                await SelfRole.remChoice(guildId, interaction);
                break;
        }
        await interaction.reply("Done.");
    }

    private static async createRoleList(
        guildId: string,
        inter: CommandInteraction
    ) {
        const label = inter.options.getString("label", true);
        await createRoleList(guildId, label);
    }

    private static async deleteRoleList(
        guildId: string,
        inter: CommandInteraction
    ) {
        const label = inter.options.getString("label", true);
        await removeRoleList(guildId, label);
    }

    private static async addChoice(guildId: string, inter: CommandInteraction) {
        const label = inter.options.getString("label", true);
        const role = inter.options.getRole("role", true);
        await addRoleChoice(guildId, label, role.id);
    }

    private static async remChoice(guildId: string, inter: CommandInteraction) {
        const label = inter.options.getString("label", true);
        const role = inter.options.getRole("role", true);
        await removeRoleChoice(guildId, label, role.id);
    }
}
