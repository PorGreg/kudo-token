import { ethers } from 'hardhat'

async function main() {
  const KudoToken = await ethers.getContractFactory('KudoToken')

  // Start deployment, returning a promise that resolves to a contract object
  const kudoToken = await KudoToken.deploy()
  await kudoToken.deployed()
  console.log('Contract deployed to address:', kudoToken.address)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
