import { VoteManager } from "./main"
import { test, expect, beforeEach } from "bun:test"

let voteManager: VoteManager

beforeEach(() => {
  voteManager = new VoteManager()
})

test("指定されたオプションで投票を開始する", () => {
  const options = ["オプション 1", "オプション 2"]
  voteManager.startVote(options)
  expect(voteManager.getCurrentVote()).toEqual({
    options: options,
    votes: {},
  })
})

test("オプションに投票することを許可する", () => {
  const options = ["オプション 1", "オプション 2"]
  voteManager.startVote(options)
  const success = voteManager.vote("user1", "オプション 1")
  expect(success).toBe(true)
  expect(voteManager.getCurrentVote()?.votes.user1).toBe("オプション 1")
})

test("無効なオプションには投票できない", () => {
  const options = ["オプション 1", "オプション 2"]
  voteManager.startVote(options)
  const success = voteManager.vote("user1", "オプション 3")
  expect(success).toBe(false)
})

test("投票後の正しい結果を取得する", () => {
  const options = ["オプション 1", "オプション 2"]
  voteManager.startVote(options)
  voteManager.vote("user1", "オプション 1")
  voteManager.vote("user2", "オプション 1")
  const results = voteManager.getResults()
  expect(results).toEqual({ "オプション 1": 2, "オプション 2": 0 })
})

test("投票を終了した後は現在の投票をリセットする", () => {
  const options = ["オプション 1", "オプション 2"]
  voteManager.startVote(options)
  voteManager.endVote()
  expect(voteManager.getCurrentVote()).toBeNull()
})

test("利用できないオプションに投票しようとすると失敗する", () => {
  const options = ["オプション 1", "オプション 2"]
  voteManager.startVote(options)
  const success = voteManager.vote("user1", "オプション 3")
  expect(success).toBe(false)
})

test("同じユーザーによる複数の投票は投票を更新する", () => {
  const options = ["オプション 1", "オプション 2"]
  voteManager.startVote(options)
  voteManager.vote("user1", "オプション 1")
  voteManager.vote("user1", "オプション 2")
  const results = voteManager.getResults()
  expect(results).toEqual({ "オプション 1": 0, "オプション 2": 1 })
})

test("投票が終了した後は投票できない", () => {
  const options = ["オプション 1", "オプション 2"]
  voteManager.startVote(options)
  voteManager.endVote()
  const success = voteManager.vote("user1", "オプション 1")
  expect(success).toBe(false)
})

test("新しい投票を開始すると投票がリセットされる", () => {
  const options1 = ["オプション 1", "オプション 2"]
  voteManager.startVote(options1)
  voteManager.vote("user1", "オプション 1")
  const options2 = ["オプション 3", "オプション 4"]
  voteManager.startVote(options2)
  const results = voteManager.getResults()
  expect(results).toEqual({ "オプション 3": 0, "オプション 4": 0 })
})

test("複数のオプションで正しい投票数が返される", () => {
  const options = ["オプション 1", "オプション 2", "オプション 3"]
  voteManager.startVote(options)
  voteManager.vote("user1", "オプション 1")
  voteManager.vote("user2", "オプション 2")
  voteManager.vote("user3", "オプション 1")
  const results = voteManager.getResults()
  expect(results).toEqual({
    "オプション 1": 2,
    "オプション 2": 1,
    "オプション 3": 0,
  })
})

test("投票がない場合は空の結果が返される", () => {
  const options = ["オプション 1", "オプション 2"]
  voteManager.startVote(options)
  const results = voteManager.getResults()
  expect(results).toEqual({ "オプション 1": 0, "オプション 2": 0 })
})

test("投票項目が25個以下の時投票を開始する", () => {
  const options = Array.from({ length: 25 }, (_, i) => `Option ${i + 1}`)
  voteManager.startVote(options)
  expect(voteManager.getCurrentVote()).not.toBeNull()
  expect(voteManager.getCurrentVote()?.options).toEqual(options)
})

test("投票項目が25個以上の時エラーを返す", () => {
  const options = Array.from({ length: 26 }, (_, i) => `Option ${i + 1}`)
  expect(() => voteManager.startVote(options)).toThrow(
    "エラー: 選択肢は25個以下でなければなりません。",
  )
})

test("オプションが30文字以下であれば投票を開始する", () => {
  const options = ["Option1", "Option2", "Option3"]
  voteManager.startVote(options)
  expect(voteManager.getCurrentVote()).not.toBeNull()
  expect(voteManager.getCurrentVote()?.options).toEqual(options)
})

test("30文字を超える選択肢がある場合にエラーを投げる", async () => {
  const longOption = "ThisIsAVeryLongOptionThatExceedsThirtyCharacters"
  const options = ["Option1", longOption]
  expect(() => voteManager.startVote(options)).toThrow(
    "エラー: 選択肢は30文字以下でなければなりません。",
  )
})
