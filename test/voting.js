import expectRevert from "lk-test-helpers/src/helpers/expectRevert";
import lkTestHelpers from 'lk-test-helpers/src/main.js'

const UseratioBallot = artifacts.require('./UseratioBallot')
const Voting = artifacts.require('./Voting.sol')

const {
  advanceBlock,
  advanceToBlock,
  assertJump,
  ether,
  latestTime,
  increaseTime,
  increaseTimeTo,
  EVMThrow,
  expectThrow,
  hashMessage,
  timer,
  toPromise,
  transactionMined
} = lkTestHelpers(web3)

const range = (n) => Array.apply(null, {length: n}).map(Number.call, Number)
const one_day = 24 * 60 * 60
contract('Voting', function (accounts) {

  describe("create Voting", () => {
    it("success", async () => {
      const now = await latestTime() / 1000
      const useratio_ballot = await UseratioBallot.new()
      const voting = await Voting.new(now - (one_day * 10), now - (one_day), useratio_ballot.address)
      assert.isOk(voting)
    })

    it("faild, address is bad.", async () => {
      const now = await latestTime() / 1000
      const useratio_ballot = await UseratioBallot.new()
      await expectRevert(Voting.new(now - (one_day * 10), now - (one_day), 0))
    })

    it("faild, The start date not previous.", async () => {
      const now = await latestTime() / 1000
      const useratio_ballot = await UseratioBallot.new()
      // add 10 sec because sometimes failed.
      await expectRevert(Voting.new(now + 10, now + 10, useratio_ballot.address))
    })

    it("faild, The end date not previous.", async () => {
      const now = await latestTime() / 1000
      const useratio_ballot = await UseratioBallot.new()
      // add 10 sec because sometimes failed.
      await expectRevert(Voting.new(now - one_day, now + 10, useratio_ballot.address))
    })

    it("faild, The start date not before end date.", async () => {
      const now = await latestTime() / 1000
      const useratio_ballot = await UseratioBallot.new()
      // add 10 sec because sometimes failed.
      await expectRevert(Voting.new(now - one_day, now - (one_day * 2), useratio_ballot.address))
    })
  })

  describe("voting test", () => {
    const account = accounts[0]
    let useratio_ballot, voting, now
    beforeEach(async () => {
      useratio_ballot = await UseratioBallot.new()
      for (let i = 0; i < 10; i++) {
        await useratio_ballot.increaseRatio(account)
        await increaseTime(one_day)
      }
      now = await latestTime() / 1000
      voting = await Voting.new(now - (one_day * 10), now - (one_day), useratio_ballot.address)
    })

    it("success, agree count", async () => {
      let agreeCount = await voting.agreeCount()
      let disagreeCount = await voting.disagreeCount()
      assert.equal(0, agreeCount)
      assert.equal(0, disagreeCount)
      await voting.vote(true)

      agreeCount = await voting.agreeCount()
      disagreeCount = await voting.disagreeCount()
      assert.equal(10, agreeCount.toNumber())
      assert.equal(0, disagreeCount.toNumber())
    })

    it("success, disagree count", async () => {
      let agreeCount = await voting.agreeCount()
      let disagreeCount = await voting.disagreeCount()
      assert.equal(0, agreeCount)
      assert.equal(0, disagreeCount)
      await voting.vote(false)

      agreeCount = await voting.agreeCount()
      disagreeCount = await voting.disagreeCount()
      assert.equal(0, agreeCount.toNumber())
      assert.equal(10, disagreeCount.toNumber())
    })

    it("failed, vote duplicated.", async () => {
      await voting.vote(true)
      await expectRevert(voting.vote(true))
    })
  })
})
