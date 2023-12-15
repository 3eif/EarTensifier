const fs = require('fs');
const { ApplicationCommandOptionType, ButtonStyle, ButtonBuilder, ActionRowBuilder, EmbedBuilder } = require('discord.js');

const Command = require('../../structures/Command');
const categories = fs.readdirSync('./src/commands/');

module.exports = class Help extends Command {
    constructor(client) {
        super(client, {
            name: 'help',
            description: {
                content: 'Sends you a detailed list of the bot\'s commands.',
                usage: '[comamnd]',
                examples: ['', 'play', 'seek'],
            },
            aliases: ['commands', 'list'],
            options: [{
                name: 'command',
                type: ApplicationCommandOptionType.String,
                required: false,
                description: 'The command to view the help page of.',
                autocomplete: true,
            }],
            slashCommand: true,
        });
    }

    async autocomplete(client, interaction) {
        const focusedValue = interaction.options.getFocused();
        const { commands } = client;
        const helpCommands = [];
        categories.forEach(async (category) => {
            if (category == 'dev') return;
            const commandsFile = fs.readdirSync(`./src/commands/${category}`).filter(file => file.endsWith('.js'));
            for (let i = 0; i < commandsFile.length; i++) {
                const command = commands.get(commandsFile[i].split('.')[0].toLowerCase());
                if (command && !command.hide && command.enabled) helpCommands.push(command.name);
            }
        });
        const filtered = helpCommands.filter(choice => choice.startsWith(focusedValue));
        if (filtered.length > 25) filtered.length = 25;
        await interaction.respond(filtered.map(choice => ({ name: choice, value: choice })));
    }

    async run(client, ctx, args) {
        const { commands } = ctx.client;
        const data = [];

        const embed = new EmbedBuilder()
            .setAuthor({ name: 'Commands', iconURL: client.user.displayAvatarURL() })
            .setDescription(`A detailed list of commands can be found **[here](https://eartensifier.net/#commands)**.\nNeed more help? Join the **[support server](${client.config.server})**`)
            .setFooter({ text: 'For more information on a command: /help <command>' })
            .setColor(client.config.colors.default);

        const slashCommands = await client.application.commands.fetch();
        if (!args.length) {
            const buttons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel('Support Server')
                        .setStyle(ButtonStyle.Link)
                        .setURL(client.config.server),
                    new ButtonBuilder()
                        .setLabel('Website')
                        .setStyle(ButtonStyle.Link)
                        .setURL(client.config.website),
                );

            categories.forEach(async (category) => {
                if (category == 'dev') return;

                const helpCommands = [];
                let categoryCommands = '';
                const commandsFile = fs.readdirSync(`./src/commands/${category}`).filter(file => file.endsWith('.js'));

                for (let i = 0; i < commandsFile.length; i++) {
                    const command = commands.get(commandsFile[i].split('.')[0].toLowerCase());
                    if (command && !command.hide) {
                        const slashCommand = slashCommands.find(c => c.name == command.name);
                        if (slashCommand) {
                            const commandString = `</${slashCommand.name}:${slashCommand.id}>`;
                            helpCommands.push(`${commandString}  `);
                        }
                    }
                }

                for (let i = 0; i < helpCommands.length; i++) categoryCommands += helpCommands[i];
                const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
                embed.addFields({ name: `${categoryName} (${commandsFile.length})`, value: categoryCommands });
            });

            await ctx.sendMessage({ embeds: [embed], components: [buttons] });
        }
        else {
            if (!commands.has(args[0])) return ctx.sendMessage('That\'s not a valid command!');

            const command = commands.get(args[0]);
            const slashCommand = slashCommands.find(c => c.name == command.name);

            data.push(`**Name:** ${slashCommand ? `</${slashCommand.name}:${slashCommand.id}>` : command.name}`);

            if (command.description.content) data.push(`**Description:** ${command.description.content}`);

            if (command.description.usage == 'No usage provided') data.push(`**Usage:** \`/${command.name}\``);
            else data.push(`**Usage:** \`/${command.name} ${command.description.usage}\``);

            if (command.description.examples != 'No examples provided') {
                const examples = [];
                command.description.examples.forEach(example => examples.push(`\`/${command.name} ${example}\``));
                data.push(`**Examples:** ${examples.join(', ')}`);
            }

            if (command.aliases == 'No aliases for this certain command') data.push('**Aliases:** This command has no aliases');
            else data.push(`**Aliases:** \`${command.aliases}\``);

            data.push(`**Cooldown:** ${command.cooldown || 3} second(s)`);

            return ctx.sendMessage(data.join('\n'));
        }
    }
};
