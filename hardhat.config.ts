import { HardhatUserConfig } from 'hardhat/types'

import dotenv from 'dotenv'
import '@nomicfoundation/hardhat-toolbox'
import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-etherscan'

dotenv.config()

const { PRIVATE_KEY, API_URL } = process.env

const config: HardhatUserConfig = {
  defaultNetwork: 'goerli',
  networks: {
    hardhat: {},
    goerli: {
      url: API_URL,
      accounts: [`0x${PRIVATE_KEY}`],
    },
  },
  solidity: {
    version: '0.8.18',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
}

export default config
