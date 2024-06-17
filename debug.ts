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
}

const voteManager = new VoteManager()

voteManager.startVote(["yes", "no"])

voteManager.vote("123", "yes")

voteManager.vote("123", "noi")

console.log("voteManager", voteManager.getResults())
