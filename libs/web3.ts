import { KudoToken__factory } from '@/typechain-types'
import { Wallet, providers } from 'ethers'

export function getSigner() {
  const provider = new providers.JsonRpcProvider(process.env.API_URL, 11155111)
  return new Wallet(process.env.PRIVATE_KEY!, provider)
}

export function getKudoTokenContract() {
  const signer = getSigner()
  return KudoToken__factory.connect(process.env.KUDO_TOKEN_ADDRESS!, signer)
}
