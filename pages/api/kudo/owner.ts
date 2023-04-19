import { getKudoTokenContract } from '@/libs/web3'
import { NextApiHandler } from 'next'

const handler: NextApiHandler = async (req, res) => {
  if (req.method === 'GET') {
    const kudoToken = getKudoTokenContract()

    const owner = await kudoToken.owner()

    return res.status(200).json(owner)
  }
  res.status(405).end()
}

export default handler
