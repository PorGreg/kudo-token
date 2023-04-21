import { KudoToken__factory } from '@/typechain-types'
import { Wallet, providers } from 'ethers'

export const KUDO_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_KUDO_TOKEN_ADDRESS!

export function getSigner() {
  const provider = new providers.JsonRpcProvider(process.env.API_URL, 11155111)
  return new Wallet(process.env.PRIVATE_KEY!, provider)
}

export function getKudoTokenContract() {
  const signer = getSigner()
  return KudoToken__factory.connect(KUDO_TOKEN_ADDRESS, signer)
}
