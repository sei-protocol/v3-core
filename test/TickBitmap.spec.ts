import { ethers } from 'hardhat'
import { TickBitmapTest } from '../typechain/TickBitmapTest'
import { expect } from './shared/expect'
import snapshotGasCost from './shared/snapshotGasCost'
import { sleep } from './shared/utilities'

describe('TickBitmap', () => {
  let tickBitmap: TickBitmapTest

  beforeEach('deploy TickBitmapTest', async () => {
    const tickBitmapTestFactory = await ethers.getContractFactory('TickBitmapTest')
    await sleep(3000);
    tickBitmap = (await tickBitmapTestFactory.deploy()) as TickBitmapTest
    await sleep(3000);
  })

  async function initTicks(ticks: number[]): Promise<void> {
    for (const tick of ticks) {
      await tickBitmap.flipTick(tick)
      await sleep(3000);
    }
  }

  describe('#isInitialized', () => {
    it('is false at first', async () => {
      expect(await tickBitmap.isInitialized(1)).to.eq(false)
      await sleep(3000);
    })
    it('is flipped by #flipTick', async () => {
      await tickBitmap.flipTick(1)
      await sleep(3000);
      expect(await tickBitmap.isInitialized(1)).to.eq(true)
      await sleep(3000);
    })
    it('is flipped back by #flipTick', async () => {
      await tickBitmap.flipTick(1)
      await sleep(3000);
      await tickBitmap.flipTick(1)
      await sleep(3000);
      expect(await tickBitmap.isInitialized(1)).to.eq(false)
      await sleep(3000);
    })
    it('is not changed by another flip to a different tick', async () => {
      await tickBitmap.flipTick(2)
      await sleep(3000);
      expect(await tickBitmap.isInitialized(1)).to.eq(false)
      await sleep(3000);
    })
    it('is not changed by another flip to a different tick on another word', async () => {
      await tickBitmap.flipTick(1 + 256)
      await sleep(3000);
      expect(await tickBitmap.isInitialized(257)).to.eq(true)
      await sleep(3000);
      expect(await tickBitmap.isInitialized(1)).to.eq(false)
      await sleep(3000);
    })
  })

  describe('#flipTick', () => {
    it('flips only the specified tick', async () => {
      await tickBitmap.flipTick(-230)
      await sleep(3000);
      expect(await tickBitmap.isInitialized(-230)).to.eq(true)
      await sleep(3000);
      expect(await tickBitmap.isInitialized(-231)).to.eq(false)
      await sleep(3000);
      expect(await tickBitmap.isInitialized(-229)).to.eq(false)
      await sleep(3000);
      expect(await tickBitmap.isInitialized(-230 + 256)).to.eq(false)
      await sleep(3000);
      expect(await tickBitmap.isInitialized(-230 - 256)).to.eq(false)
      await sleep(3000);
      await tickBitmap.flipTick(-230)
      await sleep(3000);
      expect(await tickBitmap.isInitialized(-230)).to.eq(false)
      await sleep(3000);
      expect(await tickBitmap.isInitialized(-231)).to.eq(false)
      await sleep(3000);
      expect(await tickBitmap.isInitialized(-229)).to.eq(false)
      await sleep(3000);
      expect(await tickBitmap.isInitialized(-230 + 256)).to.eq(false)
      await sleep(3000);
      expect(await tickBitmap.isInitialized(-230 - 256)).to.eq(false)
      await sleep(3000);
    })

    it('reverts only itself', async () => {
      await tickBitmap.flipTick(-230)
      await sleep(3000);
      await tickBitmap.flipTick(-259)
      await sleep(3000);
      await tickBitmap.flipTick(-229)
      await sleep(3000);
      await tickBitmap.flipTick(500)
      await sleep(3000);
      await tickBitmap.flipTick(-259)
      await sleep(3000);
      await tickBitmap.flipTick(-229)
      await sleep(3000);
      await tickBitmap.flipTick(-259)
      await sleep(3000);

      expect(await tickBitmap.isInitialized(-259)).to.eq(true)
      await sleep(3000);
      expect(await tickBitmap.isInitialized(-229)).to.eq(false)
      await sleep(3000);
    })

    it('gas cost of flipping first tick in word to initialized', async () => {
      await snapshotGasCost(await tickBitmap.getGasCostOfFlipTick(1))
      await sleep(3000);
    })
    it('gas cost of flipping second tick in word to initialized', async () => {
      await tickBitmap.flipTick(0)
      await sleep(3000);
      await snapshotGasCost(await tickBitmap.getGasCostOfFlipTick(1))
      await sleep(3000);
    })
    // it('gas cost of flipping a tick that results in deleting a word', async () => {
    //   await tickBitmap.flipTick(0)
    //   await sleep(3000);
    //   await snapshotGasCost(await tickBitmap.getGasCostOfFlipTick(0))
    //   await sleep(3000);
    // })
  })

  describe('#nextInitializedTickWithinOneWord', () => {
    beforeEach('set up some ticks', async () => {
      // word boundaries are at multiples of 256
      await initTicks([-200, -55, -4, 70, 78, 84, 139, 240, 535])
      await sleep(3000);
    })

    describe('lte = false', async () => {
      it('returns tick to right if at initialized tick', async () => {
        const { next, initialized } = await tickBitmap.nextInitializedTickWithinOneWord(78, false)
        await sleep(3000);
        expect(next).to.eq(84)
        expect(initialized).to.eq(true)
      })
      it('returns tick to right if at initialized tick', async () => {
        const { next, initialized } = await tickBitmap.nextInitializedTickWithinOneWord(-55, false)
        await sleep(3000);
        expect(next).to.eq(-4)
        expect(initialized).to.eq(true)
      })

      it('returns the tick directly to the right', async () => {
        const { next, initialized } = await tickBitmap.nextInitializedTickWithinOneWord(77, false)
        await sleep(3000);
        expect(next).to.eq(78)
        expect(initialized).to.eq(true)
      })
      it('returns the tick directly to the right', async () => {
        const { next, initialized } = await tickBitmap.nextInitializedTickWithinOneWord(-56, false)
        await sleep(3000);
        expect(next).to.eq(-55)
        expect(initialized).to.eq(true)
      })

      it('returns the next words initialized tick if on the right boundary', async () => {
        const { next, initialized } = await tickBitmap.nextInitializedTickWithinOneWord(255, false)
        await sleep(3000);
        expect(next).to.eq(511)
        expect(initialized).to.eq(false)
      })
      it('returns the next words initialized tick if on the right boundary', async () => {
        const { next, initialized } = await tickBitmap.nextInitializedTickWithinOneWord(-257, false)
        await sleep(3000);
        expect(next).to.eq(-200)
        expect(initialized).to.eq(true)
      })

      it('returns the next initialized tick from the next word', async () => {
        await tickBitmap.flipTick(340)
        await sleep(3000);
        const { next, initialized } = await tickBitmap.nextInitializedTickWithinOneWord(328, false)
        await sleep(3000);
        expect(next).to.eq(340)
        expect(initialized).to.eq(true)
      })
      it('does not exceed boundary', async () => {
        const { next, initialized } = await tickBitmap.nextInitializedTickWithinOneWord(508, false)
        await sleep(3000);
        expect(next).to.eq(511)
        expect(initialized).to.eq(false)
      })
      it('skips entire word', async () => {
        const { next, initialized } = await tickBitmap.nextInitializedTickWithinOneWord(255, false)
        await sleep(3000);
        expect(next).to.eq(511)
        expect(initialized).to.eq(false)
      })
      it('skips half word', async () => {
        const { next, initialized } = await tickBitmap.nextInitializedTickWithinOneWord(383, false)
        await sleep(3000);
        expect(next).to.eq(511)
        expect(initialized).to.eq(false)
      })

      it('gas cost on boundary', async () => {
        await snapshotGasCost(await tickBitmap.getGasCostOfNextInitializedTickWithinOneWord(255, false))
        await sleep(3000);
      })
      it('gas cost just below boundary', async () => {
        await snapshotGasCost(await tickBitmap.getGasCostOfNextInitializedTickWithinOneWord(254, false))
        await sleep(3000);
      })
      it('gas cost for entire word', async () => {
        await snapshotGasCost(await tickBitmap.getGasCostOfNextInitializedTickWithinOneWord(768, false))
        await sleep(3000);
      })
    })

    describe('lte = true', () => {
      it('returns same tick if initialized', async () => {
        const { next, initialized } = await tickBitmap.nextInitializedTickWithinOneWord(78, true)
        await sleep(3000);

        expect(next).to.eq(78)
        expect(initialized).to.eq(true)
      })
      it('returns tick directly to the left of input tick if not initialized', async () => {
        const { next, initialized } = await tickBitmap.nextInitializedTickWithinOneWord(79, true)
        await sleep(3000);

        expect(next).to.eq(78)
        expect(initialized).to.eq(true)
      })
      it('will not exceed the word boundary', async () => {
        const { next, initialized } = await tickBitmap.nextInitializedTickWithinOneWord(258, true)
        await sleep(3000);

        expect(next).to.eq(256)
        expect(initialized).to.eq(false)
      })
      it('at the word boundary', async () => {
        const { next, initialized } = await tickBitmap.nextInitializedTickWithinOneWord(256, true)
        await sleep(3000);

        expect(next).to.eq(256)
        expect(initialized).to.eq(false)
      })
      it('word boundary less 1 (next initialized tick in next word)', async () => {
        const { next, initialized } = await tickBitmap.nextInitializedTickWithinOneWord(72, true)
        await sleep(3000);

        expect(next).to.eq(70)
        expect(initialized).to.eq(true)
      })
      it('word boundary', async () => {
        const { next, initialized } = await tickBitmap.nextInitializedTickWithinOneWord(-257, true)
        await sleep(3000);

        expect(next).to.eq(-512)
        expect(initialized).to.eq(false)
      })
      it('entire empty word', async () => {
        const { next, initialized } = await tickBitmap.nextInitializedTickWithinOneWord(1023, true)
        await sleep(3000);

        expect(next).to.eq(768)
        expect(initialized).to.eq(false)
      })
      it('halfway through empty word', async () => {
        const { next, initialized } = await tickBitmap.nextInitializedTickWithinOneWord(900, true)
        await sleep(3000);

        expect(next).to.eq(768)
        expect(initialized).to.eq(false)
      })
      it('boundary is initialized', async () => {
        await tickBitmap.flipTick(329)
        await sleep(3000);
        const { next, initialized } = await tickBitmap.nextInitializedTickWithinOneWord(456, true)
        await sleep(3000);

        expect(next).to.eq(329)
        expect(initialized).to.eq(true)
      })

      it('gas cost on boundary', async () => {
        await snapshotGasCost(await tickBitmap.getGasCostOfNextInitializedTickWithinOneWord(256, true))
        await sleep(3000);
      })
      it('gas cost just below boundary', async () => {
        await snapshotGasCost(await tickBitmap.getGasCostOfNextInitializedTickWithinOneWord(255, true))
        await sleep(3000);
      })
      it('gas cost for entire word', async () => {
        await snapshotGasCost(await tickBitmap.getGasCostOfNextInitializedTickWithinOneWord(1024, true))
        await sleep(3000);
      })
    })
  })
})
