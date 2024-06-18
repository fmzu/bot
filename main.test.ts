import { VoteManager } from "./main"
import { test, expect, describe, beforeEach } from "bun:test"

describe("VoteManager", () => {
  let voteManager: VoteManager

  beforeEach(() => {
    voteManager = new VoteManager()
  })

  test("should start a vote with given options", () => {
    const options = ["Option 1", "Option 2"]
    voteManager.startVote(options)
    expect(voteManager.getCurrentVote()).toEqual({
      options: options,
      votes: {},
    })
  })

  test("should allow voting for an option", () => {
    const options = ["Option 1", "Option 2"]
    voteManager.startVote(options)
    const success = voteManager.vote("user1", "Option 1")
    expect(success).toBe(true)
    expect(voteManager.getCurrentVote()?.votes.user1).toBe("Option 1")
  })

  test("should not allow voting for an invalid option", () => {
    const options = ["Option 1", "Option 2"]
    voteManager.startVote(options)
    const success = voteManager.vote("user1", "Option 3")
    expect(success).toBe(false)
  })

  test("should get correct results after voting", () => {
    const options = ["Option 1", "Option 2"]
    voteManager.startVote(options)
    voteManager.vote("user1", "Option 1")
    voteManager.vote("user2", "Option 1")
    const results = voteManager.getResults()
    expect(results).toEqual({ "Option 1": 2, "Option 2": 0 })
  })

  test("should reset current vote after ending the vote", () => {
    const options = ["Option 1", "Option 2"]
    voteManager.startVote(options)
    voteManager.endVote()
    expect(voteManager.getCurrentVote()).toBeNull()
  })

  test("should allow voting for an option", () => {
    const options = ["Option 1", "Option 2"]
    voteManager.startVote(options)
    const success = voteManager.vote("user1", "Option 1")
    expect(success).toBe(true)
    expect(voteManager.getCurrentVote()?.votes.user1).toBe("Option 1")
  })

  // Test 2: Voting for an option not in the current vote should fail
  test("voting for an unavailable option fails", () => {
    const options = ["Option 1", "Option 2"]
    voteManager.startVote(options)
    const success = voteManager.vote("user1", "Option 3")
    expect(success).toBe(false)
  })

  // Test 3: Multiple votes by the same user should update the user's vote
  test("multiple votes by the same user updates vote", () => {
    const options = ["Option 1", "Option 2"]
    voteManager.startVote(options)
    voteManager.vote("user1", "Option 1")
    voteManager.vote("user1", "Option 2")
    const results = voteManager.getResults()
    expect(results).toEqual({ "Option 1": 0, "Option 2": 1 })
  })

  // Test 4: Ending a vote prevents further voting
  test("no voting allowed after vote has ended", () => {
    const options = ["Option 1", "Option 2"]
    voteManager.startVote(options)
    voteManager.endVote()
    const success = voteManager.vote("user1", "Option 1")
    expect(success).toBe(false)
  })

  // Test 5: Starting a new vote resets previous votes
  test("starting a new vote resets votes", () => {
    const options1 = ["Option 1", "Option 2"]
    voteManager.startVote(options1)
    voteManager.vote("user1", "Option 1")
    const options2 = ["Option 3", "Option 4"]
    voteManager.startVote(options2)
    const results = voteManager.getResults()
    expect(results).toEqual({ "Option 3": 0, "Option 4": 0 })
  })

  // Test 6: Get results returns correct vote counts with multiple options
  test("get results returns correct counts with multiple options", () => {
    const options = ["Option 1", "Option 2", "Option 3"]
    voteManager.startVote(options)
    voteManager.vote("user1", "Option 1")
    voteManager.vote("user2", "Option 2")
    voteManager.vote("user3", "Option 1")
    const results = voteManager.getResults()
    expect(results).toEqual({ "Option 1": 2, "Option 2": 1, "Option 3": 0 })
  })

  // Test 7: A vote with no votes returns an empty result
  test("a vote with no votes returns empty result", () => {
    const options = ["Option 1", "Option 2"]
    voteManager.startVote(options)
    const results = voteManager.getResults()
    expect(results).toEqual({ "Option 1": 0, "Option 2": 0 })
  })
})
