import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { KudoToken } from '../typechain-types'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'

describe('KudoToken', () => {
  let kudoToken: KudoToken
  let owner: SignerWithAddress
  let accounts: SignerWithAddress[]

  async function deployKudoToken() {
    // Contracts are deployed using the first signer/account by default
    const [mainAccount, ...accounts] = await ethers.getSigners()

    const KudoToken = await ethers.getContractFactory('KudoToken')
    const kudoToken = await KudoToken.deploy()

    return { kudoToken, mainAccount, accounts }
  }

  async function addMintableAmountTo(address: string, amount: number) {
    await kudoToken.addMintable(address, amount)
  }

  beforeEach(async () => {
    const deployResult = await loadFixture(deployKudoToken)

    kudoToken = deployResult.kudoToken
    owner = deployResult.mainAccount
    accounts = deployResult.accounts
  })

  describe('Minting', () => {
    describe('With mintable', () => {
      beforeEach(() => addMintableAmountTo(accounts[0].address, 2))

      it('Should have 2 mintable coins for account1', async () => {
        expect(await kudoToken.mintable(accounts[0].address)).to.be.equal(2)
      })

      it('Should mint 1 Kudo successfully', async () => {
        await kudoToken.safeMint(accounts[0].address, 'uri')

        expect(await kudoToken.balanceOf(accounts[0].address)).to.be.equal(1)
      })

      it('Should revert at the 3rd mint', async () => {
        await kudoToken.safeMint(accounts[0].address, 'uri1')
        await kudoToken.safeMint(accounts[0].address, 'uri2')

        await expect(
          kudoToken.safeMint(accounts[0].address, 'uri3')
        ).to.be.revertedWith('Cannot mint more Kudos to this address')
        expect(await kudoToken.balanceOf(accounts[0].address)).to.be.equal(2)
        expect(await kudoToken.ownerOf(0)).to.be.equal(accounts[0].address)
      })
    })

    describe('Without mintable', () => {
      it('Should revert at the 1st mint', async () => {
        await expect(
          kudoToken.safeMint(accounts[0].address, 'uri')
        ).to.be.revertedWith('Cannot mint more Kudos to this address')
        expect(await kudoToken.balanceOf(accounts[0].address)).to.be.equal(0)
      })
    })
  })

  describe('Transfering', () => {
    beforeEach(async () => {
      await addMintableAmountTo(accounts[0].address, 1)
      await kudoToken.safeMint(accounts[0].address, 'uri')
    })

    it('Should revert because not token owner', async () => {
      await expect(
        kudoToken.transferFrom(accounts[0].address, accounts[1].address, 0)
      ).to.be.revertedWith('ERC721: caller is not token owner or approved')
      expect(await kudoToken.balanceOf(accounts[1].address)).to.be.equal(0)
    })

    it('Should revert because not transferrable', async () => {
      await expect(
        kudoToken
          .connect(accounts[0])
          .transferFrom(accounts[0].address, accounts[1].address, 0)
      ).to.be.revertedWith('You cannot transfer this Kudo')
      expect(await kudoToken.balanceOf(accounts[1].address)).to.be.equal(0)
    })
  })
})
