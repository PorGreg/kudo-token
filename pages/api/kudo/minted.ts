import { getKudoTokenContract } from '@/libs/web3'
import { NextApiHandler } from 'next'

const handler: NextApiHandler = async (req, res) => {
  if (req.method === 'GET') {
    const address = req.query.address as string | undefined
    if (!address) {
      return res.status(400).end()
    }

    const kudoToken = getKudoTokenContract()

    const minted = await kudoToken.minted(address)

    return res.status(200).json({ minted })
  }
  res.status(405).end()
}

export default handler
