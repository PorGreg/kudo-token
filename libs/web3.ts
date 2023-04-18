import { Wallet, providers } from 'ethers'

export function getSigner() {
  const provider = new providers.JsonRpcProvider(process.env.API_URL, 11155111)
  return new Wallet(process.env.PRIVATE_KEY!, provider)
}
