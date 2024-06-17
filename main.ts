import {
  ActionRowBuilder,
  Client,
  Events,
  GatewayIntentBits,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  type Message,
} from "discord.js"

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

  getResults() {
    if (!this.currentVote) return null

    const results: Record<string, number> = {}

    for (const option of this.currentVote.options) {
      results[option] = 0
    }

    for (const vote of Object.values(this.currentVote.votes)) {
      results[vote]++
    }

    return results
  }

  endVote() {
    this.currentVote = null
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

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isAnySelectMenu()) return

  const vote = voteManager.getCurrentVote()
  console.log("vote", vote)

  if (!vote) return

  const userId = interaction.user.id
  const option = interaction.values[0]
  console.log("userId", userId)
  console.log("option", option)

  const success = voteManager.vote(userId, option)

  if (success) {
    await interaction.reply({
      content: "投票を受け付けました。",
      ephemeral: true,
    })
  } else {
    await interaction.reply({
      content: "選択肢が見つかりません。",
      ephemeral: true,
    })
  }
})

const mentionText = `<@${process.env.BOT_ID}>`

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

  // const select = new StringSelectMenuBuilder()
  //   .setCustomId("starter")
  //   .setPlaceholder("Make a selection!")
  //   .addOptions(
  //     new StringSelectMenuOptionBuilder()
  //       .setLabel("")
  //       .setDescription("")
  //       .setValue(""),
  //   )

  if (text.startsWith("!startVote")) {
    const options = text.split(" ").slice(1) // コマンドの後のテキストを選択肢として分割
    const select = new StringSelectMenuBuilder()
      .setCustomId("starter")
      .setPlaceholder("何か一つ選んでください")

    // 選択肢を追加
    const selectResult = select.addOptions(
      options.map((option, index) =>
        new StringSelectMenuOptionBuilder().setLabel(option).setValue(option),
      ),
    )

    // ActionRowBuilder を使用してメニューをメッセージに追加
    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      selectResult,
    )

    // 投票メッセージのテキストを構築
    let voteMessageText = `${responseText} 投票を開始します。以下の選択肢から一つ選んでください。\n`
    options.forEach((option, index) => {
      voteMessageText += `${index + 1}: ${option}\n`
    })

    voteManager.startVote(options)
    await message.channel.send({ content: voteMessageText, components: [row] })
  }

  if (text === "!endVote") {
    const results = voteManager.getResults()

    if (!results) {
      await message.channel.send({
        content: `${responseText} 現在投票は行われていません。`,
      })
      return
    }

    let resultsText = `${responseText} 投票結果は以下の通りです。\n`
    for (const [option, count] of Object.entries(results)) {
      resultsText += `${option}: ${count}票\n`
    }

    await message.channel.send({ content: resultsText })

    voteManager.endVote()
  }
}
