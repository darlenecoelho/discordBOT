const { token } = require('./config.json');
const Discord = require("discord.js")
const { ActivityType, Constants } = require('discord.js');
const client = new Discord.Client({
    intents: [
        Discord.GatewayIntentBits.Guilds
    ]
});

module.exports = client

client.on('interactionCreate', (interaction) => {

    if (interaction.type === Discord.InteractionType.ApplicationCommand) {

        const cmd = client.slashCommands.get(interaction.commandName);

        if (!cmd) return interaction.reply(`Error`);

        interaction["member"] = interaction.guild.members.cache.get(interaction.user.id);

        cmd.run(client, interaction)

    }
})


client.once('ready', async() => {
    console.log(`✅ - Logado em ${client.user.username} com sucesso! Estou em ${client.guilds.cache.size} servidores!`)

    setInterval(() => {

        const options = [{
                type: ActivityType.Playing,
                text: "Valorant",
                status: "dnd"

            },
            {
                type: ActivityType.Listening,
                text: "Spotify",
                status: "dnd"
            },
        ];

        const option = Math.floor(Math.random() * options.length);

        client.user.setPresence({
            activities: [{
                name: options[option].text,
                type: options[option].type,
            }, ],
            status: options[option].status,
        });
    }, 5000);

})

client.slashCommands = new Discord.Collection()

require('./handler')(client)

client.login(token);