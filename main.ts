import { Client, Events, GatewayIntentBits, type Message } from "discord.js"
import OpenAI from "openai"

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

const mentionText = process.env.BOT_ID

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

async function onCreateMessage(message: Message<boolean>) {
  // 自分へのメンションかどうか
  const isMention = message.content.includes(mentionText ?? "")

  // 自分へのメンションでない場合は無視する
  if (!isMention) return

  /**
   * メッセージの内容
   */
  const text = message.content.replace(mentionText ?? "", "").trim()

  const responseText = `<@${message.author.id}>`

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    stream: false,
    messages: [
      {
        role: "system",
        content: text,
      },
    ],
  })
  console.log("message", response)

  // 応答
  await message.channel.send(
    `${responseText} ${response.choices[0].message.content}`,
  )
}
