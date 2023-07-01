const Discord = require("discord.js")
const { QuickDB } = require("quick.db")
const db = new QuickDB()

module.exports = {
    name: "formulário", // Coloque o nome do comando
    description: "Abra o painel do formulário para os membros.", // Coloque a descrição do comando
    type: Discord.ApplicationCommandType.ChatInput,
    options: [{
            name: "canal_formulário",
            description: "Canal para enviar o formulário para os membros.",
            type: Discord.ApplicationCommandOptionType.Channel,
            required: true,
        },
        {
            name: "canal_logs",
            description: "Canal para enviar as logs dos formulários recebidos.",
            type: Discord.ApplicationCommandOptionType.Channel,
            required: true,
        }
    ],

    run: async(client, interaction) => {


        if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.Administrator)) {
            interaction.reply({ content: `Você não possui permissão para utilizar este comando.`, ephemeral: true })
        } else {
            const canal_formulario = interaction.options.getChannel("canal_formulário")
            const canal_logs = interaction.options.getChannel("canal_logs")

            if (canal_formulario.type !== Discord.ChannelType.GuildText) {
                interaction.reply({ content: `O canal ${canal_formulario} não é um canal de texto.`, ephemeral: true })
            } else if (canal_logs.type !== Discord.ChannelType.GuildText) {
                interaction.reply({ content: `O canal ${canal_logs} não é um canal de texto.`, ephemeral: true })
            } else {
                await db.set(`canal_formulario_${interaction.guild.id}`, canal_formulario.id)
                await db.set(`canal_logs_${interaction.guild.id}`, canal_logs.id)

                let embed = new Discord.EmbedBuilder()
                    .setDescription("Random")
                    .setTitle("Canais Configurados!")
                    .setDescription(`> Canal do Formulário: ${canal_formulario}.\n> Canal de Logs: ${canal_logs}.`)

                interaction.reply({ embeds: [embed], ephemeral: true }).then(() => {
                    let embed_formulario = new Discord.EmbedBuilder()
                        .setColor(0x0083b3)
                        .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
                        .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                        .setTitle(`Formulário:`)
                        .setDescription(`Preencha o formulário para solicitar seu set`);

                    let botao = new Discord.ActionRowBuilder().addComponents(
                        new Discord.ButtonBuilder()
                        .setCustomId("formulario")
                        .setEmoji("📝")
                        .setLabel("Solicitar set")
                        .setStyle(Discord.ButtonStyle.Primary)
                    );

                    canal_formulario.send({ embeds: [embed_formulario], components: [botao] })
                })
            }
        }

        client.on("interactionCreate", async(interaction) => {
            if (interaction.isButton()) {
                if (interaction.customId === "formulario") {
                    if (!interaction.guild.channels.cache.get(await db.get(`canal_logs_${interaction.guild.id}`))) return interaction.reply({ content: `O sistema está desativado.`, ephemeral: true })
                    const modal = new Discord.ModalBuilder()
                        .setCustomId("modal")
                        .setTitle("Formulário");

                    const pergunta1 = new Discord.TextInputBuilder()
                        .setCustomId("pergunta1")
                        .setLabel("Nome completo e passaporte")
                        .setMaxLength(30)
                        .setMinLength(5)
                        .setPlaceholder("Ex: Fuath Brown 30")
                        .setRequired(true)
                        .setStyle(Discord.TextInputStyle.Short);

                    const pergunta2 = new Discord.TextInputBuilder()
                        .setCustomId("pergunta2")
                        .setLabel("Patente")
                        .setMaxLength(30)
                        .setMinLength(4)
                        .setPlaceholder("Ex: Cabo")
                        .setRequired(true)
                        .setStyle(Discord.TextInputStyle.Short);

                    const pergunta3 = new Discord.TextInputBuilder()
                        .setCustomId("pergunta3")
                        .setLabel("Informe a unidade")
                        .setMaxLength(30)
                        .setMinLength(3)
                        .setPlaceholder("SPEED ou GTM?")
                        .setStyle(Discord.TextInputStyle.Short)
                        .setRequired(true);

                    const pergunta4 = new Discord.TextInputBuilder()
                        .setCustomId("pergunta4")
                        .setLabel("Quem recrutou?")
                        .setMaxLength(30)
                        .setMinLength(4)
                        .setPlaceholder("Ex: Fuath Brown")
                        .setStyle(Discord.TextInputStyle.Short)
                        .setRequired(true);

                    modal.addComponents(
                        new Discord.ActionRowBuilder().addComponents(pergunta1),
                        new Discord.ActionRowBuilder().addComponents(pergunta2),
                        new Discord.ActionRowBuilder().addComponents(pergunta3),
                        new Discord.ActionRowBuilder().addComponents(pergunta4)
                    )
                    await interaction.showModal(modal)
                } else if (interaction.customId === "aprovar") {
                    const roleToAdd = "1123710114608713768"; // ID do cargo que será adicionado
                    const roleToAdd2 = "1124827425717633107"; // ID do cargo que será adicionado

                    const embed = interaction.message.embeds[0];
                    const userId = embed.thumbnail.url.split("/")[4];
                    const member = await interaction.guild.members.fetch(userId);
                    let painel = new Discord.ActionRowBuilder().addComponents(
                        new Discord.StringSelectMenuBuilder()
                        .setCustomId('menu')
                        .setPlaceholder('Selecione o cargo')
                        .addOptions([{
                                label: "G.T.M",
                                value: roleToAdd
                            },
                            {
                                label: "SPEED",
                                value: roleToAdd2
                            },
                        ])
                    )
                    await interaction.reply({ components: [painel] });
                    // Aguarde a resposta do usuário antes de prosseguir
                    const collectedInteraction = await interaction.channel.awaitMessageComponent({
                        filter: (collected) =>
                            collected.customId === 'menu' && collected.user.id === interaction.user.id,
                        time: 60000 // Tempo limite para o usuário selecionar uma opção (em milissegundos)
                    });
                    // Verifique se o usuário selecionou uma opção
                    if (collectedInteraction && collectedInteraction.values) {
                        const selectedOption = collectedInteraction.values[0];
                        try {
                            await member.roles.add(selectedOption);
                            await collectedInteraction.update({ content: "Aprovado! O cargo foi adicionado com sucesso!", components: [] });
                        } catch (error) {
                            console.error("Erro ao adicionar o cargo:", error);
                            await collectedInteraction.update({ content: "Ocorreu um erro ao adicionar o cargo.", components: [] });
                        }
                    }
                }
            } else if (interaction.isModalSubmit()) {
                if (interaction.customId === "modal") {
                    let resposta1 = interaction.fields.getTextInputValue("pergunta1")
                    let resposta2 = interaction.fields.getTextInputValue("pergunta2")
                    let resposta3 = interaction.fields.getTextInputValue("pergunta3")
                    let resposta4 = interaction.fields.getTextInputValue("pergunta4")

                    if (!resposta1) resposta1 = "Não informado."
                    if (!resposta2) resposta2 = "Não informado."
                    if (!resposta3) resposta3 = "Não informado."
                    if (!resposta4) resposta4 = "Não informado."

                    let embed = new Discord.EmbedBuilder()
                        .setColor("Green")
                        .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
                        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                        .setDescription(`O usuário ${interaction.user} enviou o formulário abaixo:`)
                        .addFields({
                            name: `Nome e Passaporte:`,
                            value: `\`${resposta1}\``,
                            inline: false
                        }, {
                            name: `Patente`,
                            value: `\`${resposta2}\``,
                            inline: false
                        }, {
                            name: `Unidade:`,
                            value: `\`${resposta3}\``,
                            inline: false
                        }, {
                            name: `Quem recrutou:`,
                            value: `\`${resposta4}\``,
                            inline: false
                        }, )
                    let botao = new Discord.ActionRowBuilder().addComponents(
                        new Discord.ButtonBuilder()
                        .setCustomId("aprovar")
                        .setEmoji("✅")
                        .setLabel("Aprovar!")
                        .setStyle(Discord.ButtonStyle.Success)
                    );
                    if (!interaction.replied) {
                        interaction.reply({ content: `Olá **${interaction.user.username}**, seu formulário foi enviado com sucesso!`, ephemeral: true });
                    }
                    const member = await interaction.guild.members.fetch(interaction.user.id);
                    await member.setNickname(resposta1); // Definindo o apelido do membro
                    await interaction.guild.channels.cache.get(await db.get(`canal_logs_${interaction.guild.id}`)).send({ embeds: [embed], components: [botao] });
                }
            }
        })
    }
}