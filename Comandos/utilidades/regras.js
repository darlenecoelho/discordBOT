const Discord = require("discord.js")

module.exports = {
  name: "regras", // Coloque o nome do comando
  description: "Sobre as regras do servidor", // Coloque a descrição do comando
  type: Discord.ApplicationCommandType.ChatInput,

  run: async (client, interaction) => {
    if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.Administrator)) {
      interaction.reply({ content: `Você não possui permissão para utilizar este comando.`, ephemeral: true }) }
      else {
        let embed2 = new Discord.EmbedBuilder() 
        .setColor(0x0099FF)
        .setTitle('Regras básicas do servidor')
        .setDescription('1 - Respeite a hierarquia estabelecida dentro da corporação policial.\n2 - Tenha respeito por toda a comunidade, incluindo outros policiais e civis.\n3 - Não toleraremos discursos de discriminação, seja com base em raça, gênero, orientação sexual, religião ou qualquer outra característica.\n4 - Não compartilhe, de forma alguma, conteúdo sexualmente explícito, uma vez que existem menores de idade no servidor.\n5 - Evite postar qualquer tipo de conteúdo de conotação sexual, mesmo que não seja explicitamente explícito. \n6 - Evite o envio excessivo de mensagens repetitivas (spams) ou inundação (floods) de mensagens e/ou imagens no chat.\n7 - Esteja ciente e siga as regras estabelecidas pela cidade, bem como pelas regras internas da polícia.')
        .setThumbnail('https://i.imgur.com/AfFp7pu.png')
        interaction.reply({ embeds: [embed2] })
  }
}
}