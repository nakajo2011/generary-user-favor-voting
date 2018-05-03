const UseratioBallot = artifacts.require('./UseratioBallot')
import lkTestHelpers from 'lk-test-helpers/src/main.js'

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

const one_day = 24 * 60 * 60
contract('UseratioToken', function (accounts) {
  it("should assert true", async () => {
    const useratio_ballot = await UseratioBallot.new();
    assert.isOk(useratio_ballot)
  })

  it("normalized day unit.", async () => {
    const localnow = parseInt(Date.now() / 1000) // millis -> sec
    const useratio_ballot = await UseratioBallot.new();
    const date = await useratio_ballot.getNormalizedDate(localnow)

    const normalized = parseInt(localnow / one_day) * one_day
    assert.equal(date.toNumber(), normalized)
  })

  it("ratio increase only one time in the day.", async () => {
    const useratio_ballot = await UseratioBallot.new();
    const account = accounts[0]
    await useratio_ballot.increaseRatio(account)
    let balance = await useratio_ballot.balances(account)
    assert.equal(1, balance)

    try {
      await useratio_ballot.increaseRatio(account) // not increase. evm reverted.
    } catch (e) {
      assert.equal("Error: VM Exception while processing transaction: revert", e)
    }
    balance = await useratio_ballot.balances(account)
    assert.equal(1, balance.toNumber())
  })

  it("ratio increase two days test.", async () => {
    const useratio_token = await UseratioBallot.new();
    const account = accounts[0]
    await useratio_token.increaseRatio(account)
    let balance = await useratio_token.balances(account)
    assert.equal(1, balance)

    await increaseTime(one_day)
    await useratio_token.increaseRatio(account) // not increase. evm reverted.
    balance = await useratio_token.balances(account)
    assert.equal(2, balance.toNumber())
  })

  describe("ballots of test.", () => {
    let useratio_ballot, account, today, yesterday, before2day, long_day_ago
    before(async () => {
      useratio_ballot = await UseratioBallot.new();
      account = accounts[0]

      await useratio_ballot.increaseRatio(account)
      await increaseTime(one_day)
      await useratio_ballot.increaseRatio(account) // not increase. evm reverted.
      let balance = await useratio_ballot.balances(account)
      assert.equal(2, balance.toNumber())

      // now is increased one days. today and yesterday has ballot.
      const localnow = parseInt(await latestTime() / 1000) // millis -> sec
      today = parseInt(localnow / one_day) * one_day
      yesterday = today - one_day
      before2day = yesterday - one_day
      long_day_ago = today - one_day * 10

    })
    it("no have ballots term test.", async () => {
      const ballots = await useratio_ballot.ballotsOf(account, long_day_ago, before2day)
      assert.equal(0, ballots.toNumber())
    })

    it("to yesterday test.", async () => {
      const ballots = await useratio_ballot.ballotsOf(account, long_day_ago, yesterday)
      assert.equal(1, ballots.toNumber())
    })

    it("to today test.", async () => {
      const ballots = await useratio_ballot.ballotsOf(account, long_day_ago, today)
      assert.equal(2, ballots.toNumber())
    })

    it("at today test.", async () => {
      const ballots = await useratio_ballot.ballotsOf(account, today, today)
      assert.equal(1, ballots.toNumber())
    })
  })

});
