import { getSigner } from '@/libs/web3'
import { NextApiHandler } from 'next'
import { KudoToken__factory } from '@/typechain-types'

const handler: NextApiHandler = async (req, res) => {
  if (req.method === 'GET') {
    const signer = getSigner()

    const kudoToken = KudoToken__factory.connect(
      process.env.KUDO_TOKEN_ADDRESS!,
      signer
    )

    const owner = await kudoToken.owner()

    return res.status(200).json(owner)
  }
  res.status(405).end()
}

export default handler
