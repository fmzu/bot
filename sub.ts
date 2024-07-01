import type { Message } from "discord.js"
import { ActionRowBuilder, Client, Events, GatewayIntentBits } from "discord.js"

const {
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  SlashCommandBuilder,
} = require("discord.js")

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
})
const isDebugMode = import.meta.env.MODE === "development"

const token = isDebugMode
  ? process.env.DISCORD_TOKEN_DEBUG
  : process.env.DISCORD_TOKEN

client.login(token)

client.on(Events.ClientReady, (c) => {
  console.log(`Ready! Logged in as sub ${c.user.tag}`)
})

client.on(Events.MessageCreate, onCreateMessage)

const mentionText = `<@${process.env.BOT_ID}>`

async function onCreateMessage(message: Message<boolean>) {
  const isMention = message.content.includes(mentionText ?? "")
  console.log("aaa", isMention)

  if (!isMention) return

  const responseText = `<@${message.author.id}>`

  const text = message.content.replace(mentionText ?? "", "").trim()
  console.log("aa", text)

  const select = new StringSelectMenuBuilder()
    .setCustomId("starter")
    .setPlaceholder("Make a selection!")
    .addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel("Bulbasaur")
        .setDescription("The dual-type Grass/Poison Seed Pokémon.")
        .setValue("bulbasaur"),
      new StringSelectMenuOptionBuilder()
        .setLabel("Charmander")
        .setDescription("The Fire-type Lizard Pokémon.")
        .setValue("charmander"),
      new StringSelectMenuOptionBuilder()
        .setLabel("Squirtle")
        .setDescription("The Water-type Tiny Turtle Pokémon.")
        .setValue("squirtle"),
    )

  const row = new ActionRowBuilder().addComponents(select)

  await interaction.reply({
    content: "Choose your starter!",
    components: [row],
  })
  console.log("select", select)
  message.channel.send({
    content: `${responseText} あああ`,
    components: [row],
  })
}
