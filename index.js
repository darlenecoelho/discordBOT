const { token } = require('./config.json');
const Discord = require("discord.js")
const { ActivityType } = require('discord.js');
const { GatewayIntentBits } = require('discord.js');
const client = new Discord.Client({ 
  intents: [ 
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ]
});

client.on("guildMemberAdd", (member) => {
    let cargo_autorole = member.guild.roles.cache.get("1124462803835703397") // Coloque o ID do cargo
    if (!cargo_autorole) return console.log("❌ O AUTOROLE não está configurado.")
  
    member.roles.add(cargo_autorole.id).catch(err => {
      console.log(`❌ Não foi possível adicionar o cargo de autorole no usuário ${member.user.tag}.`)
    })
})

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

    const description = "Olá! Eu sou um bot incrível.";

    // Definir a descrição do perfil do bot
    client.user.setProfile({ description })
      .then(() => console.log("Descrição do perfil atualizada com sucesso!"))
      .catch(console.error);



    setInterval(() => {
        const options = [{
                type: ActivityType.Playing,
                text: "Fivem 🎮",
                status: "dnd"

            },
            {
                type: ActivityType.Watching, 
                text: "Browns 🤪", 
                url: "https://www.twitch.tv/shankswr"
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