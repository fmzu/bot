import { Client, Events, GatewayIntentBits, type Message } from "discord.js"

class VoteManager {
  private currentVote: {
    options: string[]
    votes: Record<string, string>
  } | null = null

  startVote(options: string[]) {
    this.currentVote = {
      options: options,
      votes: {},
    }
  }

  vote(userId: string, option: string) {
    if (this.currentVote?.options.includes(option)) {
      this.currentVote.votes[userId] = option
      return true
    }
    return false
  }

  getCurrentVote() {
    return this.currentVote
  }
}

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

const voteManager = new VoteManager()

client.on(Events.MessageCreate, onCreateMessage)

const mentionText = process.env.BOT_ID

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_TOKEN,
// })

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

  if (text.startsWith("!startvote")) {
    const options = text.split(" ").slice(1)
    let voteMessageText = "投票を開始します。選択肢は以下の通りです。\n"

    for (let i = 0; i < options.length; i++) {
      voteMessageText += `${i + 1} : ${options[i]}\n`
    }

    voteManager.startVote(options)
    await message.channel.send(voteMessageText)
  } else if (text.startsWith("!vote")) {
    const option = text.split(" ")[1]
    if (voteManager.vote(message.author.id, option)) {
      await message.channel.send(`あなたの投票を受け付けました: ${option}`)
    } else {
      await message.channel.send(`無効な選択肢です: ${option}`)
    }
  }

  // else {
  //   const response = await openai.chat.completions.create({
  //     model: "gpt-4o",
  //     stream: false,
  //     messages: [
  //       {
  //         role: "system",
  //         content: text,
  //       },
  //     ],
  //   })
  //   console.log("message", response)

  // // 応答
  // await message.channel.send(
  //   `${responseText} ${response.choices[0].message.content}`,
  // )
  // }
}
