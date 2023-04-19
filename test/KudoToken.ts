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

  async function setMintableAmountTo(address: string, amount: number) {
    await kudoToken.setMintable(address, amount)
  }

  beforeEach(async () => {
    // re-deploy the token between every test
    const deployResult = await loadFixture(deployKudoToken)

    kudoToken = deployResult.kudoToken
    owner = deployResult.mainAccount
    accounts = deployResult.accounts
  })

  describe('Allowance', () => {
    it('Should have 2 mintable coins for account1', async () => {
      await setMintableAmountTo(accounts[0].address, 2)
      // check if accounts[0] has enough mintable tokens
      expect(await kudoToken.mintable(accounts[0].address)).to.be.equal(2)
    })

    it('Should have 0 mintable coins after 2 set for account1', async () => {
      // check the potential of the mintable varying
      expect(await kudoToken.mintable(accounts[0].address)).to.be.equal(0)
      await setMintableAmountTo(accounts[0].address, 2)
      expect(await kudoToken.mintable(accounts[0].address)).to.be.equal(2)
      await setMintableAmountTo(accounts[0].address, 0)
      expect(await kudoToken.mintable(accounts[0].address)).to.be.equal(0)
    })
  })

  describe('Minting', () => {
    describe('With mintable', () => {
      // set mintable token for accounts[0] for every test
      beforeEach(() => setMintableAmountTo(accounts[0].address, 2))

      it('Should mint 1 Kudo successfully', async () => {
        // mint 1 token to accounts[1] with accounts[0] as the giver
        await kudoToken.safeMint(
          accounts[0].address,
          accounts[1].address,
          'uri'
        )

        // check if the minting was successful
        expect(await kudoToken.minted(accounts[0].address)).to.be.equal(1)
        expect(await kudoToken.balanceOf(accounts[1].address)).to.be.equal(1)
      })

      it('Should revert at the 3rd mint', async () => {
        // mint 2 tokens from accounts[0] to different accounts
        await kudoToken.safeMint(
          accounts[0].address,
          accounts[1].address,
          'uri1'
        )
        await kudoToken.safeMint(
          accounts[0].address,
          accounts[2].address,
          'uri2'
        )

        // try to mint a 3rd one to accounts[2]
        await expect(
          kudoToken.safeMint(accounts[0].address, accounts[2].address, 'uri3')
        ).to.be.revertedWith('Cannot mint more Kudos to this address')
        // check if the accounts has their tokens (except the 3rd call which should be reverted)
        expect(await kudoToken.minted(accounts[0].address)).to.be.equal(2)
        expect(await kudoToken.balanceOf(accounts[1].address)).to.be.equal(1)
        expect(await kudoToken.balanceOf(accounts[2].address)).to.be.equal(1)
        expect(await kudoToken.ownerOf(0)).to.be.equal(accounts[1].address)
        expect(await kudoToken.ownerOf(1)).to.be.equal(accounts[2].address)
      })
    })

    describe('Without mintable', () => {
      it('Should revert at the 1st mint', async () => {
        // try to mint without mintable set (cannot mint more than your `mintable`)
        await expect(
          kudoToken.safeMint(accounts[0].address, accounts[1].address, 'uri')
        ).to.be.revertedWith('Cannot mint more Kudos to this address')
        // check if everything is the same as before
        expect(await kudoToken.minted(accounts[0].address)).to.be.equal(0)
        expect(await kudoToken.balanceOf(accounts[1].address)).to.be.equal(0)
      })
    })
  })

  describe('Transfering', () => {
    beforeEach(async () => {
      // mint 1 token for accounts[1] with accounts[0] as the giver
      await setMintableAmountTo(accounts[0].address, 1)
      await kudoToken.safeMint(accounts[0].address, accounts[1].address, 'uri')
    })

    it('Should revert because not token owner', async () => {
      // try to transfer without the token owner account
      // (accounts[1] the owner of the token, but we are signed in with the `owner` account)
      await expect(
        kudoToken.transferFrom(accounts[1].address, accounts[2].address, 0)
      ).to.be.revertedWith('ERC721: caller is not token owner or approved')
      // check if everything is the same as before
      expect(await kudoToken.balanceOf(accounts[1].address)).to.be.equal(1)
      expect(await kudoToken.balanceOf(accounts[2].address)).to.be.equal(0)
    })

    it('Should revert because not transferrable', async () => {
      // try to transfer with the token owner account
      // (accounts[1] the owner of the token, but we are signed in with the `owner` account)
      await expect(
        kudoToken
          .connect(accounts[1])
          .transferFrom(accounts[1].address, accounts[2].address, 0)
      ).to.be.revertedWith('You cannot transfer this Kudo')
      // check if everything is the same as before
      expect(await kudoToken.balanceOf(accounts[1].address)).to.be.equal(1)
      expect(await kudoToken.balanceOf(accounts[2].address)).to.be.equal(0)
    })
  })
})
