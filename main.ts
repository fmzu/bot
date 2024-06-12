import { Client, Events, GatewayIntentBits, type Message } from "discord.js"

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
})

const isDebugMode = import.meta.env.MODE === "development"

const token = isDebugMode
  ? process.env.DISCORD_TOKEN_DEBUG
  : process.env.DISCORD_TOKEN

client.login(token)

client.on(Events.ClientReady, (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`)
})

client.on(Events.MessageCreate, onCreateMessage)

async function onCreateMessage(message: Message<boolean>) {
  console.log(message)
}