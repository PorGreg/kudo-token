import { getKudoTokenContract } from '@/libs/web3'
import { NextApiHandler } from 'next'

const handler: NextApiHandler = async (req, res) => {
  if (req.method === 'POST') {
    const address = req.query.address as string | undefined
    const amount = req.query.amount as string | undefined
    if (!address || !amount) {
      return res.status(400).end()
    }

    const kudoToken = getKudoTokenContract()

    await kudoToken.setMintable(address, amount)

    return res.status(200).end()
  }
  res.status(405).end()
}

export default handler
