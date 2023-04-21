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

  beforeEach(async () => {
    // re-deploy the token between every test
    const deployResult = await loadFixture(deployKudoToken)

    kudoToken = deployResult.kudoToken
    owner = deployResult.mainAccount
    accounts = deployResult.accounts
  })

  describe('Allowance', () => {
    it('Should have 2 mintable coins for account1', async () => {
      await kudoToken.setMintable(accounts[0].address, 2)
      // check if accounts[0] has enough mintable tokens
      expect(await kudoToken.mintable(accounts[0].address)).to.be.equal(2)
    })

    it('Should have 0 mintable coins after 2 set for account1', async () => {
      // check the potential of the mintable varying
      expect(await kudoToken.mintable(accounts[0].address)).to.be.equal(0)
      await kudoToken.setMintable(accounts[0].address, 2)
      expect(await kudoToken.mintable(accounts[0].address)).to.be.equal(2)
      await kudoToken.setMintable(accounts[0].address, 0)
      expect(await kudoToken.mintable(accounts[0].address)).to.be.equal(0)
    })
  })

  describe('Minting', () => {
    describe('With mintable', () => {
      // set mintable token for accounts[0] for every test
      beforeEach(() => kudoToken.setMintable(accounts[0].address, 2))

      it('Should mint 1 Kudo successfully', async () => {
        // mint 1 token to accounts[1] with accounts[0] as the giver
        await kudoToken.safeMint(
          accounts[0].address,
          accounts[1].address,
          'cid'
        )

        // check if the minting was successful
        expect(await kudoToken.minted(accounts[0].address)).to.be.equal(1)
        expect(await kudoToken.balanceOf(accounts[1].address)).to.be.equal(1)
        expect(await kudoToken.tokenURI(0)).to.be.equal('ipfs://cid')
      })

      it('Should revert because too much kudo', async () => {
        // mint 2 tokens from accounts[0] to different accounts
        await kudoToken.safeMint(
          accounts[0].address,
          accounts[1].address,
          'cid1'
        )
        await kudoToken.safeMint(
          accounts[0].address,
          accounts[2].address,
          'cid2'
        )

        // try to mint a 3rd one to accounts[2]
        await expect(
          kudoToken.safeMint(accounts[0].address, accounts[2].address, 'cid3')
        ).to.be.revertedWith('This address cannot send more Kudo')
        // check if the accounts has their tokens (except the 3rd call which should be reverted)
        expect(await kudoToken.minted(accounts[0].address)).to.be.equal(2)
        expect(await kudoToken.balanceOf(accounts[1].address)).to.be.equal(1)
        expect(await kudoToken.balanceOf(accounts[2].address)).to.be.equal(1)
        expect(await kudoToken.ownerOf(0)).to.be.equal(accounts[1].address)
        expect(await kudoToken.ownerOf(1)).to.be.equal(accounts[2].address)
      })

      it('Should revert because self-kudo', async () => {
        // try to send Kudo to the address as the sender
        await expect(
          kudoToken.safeMint(accounts[0].address, accounts[0].address, 'cid')
        ).to.be.revertedWith('`from` and `to` addresses are the same')
      })
    })

    describe('Without mintable', () => {
      it('Should revert because 0 mintable kudo', async () => {
        // try to mint without mintable set (cannot mint more than your `mintable`)
        await expect(
          kudoToken.safeMint(accounts[0].address, accounts[1].address, 'cid')
        ).to.be.revertedWith('This address cannot send more Kudo')
        // check if everything is the same as before
        expect(await kudoToken.minted(accounts[0].address)).to.be.equal(0)
        expect(await kudoToken.balanceOf(accounts[1].address)).to.be.equal(0)
      })
    })
  })

  describe('Transfering', () => {
    beforeEach(async () => {
      // mint 1 token for accounts[1] with accounts[0] as the giver
      await kudoToken.setMintable(accounts[0].address, 1)
      await kudoToken.safeMint(accounts[0].address, accounts[1].address, 'cid')
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

  describe('Burning', () => {
    beforeEach(async () => {
      // mint 1 token for accounts[1] with accounts[0] as the giver
      await kudoToken.setMintable(accounts[0].address, 1)
      await kudoToken.safeMint(accounts[0].address, accounts[1].address, 'cid')
    })

    it('Should burn the token successfully', async () => {
      // burn the token as the owner (accounts[1])
      await kudoToken.connect(accounts[1]).burn(0)

      // any call will be reverted because ERC721 ownerOf method
      await expect(kudoToken.ownerOf(0)).to.be.revertedWith(
        'ERC721: invalid token ID'
      )
    })

    it('Should revert because not token owner', async () => {
      await expect(kudoToken.burn(0)).to.be.revertedWith(
        'Only token owner can burn it'
      )
    })
  })

  describe('Events', () => {
    it('Should emit SetMintable and Mint events successfully', async () => {
      // gather the expected
      const mintableExpected = {
        to: accounts[0].address,
        oldAmount: 0,
        newAmount: 1,
      }
      const mintExpected = {
        id: 0,
        cid: 'cid',
      }

      // call contract
      await kudoToken.setMintable(
        mintableExpected.to,
        mintableExpected.newAmount
      )
      await kudoToken.safeMint(
        accounts[0].address,
        accounts[1].address,
        mintExpected.cid
      )

      // wait the event listeners
      const [mintableEventResult, mintEventResult] = await Promise.all([
        new Promise<boolean>((resolve) => {
          setTimeout(() => resolve(false), 10000)
          kudoToken.on(
            kudoToken.filters['SetMintable(address,uint16,uint16)'](),
            (to, oldAmount, newAmount) => {
              if (
                to === mintableExpected.to &&
                oldAmount === mintableExpected.oldAmount &&
                newAmount === mintableExpected.newAmount
              ) {
                resolve(true)
              }
            }
          )
        }),
        new Promise<number | null>((resolve) => {
          setTimeout(() => resolve(null), 10000)
          kudoToken.on(
            kudoToken.filters['Mint(uint256,string)'](),
            (tokenId, cid) => {
              if (cid === mintExpected.cid) {
                resolve(tokenId.toNumber())
              }
            }
          )
        }),
      ])

      // check result
      expect(mintableEventResult).to.be.equal(true)
      expect(mintEventResult).to.be.equal(mintExpected.id)
    })
  })
})
