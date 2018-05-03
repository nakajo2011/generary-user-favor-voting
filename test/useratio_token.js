const UseratioToken = artifacts.require('./UseratioToken')
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
    const useratio_token = await UseratioToken.new();
    assert.isOk(useratio_token)
  })

  it("normalized day unit.", async () => {
    const useratio_token = await UseratioToken.new();
    const date = await useratio_token.getNormalizedDate()
    const localnow = parseInt(Date.now() / 1000) // millis -> sec

    const normalized = parseInt(localnow / one_day) * one_day
    assert.equal(date.toNumber(), normalized)
  })

  it("ratio increase only one time in the day.", async () => {
    const useratio_token = await UseratioToken.new();
    const account = accounts[0]
    await useratio_token.increaseRatio(account)
    let balance = await useratio_token.balances(account)
    assert.equal(1, balance)

    try {
      await useratio_token.increaseRatio(account) // not increase. evm reverted.
    } catch (e) {
      assert.equal("Error: VM Exception while processing transaction: revert", e)
    }
    balance = await useratio_token.balances(account)
    assert.equal(1, balance.toNumber())
  })

  it("ratio increase only one time in the day.", async () => {
    const useratio_token = await UseratioToken.new();
    const account = accounts[0]
    await useratio_token.increaseRatio(account)
    let balance = await useratio_token.balances(account)
    assert.equal(1, balance)

    increaseTime(one_day)
    await useratio_token.increaseRatio(account) // not increase. evm reverted.
    balance = await useratio_token.balances(account)
    assert.equal(2, balance.toNumber())
  })

});
