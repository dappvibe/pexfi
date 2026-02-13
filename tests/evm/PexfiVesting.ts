import { expect } from 'chai'

let pexfi, vault, vesting
let deployer
let hre, ethers, network

const SIX_MONTHS = 6 * 30 * 24 * 60 * 60
const TWO_YEARS = 2 * 365 * 24 * 60 * 60

before(async function () {
  const hardhat = await import('hardhat')
  hre = hardhat.default
  network = await hre.network.connect()
  ;({ ethers } = network)
  ;[deployer] = await ethers.getSigners()
})

describe('PexfiVesting', function () {
  before(async function () {
    pexfi = await (await ethers.getContractFactory('PexfiToken')).deploy()
    vault = await (
      await ethers.getContractFactory('PexfiVault')
    ).deploy(pexfi.target)

    const latestBlock = await ethers.provider.getBlock('latest')
    const start = latestBlock.timestamp

    vesting = await (
      await ethers.getContractFactory('PexfiVesting')
    ).deploy(deployer.address, start, TWO_YEARS, SIX_MONTHS, vault.target)

    const amount = ethers.parseEther('150000')
    await pexfi.approve(vault.target, amount)
    await vault.deposit(amount, vesting.target)
  })

  it('delegates voting power to beneficiary on construction', async function () {
    expect(await vault.delegates(vesting.target)).to.eq(deployer.address)
  })

  it('stores votingToken reference', async function () {
    expect(await vesting.votingToken()).to.eq(vault.target)
  })

  it('beneficiary has voting power from vesting contract balance', async function () {
    const votes = await vault.getVotes(deployer.address)
    expect(votes).to.be.gt(0)
  })
})
