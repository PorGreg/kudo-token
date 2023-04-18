import { HardhatUserConfig } from 'hardhat/types'

import dotenv from 'dotenv'
import '@nomicfoundation/hardhat-toolbox'
import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-etherscan'

dotenv.config()

const { PRIVATE_KEY, API_URL } = process.env

const config: HardhatUserConfig = {
  defaultNetwork: 'sepolia',
  networks: {
    hardhat: {},
    sepolia: {
      url: API_URL,
      accounts: [`0x${PRIVATE_KEY}`],
    },
  },
  solidity: '0.8.18',
}

export default config
