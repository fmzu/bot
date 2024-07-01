import {
  ActionRowBuilder,
  Client,
  Events,
  GatewayIntentBits,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  type Message,
} from "discord.js"

export class VoteManager {
  private currentVote: {
    options: string[]
    votes: Record<string, string>
  } | null = null

  startVote(options: string[]) {
    this.currentVote = {
      options: options,
      votes: {},
    }
    if (options.length > 25) {
      throw new Error("エラー: 選択肢は25個以下でなければなりません。")
    }
    if (options.some((option) => option.length > 30)) {
      throw new Error("エラー: 選択肢は30文字以下でなければなりません。")
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

  if (!vote) return

  const userId = interaction.user.id
  const option = interaction.values[0]

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

/**
 * botのメンションテキスト
 */
const mentionText = `<@${process.env.BOT_ID}>`

async function onCreateMessage(message: Message<boolean>) {
  // 自分へのメンションかどうか
  const isMention = message.content.includes(mentionText ?? "")

  // 自分へのメンションでない場合は無視する
  if (!isMention) return
  /**
   * メンションしたユーザーのIDのメンションテキスト
   */
  const responseText = `<@${message.author.id}>`

  /**
   * メッセージの内容
   */
  const text = message.content.replace(mentionText ?? "", "").trim()

  if (text.startsWith("!startVote")) {
    if (text.startsWith("!startVote")) {
      const options = text.split(" ").slice(1)
      if (options.length > 25) {
        message.channel.send(
          `${responseText} エラー: 項目は25個以下でなければなりません。`,
        )
        return
      }

      if (options.some((option) => option.length > 30)) {
        // 30文字以上の選択肢がある場合は無効
        message.channel.send(
          `${responseText} エラー: 選択肢は30文字以下でなければなりません。`,
        )
        return // 明示的に何も返さないように変更
      }

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
      await message.channel.send({
        content: voteMessageText,
        components: [row],
      })
    }
  }

  if (text === "!endVote") {
    const results = voteManager.getResults()

    if (!results) {
      await message.channel.send({
        content: `${responseText} 現在投票は行われていません。`,
      })
      return
    }

    let maxVotes = 0
    const maxOptions = [] // 最大票数を持つ選択肢を格納する配列

    // 最大票数を持つ選択肢を見つける
    for (const [option, count] of Object.entries(results)) {
      if (count > maxVotes) {
        maxVotes = count
        maxOptions.length = 0 // 配列をリセット
        maxOptions.push(option)
      } else if (count === maxVotes) {
        maxOptions.push(option) // 最大票数と同じ票数の選択肢を追加
      }
    }

    const allVotesZero = Object.values(results).every((count) => count === 0)

    // 結果テキストを更新
    let resultsText = `${responseText} 投票結果は以下の通りです。 \n`

    if (allVotesZero) {
      resultsText = "投票が行われましたが、すべての選択肢の票数が0でした。\n"
    } else {
      if (maxOptions.length === 1) {
        resultsText += `投票の結果、${maxOptions[0]}が選ばれました。(${maxVotes}票)\n`
      } else {
        resultsText += `投票の結果、${maxOptions.join("と")}が同票で最も多い票を獲得しました。(${maxVotes}票)\n`
      }
      const sortedEntries = Object.entries(results).sort((a, b) => b[1] - a[1])
      for (const [option, count] of sortedEntries) {
        resultsText += `${option}: ${count}票\n`
      }
    }

    await message.channel.send({ content: resultsText })

    voteManager.endVote()
  }
}
