import { Wallet } from 'ethers'
import { ethers, waffle } from 'hardhat'
import { UniswapV3Factory } from '../typechain/UniswapV3Factory'
import { expect } from './shared/expect'
import snapshotGasCost from './shared/snapshotGasCost'
import { sleep } from './shared/utilities'

import { FeeAmount, getCreate2Address, TICK_SPACINGS } from './shared/utilities'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'

const { constants } = ethers

const TEST_ADDRESSES: [string, string] = [
  '0x1000000000000000000000000000000000000000',
  '0x2000000000000000000000000000000000000000',
]

const createFixtureLoader = waffle.createFixtureLoader

describe('UniswapV3Factory', () => {
  let wallet: SignerWithAddress, other: SignerWithAddress

  let factory: UniswapV3Factory
  let poolBytecode: string
  const fixture = async () => {
    const factoryFactory = await ethers.getContractFactory('UniswapV3Factory')
    const ff = await factoryFactory.deploy()
    ff.waitForDeployment();
    return ff as UniswapV3Factory
  }

  before('create fixture loader', async () => {
    wallet = (await ethers.getSigners())[0]
    other = (await ethers.getSigners())[1]
  })

  before('load pool bytecode', async () => {
    poolBytecode = (await ethers.getContractFactory('UniswapV3Pool')).bytecode
    await sleep(3000);
  })

  beforeEach('deploy factory', async () => {
    factory = await fixture()
    await sleep(3000);
  })

  it('owner is deployer', async () => {
    expect(await factory.owner()).to.eq(wallet.address)
  })

  it('factory bytecode size', async () => {
    expect(((await waffle.provider.getCode(factory.address)).length - 2) / 2).to.matchSnapshot()
  })

  it('pool bytecode size', async () => {
    await factory.createPool(TEST_ADDRESSES[0], TEST_ADDRESSES[1], FeeAmount.MEDIUM)
    await sleep(3000);
    const poolAddress = getCreate2Address(factory.address, TEST_ADDRESSES, FeeAmount.MEDIUM, poolBytecode)
    await sleep(3000);
    expect(((await waffle.provider.getCode(poolAddress)).length - 2) / 2).to.matchSnapshot()
  })

  it('initial enabled fee amounts', async () => {
    expect(await factory.feeAmountTickSpacing(FeeAmount.LOW)).to.eq(TICK_SPACINGS[FeeAmount.LOW])
    await sleep(3000);
    expect(await factory.feeAmountTickSpacing(FeeAmount.MEDIUM)).to.eq(TICK_SPACINGS[FeeAmount.MEDIUM])
    await sleep(3000);
    expect(await factory.feeAmountTickSpacing(FeeAmount.HIGH)).to.eq(TICK_SPACINGS[FeeAmount.HIGH])
    await sleep(3000);
  })

  async function createAndCheckPool(
    tokens: [string, string],
    feeAmount: FeeAmount,
    tickSpacing: number = TICK_SPACINGS[feeAmount]
  ) {
    const create2Address = getCreate2Address(factory.address, tokens, feeAmount, poolBytecode)
    await sleep(3000);
    const create = factory.createPool(tokens[0], tokens[1], feeAmount)
    await sleep(3000);

    await expect(create)
      .to.emit(factory, 'PoolCreated')
      .withArgs(TEST_ADDRESSES[0], TEST_ADDRESSES[1], feeAmount, tickSpacing, create2Address)
    await sleep(3000);

    await expect(factory.createPool(tokens[0], tokens[1], feeAmount)).to.be.reverted
    await sleep(3000);
    await expect(factory.createPool(tokens[1], tokens[0], feeAmount)).to.be.reverted
    await sleep(3000);
    expect(await factory.getPool(tokens[0], tokens[1], feeAmount), 'getPool in order').to.eq(create2Address)
    await sleep(3000);
    expect(await factory.getPool(tokens[1], tokens[0], feeAmount), 'getPool in reverse').to.eq(create2Address)
    await sleep(3000);

    const poolContractFactory = await ethers.getContractFactory('UniswapV3Pool')
    await sleep(3000);
    const pool = poolContractFactory.attach(create2Address)
    expect(await pool.factory(), 'pool factory address').to.eq(factory.address)
    await sleep(3000);
    expect(await pool.token0(), 'pool token0').to.eq(TEST_ADDRESSES[0])
    await sleep(3000);
    expect(await pool.token1(), 'pool token1').to.eq(TEST_ADDRESSES[1])
    await sleep(3000);
    expect(await pool.fee(), 'pool fee').to.eq(feeAmount)
    await sleep(3000);
    expect(await pool.tickSpacing(), 'pool tick spacing').to.eq(tickSpacing)
    await sleep(3000);
  }

  describe('#createPool', async () => {
    it('succeeds for low fee pool', async () => {
      await createAndCheckPool(TEST_ADDRESSES, FeeAmount.LOW)
      await sleep(3000);
    })

    it('succeeds for medium fee pool', async () => {
      await createAndCheckPool(TEST_ADDRESSES, FeeAmount.MEDIUM)
      await sleep(3000);
    })
    it('succeeds for high fee pool', async () => {
      await createAndCheckPool(TEST_ADDRESSES, FeeAmount.HIGH)
      await sleep(3000);
    })

    it('succeeds if tokens are passed in reverse', async () => {
      await createAndCheckPool([TEST_ADDRESSES[1], TEST_ADDRESSES[0]], FeeAmount.MEDIUM)
      await sleep(3000);
    })

    it('fails if token a == token b', async () => {
      await expect(factory.createPool(TEST_ADDRESSES[0], TEST_ADDRESSES[0], FeeAmount.LOW)).to.be.reverted
      await sleep(3000);
    })

    it('fails if token a is 0 or token b is 0', async () => {
      await expect(factory.createPool(TEST_ADDRESSES[0], constants.AddressZero, FeeAmount.LOW)).to.be.reverted
      await sleep(3000);
      await expect(factory.createPool(constants.AddressZero, TEST_ADDRESSES[0], FeeAmount.LOW)).to.be.reverted
      await sleep(3000);
      await expect(factory.createPool(constants.AddressZero, constants.AddressZero, FeeAmount.LOW)).to.be.revertedWith(
        ''
      )
      await sleep(3000);
    })

    it('fails if fee amount is not enabled', async () => {
      await expect(factory.createPool(TEST_ADDRESSES[0], TEST_ADDRESSES[1], 250)).to.be.reverted
      await sleep(3000);
    })

    // it('gas', async () => {
    //   await snapshotGasCost(factory.createPool(TEST_ADDRESSES[0], TEST_ADDRESSES[1], FeeAmount.MEDIUM))
    // await sleep(3000);
    // })
  })

  describe('#setOwner', () => {
    it('fails if caller is not owner', async () => {
      await expect(factory.connect(other).setOwner(wallet.address)).to.be.reverted
      await sleep(3000);
    })

    it('updates owner', async () => {
      await factory.setOwner(other.address)
      await sleep(3000);
      expect(await factory.owner()).to.eq(other.address)
      await sleep(3000);
    })

    it('emits event', async () => {
      const txResp = await factory.setOwner(other.address)
      await txResp.wait()
      await expect(txResp)
        .to.emit(factory, 'OwnerChanged')
        .withArgs(wallet.address, other.address)
    })

    it('cannot be called by original owner', async () => {
      await factory.setOwner(other.address)
      await sleep(3000);
      await expect(factory.setOwner(wallet.address)).to.be.reverted
      await sleep(3000);
    })
  })

  describe('#enableFeeAmount', () => {
    it('fails if caller is not owner', async () => {
      await expect(factory.connect(other).enableFeeAmount(100, 2)).to.be.reverted
      await sleep(3000);
    })
    it('fails if fee is too great', async () => {
      await expect(factory.enableFeeAmount(1000000, 10)).to.be.reverted
      await sleep(3000);
    })
    it('fails if tick spacing is too small', async () => {
      await expect(factory.enableFeeAmount(500, 0)).to.be.reverted
      await sleep(3000);
    })
    it('fails if tick spacing is too large', async () => {
      await expect(factory.enableFeeAmount(500, 16834)).to.be.reverted
      await sleep(3000);
    })
    it('fails if already initialized', async () => {
      await factory.enableFeeAmount(100, 5)
      await sleep(3000);
      await expect(factory.enableFeeAmount(100, 10)).to.be.reverted
      await sleep(3000);
    })
    it('sets the fee amount in the mapping', async () => {
      await factory.enableFeeAmount(100, 5)
      await sleep(3000);
      expect(await factory.feeAmountTickSpacing(100)).to.eq(5)
      await sleep(3000);
    })
    it('emits an event', async () => {
      await expect(factory.enableFeeAmount(100, 5)).to.emit(factory, 'FeeAmountEnabled').withArgs(100, 5)
      await sleep(3000);
    })
    it('enables pool creation', async () => {
      await factory.enableFeeAmount(250, 15)
      await sleep(3000);
      await createAndCheckPool([TEST_ADDRESSES[0], TEST_ADDRESSES[1]], 250, 15)
      await sleep(3000);
    })
  })
})
